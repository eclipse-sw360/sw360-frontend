// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { ChangeEvent, type JSX, useEffect, useState } from 'react'
import { Button, Form, Modal } from 'react-bootstrap'
import { BsPencil } from 'react-icons/bs'

interface Props<T> {
    show: boolean
    setShow: React.Dispatch<React.SetStateAction<boolean>>
    updateEntity: (payload?: T) => Promise<void>
    setEntityPayload: React.Dispatch<React.SetStateAction<T>>
}

export default function CreateMRCommentDialog<T>({
    show,
    setShow,
    updateEntity,
    setEntityPayload,
}: Props<T>): JSX.Element {
    const t = useTranslations('default')
    const [userComment, setUserComment] = useState('')
    const [loading, setLoading] = useState(false)
    const { status } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [
        status,
    ])

    const handleCloseDialog = () => {
        setShow(!show)
        setUserComment('')
    }

    const handleUserComment = (e: ChangeEvent<HTMLInputElement>) => {
        setUserComment(e.target.value)
    }

    const handleSubmit = async () => {
        setLoading(true)
        let updatedPayload: T | undefined
        setEntityPayload((prev) => {
            if (!prev) return prev
            updatedPayload = {
                ...prev,
                comment: userComment,
            }
            return updatedPayload
        })

        if (updatedPayload) {
            await updateEntity(updatedPayload)
        }
        setLoading(false)
        setShow(!show)
        setUserComment('')
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
                    color: 'blue',
                }}
            >
                <Modal.Title>
                    <BsPencil
                        style={{
                            marginBottom: '5px',
                        }}
                        size={20}
                    />
                    &nbsp;&nbsp;{t('Create moderation request')}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <>
                    <Form>
                        <Form.Group className='mb-3'>
                            <Form.Label
                                style={{
                                    fontWeight: 'bold',
                                }}
                            >
                                {t('Please comment your changes')}
                            </Form.Label>
                            <Form.Control
                                as='textarea'
                                aria-label='With textarea'
                                placeholder={t('Leave a comment on your moderation request')}
                                onChange={handleUserComment}
                            />
                        </Form.Group>
                    </Form>
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
                    disabled={userComment.length === 0 || loading}
                >
                    {t('Send moderation request')}
                </Button>
            </Modal.Footer>
        </Modal>
    )
}
