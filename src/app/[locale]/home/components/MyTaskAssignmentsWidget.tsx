// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { StatusCodes } from 'http-status-codes'
import Link from 'next/link'
import { getSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { SW360Table, TableFooter } from 'next-sw360'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import { Spinner } from 'react-bootstrap'
import type { Embedded, ErrorDetails, ModerationRequest, PageableQueryParam, PaginationMeta } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils/index'
import HomeTableHeader from './HomeTableHeader'

type EmbeddedTaskAssignments = Embedded<ModerationRequest, 'sw360:moderationRequests'>
interface TaskAssignmentStatusMap {
    [key: string]: string
}

function MyTaskAssignmentsWidget(): ReactNode {
    const t = useTranslations('default')
    const [reload, setReload] = useState(false)
    const taskAssignmentStatus: TaskAssignmentStatusMap = {
        INPROGRESS: t('In Progress'),
        APPROVED: t('APPROVED'),
        PENDING: t('Pending'),
        REJECTED: t('REJECTED'),
    }

    const columns = useMemo<ColumnDef<ModerationRequest>[]>(
        () => [
            {
                id: 'name',
                header: t('Document Name'),
                enableSorting: true,
                cell: ({ row }) => {
                    const { id, documentName } = row.original
                    return (
                        <Link
                            href={`/requests/moderationRequest/${id}`}
                            className='text-link'
                        >
                            {documentName}
                        </Link>
                    )
                },
                meta: {
                    width: '60%',
                },
            },
            {
                id: 'status',
                header: t('Status'),
                cell: ({ row }) => {
                    const { moderationState } = row.original
                    return <>{taskAssignmentStatus[moderationState ?? 'INPROGRESS']}</>
                },
                meta: {
                    width: '40%',
                },
            },
        ],
        [
            t,
        ],
    )

    const [pageableQueryParam, setPageableQueryParam] = useState<PageableQueryParam>({
        page: 0,
        page_entries: 5,
        sort: '',
    })
    const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | undefined>({
        size: 0,
        totalElements: 0,
        totalPages: 0,
        number: 0,
    })
    const [taskAssignmentData, setTaskAssignmentData] = useState<ModerationRequest[]>(() => [])
    const memoizedData = useMemo(
        () => taskAssignmentData,
        [
            taskAssignmentData,
        ],
    )
    const [showProcessing, setShowProcessing] = useState(false)

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal

        const timeLimit = taskAssignmentData.length !== 0 ? 400 : 0
        const timeout = setTimeout(() => {
            setShowProcessing(true)
        }, timeLimit)

        void (async () => {
            try {
                const session = await getSession()
                if (CommonUtils.isNullOrUndefined(session)) return signOut()

                const queryUrl = CommonUtils.createUrlWithParams(
                    `moderationrequest/byState`,
                    Object.fromEntries(
                        Object.entries({
                            ...pageableQueryParam,
                            state: 'open',
                            allDetails: false,
                        }).map(([key, value]) => [
                            key,
                            String(value),
                        ]),
                    ),
                )
                const response = await ApiUtils.GET(queryUrl, session.user.access_token, signal)
                if (response.status !== StatusCodes.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new Error(err.message)
                }

                const data = (await response.json()) as EmbeddedTaskAssignments
                setPaginationMeta(data.page)
                setTaskAssignmentData(
                    CommonUtils.isNullOrUndefined(data['_embedded']?.['sw360:moderationRequests'])
                        ? []
                        : data['_embedded']['sw360:moderationRequests'],
                )
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
        reload,
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
            sorting: [
                {
                    id: pageableQueryParam.sort.split(',')[0],
                    desc: pageableQueryParam.sort.split(',')[1] === 'desc',
                },
            ],
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
        <div>
            <HomeTableHeader
                title={t('My Task Assignments')}
                setReload={setReload}
            />
            <div className='mb-3'>
                {pageableQueryParam && table && paginationMeta ? (
                    <>
                        <SW360Table
                            table={table}
                            showProcessing={showProcessing}
                            noRecordsFoundMessage={t('NoTasksAssigned')}
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
    )
}

export default MyTaskAssignmentsWidget
