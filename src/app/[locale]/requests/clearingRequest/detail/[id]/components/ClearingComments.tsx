// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import parse from 'html-react-parser'
import { StatusCodes } from 'http-status-codes'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { ReactNode, useEffect, useState } from 'react'
import { Spinner } from 'react-bootstrap'

import { ClearingRequestComments, Embedded } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils/index'

type EmbeddedClearingRequestComments = Embedded<ClearingRequestComments, 'sw360:comments'>

export default function ClearingComments({
    clearingRequestId,
}: Readonly<{
    clearingRequestId: string | undefined
}>): ReactNode | undefined {
    const t = useTranslations('default')
    const [loading, setLoading] = useState(true)
    const [comments, setComments] = useState<Array<ClearingRequestComments>>([])
    const [inputComment, setInputComment] = useState('')
    const [commentPayload, setCommentPayload] = useState({
        text: '',
    })
    const { status } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [
        status,
    ])

    const formatDate = (timestamp: number | undefined): string | null => {
        if (timestamp === undefined) {
            return null
        }
        const date = new Date(timestamp)
        const dateISOString = date.toISOString()
        return `${dateISOString.slice(0, 10)}  ${dateISOString.slice(11, 19)}`
    }

    const fetchData = async (url: string) => {
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) return signOut()
        const response = await ApiUtils.GET(url, session.user.access_token)
        if (response.status == StatusCodes.OK) {
            const data = (await response.json()) as EmbeddedClearingRequestComments
            return data
        } else if (response.status == StatusCodes.UNAUTHORIZED) {
            return signOut()
        } else {
            notFound()
        }
    }

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            try {
                const clearingRequestCommentList = await fetchData(`clearingrequest/${clearingRequestId}/comments`)
                if (clearingRequestCommentList === undefined) {
                    return
                }

                if (
                    !CommonUtils.isNullOrUndefined(clearingRequestCommentList['_embedded']) &&
                    !CommonUtils.isNullOrUndefined(clearingRequestCommentList['_embedded']['sw360:comments'])
                ) {
                    setComments(clearingRequestCommentList['_embedded']['sw360:comments'])
                }
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        void load()
    }, [])

    const updateInputField = (event: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
        setInputComment(event.target.value)
        setCommentPayload({
            ...commentPayload,
            [event.target.name]: event.target.value,
        })
    }

    const handleAddComment = async () => {
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) return signOut()
        const response = await ApiUtils.POST(
            `clearingrequest/${clearingRequestId}/comments`,
            commentPayload,
            session.user.access_token,
        )
        if (response.status == StatusCodes.OK) {
            const response_data = (await response.json()) as EmbeddedClearingRequestComments
            setInputComment('')
            setComments(response_data._embedded['sw360:comments'])
            MessageService.success(t('Your comments updated successfully'))
            setCommentPayload({
                text: '',
            })
        } else if (response.status == StatusCodes.UNAUTHORIZED) {
            return signOut()
        } else {
            MessageService.error(t('There are some problem to update your comments'))
        }
    }

    return (
        <>
            {loading == false ? (
                <table className='table label-value-table request-summary-table'>
                    <thead>
                        <tr>
                            <th colSpan={2}>{t('Comments')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colSpan={2}>
                                <input
                                    className='form-control'
                                    type='text'
                                    name='text'
                                    placeholder={t('Enter Comment')}
                                    style={{
                                        height: '50px',
                                        width: '100%',
                                        marginBottom: '20px',
                                    }}
                                    value={inputComment}
                                    onChange={updateInputField}
                                />
                                <button
                                    type='button'
                                    className='btn btn-accept mb-2'
                                    onClick={() => void handleAddComment()}
                                >
                                    {t('Add Comment')}
                                </button>
                            </td>
                        </tr>
                        {comments.map((item: ClearingRequestComments) => (
                            <tr key={item.commentedOn}>
                                <td
                                    style={{
                                        padding: '5px !important',
                                        width: '3%',
                                    }}
                                >
                                    <div>
                                        {item._embedded?.commentingUser?.fullName
                                            ?.split(' ')
                                            .map((word) => word[0])
                                            .join('')
                                            .toUpperCase() ?? ''}
                                    </div>
                                </td>
                                <td>
                                    <div>
                                        {item.autoGenerated !== undefined && (
                                            <>
                                                *** <b>{t('This is auto-generated comment')}</b> ***
                                            </>
                                        )}
                                    </div>
                                    <div>
                                        {item.text !== undefined &&
                                            parse(
                                                item.text
                                                    .replace(/<li>/g, '<li style="margin-left:10px;">')
                                                    .replace(/\n/g, '<br />&emsp;&emsp;'),
                                            )}
                                    </div>
                                    <div>
                                        {
                                            <>
                                                -- by &thinsp;{' '}
                                                {
                                                    <i>
                                                        <Link
                                                            className='text-link'
                                                            href={`mailto:${item.commentedBy}`}
                                                        >
                                                            <b>{item._embedded?.commentingUser?.fullName}</b>
                                                        </Link>
                                                    </i>
                                                }{' '}
                                                &thinsp; on &thinsp;
                                                <i>{formatDate(item.commentedOn)}</i>
                                            </>
                                        }
                                    </div>
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
    )
}
