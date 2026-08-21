// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ColumnDef, getCoreRowModel, getSortedRowModel, SortingState, useReactTable } from '@tanstack/react-table'
import { StatusCodes } from 'http-status-codes'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { PageSizeSelector, SW360Table, TableFooter } from 'next-sw360'
import { Dispatch, ReactNode, SetStateAction, useEffect, useMemo, useState } from 'react'
import { Spinner } from 'react-bootstrap'
import { Embedded, ErrorDetails, ModerationRequest, PageableQueryParam, PaginationMeta } from '@/object-types'
import { ApiError, CommonUtils } from '@/utils'
import ApiUtils from '@/utils/api/authenticatedApi.util'
import BulkDeclineModerationRequestModal from './BulkDeclineModerationRequestModal'
import ExpandingModeratorCell from './ExpandingModeratorCell'

type EmbeddedModerationRequest = Embedded<ModerationRequest, 'sw360:moderationRequests'>
interface ModerationRequestMap {
    [key: string]: string
}

function ModerationRequestComponent({
    status,
    setModerationRequestCount,
}: {
    status: string
    setModerationRequestCount: Dispatch<SetStateAction<number>>
}): ReactNode {
    const t = useTranslations('default')
    const [mrIdArray, setMrIdArray] = useState<Array<string>>([])
    const [disableBulkDecline, setDisableBulkDecline] = useState(true)
    const [bulkDeclineMRModal, setBulkDeclineMRModal] = useState(false)
    const [mrIdNameMap, setMrIdNameMap] = useState<{
        [key: string]: string
    }>({})
    const moderationRequestStatus: ModerationRequestMap = {
        INPROGRESS: t('In Progress'),
        APPROVED: t('APPROVED'),
        PENDING: t('Pending'),
        REJECTED: t('REJECTED'),
    }

    const params = useSearchParams()

    const formatDate = (timestamp: number | undefined): string | null => {
        if (timestamp === undefined) {
            return null
        }
        const date = new Date(timestamp)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    const columns = useMemo<ColumnDef<ModerationRequest>[]>(
        () => [
            {
                id: 'requestDate',
                header: t('Date'),
                accessorKey: 'requestDate',
                enableSorting: true,
                cell: ({ row }) => <>{formatDate(row.original.timestamp)}</>,
            },
            {
                id: 'documentType',
                header: t('Type'),
                accessorKey: 'documentType',
                enableSorting: true,
                cell: (info) => info.getValue(),
            },
            {
                id: 'documentName',
                header: t('Document Name'),
                enableSorting: true,
                accessorKey: 'documentName',
                cell: ({ row }) => {
                    const { id, documentName } = row.original
                    return (
                        <Link
                            className='text-link'
                            href={'requests/moderationRequest/' + id}
                        >
                            {documentName}
                        </Link>
                    )
                },
            },
            {
                id: 'requestingUser',
                header: t('Requesting User'),
                enableSorting: true,
                accessorKey: 'requestingUser',
                cell: ({ row }) => {
                    const { requestingUser: email } = row.original
                    return (
                        <Link
                            href={`mailto:${email}`}
                            className='text-link'
                        >
                            {email}
                        </Link>
                    )
                },
            },
            {
                id: 'requestingUserDepartment',
                header: t('Department'),
                enableSorting: true,
                accessorKey: 'requestingUserDepartment',
                cell: ({ row }) => <>{row.original.requestingUserDepartment}</>,
            },
            {
                id: 'moderators',
                header: t('Moderators'),
                enableSorting: false,
                cell: ({ row }) => <ExpandingModeratorCell moderators={row.original.moderators ?? []} />,
            },
            {
                id: 'moderationState',
                header: t('State'),
                enableSorting: true,
                accessorKey: 'moderationState',
                cell: ({ row }) => (
                    <>{row.original.moderationState ? moderationRequestStatus[row.original.moderationState] : ''}</>
                ),
            },
            {
                id: 'actions',
                header: t('Actions'),
                cell: ({ row }) => {
                    const { id, documentName } = row.original
                    return (
                        <div className='form-check'>
                            <input
                                className='form-check-input'
                                type='checkbox'
                                name='moderationRequestId'
                                value={id}
                                checked={mrIdArray.includes(id)}
                                onChange={() => handleCheckboxes(id, documentName)}
                            />
                        </div>
                    )
                },
                meta: {
                    width: '6%',
                },
            },
        ],
        [
            t,
            mrIdArray,
        ],
    )

    const [pageableQueryParam, setPageableQueryParam] = useState<PageableQueryParam>({
        page: 0,
        page_entries: 10,
        sort: 'requestDate,desc',
    })
    const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | undefined>({
        size: 0,
        totalElements: 0,
        totalPages: 0,
        number: 0,
    })

    const [moderationRequestData, setModerationRequestData] = useState<ModerationRequest[]>(() => [])
    const memoizedData = useMemo(
        () => moderationRequestData,
        [
            moderationRequestData,
        ],
    )
    const [showProcessing, setShowProcessing] = useState(false)

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal

        const timeLimit = moderationRequestData.length !== 0 ? 700 : 0
        const timeout = setTimeout(() => {
            setShowProcessing(true)
        }, timeLimit)

        void (async () => {
            try {
                const searchParams = Object.fromEntries(params.entries())
                const queryUrl = CommonUtils.createUrlWithParams(
                    `moderationrequest`,
                    Object.fromEntries(
                        Object.entries({
                            moderationState: status,
                            ...searchParams,
                            ...pageableQueryParam,
                        }).map(([key, value]) => [
                            key,
                            String(value),
                        ]),
                    ),
                )
                const response = await ApiUtils.GET(queryUrl, signal)
                if (response.status !== StatusCodes.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new ApiError(err.message, {
                        status: response.status,
                    })
                }

                const data = (await response.json()) as EmbeddedModerationRequest
                setPaginationMeta(data.page)
                if (data.page) {
                    setModerationRequestCount(data.page.totalElements)
                } else {
                    setModerationRequestCount(0)
                }
                const openModerationRequests = CommonUtils.isNullOrUndefined(
                    data['_embedded']?.['sw360:moderationRequests'],
                )
                    ? []
                    : data['_embedded']['sw360:moderationRequests']
                setModerationRequestData(openModerationRequests)
            } catch (error) {
                ApiUtils.reportError(error)
            } finally {
                clearTimeout(timeout)
                setShowProcessing(false)
            }
        })()

        return () => controller.abort()
    }, [
        pageableQueryParam,
        params.toString(),
        setModerationRequestCount,
        status,
    ])

    useEffect(() => {
        setPageableQueryParam({
            page: 0,
            page_entries: 10,
            sort: params.toString() ? 'score,desc' : '',
        })
    }, [
        params.toString(),
    ])

    const table = useReactTable({
        data: memoizedData,
        columns,
        getCoreRowModel: getCoreRowModel(),

        state: {
            pagination: {
                pageIndex: pageableQueryParam.page,
                pageSize: pageableQueryParam.page_entries,
            },
            sorting: pageableQueryParam.sort
                ? [
                      {
                          id: pageableQueryParam.sort.split(',')[0],
                          desc: pageableQueryParam.sort.split(',')[1] === 'desc',
                      },
                  ]
                : [],
        },

        manualSorting: true,
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: (updater) => {
            setPageableQueryParam((prev) => {
                const prevSorting: SortingState = prev.sort
                    ? [
                          {
                              id: prev.sort.split(',')[0],
                              desc: prev.sort.split(',')[1] === 'desc',
                          },
                      ]
                    : []

                const nextSorting = typeof updater === 'function' ? updater(prevSorting) : updater

                if (nextSorting.length > 0) {
                    const { id, desc } = nextSorting[0]
                    return {
                        ...prev,
                        page: 0,
                        sort: `${id},${desc ? 'desc' : 'asc'}`,
                    }
                }

                return {
                    ...prev,
                    page: 0,
                    sort: '',
                }
            })
        },

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
    })

    const handleCheckboxes = (moderationRequestId: string, documentName: string) => {
        const updatedMrIdArray: string[] = [
            ...mrIdArray,
        ]
        const mrMap = {
            ...mrIdNameMap,
        }
        if (updatedMrIdArray.includes(moderationRequestId)) {
            const index = updatedMrIdArray.indexOf(moderationRequestId)
            updatedMrIdArray.splice(index, 1)
            delete mrMap[moderationRequestId]
        } else {
            mrMap[moderationRequestId] = documentName
            updatedMrIdArray.push(moderationRequestId)
        }
        setMrIdArray(updatedMrIdArray)
        setMrIdNameMap(mrMap)
        setDisableBulkDecline(updatedMrIdArray.length === 0)
    }

    return (
        <>
            <BulkDeclineModerationRequestModal
                show={bulkDeclineMRModal}
                setShow={setBulkDeclineMRModal}
                mrIdNameMap={mrIdNameMap}
            />
            <div className='row mb-4'>
                <div className='col-12'>
                    <button
                        className='btn btn-danger'
                        disabled={disableBulkDecline}
                        onClick={() => setBulkDeclineMRModal(true)}
                    >
                        {t('Bulk Actions')}
                    </button>
                </div>
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
        </>
    )
}

export default ModerationRequestComponent
