// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap'

interface UpdateCommentModalProps {
    show: boolean
    title: string
    initialValue?: string
    placeholder?: string
    onClose: () => void
    onUpdate: (value: string) => void
}

export default function UpdateCommentModal({
    show,
    title,
    initialValue,
    placeholder,
    onClose,
    onUpdate,
}: UpdateCommentModalProps) {
    const t = useTranslations('default')
    const [commentText, setCommentText] = useState('')

    useEffect(() => {
        if (show) {
            setCommentText(initialValue ?? '')
        }
    }, [
        show,
        initialValue,
    ])

    return (
        <Modal
            show={show}
            onHide={onClose}
            backdrop='static'
            centered
            size='lg'
        >
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <input
                    type='text'
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className='form-control'
                    placeholder={placeholder ?? title}
                />
            </Modal.Body>
            <Modal.Footer className='justify-content-end'>
                <button
                    type='button'
                    className='fw-bold btn btn-light me-2'
                    onClick={onClose}
                >
                    {t('Cancel')}
                </button>
                <button
                    type='button'
                    className='fw-bold btn btn-primary me-2'
                    onClick={() => onUpdate(commentText)}
                >
                    {t('Update')}
                </button>
            </Modal.Footer>
        </Modal>
    )
}
