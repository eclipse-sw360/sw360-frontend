// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useTranslations } from 'next-intl'
import { ClearingRequestDetails, HttpStatus } from '@/object-types'
import styles from '@/app/[locale]/requests/requestDetail.module.css'
import { signOut, useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { ApiUtils } from '@/utils/index'
import { notFound } from 'next/navigation'
import MessageService from '@/services/message.service'


interface comment {
    text?: string
    commentedBy?: string
}

export default function ClearingComments({ clearingRequestDetails }:
                                         { clearingRequestDetails: ClearingRequestDetails }) {
    const t = useTranslations('default')
    const { data:session, status } = useSession()
    const [comments, setComments] = useState<Array<comment>>([])
    const [inputComment, setInputComment] = useState('')
    const [commentPayload, setCommentPayload] = useState({
        text: ''
    })

    useEffect(() => {
        setComments(clearingRequestDetails.comments);
      }, [clearingRequestDetails.comments])

    const updateInputField = (event: React.ChangeEvent<HTMLSelectElement |
                                     HTMLInputElement |
                                     HTMLTextAreaElement>) => {
        setInputComment(event.target.value)
        setCommentPayload({
            ...commentPayload,
            [event.target.name]: event.target.value,
        })
    }

    const handleAddComment = async () => {
        const response = await ApiUtils.POST(`clearingrequest/${clearingRequestDetails.id}/comments`,
                                              commentPayload,
                                              session.user.access_token)
        if (response.status == HttpStatus.OK) {
            const response_data = await response.json()
            setInputComment('')
            setComments(response_data)
            MessageService.success(t('Your comments updated successfully'))
        } else if (response.status == HttpStatus.UNAUTHORIZED) {
            return signOut()
        } else {
            MessageService.error(t('There are some problem to update your comments'))
            notFound()
        }
    }

    if (status === 'unauthenticated') {
        signOut()
    } else {
        return (
            <div>
                <table className={`table label-value-table ${styles['summary-table']}`}>
                    <thead>
                        <tr>
                            <th colSpan={2}>{t('Comments')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colSpan={2}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <input
                                        className='form-control'
                                        type="text"
                                        placeholder={t('Enter Comment')}
                                        style={{ height: '50px', marginBottom: '10px' }}
                                    />
                                    <button
                                        type='button'
                                        className='btn btn-accept'
                                        style={{ width: 'fit-content' }}
                                        onClick={handleAddComment}
                                    >
                                        {t('Add Comment')}
                                    </button>
                                </div>
                            </td>
                        </tr>
                        {comments.map((item) => (
                            <tr key={item.text}>
                                <td>{item.text}</td>
                                <td>{item.commentedBy}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
}
