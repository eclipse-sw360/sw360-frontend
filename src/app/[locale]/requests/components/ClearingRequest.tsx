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
import { useSearchParams } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { ClientSidePageSizeSelector, ClientSideTableFooter, SW360Table } from 'next-sw360'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import { Button, OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap'
import { FaPencilAlt } from 'react-icons/fa'
import { ClearingRequest, Embedded, ErrorDetails, RequestType, UserGroupType } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils/index'

type EmbeddedClearingRequest = Embedded<ClearingRequest, 'sw360:clearingRequests'>

function ClearingRequestComponent({ requestType }: { requestType: RequestType }): ReactNode | undefined {
    const t = useTranslations('default')
    const session = useSession()
    const params = useSearchParams()

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            void signOut()
        }
    }, [
        session,
    ])

    const columns = useMemo<ColumnDef<ClearingRequest>[]>(
        () => [
            {
                id: 'requestId',
                header: t('Request ID'),
                cell: ({ row }) => (
                    <Link
                        href={`/requests/clearingRequest/detail/${row.original.id}`}
                        className='text-link'
                    >
                        {row.original.id}
                    </Link>
                ),
            },
            {
                id: 'baBlGroup',
                header: t('BA-BL/Group'),
                cell: ({ row }) => <>{row.original.projectBU ?? t('Not Available')}</>,
            },
            {
                id: 'tag',
                header: t('Tag'),
                cell: ({ row }) => <>{row.original._embedded?.['sw360:project']?.tag ?? t('Not Available')}</>,
            },
            {
                id: 'project',
                header: t('Project'),
                cell: ({ row }) => {
                    if (!Object.hasOwn(row.original, 'projectId')) {
                        return <>{t('Project Deleted')}</>
                    } else {
                        return (
                            <Link
                                href={`/projects/detail/${row.original.projectId}`}
                                className='text-link'
                            >
                                {row.original._embedded?.['sw360:project']?.name}
                            </Link>
                        )
                    }
                },
            },
            {
                id: 'openReleases',
                header: t('Open Releases'),
                cell: ({ row }) => {
                    if (!Object.hasOwn(row.original, 'projectId')) {
                        return <>{t('Project Deleted')}</>
                    } else {
                        return <>{row.original._embedded?.openRelease}</>
                    }
                },
            },
            {
                id: 'status',
                header: t('Status'),
                cell: ({ row }) => {
                    const { clearingState: status } = row.original
                    return (
                        <>
                            {status === 'NEW' && (
                                <OverlayTrigger overlay={<Tooltip>{t('CR New')}</Tooltip>}>
                                    <span className='d-inline-block'>{t(`${status}`)}</span>
                                </OverlayTrigger>
                            )}
                            {status === 'IN_PROGRESS' && (
                                <OverlayTrigger overlay={<Tooltip>{t('CR In Progress')}</Tooltip>}>
                                    <span className='d-inline-block'>{t(`${status}`)}</span>
                                </OverlayTrigger>
                            )}
                            {status === 'ACCEPTED' && (
                                <OverlayTrigger overlay={<Tooltip>{t('CR Accepted')}</Tooltip>}>
                                    <span className='d-inline-block'>{t(`${status}`)}</span>
                                </OverlayTrigger>
                            )}
                            {status === 'SANITY_CHECK' && (
                                <OverlayTrigger overlay={<Tooltip>{t('CR Sanity Check')}</Tooltip>}>
                                    <span className='d-inline-block'>{t(`${status}`)}</span>
                                </OverlayTrigger>
                            )}
                            {status === 'IN_QUEUE' && (
                                <OverlayTrigger overlay={<Tooltip>{t('CR In Queue')}</Tooltip>}>
                                    <span className='d-inline-block'>{t(`${status}`)}</span>
                                </OverlayTrigger>
                            )}
                            {status === 'AWAITING_RESPONSE' && (
                                <OverlayTrigger overlay={<Tooltip>{t('CR Awaiting Response')}</Tooltip>}>
                                    <span className='d-inline-block'>{t(`${status}`)}</span>
                                </OverlayTrigger>
                            )}
                            {status === 'ON_HOLD' && (
                                <OverlayTrigger overlay={<Tooltip>{t('CR On Hold')}</Tooltip>}>
                                    <span className='d-inline-block'>{t(`${status}`)}</span>
                                </OverlayTrigger>
                            )}
                            {status === 'PENDING_INPUT' && (
                                <OverlayTrigger overlay={<Tooltip>{t('CR Pending Input')}</Tooltip>}>
                                    <span className='d-inline-block'>{t(`${status}`)}</span>
                                </OverlayTrigger>
                            )}
                            {status === 'CLOSED' && (
                                <OverlayTrigger overlay={<Tooltip>{t('CR Closed')}</Tooltip>}>
                                    <span className='d-inline-block'>{t(`${status}`)}</span>
                                </OverlayTrigger>
                            )}
                            {status === 'REJECTED' && (
                                <OverlayTrigger overlay={<Tooltip>{t('CR Rejected')}</Tooltip>}>
                                    <span className='d-inline-block'>{t(`${status}`)}</span>
                                </OverlayTrigger>
                            )}
                        </>
                    )
                },
            },
            {
                id: 'priority',
                header: t('Priority'),
                cell: ({ row }) => {
                    const { priority } = row.original
                    return (
                        <>
                            {priority && priority === 'LOW' && (
                                <div className='text-success'>
                                    <OverlayTrigger overlay={<Tooltip>{t('CR Priority Low')}</Tooltip>}>
                                        <span className='d-inline-block'>
                                            <b>{t(`${priority}`)}</b>
                                        </span>
                                    </OverlayTrigger>
                                </div>
                            )}
                            {priority && priority === 'MEDIUM' && (
                                <div className='text-primary'>
                                    <OverlayTrigger overlay={<Tooltip>{t('CR Priority Medium')}</Tooltip>}>
                                        <span className='d-inline-block'>
                                            <b>{t(`${priority}`)}</b>
                                        </span>
                                    </OverlayTrigger>
                                </div>
                            )}
                            {priority && priority === 'HIGH' && (
                                <div className='text-warning'>
                                    <OverlayTrigger overlay={<Tooltip>{t('CR Priority High')}</Tooltip>}>
                                        <span className='d-inline-block'>
                                            <b>{t(`${priority}`)}</b>
                                        </span>
                                    </OverlayTrigger>
                                </div>
                            )}
                            {priority && priority === 'CRITICAL' && (
                                <div className='text-danger'>
                                    <OverlayTrigger overlay={<Tooltip>{t('CR Priority Critical')}</Tooltip>}>
                                        <span className='d-inline-block'>
                                            <b>{t(`${priority}`)}</b>
                                        </span>
                                    </OverlayTrigger>
                                </div>
                            )}
                        </>
                    )
                },
            },
            {
                id: 'requestingUser',
                header: t('Requesting User'),
                cell: ({ row }) => {
                    const requestingUser = row.original._embedded?.requestingUser
                    return requestingUser ? (
                        <Link
                            href={`mailto:${requestingUser.email}`}
                            className='text-link'
                        >
                            {requestingUser.fullName}
                        </Link>
                    ) : (
                        <>{t('Not Available')}</>
                    )
                },
            },
            {
                id: 'clearingProgress',
                header: t('Clearing Progress'),
                cell: ({ row }) => {
                    if (!Object.hasOwn(row.original, 'projectId')) {
                        return <>{t('Not Available')}</>
                    } else {
                        const openRelease = row.original._embedded?.openRelease
                        const totalRelease = row.original._embedded?.totalRelease
                        return (
                            <>
                                {openRelease && totalRelease
                                    ? totalRelease > 0
                                        ? (((totalRelease - openRelease) / totalRelease) * 100).toFixed(2) + '%'
                                        : '0%'
                                    : t('Not Available')}
                            </>
                        )
                    }
                },
            },
            {
                id: 'createdOn',
                header: t('Created On'),
                cell: ({ row }) => <>{row.original._embedded?.createdOn}</>,
            },
            {
                id: 'preferredClearingDate',
                header: t('Preferred Clearing Date'),
                cell: ({ row }) => <>{row.original.requestedClearingDate}</>,
            },
            {
                id: 'agreedClearingDate',
                header: t('Agreed Clearing Date'),
                cell: ({ row }) => <>{row.original.agreedClearingDate}</>,
            },
            {
                id: 'clearingType',
                header: t('Clearing Type'),
                cell: ({ row }) => {
                    const { clearingType } = row.original
                    return (
                        <>
                            {clearingType === 'DEEP' && (
                                <OverlayTrigger overlay={<Tooltip>{t('CR Type Deep')}</Tooltip>}>
                                    <span className='d-inline-block'>{t(`${clearingType}`)}</span>
                                </OverlayTrigger>
                            )}
                            {clearingType === 'HIGH' && (
                                <OverlayTrigger overlay={<Tooltip>{t('CR Type High')}</Tooltip>}>
                                    <span className='d-inline-block'>{t(`${clearingType}`)}</span>
                                </OverlayTrigger>
                            )}
                        </>
                    )
                },
            },
            {
                id: 'ctions',
                header: t('Actions'),
                cell: ({ row }) => {
                    return (
                        <>
                            <OverlayTrigger overlay={<Tooltip>{t('Edit')}</Tooltip>}>
                                <Button
                                    className='btn-transparent'
                                    hidden={
                                        !Object.hasOwn(row.original, 'projectId') ||
                                        !session.data ||
                                        (session.data.user.userGroup === UserGroupType.USER &&
                                            session.data.user.email !== row.original._embedded?.requestingUser?.email)
                                    }
                                >
                                    <Link
                                        href={`/requests/clearingRequest/edit/${row.original.id}`}
                                        className='overlay-trigger'
                                    >
                                        <FaPencilAlt className='btn-icon' />
                                    </Link>
                                </Button>
                            </OverlayTrigger>
                        </>
                    )
                },
                meta: {
                    width: '5%',
                },
            },
        ],
        [
            t,
            session,
        ],
    )
    const [clearingRequestData, setClearingRequestDataData] = useState<ClearingRequest[]>(() => [])
    const memoizedData = useMemo(
        () => clearingRequestData,
        [
            clearingRequestData,
        ],
    )
    const [showProcessing, setShowProcessing] = useState(false)

    useEffect(() => {
        if (session.status === 'loading') return
        const controller = new AbortController()
        const signal = controller.signal

        const timeLimit = clearingRequestData.length !== 0 ? 700 : 0
        const timeout = setTimeout(() => {
            setShowProcessing(true)
        }, timeLimit)

        void (async () => {
            try {
                if (CommonUtils.isNullOrUndefined(session.data)) return signOut()
                const searchParams = Object.fromEntries(params.entries())
                const queryUrl = CommonUtils.createUrlWithParams(
                    `clearingrequests`,
                    Object.fromEntries(
                        Object.entries({
                            ...searchParams,
                        }).map(([key, value]) => [
                            key,
                            String(value),
                        ]),
                    ),
                )
                const response = await ApiUtils.GET(queryUrl, session.data.user.access_token, signal)
                if (response.status !== StatusCodes.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new Error(err.message)
                }

                const data = (await response.json()) as EmbeddedClearingRequest
                const openClearingRequests = CommonUtils.isNullOrUndefined(data['_embedded']['sw360:clearingRequests'])
                    ? []
                    : data['_embedded']['sw360:clearingRequests'].filter(
                        (cr) => cr.clearingState !== 'REJECTED' && cr.clearingState !== 'CLOSED',
                    )

                const closedClearingRequests = CommonUtils.isNullOrUndefined(
                    data['_embedded']['sw360:clearingRequests'],
                )
                    ? []
                    : data['_embedded']['sw360:clearingRequests'].filter(
                        (cr) => cr.clearingState == 'REJECTED' || cr.clearingState === 'CLOSED',
                    )
                setClearingRequestDataData(requestType === 'OPEN' ? openClearingRequests : closedClearingRequests)
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return
                }
                const message = error instanceof Error ? error.message : String(error)
                MessageService.error(message)
            } finally {
                clearTimeout(timeout)
                setShowProcessing(false)
            }
        })()

        return () => controller.abort()
    }, [
        params.toString(),
        session,
        requestType,
    ])

    const table = useReactTable({
        data: memoizedData,
        columns,
        getCoreRowModel: getCoreRowModel(),

        getPaginationRowModel: getPaginationRowModel(),
    })

    return (
        <div className='row mb-4'>
            <div className='col d-flex justify-content-center align-items-center'>
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
        </div>
    )
}

export default ClearingRequestComponent
