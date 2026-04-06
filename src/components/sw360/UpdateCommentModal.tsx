// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap'
import { UpdateCommentModalMetadata } from '@/object-types'

interface UpdateCommentModalProps {
    modalMetaData: UpdateCommentModalMetadata | null
    setModalMetaData: Dispatch<SetStateAction<UpdateCommentModalMetadata | null>>
    setCommentInPayload?: (s: string) => void
}

export default function UpdateCommentModal({
    modalMetaData,
    setModalMetaData,
    setCommentInPayload,
}: UpdateCommentModalProps) {
    const t = useTranslations('default')
    const [commentText, setCommentText] = useState('')
    const { status } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            void signOut()
        }
    }, [
        status,
    ])

    useEffect(() => {
        setCommentText(modalMetaData?.initialCommentValue ?? '')
    }, [
        modalMetaData,
    ])
    return (
        <Modal
            show={modalMetaData ? true : false}
            onHide={() => {
                setModalMetaData(null)
                setCommentText('')
            }}
            backdrop='static'
            centered
            size='lg'
        >
            <Modal.Header closeButton>
                <Modal.Title>{t('Enter comment')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <input
                    type='text'
                    value={commentText}
                    onChange={(e) => {
                        setCommentText(e.target.value)
                    }}
                    className='form-control'
                    placeholder={t('Enter comment')}
                />
            </Modal.Body>
            <Modal.Footer className='justify-content-end'>
                <button
                    type='button'
                    className='fw-bold btn btn-light me-2'
                    onClick={() => {
                        setModalMetaData(null)
                        setCommentText('')
                    }}
                >
                    {t('Cancel')}
                </button>
                <button
                    type='button'
                    className='fw-bold btn btn-primary me-2'
                    onClick={() => {
                        if (modalMetaData !== null && setCommentInPayload) {
                            setCommentInPayload(commentText)
                            setCommentText('')
                            setModalMetaData(null)
                        }
                    }}
                >
                    {t('Update')}
                </button>
            </Modal.Footer>
        </Modal>
    )
}
