// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { getSession, signOut, useSession } from 'next-auth/react'
import type { useTranslations } from 'next-intl'
import React, { type JSX, useCallback, useEffect, useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { BsCaretDownFill, BsCaretRightFill, BsExclamationTriangle, BsInfoCircle } from 'react-icons/bs'
import CommonUtils from '@/utils/common.utils'
import { ApiUtils } from '@/utils/index'
import ViewFileListIcon from './ViewFileListIcon'

interface LicenseData {
    licenseType: string
    licenseSpdxId: string
    licenseName: string
    sourcesFiles: Array<string>
}

interface LicensesToSourcesMapping {
    releaseId: string
    releaseName: string
    attachmentName?: string
    licensesData?: Array<LicenseData>
    status: string
    message?: string
}

const sortIgnoreCase = (array: Array<string>) =>
    array.sort((a, b) =>
        a.localeCompare(b, undefined, {
            sensitivity: 'base',
        }),
    )

const TogglerLicenseList = ({
    licenses,
    releaseId,
    t,
}: {
    licenses?: Array<string>
    releaseId: string
    t: ReturnType<typeof useTranslations>
}): JSX.Element => {
    const [toggle, setToggle] = useState(false)
    const [isFileModalOpen, setIsFileModalOpen] = useState(false)
    const [selectedLicense, setSelectedLicense] = useState<string | undefined>(undefined)
    const { status } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [
        status,
    ])

    return !CommonUtils.isNullEmptyOrUndefinedArray(licenses) ? (
        <div className='d-flex'>
            {licenses.length > 1 ? (
                toggle ? (
                    <>
                        <div
                            style={{
                                marginRight: '0.25rem',
                            }}
                        >
                            <BsCaretDownFill
                                className='cursor'
                                size={20}
                                onClick={() => setToggle(!toggle)}
                            />
                        </div>
                        <div>
                            {Object.values(sortIgnoreCase(licenses))
                                .map(
                                    (license): React.ReactNode => (
                                        <span key={license}>
                                            <span className='license-name'>{license}</span>{' '}
                                            <ViewFileListIcon
                                                license={license}
                                                t={t}
                                                openModal={(license) => {
                                                    setIsFileModalOpen(true)
                                                    setSelectedLicense(license)
                                                }}
                                            />
                                        </span>
                                    ),
                                )
                                .reduce((prev, curr): React.ReactNode[] => [
                                    prev,
                                    <>
                                        {','}
                                        <br />
                                    </>,
                                    curr,
                                ])}
                        </div>
                    </>
                ) : (
                    <>
                        <div
                            style={{
                                marginRight: '0.25rem',
                            }}
                        >
                            <BsCaretRightFill
                                className='cursor'
                                size={20}
                                onClick={() => setToggle(!toggle)}
                            />
                        </div>
                        <div>
                            <div>
                                <span>{sortIgnoreCase(licenses)[0]}</span>{' '}
                                <ViewFileListIcon
                                    license={sortIgnoreCase(licenses)[0]}
                                    t={t}
                                    openModal={(license) => {
                                        setIsFileModalOpen(true)
                                        setSelectedLicense(license)
                                    }}
                                />
                            </div>
                            {'...'}
                        </div>
                    </>
                )
            ) : (
                <div>
                    <span>{licenses[0]}</span>{' '}
                    <ViewFileListIcon
                        license={licenses[0]}
                        t={t}
                        openModal={(license) => {
                            setIsFileModalOpen(true)
                            setSelectedLicense(license)
                        }}
                    />
                </div>
            )}
            {selectedLicense !== undefined ? (
                <FileListModal
                    license={selectedLicense}
                    releaseId={releaseId}
                    isFileModalOpen={isFileModalOpen}
                    setIsFileModalOpen={setIsFileModalOpen}
                    t={t}
                />
            ) : (
                <></>
            )}
        </div>
    ) : (
        <></>
    )
}

