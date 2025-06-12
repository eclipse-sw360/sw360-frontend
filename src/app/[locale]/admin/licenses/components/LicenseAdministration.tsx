// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { StatusCodes } from 'http-status-codes'
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { ReactNode, useEffect, useRef, useState } from 'react'
import DownloadService from '@/services/download.service'
import MessageService from '@/services/message.service'
import { ApiUtils } from '@/utils'
import DeleteAllLicenseInformationModal from './DeleteAllLicenseInformationModal'

export default function LicenseAdministration(): ReactNode {
    const t = useTranslations('default')
    const file = useRef<File | undefined>(undefined)
    const [deleteAllLicenseInformationModal, showDeleteAllLicenseInformationModal] = useState(false)
    const [overwriteIfExternalIdMatches, setOverwriteIfExternalIdMatches] = useState(false)
    const [overwriteIfIdMatchesEvenWithoutExternalIdMatch, setOverwriteIfIdMatchesEvenWithoutExternalIdMatch] =
        useState(false)
    const { status } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [
        status,
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

            const session = await getSession()
            if (!session) {
                return signOut()
            }
            const response = await ApiUtils.POST(
                `licenses/upload?overwriteIfExternalIdMatches=${overwriteIfExternalIdMatches
                }&overwriteIfIdMatchesEvenWithoutExternalIdMatch=${overwriteIfIdMatchesEvenWithoutExternalIdMatch}`,
                formData,
                session.user.access_token,
            )
            if (response.status === HttpStatus.OK) {
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

    const downloadLicenseArchive = async () => {
        try {
            const session = await getSession()
            if (!session) return signOut()
            DownloadService.download('licenses/downloadLicenses', session, `LicensesBackup.lics`)
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
            <div className='mt-4 mx-5'>
                <div className='row'>
                    <div className='col-lg-8'>
                        <button
                            type='button'
                            className='btn btn-primary col-auto me-2'
                            onClick={() => downloadLicenseArchive()}
                        >
                            {t('Download License Archive')}
                        </button>
                        <button
                            type='button'
                            className='btn btn-primary col-auto me-2'
                        >
                            {t('Import SPDX Information')}
                        </button>
                        <button
                            type='button'
                            className='btn btn-primary col-auto me-2'
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
                        onClick={() => uploadLicenses()}
                    >
                        {t('Upload Licenses')}
                    </button>
                </div>
            </div>
        </>
    )
}
