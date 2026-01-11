// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { StatusCodes } from 'http-status-codes'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Dispatch, JSX, ReactNode, SetStateAction, useEffect, useRef, useState } from 'react'
import { Alert, Modal } from 'react-bootstrap'
import { FaRegQuestionCircle } from 'react-icons/fa'
import { ErrorDetails } from '@/object-types'
import DownloadService from '@/services/download.service'
import MessageService from '@/services/message.service'
import { ApiUtils } from '@/utils'
import DeleteAllLicenseInformationModal from './DeleteAllLicenseInformationModal'

type ModalType = 'OSADL' | 'SPDX' | undefined

interface AlertData {
    variant: string
    message: JSX.Element
}

interface ImportResult {
    requestStatus: string
    totalAffectedElements: number
    totalElements: number
    message: string
}

function ConfirmationModal({ type, setType }: { type: ModalType; setType: Dispatch<SetStateAction<ModalType>> }) {
    const t = useTranslations('default')
    const purpose = type === 'OSADL' ? t('Import OSADL license obligations') : t('Import SPDX licenses')
    const confirmation =
        type === 'OSADL'
            ? t('Do you really want to import all OSADL license obligations')
            : t('Do you really want to import all SPDX all licenses')
    const url = `licenses/import/${type}`
    enum ImportState {
        IMPORT,
        LOADING,
        DONE,
    }
    const [state, setState] = useState<ImportState>(ImportState.IMPORT)
    const session = useSession()
    const [alert, setAlert] = useState<AlertData | null>(null)

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            signOut()
        }
    }, [
        session,
    ])

    const handleImport = async () => {
        try {
            setState(ImportState.LOADING)
            if (!session.data) {
                return signOut()
            }
            const response = await ApiUtils.POST(url, {}, session.data.user.access_token)
            const res = (await response.json()) as ImportResult
            if (response.status !== StatusCodes.OK) {
                setState(ImportState.IMPORT)
            } else {
                setState(ImportState.DONE)
            }
            setAlert({
                variant: 'success',
                message: (
                    <>
                        <p>{res.message}</p>
                        <ul>
                            <li>
                                {t('Total Affected Elements')}: {res.totalAffectedElements}
                            </li>
                            <li>
                                {t('Total Elements')}: {res.totalElements}
                            </li>
                        </ul>
                    </>
                ),
            })
        } catch (error: unknown) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                return
            }
            const message = error instanceof Error ? error.message : String(error)
            MessageService.error(message)
        }
    }

    const close = () => {
        setType(undefined)
        setState(ImportState.IMPORT)
        setAlert(null)
    }

    return (
        <Modal
            show={type !== undefined}
            onHide={close}
            backdrop='static'
            centered
            size='lg'
        >
            <Modal.Header>
                <Modal.Title>
                    <FaRegQuestionCircle /> {purpose}?{' '}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {confirmation}?
                {alert && (
                    <Alert
                        variant={alert.variant}
                        id='updateRelease.message.alert'
                    >
                        {alert.message}
                    </Alert>
                )}
            </Modal.Body>
            <Modal.Footer className='justify-content-end'>
                {state === ImportState.DONE ? (
                    <button
                        className='btn btn-primary'
                        onClick={close}
                    >
                        {t('Close')}
                    </button>
                ) : (
                    <button
                        className='btn btn-dark'
                        onClick={close}
                        disabled={state === ImportState.LOADING}
                    >
                        {t('Cancel')}
                    </button>
                )}
                {state !== ImportState.DONE && (
                    <button
                        className='btn btn-primary'
                        onClick={() => void handleImport()}
                        disabled={state === ImportState.LOADING}
                    >
                        {purpose}{' '}
                    </button>
                )}
            </Modal.Footer>
        </Modal>
    )
}

