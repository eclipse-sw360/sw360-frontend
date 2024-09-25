// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { HttpStatus, ModerationRequestPayload } from '@/object-types'
import { ApiUtils } from '@/utils/index'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { Alert, Form, Modal, Spinner } from 'react-bootstrap'
import { AiOutlineQuestionCircle } from 'react-icons/ai'
import MessageService from '@/services/message.service'
import { signOut, useSession } from 'next-auth/react'
import { _, Table } from 'next-sw360'
import { ProgressBar } from 'react-bootstrap'
import { notFound } from 'next/navigation'

interface Message {
    type: 'success' | 'danger'
    message: string
}

interface propType {
    [key: string]: string
}

export default function BulkDeclineModerationRequestModal({
    show,
    setShow,
    mrIdNameMap
}: {
    show: boolean
    setShow: Dispatch<SetStateAction<boolean>>
    mrIdNameMap: propType
}) {
    const t = useTranslations('default')
    const [loading, setLoading] = useState(true)
    const { data: session, status } = useSession()
    const [deleting] = useState<boolean>(undefined)
    const [tableData, setTableData] = useState<Array<any>>([])
    const [hasComment, setHasComment] = useState<boolean>(false)
    const [message, setMessage] = useState<undefined | Message>(undefined)
    const [moderationRequestPayload, setModerationRequestPayload] =
                    useState<ModerationRequestPayload>({
        action: '',
        comment: ''
    })

    const computeProgress = (responseCode:number) => {
        switch (responseCode) {
            case 202:
            case 405:
            case 500:
                return 100
            default:
                return 0;
        }
    }

    const columns = [
        {
            id: 'bulkModerationRequestAction.documentName',
            name: t('Document Name'),
            sort: true,
            width: "50%",
            formatter: ({moderationRequestId, documentName}:
                        {moderationRequestId: string; documentName: string}) =>
                _(
                    <>
                        <Link className='link'
                            href={`/requests/moderationRequest/${moderationRequestId}`}>
                            {documentName}
                        </Link>
                    </>
                ),
        },
        {
            id: 'bulkModerationRequestAction.status',
            name: t('Status'),
            sort: true,
            width: "50%",
            formatter: ({progressStatus}: {progressStatus:number}) => 
                _(
                    <div style={{width: "80%"}}>
                        <ProgressBar now={progressStatus} label={`${progressStatus}%`} />
                    </div>
                )
        },
    ]

    useEffect(() => {
        setLoading(true)
        setTableData(
            Object.entries(mrIdNameMap).map(([key, value]) => {
                return [
                        {
                            moderationRequestId: key,
                            documentName: value
                        },
                        {progressStatus : 0}
                    ]
            })
        )
        setLoading(false)
    },[mrIdNameMap])

    const handleCommentValidation = (comment: string) => {
        if (!comment.trim()) {
            return false
        }
        return true
    }

    const handleUserComment = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const updatedComment = event.target.value;
        setModerationRequestPayload({
            ...moderationRequestPayload,
            [event.target.name]: updatedComment,
        })
        const hasCommentStatus: boolean = handleCommentValidation(updatedComment);
        setHasComment(hasCommentStatus)
    }

    const rejectModerationRequest = async (singleMrId: string,
                                                 updatedRejectPayload:ModerationRequestPayload
                                                ) => {
        const hasComment = handleCommentValidation(moderationRequestPayload.comment)
        if (hasComment){
            const response = await ApiUtils.PATCH(`moderationrequest/${singleMrId}`,
                                                   updatedRejectPayload,
                                                   session.user.access_token)
            if (response.status == HttpStatus.ACCEPTED) {
                await response.json()
                const progressStatus = computeProgress(response.status)
                setTableData((prevData) => {
                    const updatedData = prevData.map((row) => {
                        if (row[0].moderationRequestId === singleMrId) {
                            return [
                                {
                                    moderationRequestId: row[0].moderationRequestId,
                                    documentName: row[0].documentName,
                                },
                                { progressStatus }
                            ]
                        } else {
                            return row
                        }
                    })
                    return updatedData
                })
                // MessageService.success(t('You have rejected the moderation request'))
            }
            else if (response.status == HttpStatus.NOT_ALLOWED) {
                return notFound()
            }
            else if (response.status == HttpStatus.UNAUTHORIZED) {
                return signOut()
            }
            else {
                MessageService.error(t('There are some errors while updating moderation request'))
            }
        }
        else {
            MessageService.error(t('Mandatory fields are empty please provide required data'))
        }
    }

    const handleBulkDeclineModerationRequests = async () => {
        const updatedRejectPayload = {
            ...moderationRequestPayload,
            action: "REJECT"
        }
        setModerationRequestPayload(updatedRejectPayload)
        for (const [key] of Object.entries(mrIdNameMap)){
            await rejectModerationRequest(key, updatedRejectPayload)
        }
    }


    if (status === 'unauthenticated') {
        signOut()
    } else {
        return (
            <>
                <Modal
                    size='lg'
                    centered
                    show={show}
                    onHide={() => {
                        if (!deleting) {
                            setShow(false)
                            setMessage(undefined)
                            setHasComment(false)
                        }
                    }}
                    aria-labelledby={t('Decline All Selected Moderation Requests')}
                    scrollable
                >
                    <Modal.Header style={{ backgroundColor: '#feefef',
                                        color: '#da1414' }}
                                closeButton>
                        <Modal.Title id='delete-all-license-info-modal'>
                            <AiOutlineQuestionCircle />
                                {t('Decline All Selected Moderation Requests')}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {message && (
                            <Alert variant={message.type} id='declineBulkMR.message.alert'>
                                {message.message}
                            </Alert>
                        )}
                        <p className='my-3'>{t('Decline All MRs')}</p> 
                        <Form>
                        <Form.Group className='mb-3'>
                            <Form.Label className='mb-1'>
                                {t.rich('Your selected Moderation requests are')}
                                <div className='col-12 d-flex justify-content-center align-items-center'>
                                    {loading == false ? (
                                        <div style={{ paddingLeft: '0px' }}>
                                            <Table columns={columns}
                                                data={tableData}
                                                sort={false}
                                                selector={true}
                                            />
                                        </div>
                                        ) : (
                                                <Spinner className='spinner' />
                                        )
                                    }
                                </div>
                            </Form.Label>
                            <br />
                            <Form.Label style={{ fontWeight: 'bold' }}>
                                {t('Please provide your comments')}{' '}
                                <span className='text-red' style={{ color: '#F7941E' }}>
                                    *
                                </span>
                            </Form.Label>
                            <p className='subscriptionBox'
                                style={{textAlign: 'left'}}>
                                {t('Note for comments')}
                            </p>
                            <Form.Control
                                as='textarea'
                                name='comment'
                                aria-label='With textarea'
                                placeholder='Comment your message...'
                                onChange={handleUserComment}
                                required
                                />
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <button
                            className='btn btn-dark'
                            onClick={() => {
                                setShow(false)
                                setMessage(undefined)
                                setHasComment(false)
                            }}
                            disabled={deleting}
                        >
                            {t('Cancel')}
                        </button>
                        <button
                            className='btn btn-danger'
                            onClick={async () => {
                                await handleBulkDeclineModerationRequests()
                            }}
                            disabled={deleting || !hasComment}
                        >
                            {t('Bulk Decline Moderation Requests')}{' '}
                            {deleting && 
                                <Spinner size='sm' className='ms-1 spinner' />
                            }
                        </button>
                        <button
                            className='btn btn-success'
                            onClick={async () => {
                                // await handleBulkAcceptModerationRequests()
                            }}
                            disabled={deleting || !hasComment}
                        >
                            {t('Bulk Accept Moderation Requests')}{' '}
                            {deleting && 
                                <Spinner size='sm' className='ms-1 spinner' />
                            }
                        </button>
                    </Modal.Footer>
                </Modal>
            </>
        )
    }
}
