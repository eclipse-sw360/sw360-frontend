// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ColumnDef, getCoreRowModel, getSortedRowModel, SortingState, useReactTable } from '@tanstack/react-table'
import { StatusCodes } from 'http-status-codes'
import { useTranslations } from 'next-intl'
import { PageSizeSelector, SW360Table, TableFooter, TableSearch } from 'next-sw360'
import { Dispatch, ReactNode, SetStateAction, useEffect, useMemo, useState } from 'react'
import { Form, Spinner } from 'react-bootstrap'
import { Embedded, ErrorDetails, PageableQueryParam, PaginationMeta, ReleaseDetail } from '@/object-types'
import { ApiError, CommonUtils } from '@/utils'
import ApiUtils from '@/utils/api/authenticatedApi.util'

type EmbeddedReleases = Embedded<ReleaseDetail, 'sw360:releaseLinks'>

export default function MergeReleaseTable({
    release,
    setRelease,
    componentId,
    releaseId,
}: Readonly<{
    release: ReleaseDetail | null
    setRelease: Dispatch<SetStateAction<null | ReleaseDetail>>
    componentId: string | null
    releaseId: string | null
}>): ReactNode {
    const t = useTranslations('default')
    const [search, setSearch] = useState<{
        searchText: string
        luceneSearch?: boolean
    }>({
        searchText: '',
    })

    const searchFunction = (value: string) => {
        if (value === '') {
            setSearch({
                searchText: '',
            })
        } else {
            setSearch({
                searchText: value,
                luceneSearch: true,
            })
        }
    }

    const columns = useMemo<ColumnDef<ReleaseDetail>[]>(
        () => [
            {
                id: 'select',
                cell: ({ row }) => (
                    <Form.Check
                        type='radio'
                        checked={release !== null && row.original.id === release.id}
                        onChange={() => {
                            setRelease(row.original)
                        }}
                    ></Form.Check>
                ),
                meta: {
                    width: '5%',
                },
            },
            {
                id: 'releaseName',
                accessorKey: 'name',
                header: t('Release Name'),
                enableSorting: true,
                cell: (info) => info.getValue(),
                meta: {
                    width: '45%',
                },
            },
            {
                id: 'version',
                header: t('Version'),
                cell: ({ row }) => <>{row.original.version ?? ''}</>,
                meta: {
                    width: '25%',
                },
            },
            {
                id: 'createdBy',
                header: t('Created by'),
                cell: ({ row }) => <>{row.original.createdBy ?? ''}</>,
                meta: {
                    width: '25%',
                },
            },
        ],
        [
            t,
            release,
        ],
    )

    const [componentReleaseData, setComponentReleaseData] = useState<ReleaseDetail[]>(() => [])
    const [pageableQueryParam, setPageableQueryParam] = useState<PageableQueryParam>({
        page: 0,
        page_entries: 10,
        sort: 'name,asc',
    })
    const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | undefined>({
        size: 0,
        totalElements: 0,
        totalPages: 0,
        number: 0,
    })
    const memoizedData = useMemo(
        () => componentReleaseData,
        [
            componentReleaseData,
        ],
    )
    const [showProcessing, setShowProcessing] = useState(false)

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal

        const timeLimit = componentReleaseData.length !== 0 ? 700 : 0
        const timeout = setTimeout(() => {
            setShowProcessing(true)
        }, timeLimit)

        void (async () => {
            try {
                const queryUrl = CommonUtils.createUrlWithParams(
                    `components/${componentId}/releases`,
                    Object.fromEntries(
                        Object.entries({
                            ...search,
                            ...pageableQueryParam,
                            allDetails: true,
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

                const data = (await response.json()) as EmbeddedReleases
                setPaginationMeta(data.page)
                setComponentReleaseData(data['_embedded']?.['sw360:releaseLinks'] ?? [])
            } catch (error) {
                ApiUtils.reportError(error)
            } finally {
                clearTimeout(timeout)
                if (!signal.aborted) {
                    setShowProcessing(false)
                }
            }
        })()

        return () => {
            controller.abort()
            clearTimeout(timeout)
        }
    }, [
        pageableQueryParam,
    ])

    useEffect(() => {
        setPageableQueryParam((prev) => ({
            ...prev,
            page: 0,
        }))
    }, [
        search,
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

        // server side sorting config
        manualSorting: true,
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: (updater) => {
            setPageableQueryParam((prev) => {
                const prevSorting: SortingState = [
                    {
                        id: prev.sort.split(',')[0],
                        desc: prev.sort.split(',')[1] === 'desc',
                    },
                ]

                const nextSorting = typeof updater === 'function' ? updater(prevSorting) : updater

                if (nextSorting.length > 0) {
                    const { id, desc } = nextSorting[0]
                    return {
                        ...prev,
                        sort: `${id},${desc ? 'desc' : 'asc'}`,
                    }
                }

                return {
                    ...prev,
                    sort: '',
                }
            })
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
        <div className='mb-3'>
            {pageableQueryParam && table && paginationMeta ? (
                <>
                    <div className='d-flex justify-content-between'>
                        <PageSizeSelector
                            pageableQueryParam={pageableQueryParam}
                            setPageableQueryParam={setPageableQueryParam}
                        />
                        <TableSearch searchFunction={searchFunction} />
                    </div>
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
    )
}