export default function LicenseAdministration(): ReactNode {
    const t = useTranslations('default')
    const file = useRef<File | undefined>(undefined)
    const [deleteAllLicenseInformationModal, showDeleteAllLicenseInformationModal] = useState(false)
    const [overwriteIfExternalIdMatches, setOverwriteIfExternalIdMatches] = useState(false)
    const [overwriteIfIdMatchesEvenWithoutExternalIdMatch, setOverwriteIfIdMatchesEvenWithoutExternalIdMatch] =
        useState(false)
    const [confirmationModalType, setConfirmationModalType] = useState<ModalType>(undefined)
    const session = useSession()

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            signOut()
        }
    }, [
        session,
    ])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.currentTarget.files

        if (!files || files.length === 0) return

        file.current = files[0]
    }

    const uploadLicenses = async () => {
        try {
            if (!file.current) {
                MessageService.error(t('Please select a file'))
                return
            }
            const formData = new FormData()
            formData.append('licenseFile', file.current, file.current.name)

            if (!session.data) {
                return signOut()
            }
            const response = await ApiUtils.POST(
                `licenses/upload?overwriteIfExternalIdMatches=${
                    overwriteIfExternalIdMatches
                }&overwriteIfIdMatchesEvenWithoutExternalIdMatch=${overwriteIfIdMatchesEvenWithoutExternalIdMatch}`,
                formData,
                session.data.user.access_token,
            )
            if (response.status === StatusCodes.OK) {
                MessageService.success(t('Licenses uploaded successfully'))
            } else {
                const err = (await response.json()) as ErrorDetails
                throw new Error(err.message)
            }
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                return
            }
            const message = error instanceof Error ? error.message : String(error)
            MessageService.error(message)
        }
    }

    const downloadLicenseArchive = () => {
        try {
            if (!session.data) return signOut()
            void DownloadService.download('licenses/downloadLicenses', session.data, `LicensesBackup.lics`)
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                return
            }
            const message = error instanceof Error ? error.message : String(error)
            MessageService.error(message)
        }
    }

    return (
        <>
            <DeleteAllLicenseInformationModal
                show={deleteAllLicenseInformationModal}
                setShow={showDeleteAllLicenseInformationModal}
            />
            <ConfirmationModal
                type={confirmationModalType}
                setType={setConfirmationModalType}
            />
            <div className='mt-4 mx-5'>
                <div className='row'>
                    <div className='col-lg-8'>
                        <button
                            type='button'
                            className='btn btn-primary col-auto me-2'
                            onClick={() => void downloadLicenseArchive()}
                        >
                            {t('Download License Archive')}
                        </button>
                        <button
                            type='button'
                            className='btn btn-primary col-auto me-2'
                            onClick={() => setConfirmationModalType('SPDX')}
                        >
                            {t('Import SPDX Information')}
                        </button>
                        <button
                            type='button'
                            className='btn btn-primary col-auto me-2'
                            onClick={() => setConfirmationModalType('OSADL')}
                        >
                            {t('Import OSADL Information')}
                        </button>
                        <button
                            type='button'
                            className='btn btn-danger col-auto me-2'
                            onClick={() => showDeleteAllLicenseInformationModal(true)}
                        >
                            {t('Delete all License Information')}
                        </button>
                    </div>
                    <div className='col-lg-4 d-flex justify-content-end buttonheader-title'>
                        {t('License Administration')}
                    </div>
                </div>
                <div className='mt-4'>
                    <h5 className='licadmin-upload'>{t('Upload License Archive')}</h5>
                    <input
                        type='file'
                        onChange={handleFileChange}
                        placeholder={t('Drop a File Here')}
                    />
                    <div className='form-check mt-3'>
                        <input
                            id='overWriteIfExternalIdsMatch'
                            type='checkbox'
                            className='form-check-input'
                            name='overWriteIfExternalIdsMatch'
                            checked={overwriteIfExternalIdMatches}
                            onChange={() => setOverwriteIfExternalIdMatches(!overwriteIfExternalIdMatches)}
                        />
                        <label
                            className='form-check-label fw-bold fs-6'
                            htmlFor='overWriteIfExternalIdsMatch'
                        >
                            {t('Overwrite if external ids match')}
                        </label>
                    </div>
                    <div className='form-check'>
                        <input
                            id='overWriteIfIdsMatch'
                            type='checkbox'
                            className='form-check-input'
                            name='overWriteIfIdsMatch'
                            checked={overwriteIfIdMatchesEvenWithoutExternalIdMatch}
                            onChange={() =>
                                setOverwriteIfIdMatchesEvenWithoutExternalIdMatch(
                                    !overwriteIfIdMatchesEvenWithoutExternalIdMatch,
                                )
                            }
                        />
                        <label
                            className='form-check-label fw-bold'
                            htmlFor='overWriteIfIdsMatch'
                        >
                            {t('Overwrite if ids match')}
                        </label>
                    </div>
                    <button
                        type='button'
                        className='btn btn-secondary col-auto mt-3'
                        onClick={() => void uploadLicenses()}
                    >
                        {t('Upload Licenses')}
                    </button>
                </div>
            </div>
        </>
    )
}
