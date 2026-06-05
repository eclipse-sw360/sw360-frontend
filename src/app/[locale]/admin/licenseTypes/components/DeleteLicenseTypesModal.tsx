// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { StatusCodes } from 'http-status-codes'

import { useTranslations } from 'next-intl'
import { type JSX, useCallback, useEffect, useState } from 'react'
import { Button, Form, Modal, Spinner } from 'react-bootstrap'
import { BsQuestionCircle } from 'react-icons/bs'
import MessageService from '@/services/message.service'
import ApiUtils from '@/utils/api/authenticatedApi.util'
import { dispatchSessionExpiredEvent } from '@/utils/sessionExpiry.utils'

interface Props {
    licenseTypeId: string
    licenseTypeName: string
    show: boolean
    setShow: React.Dispatch<React.SetStateAction<boolean>>
}

interface LicenseTypeInfo {
    isUsed: boolean
    count: number
}

export default function DeleteLicenseTypesModal({ licenseTypeId, licenseTypeName, show, setShow }: Props): JSX.Element {
    const t = useTranslations('default')
    const [loading, setLoading] = useState<boolean>(false)
    const [licenseTypeInUse, setLicenseTypeInUse] = useState<boolean>(false)
    const [licenseTypeUsageCount, setLicenseTypeUsageCount] = useState<number | null>(null)

    const fetchData = useCallback(async (url: string) => {
        const response = await ApiUtils.GET(url)
        if (response.status === StatusCodes.OK) {
            const data = await response.json()
            return data
        } else if (response.status === StatusCodes.UNAUTHORIZED) {
            MessageService.error(t('Unauthorized request'))
            return
        } else {
            return undefined
        }
    }, [])

    useEffect(() => {
        setLoading(true)
        void fetchData(`licenseTypes/${licenseTypeId}/usage`)
            .then((licenseTypeInfo: LicenseTypeInfo) => {
                if (licenseTypeInfo === undefined) {
                    return
                }
                if (licenseTypeInfo.isUsed) {
                    setLicenseTypeInUse(true)
                    setLicenseTypeUsageCount(licenseTypeInfo.count)
                }
            })
            .catch((error) => {
                ApiUtils.reportError(error)
            })
            .finally(() => {
                setLoading(false)
            })
    }, [
        fetchData,
        licenseTypeId,
    ])

    const handleDeleteLicenseType = async () => {
        try {
            const response = await ApiUtils.DELETE(`licenseTypes/${licenseTypeId}`)
            if (response.status === StatusCodes.OK) {
                MessageService.success(t('Delete License Type successful'))
                setShow(false)
                window.location.reload()
            } else if (response.status === StatusCodes.UNAUTHORIZED) {
                dispatchSessionExpiredEvent()
            } else {
                MessageService.error(t('Error while processing'))
            }
        } catch (error) {
            ApiUtils.reportError(error)
        }
    }

    const handleCloseDialog = () => {
        setShow(!show)
    }

    return (
        <>
            <Modal
                show={show}
                onHide={handleCloseDialog}
                backdrop='static'
                centered
                size='lg'
            >
                <Modal.Header className='alert-danger'>
                    <h5>
                        <Modal.Title>
                            <BsQuestionCircle size={20} />
                            &nbsp;
                            {t('Delete License Type')}?
                        </Modal.Title>
                    </h5>
                </Modal.Header>
                <Modal.Body>
                    <>
                        {loading ? (
                            <div className='col-12 mt-1 text-center'>
                                <Spinner className='spinner' />
                            </div>
                        ) : (
                            <>
                                {licenseTypeInUse ? (
                                    <Form>
                                        {t.rich('The license type cannot be deleted', {
                                            name: licenseTypeName ?? '',
                                            usageCount: licenseTypeUsageCount ?? 0,
                                            strong: (chunks) => <b>{chunks}</b>,
                                        })}
                                    </Form>
                                ) : (
                                    <Form>
                                        {t.rich('Do you really want to delete the License Type', {
                                            name: licenseTypeName ?? '',
                                            strong: (chunks) => <b>{chunks}</b>,
                                        })}
                                    </Form>
                                )}
                            </>
                        )}
                    </>
                </Modal.Body>
                <Modal.Footer className='justify-content-end'>
                    <Button
                        variant='light'
                        onClick={handleCloseDialog}
                    >
                        {licenseTypeInUse ? t('OK') : t('Cancel')}
                    </Button>
                    <Button
                        className='login-btn'
                        variant='danger'
                        hidden={licenseTypeInUse}
                        onClick={() => handleDeleteLicenseType()}
                    >
                        {t('Delete License Type')}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}
