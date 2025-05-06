// Copyright (C) TOSHIBA CORPORATION, 2025. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import { HttpStatus } from '@/object-types'
import MessageService from '@/services/message.service'
import { CommonUtils } from '@/utils'
import { SW360_API_URL } from '@/utils/env'
import { getSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Button, Form, Modal } from 'react-bootstrap'
import { AiOutlineQuestionCircle } from 'react-icons/ai'

import type { JSX } from 'react'

interface Props {
    clientId: string
    show: boolean
    setShow: React.Dispatch<React.SetStateAction<boolean>>
}

function DeleteClientDialog({ clientId, show, setShow }: Props): JSX.Element {
    const t = useTranslations('default')

    const sendOAuthClientRequest = async (clientId: string, token: string): Promise<Response> => {
        return fetch(`${SW360_API_URL}/authorization/client-management/${clientId}`, {
            method: 'DELETE',
            headers: {
                Accept: 'application/*',
                'Content-Type': 'application/json',
                Authorization: token,
            },
        })
    }

    const deleteProject = async () => {
        try {
            const session = await getSession()
            if (CommonUtils.isNullOrUndefined(session)) return
            const response = await sendOAuthClientRequest(clientId, session.user.access_token)
            if (response.status === HttpStatus.OK) {
                MessageService.success(t('Client deleted successfully'))
                setShow(false)
            } else if (response.status == HttpStatus.UNAUTHORIZED) {
                await signOut()
            } else {
                MessageService.error(t('Error when processing'))
            }
        } catch {
            MessageService.error(t('Error when processing'))
        }
    }

    const handleSubmit = () => {
        deleteProject().catch((err) => {
            console.error(err)
        })
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
                style={{ color: 'red' }}
            >
                <Modal.Title>
                    <AiOutlineQuestionCircle style={{ marginBottom: '5px' }} />
                    {t('Delete Client')} ?
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <>
                    {
                        <>
                            <Form>
                                <Form.Group>
                                    <Form.Label className='mb-3'>
                                        {t('Do you really want to delete this client')} ?
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
                    {t('Delete Client')}
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default DeleteClientDialog
