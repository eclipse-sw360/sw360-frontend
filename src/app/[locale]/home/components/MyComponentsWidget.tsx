// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import MessageService from '@/services/message.service'
import { ColumnDef, getCoreRowModel, SortingState, useReactTable } from '@tanstack/react-table'
import { getSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import { Spinner } from 'react-bootstrap'

import { HttpStatus } from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils'
import { SW360Table, TableFooter } from 'next-sw360'
import Link from 'next/link'

import { Component, Embedded, ErrorDetails, PageableQueryParam, PaginationMeta } from '@/object-types'
import HomeTableHeader from './HomeTableHeader'

type EmbeddedComponents = Embedded<Component, 'sw360:components'>

export default function MyComponentsWidget(): ReactNode {
    const t = useTranslations('default')
    const [reload, setReload] = useState(false)

    const columns = useMemo<ColumnDef<Component>[]>(
        () => [
            {
                id: 'name',
                accessorKey: 'name',
                header: t('Component Name'),
                enableSorting: true,
                cell: ({ row }) => {
                    const { name, id } = row.original
                    return (
                        <Link
                            href={`/components/detail/${id}`}
                            className='text-link'
                        >
                            {name}
                        </Link>
                    )
                },
                meta: {
                    width: '40%',
                },
            },
            {
                id: 'description',
                header: t('Description'),
                accessorKey: 'description',
                cell: (info) => info.getValue(),
                meta: {
                    width: '60%',
                },
            },
        ],
        [t],
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
    const [componentData, setComponentData] = useState<Component[]>(() => [])
    const memoizedData = useMemo(() => componentData, [componentData])
    const [showProcessing, setShowProcessing] = useState(false)

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal

        const timeLimit = componentData.length !== 0 ? 400 : 0
        const timeout = setTimeout(() => {
            setShowProcessing(true)
        }, timeLimit)

        void (async () => {
            try {
                const session = await getSession()
                if (CommonUtils.isNullOrUndefined(session)) return signOut()

                const queryUrl = CommonUtils.createUrlWithParams(
                    `components/mycomponents`,
                    Object.fromEntries(Object.entries(pageableQueryParam).map(([key, value]) => [key, String(value)])),
                )
                const response = await ApiUtils.GET(queryUrl, session.user.access_token, signal)
                if (response.status !== HttpStatus.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new Error(err.message)
                }

                const data = (await response.json()) as EmbeddedComponents
                setPaginationMeta(data.page)
                setComponentData(
                    CommonUtils.isNullOrUndefined(data['_embedded']?.['sw360:components'])
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
    }, [pageableQueryParam, reload])

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
        <div>
            <HomeTableHeader
                title={t('My Components')}
                setReload={setReload}
            />
            <div className='mb-3'>
                {pageableQueryParam && table && paginationMeta ? (
                    <>
                        <SW360Table
                            table={table}
                            showProcessing={showProcessing}
                            noRecordsFoundMessage={t('NotOwnComponent')}
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
