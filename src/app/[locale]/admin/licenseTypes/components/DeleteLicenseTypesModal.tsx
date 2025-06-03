// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client';
import { useTranslations } from 'next-intl';

import { Button, Form, Modal } from 'react-bootstrap';

import { HttpStatus } from '@/object-types';
import { ApiUtils, CommonUtils } from '@/utils';
import { BsQuestionCircle } from 'react-icons/bs';
import MessageService from '@/services/message.service';
import { getSession, signOut } from 'next-auth/react';
import { useCallback, useEffect, useState, type JSX } from "react";

interface Props {
    licenseTypeId: string
    licenseTypeName: string
    show: boolean
    setShow: React.Dispatch<React.SetStateAction<boolean>>
}

interface LicenseTypeInfo {
    inUse: boolean,
    usageCount: number
}

export default function DeleteLicenseTypesModal ({ licenseTypeId,
                                                   licenseTypeName,
                                                   show,
                                                   setShow}: Props) : JSX.Element {
    const t = useTranslations('default')
    const [loading, setLoading] = useState<boolean>(false)
    const [licenseTypeInUse, setLicenseTypeInUse] = useState<boolean>(false)
    const [licenseTypeUsageCount, setLicenseTypeUsageCount] = useState<number | null>(null)

    const fetchData = useCallback(async (url: string) => {
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session))
            return signOut()
        const response = await ApiUtils.GET(url, session.user.access_token)
        if (response.status === HttpStatus.OK) {
            const data = await response.json()
            return data
        } else if (response.status === HttpStatus.UNAUTHORIZED) {
            MessageService.error(t('Unauthorized request'))
            return
        } else {
            return undefined
        }
    }, [])

    useEffect(() => {
        setLoading(true)
        void fetchData('licenseTypes').then(
            (licenseTypeInfo: LicenseTypeInfo ) => {
                if (licenseTypeInfo === undefined) {
                    return
                }
                if (licenseTypeInfo.inUse) {
                    setLicenseTypeInUse(true)
                    setLicenseTypeUsageCount(licenseTypeInfo.usageCount)   
                }
            }
        )
            .catch ((error) => {
                if (error instanceof DOMException && error.name === "AbortError") {
                    return
                }
                const message = error instanceof Error ? error.message : String(error)
                MessageService.error(message)
        })
            .finally(() => {
                setLoading(false)
        })
    }, [fetchData])

    const handleCloseDialog = () => {
        setShow(!show)
    }

    console.log('loading', loading)
    console.log('licenseTypeId', licenseTypeId)
    console.log('licenseTypeInUse', licenseTypeInUse)
    console.log('licenseTypeUsageCount', licenseTypeUsageCount)

    return (
        <>

            <Modal show={show} onHide={handleCloseDialog} backdrop='static' centered size='lg'>
                <Modal.Header style={{ backgroundColor: '#FEEFEF', color: '#da1414', fontWeight: '700' }}>
                    <h5>
                        <Modal.Title style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                            <BsQuestionCircle />
                            &nbsp;
                            {t('Delete License Type')}?
                        </Modal.Title>
                    </h5>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        {t.rich('Do you really want to delete the License Type', {
                            name: licenseTypeName ?? '',
                            strong: (chunks) => <b>{chunks}</b>,
                        })}
                    </Form>
                </Modal.Body>
                <Modal.Footer className='justify-content-end'>
                    <Button className='delete-btn'
                            variant='light'
                            onClick={handleCloseDialog}
                    >
                        {t('Cancel')}
                    </Button>
                    <Button className='login-btn'
                            variant='danger'
                            // onClick={() => handleSubmit()}
                    >
                        {t('Delete License Type')}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