interface FileListModalProps {
    license: string
    releaseId: string
    isFileModalOpen: boolean
    setIsFileModalOpen: React.Dispatch<React.SetStateAction<boolean>>
    t: ReturnType<typeof useTranslations>
}

const FileListModal = ({
    license,
    releaseId,
    isFileModalOpen,
    setIsFileModalOpen,
    t,
}: FileListModalProps): JSX.Element => {
    const [licensesToSourceFilesMapping, setLicensesToSourceFilesMapping] = useState<LicensesToSourcesMapping>()
    const [licenseMappingData, setLicenseMappingData] = useState<LicenseData>()

    const closeModal = () => {
        setLicenseMappingData(undefined)
        setLicensesToSourceFilesMapping(undefined)
        setIsFileModalOpen(false)
    }

    const fetchReleasesToFilesMapping = useCallback(async () => {
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) return signOut()
        const response = await ApiUtils.GET(`releases/${releaseId}/licensesToSourceFiles`, session.user.access_token)
        const data = (await response.json()) as LicensesToSourcesMapping
        setLicensesToSourceFilesMapping(data)
        if (data.status === 'success' && data.licensesData !== undefined) {
            for (const licenseData of data.licensesData) {
                if (
                    licenseData.licenseName.toUpperCase() === license.toUpperCase() &&
                    !CommonUtils.isNullEmptyOrUndefinedArray(licenseData.sourcesFiles)
                ) {
                    setLicenseMappingData(licenseData)
                    break
                }
            }
        }
    }, [
        releaseId,
        license,
    ])

    useEffect(() => {
        if (!isFileModalOpen) return
        void fetchReleasesToFilesMapping()
    }, [
        isFileModalOpen,
        fetchReleasesToFilesMapping,
    ])

    return licensesToSourceFilesMapping ? (
        <Modal
            show={isFileModalOpen}
            onHide={closeModal}
            backdrop='static'
            className={`view-file-list ${
                licensesToSourceFilesMapping.status === 'failure' ? 'modal-warning' : 'modal-info'
            }`}
            size='lg'
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title>
                    {licensesToSourceFilesMapping.status === 'failure' ? (
                        <>
                            <BsExclamationTriangle size={20} /> {t('Warning')}
                        </>
                    ) : (
                        <>
                            <BsInfoCircle size={20} /> {licensesToSourceFilesMapping.releaseName}
                        </>
                    )}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {licensesToSourceFilesMapping.status === 'failure' ? (
                    <div className='mapping-data'>
                        {t('Failed to load source file with error')}:{' '}
                        <b>{t(licensesToSourceFilesMapping.message ?? 'Unknown error')}!</b>
                    </div>
                ) : (
                    <div className='mapping-data'>
                        <div className='file-name'>
                            {t('File name')}: <b>{licensesToSourceFilesMapping.attachmentName}</b>
                        </div>
                        <div className='lic-type'>
                            {t('License type')}: <b>{licenseMappingData ? licenseMappingData.licenseType : ''}</b>
                        </div>
                        <div className='lic-name'>
                            {t('License name')}: <b>{license}</b>
                        </div>
                        <ul>
                            {licenseMappingData ? (
                                Object.values(licenseMappingData.sourcesFiles).map((fileName) => (
                                    <React.Fragment key={fileName}>
                                        {fileName.split(/\s+|\n+/).map((name) => (
                                            <li key={name}>
                                                <b>{name}</b>
                                            </li>
                                        ))}
                                    </React.Fragment>
                                ))
                            ) : (
                                <li>
                                    <b>{t('Source file information not found in CLI')}!</b>
                                </li>
                            )}
                        </ul>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer className='justify-content-end'>
                <Button
                    variant='light'
                    onClick={closeModal}
                >
                    OK
                </Button>
            </Modal.Footer>
        </Modal>
    ) : (
        <></>
    )
}

export default TogglerLicenseList
