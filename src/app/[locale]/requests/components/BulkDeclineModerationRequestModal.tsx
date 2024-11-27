// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { HttpStatus, ModerationRequestPayload } from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils/index'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Dispatch, SetStateAction, useEffect, useState, ReactNode } from 'react'
import { Form, Modal, OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap'
import { AiOutlineQuestionCircle } from 'react-icons/ai'
import MessageService from '@/services/message.service'
import { signOut, getSession, useSession } from 'next-auth/react'
import { _, Table } from 'next-sw360'
import { BiCheckCircle, BiInfoCircle, BiXCircle } from 'react-icons/bi'
import { BsFillExclamationCircleFill } from 'react-icons/bs'


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
}) : ReactNode {
    const t = useTranslations('default')
    const [loading, setLoading] = useState<boolean>(true)
    const [disableAcceptMr, setDisableAcceptMr] = useState<boolean>(false)
    const [disableDeclineMr, setDisableDeclineMr] = useState<boolean>(false)
    const [statusCheck, setStatusCheck] = useState<number>()
    const [tableData, setTableData] = useState<Array<any>>([])
    const [hasComment, setHasComment] = useState<boolean>(false)
    const { status } = useSession()
    const [moderationRequestPayload, setModerationRequestPayload] =
                    useState<ModerationRequestPayload>({
        action: '',
        comment: ''
    })

    const computeProgress = (responseCode:number) => {
        switch (responseCode) {
            case 202:
                return 1
            case 405:
                return 2
            case 500:
                return 3
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
                    <div  style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ marginLeft: '10px' }}>
                            {statusCheck === HttpStatus.ACCEPTED && (
                                <>
                                    <BiCheckCircle color="green" size={15} />
                                    
                                </>
                            )}
                            {statusCheck === HttpStatus.NOT_ALLOWED && (
                                <>
                                    <BsFillExclamationCircleFill  color="orange" size={15} />
                                    
                                </>
                            )}
                            {statusCheck === HttpStatus.INTERNAL_SERVER_ERROR && (
                                <>
                                    <BiXCircle  color="red" size={15} />
                                    
                                </>
                            )}
                        </div>
                        <div hidden={progressStatus === 0}>
                            {
                                progressStatus === 1 && (
                                    <>
                                        <div style={{ display: 'flex',
                                                      alignItems: 'center',
                                                      color: 'green' }}>
                                            &nbsp;&nbsp;{t('Success')}&nbsp;&nbsp;
                                            <OverlayTrigger overlay={
                                                <Tooltip>
                                                    {t('Request processed successfully')}
                                                </Tooltip>}>
                                                <span className='d-inline-block'>
                                                    <BiInfoCircle size={18}
                                                                  style={{ color: 'black' }}/>
                                                </span>
                                            </OverlayTrigger>
                                        </div>
                                    </>
                                )
                            }
                            {
                                progressStatus === 2 && (
                                    <div style={{ display: 'flex',
                                                  alignItems: 'center',
                                                  color: 'orange' }}>
                                        &nbsp;&nbsp;{t('Request Already Closed')}&nbsp;&nbsp;
                                        <OverlayTrigger overlay={
                                            <Tooltip>
                                                {t('Moderation request is already closed')}
                                            </Tooltip>}>
                                            <span className='d-inline-block'>
                                                <BiInfoCircle size={18}
                                                              style={{ color: 'black' }}/>
                                            </span>
                                        </OverlayTrigger>
                                    </div>
                                )
                            }
                            {
                                progressStatus === 3 && (
                                    <div style={{ display: 'flex',
                                                  alignItems: 'center',
                                                  color: 'red' }}>
                                        &nbsp;&nbsp;{t('Failed')}&nbsp;&nbsp;
                                        <OverlayTrigger overlay={
                                            <Tooltip>
                                                {t('There are internal server error')}
                                            </Tooltip>}>
                                            <span className='d-inline-block'>
                                                <BiInfoCircle size={18}
                                                              style={{ color: 'black' }}/>
                                            </span>
                                        </OverlayTrigger>
                                    </div>
                                )
                            }
                        </div>
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
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session))
            return signOut()
        try {
            const hasComment = handleCommentValidation(moderationRequestPayload.comment)
            if (hasComment){
                const response = await ApiUtils.PATCH(`moderationrequest/${singleMrId}`,
                                                    updatedRejectPayload,
                                                    session.user.access_token)
                if (response.status == HttpStatus.ACCEPTED) {
                    await response.json()
                    setStatusCheck(HttpStatus.ACCEPTED)
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
                    MessageService.success(t('You have rejected the moderation request'))
                }
                else if (response.status == HttpStatus.NOT_ALLOWED) {
                    setStatusCheck(HttpStatus.NOT_ALLOWED)
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
                    MessageService.warn(t('Moderation request is already closed'))
                }
                else if (response.status == HttpStatus.INTERNAL_SERVER_ERROR) {
                    setStatusCheck(HttpStatus.INTERNAL_SERVER_ERROR)
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
                    MessageService.error(t('There are internal server error'))
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
        catch(error) {
            console.log(error)
        }
    }

    const acceptModerationRequest = async (singleMrId: string,
                                                 updatedAcceptPayload:ModerationRequestPayload
                                                ) => {
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session))
            return signOut()                                            
        try {
            const hasComment = handleCommentValidation(moderationRequestPayload.comment)
            if (hasComment){
                const response = await ApiUtils.PATCH(`moderationrequest/${singleMrId}`,
                                                    updatedAcceptPayload,
                                                    session.user.access_token)
                if (response.status == HttpStatus.ACCEPTED) {
                    await response.json()
                    setStatusCheck(HttpStatus.ACCEPTED)
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
                    MessageService.success(t('You have accepted the moderation request'))
                }
                else if (response.status == HttpStatus.NOT_ALLOWED) {
                    setStatusCheck(HttpStatus.NOT_ALLOWED)
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
                    MessageService.warn(t('Moderation request is already closed'))
                }
                else if (response.status == HttpStatus.INTERNAL_SERVER_ERROR) {
                    setStatusCheck(HttpStatus.INTERNAL_SERVER_ERROR)
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
                    MessageService.error(t('There are internal server error'))
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
        catch(error) {
            console.log(error)
        }
    }

    const handleBulkDeclineModerationRequests = async () => {
        setDisableAcceptMr(true)
        const updatedRejectPayload = {
            ...moderationRequestPayload,
            action: "REJECT"
        }
        setModerationRequestPayload(updatedRejectPayload)
        for (const [key] of Object.entries(mrIdNameMap)){
            await rejectModerationRequest(key, updatedRejectPayload)
        }
    }

    const handleBulkAcceptModerationRequests = async () => {
        setDisableDeclineMr(true)
        const updatedAcceptPayload = {
            ...moderationRequestPayload,
            action: "ACCEPT"
        }
        setModerationRequestPayload(updatedAcceptPayload)
        for (const [key] of Object.entries(mrIdNameMap)){
            await acceptModerationRequest(key, updatedAcceptPayload)
        }
    }


    if (status === 'unauthenticated') {
        return signOut()
    } else {
        return (
            <>
                <Modal
                    size='lg'
                    centered
                    show={show}
                    onHide={() => {
                        setShow(false)
                        setHasComment(false)
                        setStatusCheck(0)
                        setDisableAcceptMr(false)
                        setDisableDeclineMr(false)
                    }}
                    aria-labelledby={t('Accept Decline All Selected Moderation Requests')}
                    scrollable
                >
                    <Modal.Header style={{ backgroundColor: '#feefef',
                                        color: '#da1414' }}
                                closeButton>
                        <Modal.Title id='delete-all-license-info-modal'>
                            <AiOutlineQuestionCircle />
                                {t('Accept Decline All Selected Moderation Requests')}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p className='my-3'>{t('Accept Decline All MRs')}</p> 
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
                                setHasComment(false)
                                setStatusCheck(0)
                                setDisableAcceptMr(false)
                                setDisableDeclineMr(false)
                            }}
                        >
                            {(disableAcceptMr || disableDeclineMr) ? t('Close') : t('Cancel')}
                            
                        </button>
                        <button
                            className='btn btn-danger'
                            onClick={async () => {
                                await handleBulkDeclineModerationRequests()
                            }}
                            disabled={!hasComment || disableDeclineMr}
                        >
                            {t('Bulk Decline Moderation Requests')}{' '}
                            {loading && 
                                <Spinner size='sm' className='ms-1 spinner' />
                            }
                        </button>
                        <button
                            className='btn btn-success'
                            onClick={async () => {
                                await handleBulkAcceptModerationRequests()
                            }}
                            disabled={!hasComment || disableAcceptMr}
                        >
                            {t('Bulk Accept Moderation Requests')}{' '}
                            {loading && 
                                <Spinner size='sm' className='ms-1 spinner' />
                            }
                        </button>
                    </Modal.Footer>
                </Modal>
            </>
        )
    }
}
