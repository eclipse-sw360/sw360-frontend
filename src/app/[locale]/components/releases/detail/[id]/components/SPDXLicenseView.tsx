// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import { FaInfoCircle } from 'react-icons/fa'

import { CommonUtils } from '@/utils'
import styles from '../detail.module.css'

interface Props {
    licenseInfo: { [key: string]: string | Array<string> | number }
    isISR: boolean
    attachmentName: string
}

const SPDXLicenseView = ({ licenseInfo, isISR, attachmentName }: Props) => {
    const t = useTranslations('default')
    const [selectedLicenseId, setSelectedLicenseId] = useState<string>()
    const [modalShow, setModalShow] = useState(false)

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
                    <FaInfoCircle
                        onClick={() => showLicenseToSrcMapping(licenseId)}
                        style={{ marginLeft: '5px', color: 'gray' }}
                        className={styles.info}
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
                        <b>
                            {
                                // @ts-expect-error: TS2345 invalidate translation even if is valid under
                                t(licenseInfo.otherLicense as string)
                            }
                        </b>
                    </div>
                    <ul>{renderLicenseIds(licenseInfo['otherLicenseIds'] as Array<string>)}</ul>
                </>
            )}

            <Modal show={modalShow} onHide={handleCloseDialog} backdrop='static' centered size='lg'>
                <Modal.Header closeButton style={{ color: '#2e5aac' }}>
                    <Modal.Title>
                        <b>{attachmentName}</b>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedLicenseId && (
                        <>
                            <div>
                                License Name: <b>{selectedLicenseId}</b>
                            </div>
                            <div>
                                Source File List:
                                <ul>
                                    {CommonUtils.isNullEmptyOrUndefinedArray(
                                        licenseInfo[selectedLicenseId] as Array<string>
                                    ) ? (
                                        <li>Source file information not found in ISR</li>
                                    ) : (
                                        renderSourceList(licenseInfo[selectedLicenseId] as Array<string>)
                                    )}
                                </ul>
                            </div>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer className='justify-content-end'>
                    <Button variant='light' onClick={handleCloseDialog}>
                        {' '}
                        OK{' '}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default SPDXLicenseView
