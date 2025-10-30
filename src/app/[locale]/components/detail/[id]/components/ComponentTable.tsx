// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ColumnDef, getCoreRowModel, getSortedRowModel, SortingState, useReactTable } from '@tanstack/react-table'
import { StatusCodes } from 'http-status-codes'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { PageSizeSelector, SW360Table, TableFooter, TableSearch } from 'next-sw360'
import { Dispatch, ReactNode, SetStateAction, useEffect, useMemo, useState } from 'react'
import { Form, Spinner } from 'react-bootstrap'
import { Component, Embedded, ErrorDetails, PageableQueryParam, PaginationMeta } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'

type EmbeddedComponents = Embedded<Component, 'sw360:components'>

export default function ComponentTable({
    component,
    setComponent,
}: Readonly<{
    component: Component | null
    setComponent: Dispatch<SetStateAction<null | Component>>
}>): ReactNode {
    const t = useTranslations('default')
    const session = useSession()
    const [search, setSearch] = useState<{
        name: string
        lucenseSearch?: boolean
    }>({
        name: '',
    })

    const searchFunction = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.currentTarget.value === '') {
            setSearch({
                name: '',
            })
        } else {
            setSearch({
                name: event.currentTarget.value,
                lucenseSearch: true,
            })
        }
    }

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            void signOut()
        }
    }, [
        session,
    ])

    const columns = useMemo<ColumnDef<Component>[]>(
        () => [
            {
                id: 'select',
                cell: ({ row }) => (
                    <Form.Check
                        type='radio'
                        checked={component !== null && row.original.id === component.id}
                        onChange={() => setComponent(row.original)}
                    ></Form.Check>
                ),
                meta: {
                    width: '5%',
                },
            },
            {
                id: 'componentName',
                accessorKey: 'name',
                header: t('Component Name'),
                enableSorting: true,
                cell: (info) => info.getValue(),
                meta: {
                    width: '45%',
                },
            },
            {
                id: 'createdBy',
                header: t('Created by'),
                cell: ({ row }) => <>{row.original._embedded?.createdBy?.fullName ?? ''}</>,
                meta: {
                    width: '25%',
                },
            },
            {
                id: 'releases',
                header: t('Releases'),
                cell: ({ row }) => <>{row.original._embedded?.['sw360:releases']?.length ?? 0}</>,
                meta: {
                    width: '25%',
                },
            },
        ],
        [
            t,
            component,
        ],
    )

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
    const [componentData, setComponentData] = useState<Component[]>(() => [])
    const memoizedData = useMemo(
        () => componentData,
        [
            componentData,
        ],
    )
    const [showProcessing, setShowProcessing] = useState(false)

    useEffect(() => {
        if (session.status === 'loading') return
        const controller = new AbortController()
        const signal = controller.signal

        const timeLimit = componentData.length !== 0 ? 700 : 0
        const timeout = setTimeout(() => {
            setShowProcessing(true)
        }, timeLimit)

        void (async () => {
            try {
                if (CommonUtils.isNullOrUndefined(session.data)) return signOut()
                const queryUrl = CommonUtils.createUrlWithParams(
                    `components`,
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
                const response = await ApiUtils.GET(queryUrl, session.data.user.access_token, signal)
                if (response.status !== StatusCodes.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new Error(err.message)
                }

                const data = (await response.json()) as EmbeddedComponents
                setPaginationMeta(data.page)
                setComponentData(
                    CommonUtils.isNullOrUndefined(data['_embedded']['sw360:components'])
                        ? []
                        : data['_embedded']['sw360:components'],
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
        session,
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
