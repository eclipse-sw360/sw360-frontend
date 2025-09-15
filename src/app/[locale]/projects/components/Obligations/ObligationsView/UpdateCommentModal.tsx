// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { LicenseObligationData } from '@/object-types'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap'

interface UpdateCommentModalMetadata {
    obligation: string
    comment?: string
}

interface UpdateCommentModalProps {
    modalMetaData: UpdateCommentModalMetadata | null
    setModalMetaData: Dispatch<SetStateAction<UpdateCommentModalMetadata | null>>
    payload?: LicenseObligationData
    setPayload?: Dispatch<SetStateAction<LicenseObligationData>>
}

export default function UpdateCommentModal({
    modalMetaData,
    setModalMetaData,
    payload,
    setPayload,
}: UpdateCommentModalProps) {
    const t = useTranslations('default')
    const [commentText, setCommentText] = useState('')
    const { status } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [status])

    useEffect(() => {
        setCommentText(modalMetaData?.comment ?? '')
    }, [modalMetaData])
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
                <Modal.Title>{t('Enter obligation comment')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <input
                    type='text'
                    value={commentText}
                    onChange={(e) => {
                        setCommentText(e.target.value)
                    }}
                    className='form-control'
                    placeholder={t('Enter obligation comment')}
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
                        if (modalMetaData !== null && payload && setPayload) {
                            let obligationValue = payload[modalMetaData.obligation] ?? {}
                            obligationValue = { ...obligationValue, comment: commentText }
                            setPayload((payload: LicenseObligationData) => ({
                                ...payload,
                                [modalMetaData.obligation]: obligationValue,
                            }))
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
