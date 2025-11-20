// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ColumnDef, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table'
import { StatusCodes } from 'http-status-codes'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { ClientSidePageSizeSelector, ClientSideTableFooter, SW360Table } from 'next-sw360'
import { Dispatch, ReactNode, SetStateAction, useEffect, useMemo, useState } from 'react'
import { Form, Modal, OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap'
import { AiOutlineQuestionCircle } from 'react-icons/ai'
import { BiInfoCircle } from 'react-icons/bi'
import { ModerationRequestPayload } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils/index'

interface propType {
    [key: string]: string
}

interface ModerationRequestRow {
    moderationRequestId: string
    documentName: string
    progress: number
}

export default function BulkDeclineModerationRequestModal({
    show,
    setShow,
    mrIdNameMap,
}: {
    show: boolean
    setShow: Dispatch<SetStateAction<boolean>>
    mrIdNameMap: propType
}): ReactNode {
    const t = useTranslations('default')
    const [disableAcceptMr, setDisableAcceptMr] = useState<boolean>(false)
    const [disableDeclineMr, setDisableDeclineMr] = useState<boolean>(false)
    const [tableData, setTableData] = useState<Array<ModerationRequestRow>>([])
    const [hasComment, setHasComment] = useState<boolean>(false)
    const [moderationRequestPayload, setModerationRequestPayload] = useState<ModerationRequestPayload>({
        action: '',
        comment: '',
    })

    const session = useSession()

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            void signOut()
        }
    }, [
        session,
    ])

    const computeProgress = (responseCode: number) => {
        switch (responseCode) {
            case 202:
                return 1
            case 405:
                return 2
            case 500:
                return 3
            default:
                return 0
        }
    }

    const columns = useMemo<ColumnDef<ModerationRequestRow>[]>(
        () => [
            {
                id: 'documentName',
                header: t('Document Name'),
                cell: ({ row }) => {
                    const { documentName, moderationRequestId } = row.original
                    return (
                        <Link
                            className='link'
                            href={`/requests/moderationRequest/${moderationRequestId}`}
                        >
                            {documentName}
                        </Link>
                    )
                },
            },
            {
                id: 'status',
                header: t('Status'),
                cell: ({ row }) => {
                    const { progress: progressStatus } = row.original
                    return (
                        <div className='d-flex justify-items-center'>
                            <div hidden={progressStatus === 0}>
                                {progressStatus === 1 && (
                                    <>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                color: 'green',
                                            }}
                                        >
                                            &nbsp;&nbsp;{t('Success')}&nbsp;&nbsp;
                                            <OverlayTrigger
                                                overlay={<Tooltip>{t('Request processed successfully')}</Tooltip>}
                                            >
                                                <span className='d-inline-block'>
                                                    <BiInfoCircle
                                                        size={18}
                                                        style={{
                                                            color: 'black',
                                                        }}
                                                    />
                                                </span>
                                            </OverlayTrigger>
                                        </div>
                                    </>
                                )}
                                {progressStatus === 2 && (
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            color: 'orange',
                                        }}
                                    >
                                        &nbsp;&nbsp;{t('Request Already Closed')}&nbsp;&nbsp;
                                        <OverlayTrigger
                                            overlay={<Tooltip>{t('Moderation request is already closed')}</Tooltip>}
                                        >
                                            <span className='d-inline-block'>
                                                <BiInfoCircle
                                                    size={18}
                                                    style={{
                                                        color: 'black',
                                                    }}
                                                />
                                            </span>
                                        </OverlayTrigger>
                                    </div>
                                )}
                                {progressStatus === 3 && (
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            color: 'red',
                                        }}
                                    >
                                        &nbsp;&nbsp;{t('Failed')}&nbsp;&nbsp;
                                        <OverlayTrigger
                                            overlay={<Tooltip>{t('There are internal server error')}</Tooltip>}
                                        >
                                            <span className='d-inline-block'>
                                                <BiInfoCircle
                                                    size={18}
                                                    style={{
                                                        color: 'black',
                                                    }}
                                                />
                                            </span>
                                        </OverlayTrigger>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                },
            },
        ],
        [
            t,
        ],
    )
    const [showProcessing, setShowProcessing] = useState(false)

    useEffect(() => {
        setTableData(
            Object.entries(mrIdNameMap).map(([key, value]) => {
                return {
                    moderationRequestId: key,
                    documentName: value,
                    progress: 0,
                } as ModerationRequestRow
            }),
        )
    }, [
        mrIdNameMap,
    ])

    const handleCommentValidation = (comment: string) => {
        if (!comment.trim()) {
            return false
        }
        return true
    }

    const handleUserComment = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const updatedComment = event.target.value
        setModerationRequestPayload({
            ...moderationRequestPayload,
            [event.target.name]: updatedComment,
        })
        const hasCommentStatus: boolean = handleCommentValidation(updatedComment)
        setHasComment(hasCommentStatus)
    }

    const rejectModerationRequest = async (singleMrId: string, updatedRejectPayload: ModerationRequestPayload) => {
        if (CommonUtils.isNullOrUndefined(session.data)) return signOut()
        try {
            setShowProcessing(true)
            const hasComment = handleCommentValidation(moderationRequestPayload.comment)
            if (hasComment) {
                const response = await ApiUtils.PATCH(
                    `moderationrequest/${singleMrId}`,
                    updatedRejectPayload,
                    session.data.user.access_token,
                )
                if (response.status == StatusCodes.ACCEPTED) {
                    await response.json()
                    const progressStatus = computeProgress(response.status)
                    setTableData((prevData) => {
                        const updatedData = prevData.map((row) => {
                            if (row.moderationRequestId === singleMrId) {
                                return {
                                    moderationRequestId: row.moderationRequestId,
                                    documentName: row.documentName,
                                    progress: progressStatus,
                                }
                            }
                            return row
                        })
                        return updatedData
                    })
                    MessageService.success(t('You have rejected the moderation request'))
                } else if (response.status == StatusCodes.METHOD_NOT_ALLOWED) {
                    const progressStatus = computeProgress(response.status)
                    setTableData((prevData) => {
                        const updatedData = prevData.map((row) => {
                            if (row.moderationRequestId === singleMrId) {
                                return {
                                    moderationRequestId: row.moderationRequestId,
                                    documentName: row.documentName,
                                    progress: progressStatus,
                                }
                            }
                            return row
                        })
                        return updatedData
                    })
                    MessageService.warn(t('Moderation request is already closed'))
                } else if (response.status == StatusCodes.INTERNAL_SERVER_ERROR) {
                    const progressStatus = computeProgress(response.status)
                    setTableData((prevData) => {
                        const updatedData = prevData.map((row) => {
                            if (row.moderationRequestId === singleMrId) {
                                return {
                                    moderationRequestId: row.moderationRequestId,
                                    documentName: row.documentName,
                                    progress: progressStatus,
                                }
                            }
                            return row
                        })
                        return updatedData
                    })
                    MessageService.error(t('There are internal server error'))
                } else if (response.status == StatusCodes.UNAUTHORIZED) {
                    return signOut()
                } else {
                    MessageService.error(t('There are some errors while updating moderation request'))
                }
            } else {
                MessageService.error(t('Mandatory fields are empty please provide required data'))
            }
        } catch (error) {
            console.log(error)
        } finally {
            setShowProcessing(false)
        }
    }

    const acceptModerationRequest = async (singleMrId: string, updatedAcceptPayload: ModerationRequestPayload) => {
        if (CommonUtils.isNullOrUndefined(session.data)) return signOut()
        try {
            setShowProcessing(true)
            const hasComment = handleCommentValidation(moderationRequestPayload.comment)
            if (hasComment) {
                const response = await ApiUtils.PATCH(
                    `moderationrequest/${singleMrId}`,
                    updatedAcceptPayload,
                    session.data.user.access_token,
                )
                if (response.status == StatusCodes.ACCEPTED) {
                    await response.json()
                    const progressStatus = computeProgress(response.status)
                    setTableData((prevData) => {
                        const updatedData = prevData.map((row) => {
                            if (row.moderationRequestId === singleMrId) {
                                return {
                                    moderationRequestId: row.moderationRequestId,
                                    documentName: row.documentName,
                                    progress: progressStatus,
                                }
                            }
                            return row
                        })
                        return updatedData
                    })
                    MessageService.success(t('You have accepted the moderation request'))
                } else if (response.status == StatusCodes.METHOD_NOT_ALLOWED) {
                    const progressStatus = computeProgress(response.status)
                    setTableData((prevData) => {
                        const updatedData = prevData.map((row) => {
                            if (row.moderationRequestId === singleMrId) {
                                return {
                                    moderationRequestId: row.moderationRequestId,
                                    documentName: row.documentName,
                                    progress: progressStatus,
                                }
                            }
                            return row
                        })
                        return updatedData
                    })
                    MessageService.warn(t('Moderation request is already closed'))
                } else if (response.status == StatusCodes.INTERNAL_SERVER_ERROR) {
                    const progressStatus = computeProgress(response.status)
                    setTableData((prevData) => {
                        const updatedData = prevData.map((row) => {
                            if (row.moderationRequestId === singleMrId) {
                                return {
                                    moderationRequestId: row.moderationRequestId,
                                    documentName: row.documentName,
                                    progress: progressStatus,
                                }
                            }
                            return row
                        })
                        return updatedData
                    })
                    MessageService.error(t('There are internal server error'))
                } else if (response.status == StatusCodes.UNAUTHORIZED) {
                    return signOut()
                } else {
                    MessageService.error(t('There are some errors while updating moderation request'))
                }
            } else {
                MessageService.error(t('Mandatory fields are empty please provide required data'))
            }
        } catch (error) {
            console.log(error)
        } finally {
            setShowProcessing(false)
        }
    }

    const handleBulkDeclineModerationRequests = async () => {
        setDisableAcceptMr(true)
        const updatedRejectPayload = {
            ...moderationRequestPayload,
            action: 'REJECT',
        }
        setModerationRequestPayload(updatedRejectPayload)
        for (const [key] of Object.entries(mrIdNameMap)) {
            await rejectModerationRequest(key, updatedRejectPayload)
        }
    }

    const handleBulkAcceptModerationRequests = async () => {
        setDisableDeclineMr(true)
        const updatedAcceptPayload = {
            ...moderationRequestPayload,
            action: 'ACCEPT',
        }
        setModerationRequestPayload(updatedAcceptPayload)
        for (const [key] of Object.entries(mrIdNameMap)) {
            await acceptModerationRequest(key, updatedAcceptPayload)
        }
    }

    const memoizedData = useMemo(
        () => tableData,
        [
            tableData,
        ],
    )
    const table = useReactTable({
        data: memoizedData,
        columns,
        getCoreRowModel: getCoreRowModel(),

        getPaginationRowModel: getPaginationRowModel(),

        meta: {
            rowHeightConstant: true,
        },
    })

    return (
        <>
            <Modal
                size='lg'
                centered
                show={show}
                onHide={() => {
                    setShow(false)
                    setHasComment(false)
                    setDisableAcceptMr(false)
                    setDisableDeclineMr(false)
                }}
                aria-labelledby={t('Accept Decline All Selected Moderation Requests')}
                scrollable
            >
                <Modal.Header
                    style={{
                        backgroundColor: '#feefef',
                        color: '#da1414',
                    }}
                    closeButton
                >
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
                                    <div className='mb-3'>
                                        {table ? (
                                            <>
                                                <ClientSidePageSizeSelector table={table} />
                                                <SW360Table
                                                    table={table}
                                                    showProcessing={showProcessing}
                                                />
                                                <ClientSideTableFooter table={table} />
                                            </>
                                        ) : (
                                            <div className='col-12 mt-1 text-center'>
                                                <Spinner className='spinner' />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Form.Label>
                            <br />
                            <Form.Label
                                style={{
                                    fontWeight: 'bold',
                                }}
                            >
                                {t('Please provide your comments')}{' '}
                                <span
                                    className='text-red'
                                    style={{
                                        color: '#F7941E',
                                    }}
                                >
                                    *
                                </span>
                            </Form.Label>
                            <p
                                className='subscriptionBox'
                                style={{
                                    textAlign: 'left',
                                }}
                            >
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
                            setDisableAcceptMr(false)
                            setDisableDeclineMr(false)
                        }}
                    >
                        {disableAcceptMr || disableDeclineMr ? t('Close') : t('Cancel')}
                    </button>
                    <button
                        className='btn btn-danger'
                        onClick={async () => {
                            await handleBulkDeclineModerationRequests()
                        }}
                        disabled={!hasComment || disableDeclineMr}
                    >
                        {t('Bulk Decline Moderation Requests')}{' '}
                        {showProcessing && (
                            <Spinner
                                size='sm'
                                className='ms-1 spinner'
                            />
                        )}
                    </button>
                    <button
                        className='btn btn-success'
                        onClick={async () => {
                            await handleBulkAcceptModerationRequests()
                        }}
                        disabled={!hasComment || disableAcceptMr}
                    >
                        {t('Bulk Accept Moderation Requests')}{' '}
                        {showProcessing && (
                            <Spinner
                                size='sm'
                                className='ms-1 spinner'
                            />
                        )}
                    </button>
                </Modal.Footer>
            </Modal>
        </>
    )
}
