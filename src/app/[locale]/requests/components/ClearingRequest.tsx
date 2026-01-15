// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { StatusCodes } from 'http-status-codes'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { PageSizeSelector, SW360Table, TableFooter } from 'next-sw360'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import { Button, OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap'
import { BsPencil } from 'react-icons/bs'
import {
    ClearingRequest,
    Embedded,
    ErrorDetails,
    PageableQueryParam,
    PaginationMeta,
    RequestType,
    UserGroupType,
} from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils/index'

type EmbeddedClearingRequest = Embedded<ClearingRequest, 'sw360:clearingRequests'>

function ClearingRequestComponent({ requestType }: { requestType: RequestType }): ReactNode | undefined {
    const t = useTranslations('default')
    const session = useSession()
    const params = useSearchParams()

    const [pageableQueryParam, setPageableQueryParam] = useState<PageableQueryParam>({
        page: 0,
        page_entries: 10,
        sort: '',
    })
    const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | undefined>({
        size: 0,
        totalElements: 0,
        totalPages: 0,
        number: 0,
    })

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
                                {row.original._embedded?.['sw360:projectDTOs']?.[0]?.name}
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
                id: 'actions',
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
                                        href={`/requests/clearingRequest/detail/${row.original.id}`}
                                        className='overlay-trigger'
                                    >
                                        <BsPencil
                                            className='btn-icon'
                                            size={20}
                                        />
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
                const statusFilter =
                    requestType === 'OPEN'
                        ? 'NEW,ACCEPTED,IN_PROGRESS,PENDING_INPUT,SANITY_CHECK,IN_QUEUE,AWAITING_RESPONSE,ON_HOLD'
                        : 'CLOSED,REJECTED'

                const queryUrl = CommonUtils.createUrlWithParams(
                    `clearingrequests`,
                    Object.fromEntries(
                        Object.entries({
                            ...searchParams,
                            ...pageableQueryParam,
                            status: statusFilter,
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
                setPaginationMeta(data.page)
                const clearingRequests = CommonUtils.isNullOrUndefined(data['_embedded']['sw360:clearingRequests'])
                    ? []
                    : data['_embedded']['sw360:clearingRequests']
                setClearingRequestDataData(clearingRequests)
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
        pageableQueryParam,
        params.toString(),
        session,
        requestType,
    ])

    useEffect(() => {
        setPageableQueryParam({
            page: 0,
            page_entries: 10,
            sort: '',
        })
    }, [
        params.toString(),
    ])

    const table = useReactTable({
        data: memoizedData,
        columns,
        getCoreRowModel: getCoreRowModel(),

        // table state config
        state: {
            pagination: {
                pageIndex: pageableQueryParam.page,
                pageSize: pageableQueryParam.page_entries,
            },
        },

        // server side pagination config
        manualPagination: true,
        pageCount: paginationMeta?.totalPages ?? 1,
        onPaginationChange: (updater) => {
            const next =
                typeof updater === 'function'
                    ? updater({
                          pageIndex: pageableQueryParam.page,
                          pageSize: pageableQueryParam.page_entries,
                      })
                    : updater

            setPageableQueryParam((prev) => ({
                ...prev,
                page: next.pageIndex + 1,
                page_entries: next.pageSize,
            }))
        },

        meta: {
            rowHeightConstant: true,
        },
    })

    return (
        <div className='row mb-4'>
            <div className='col d-flex justify-content-center align-items-center'>
                <div className='mb-3'>
                    {pageableQueryParam && table && paginationMeta ? (
                        <>
                            <PageSizeSelector
                                pageableQueryParam={pageableQueryParam}
                                setPageableQueryParam={setPageableQueryParam}
                            />
                            <SW360Table
                                table={table}
                                showProcessing={showProcessing}
                            />
                            <TableFooter
                                pageableQueryParam={pageableQueryParam}
                                setPageableQueryParam={setPageableQueryParam}
                                paginationMeta={paginationMeta}
                            />
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
