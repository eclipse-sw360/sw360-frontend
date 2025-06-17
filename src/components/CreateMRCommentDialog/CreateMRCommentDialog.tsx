// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ProjectPayload } from '@/object-types'
import { useTranslations } from 'next-intl'
// import { useRouter } from 'next/navigation'
import { ChangeEvent, useState, type JSX } from 'react'
import { Alert, Button, Form, Modal } from 'react-bootstrap'
import { FaPencilAlt } from 'react-icons/fa'

interface Props {
    projectPayload: ProjectPayload
    show: boolean
    setShow: React.Dispatch<React.SetStateAction<boolean>>
}

export default function CreateMRCommentDialog({ projectPayload, show, setShow }: Props): JSX.Element {
    const t = useTranslations('default')
    // const router = useRouter()
    const [variant, setVariant] = useState('success')
    const [message, setMessage] = useState('')
    const [showMessage, setShowMessage] = useState(false)
    const [reloadPage, setReloadPage] = useState(false)
    const [visuallyHideLinkedData, setVisuallyHideLinkedData] = useState(true)
    // Comment functionality is not implemented yet. This feature should be added in the future.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [comment, setComment] = useState('')

    const handleSubmit = () => {
        console.log(projectPayload, setMessage, setVariant, setShowMessage, setReloadPage, setVisuallyHideLinkedData)
    }

    const handleCloseDialog = () => {
        setShow(!show)
        setShowMessage(false)
        setComment('')
        setVisuallyHideLinkedData(!visuallyHideLinkedData)
        if (reloadPage === true) {
            window.location.reload()
        }
    }

    const handleUserComment = (e: ChangeEvent<HTMLInputElement>) => {
        setComment(e.target.value)
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
                style={{ color: 'blue' }}
            >
                <Modal.Title>
                    <FaPencilAlt style={{ marginBottom: '5px' }} />
                    &nbsp;&nbsp;{t('Create moderation request')}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <>
                    <Alert
                        variant={variant}
                        onClose={() => setShowMessage(false)}
                        dismissible
                        show={showMessage}
                    >
                        {message}
                    </Alert>
                    <Form>
                        <Form.Group className='mb-3'>
                            <Form.Label style={{ fontWeight: 'bold' }}>{t('Please comment your changes')}</Form.Label>
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
                    hidden={reloadPage}
                >
                    {t('Send moderation request')}
                </Button>
            </Modal.Footer>
        </Modal>
    )
}
