// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { HttpStatus } from '@/object-types'
import { ApiUtils } from '@/utils'
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Dispatch, ReactNode, SetStateAction, useEffect, useState } from 'react'
import { Alert, Modal, Spinner } from 'react-bootstrap'
import { AiOutlineQuestionCircle } from 'react-icons/ai'

interface Message {
    type: 'success' | 'danger'
    message: string
}

export default function DeleteAllLicenseInformationModal({
    show,
    setShow,
}: {
    show: boolean
    setShow: Dispatch<SetStateAction<boolean>>
}): ReactNode {
    const t = useTranslations('default')
    const [deleting, setDeleting] = useState<boolean>(false)
    const [message, setMessage] = useState<undefined | Message>(undefined)
    const { status } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [status])

    const handleDelete = async () => {
        try {
            setDeleting(true)
            const session = await getSession()
            if (!session) {
                return signOut()
            }
            const response = await ApiUtils.DELETE('licenses/deleteAll', session.user.access_token)
            if (response.status === HttpStatus.UNAUTHORIZED) {
                return signOut()
            } else if (response.status !== HttpStatus.OK) {
                setMessage({ type: 'danger', message: t('DELETE_ALL_LICENCES_ERROR') })
                return
            }
            setMessage({ type: 'success', message: t('DELETE_ALL_LICENCES_SUCCESS') })
        } catch (e) {
            console.error(e)
        } finally {
            setDeleting(false)
        }
    }

    return (
        <>
            <Modal
                size='lg'
                centered
                show={show}
                onHide={() => {
                    if (!deleting) {
                        setShow(false)
                        setMessage(undefined)
                    }
                }}
                aria-labelledby={t('Delete All Licenses')}
                scrollable
            >
                <Modal.Header
                    style={{ backgroundColor: '#feefef', color: '#da1414' }}
                    closeButton
                >
                    <Modal.Title id='delete-all-license-info-modal'>
                        <AiOutlineQuestionCircle /> {t('Delete All Licenses')}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {message && (
                        <Alert
                            variant={message.type}
                            id='deleteLicences.message.alert'
                        >
                            {message.message}
                        </Alert>
                    )}
                    <Alert
                        variant='warning'
                        id='deleteLicences.warning.alert'
                    >
                        {t('other documents might use the licenses')}
                    </Alert>
                    <p className='my-3'>{t('DELETE_ALL_LICENSE')}</p>
                    <Alert
                        variant='primary'
                        id='deleteLicences.info.alert'
                    >
                        {t('This function is meant to be followed by a new license import')}
                    </Alert>
                </Modal.Body>
                <Modal.Footer>
                    <button
                        className='btn btn-dark'
                        onClick={() => {
                            setShow(false)
                            setMessage(undefined)
                        }}
                        disabled={deleting}
                    >
                        {t('Cancel')}
                    </button>
                    <button
                        className='btn btn-danger'
                        onClick={() => {
                            handleDelete().catch((e) => console.error(e))
                        }}
                        disabled={deleting}
                    >
                        {t('Delete All License Information')}{' '}
                        {deleting && (
                            <Spinner
                                size='sm'
                                className='ms-1 spinner'
                            />
                        )}
                    </button>
                </Modal.Footer>
            </Modal>
        </>
    )
}
