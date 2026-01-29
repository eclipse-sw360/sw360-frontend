// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { StatusCodes } from 'http-status-codes'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { ReactNode, useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import { BsInfoCircle } from 'react-icons/bs'
import { ErrorDetails } from '@/object-types'
import { ApiError, ApiUtils, CommonUtils } from '@/utils'

interface LicenseInfo {
    license: string
    otherLicense: string
    licenseIds?: string[]
    otherLicenseIds?: string[]
    totalFileCount?: number
}

interface Props {
    isISR: boolean
    attachmentName: string
    attachmentId: string
    releaseId: string
    licenseInfo: LicenseInfo
}

interface FileList {
    licName: string
    srcFiles: string[]
    licSpdxId: string
}

interface SrcFileList {
    data: FileList[]
}

const SPDXLicenseView = ({ isISR, attachmentName, attachmentId, releaseId, licenseInfo }: Props): ReactNode => {
    const t = useTranslations('default')
    const [selectedLicenseId, setSelectedLicenseId] = useState<string>()
    const [modalShow, setModalShow] = useState(false)
    const session = useSession()
    const [fileList, setFileList] = useState<FileList[] | undefined>()

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            signOut()
        }
    }, [
        session.status,
    ])

    useEffect(() => {
        if (session.status === 'loading') return
        const controller = new AbortController()
        const signal = controller.signal

        void (async () => {
            try {
                if (CommonUtils.isNullOrUndefined(session.data)) return signOut()
                const response = await ApiUtils.GET(
                    `releases/${releaseId}/licenseFileList?attachmentId=${attachmentId}`,
                    session.data.user.access_token,
                    signal,
                )
                if (response.status !== StatusCodes.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new ApiError(err.message, {
                        status: response.status,
                    })
                }

                const fileData = (await response.json()) as SrcFileList
                setFileList(fileData.data)
            } catch (error) {
                ApiUtils.reportError(error)
            }
        })()

        return () => controller.abort()
    }, [
        session,
        releaseId,
        attachmentId,
    ])

    const handleCloseDialog = () => {
        setModalShow(false)
    }

    const caculateComplexity = (totalFileCount: number) => {
        if (totalFileCount <= 1000) {
            return 'small'
        }

        if (totalFileCount > 1000 && totalFileCount <= 5000) {
            return 'medium'
        }

        return 'large'
    }

    const renderLicenseIds = (licenseIds: Array<string>) => {
        return licenseIds.map((licenseId) => (
            <li key={licenseId}>
                {licenseId}
                {isISR && (
                    <BsInfoCircle
                        onClick={() => showLicenseToSrcMapping(licenseId)}
                        style={{
                            marginLeft: '5px',
                            color: 'gray',
                        }}
                        size={20}
                        className='release-detail-info'
                    />
                )}
            </li>
        ))
    }

    const showLicenseToSrcMapping = (licenseId: string) => {
        setSelectedLicenseId(licenseId)
        setModalShow(true)
    }

    const renderSourceList = (sourceList: Array<string>) => {
        return sourceList.map((source) => <li key={source}>{source}</li>)
    }

    return (
        <div>
            {isISR && (
                <>
                    <div>
                        {t('Total Number Of Files')}: <b>{licenseInfo['totalFileCount']}</b>
                    </div>
                    <div>
                        {t('Complexity')}: <b>{caculateComplexity(licenseInfo.totalFileCount as number)}</b> (
                        {t('based on license file count')})
                    </div>
                </>
            )}
            {CommonUtils.isNullEmptyOrUndefinedArray(licenseInfo['licenseIds'] as Array<unknown>) ? (
                <>
                    <div>
                        <b>{t('conclude_license_id')}:</b>
                        <br /> N/A
                    </div>
                </>
            ) : (
                <>
                    <div>
                        <b>{licenseInfo.license}</b>
                    </div>
                    <ul>{renderLicenseIds(licenseInfo['licenseIds'] as Array<string>)}</ul>
                </>
            )}
            {CommonUtils.isNullEmptyOrUndefinedArray(licenseInfo['otherLicenseIds'] as Array<string>) ? (
                <>
                    <div>
                        <b>{t('Other License Ids')}:</b>
                        <br /> N/A
                    </div>
                </>
            ) : (
                <>
                    <div>
                        <b>{t(licenseInfo.otherLicense as never)}</b>
                    </div>
                    <ul>{renderLicenseIds(licenseInfo['otherLicenseIds'] as Array<string>)}</ul>
                </>
            )}

            <Modal
                show={modalShow}
                onHide={handleCloseDialog}
                backdrop='static'
                centered
                size='lg'
            >
                <Modal.Header
                    closeButton
                    style={{
                        color: '#2e5aac',
                    }}
                >
                    <Modal.Title>
                        <b>{attachmentName}</b>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {!CommonUtils.isNullEmptyOrUndefinedString(selectedLicenseId) && (
                        <>
                            <div>
                                {t('License Name')}: <b>{selectedLicenseId}</b>
                            </div>
                            <div>
                                {t('Source File List')}:
                                <ul>
                                    {CommonUtils.isNullEmptyOrUndefinedArray(
                                        fileList?.filter((l) => l.licName === selectedLicenseId)?.[0].srcFiles,
                                    ) ? (
                                        <li>{t('Source file information not found in ISR')}</li>
                                    ) : (
                                        renderSourceList(
                                            fileList?.filter((l) => l.licName === selectedLicenseId)?.[0].srcFiles,
                                        )
                                    )}
                                </ul>
                            </div>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer className='justify-content-end'>
                    <Button
                        variant='light'
                        onClick={handleCloseDialog}
                    >
                        {' '}
                        OK{' '}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default SPDXLicenseView
