// Copyright (C) TOSHIBA CORPORATION, 2025. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2025. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { StatusCodes } from 'http-status-codes'
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { ReactNode, useEffect } from 'react'
import { Button, Form, Modal } from 'react-bootstrap'
import { AiOutlineQuestionCircle } from 'react-icons/ai'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'

interface Props {
    obligationId: string
    show: boolean
    setShow: React.Dispatch<React.SetStateAction<boolean>>
}

function DeleteObligationDialog({ obligationId, show, setShow }: Props): ReactNode {
    const t = useTranslations('default')
    const { status } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [
        status,
    ])

    const deleteObligation = async () => {
        try {
            const session = await getSession()
            if (CommonUtils.isNullOrUndefined(session)) return signOut()
            const response = await ApiUtils.DELETE(`obligations/${obligationId}`, session.user.access_token)
            if (response.status === StatusCodes.MULTI_STATUS) {
                MessageService.success(t('Obligation deleted successfully'))
                setShow(false)
            } else if (response.status == StatusCodes.UNAUTHORIZED) {
                await signOut()
            } else {
                MessageService.error(t('Error when processing'))
            }
        } catch {
            MessageService.error(t('Error when processing'))
        }
    }

    const handleSubmit = async () => {
        await deleteObligation()
    }

    const handleCloseDialog = () => {
        setShow(false)
    }

    return (
        <Modal
            show={show}
            onHide={handleCloseDialog}
            backdrop='static'
            centered
            size='lg'
        >
            <Modal.Header
                closeButton
                style={{
                    color: 'red',
                }}
            >
                <Modal.Title>
                    <AiOutlineQuestionCircle
                        style={{
                            marginBottom: '5px',
                        }}
                    />
                    {t('Delete Obligation')} ?
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <>
                    {
                        <>
                            <Form>
                                <Form.Group>
                                    <Form.Label className='mb-3'>
                                        {t('Do you really want to delete this obligation')} ?
                                    </Form.Label>
                                    <br />
                                </Form.Group>
                            </Form>
                        </>
                    }
                </>
            </Modal.Body>
            <Modal.Footer className='justify-content-end'>
                <Button
                    className='delete-btn'
                    variant='light'
                    onClick={handleCloseDialog}
                >
                    {' '}
                    {t('Close')}{' '}
                </Button>
                <Button
                    className='login-btn'
                    variant='danger'
                    onClick={() => handleSubmit()}
                >
                    {t('Delete Obligation')}
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default DeleteObligationDialog
