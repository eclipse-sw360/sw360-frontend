// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useTranslations } from 'next-intl'
import { Embedded, HttpStatus } from '@/object-types'
import styles from '@/app/[locale]/requests/requestDetail.module.css'
import { signOut, useSession } from 'next-auth/react'
import { useCallback, useEffect, useState } from 'react'
import { ApiUtils } from '@/utils/index'
import { notFound } from 'next/navigation'
import MessageService from '@/services/message.service'
import ClearingRequestComments from '@/object-types/ClearingRequestComments'
import { Spinner } from 'react-bootstrap'


type EmbeddedClearingRequestComments = Embedded<ClearingRequestComments, 'sw360:comments'>

export default function ClearingComments({ clearingRequestId }:
                                         { clearingRequestId: string }) {
    const t = useTranslations('default')
    const [loading, setLoading] = useState(true)
    const { data:session, status } = useSession()
    const [comments, setComments] = useState<Array<ClearingRequestComments>>([])
    const [inputComment, setInputComment] = useState('')
    const [commentPayload, setCommentPayload] = useState({
        text: ''
    })

    const fetchData = useCallback(
        async (url: string) => {
            const response = await ApiUtils.GET(url, session.user.access_token)
            if (response.status == HttpStatus.OK) {
                const data = await response.json() as EmbeddedClearingRequestComments
                return data
            } else if (response.status == HttpStatus.UNAUTHORIZED) {
                return signOut()
            } else {
                notFound()
            }
        },[session]
    )

    useEffect(() => {
        setLoading(true)
        void fetchData(`clearingrequest/${clearingRequestId}/comments`).then(
                      (clearingRequestCommentList: EmbeddedClearingRequestComments) => {
            setComments(clearingRequestCommentList['_embedded']['sw360:comments'])
            setLoading(false)
        })}, [fetchData, session])

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
        const response = await ApiUtils.POST(`clearingrequest/${clearingRequestId}/comments`,
                                              commentPayload,
                                              session.user.access_token)
        if (response.status == HttpStatus.OK) {
            const response_data = await response.json() as EmbeddedClearingRequestComments
            setInputComment('')
            setComments(response_data._embedded['sw360:comments'])
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
        <>
            {loading == false ? (
                <table className={`table label-value-table ${styles['summary-table']}`}>
                    <thead>
                        <tr>
                            <th colSpan={2}>{t('Comments')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colSpan={2}>
                                <input className='form-control'
                                    type="text"
                                    name="text"
                                    placeholder={t('Enter Comment')}
                                    style={{ height: '50px',
                                            width: '100%',
                                            marginBottom: '20px' }}
                                    value={inputComment}
                                    onChange={updateInputField}/>
                                <button type='button'
                                        className='btn btn-accept mb-2'
                                        onClick={handleAddComment}>
                                    {t('Add Comment')}
                                </button>
                            </td>
                        </tr>
                        {comments.map((item) => (
                            <tr key={item.text}>
                                <td>
                                    {
                                        <p>
                                            {item._embedded['commentingUser']['fullName'].split(' ')
                                                        .map(word => (word as string)[0])
                                                        .join('')
                                                        .toUpperCase() ?? ''}
                                        </p>
                                    }
                                </td>
                                <td>
                                    {
                                        item.autoGenerated && 
                                            <p> 
                                                *** <b>{t('This is auto-generated comment')}</b> ***
                                            </p>
                                    }
                                    {item.text}
                                    {item.commentedBy}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className='col-12 d-flex justify-content-center align-items-center'>
                    <Spinner className='spinner' />
                </div>
            )}
        </>
    )}
}
