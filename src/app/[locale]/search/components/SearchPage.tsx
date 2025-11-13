// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { PageSizeSelector, SW360Table, TableFooter } from 'next-sw360'
import { ReactNode, useMemo, useState } from 'react'
import { Alert, Spinner } from 'react-bootstrap'
import icons from '@/assets/icons/icons.svg'
import { PageableQueryParam, PaginationMeta, SearchResult } from '@/object-types'
import KeywordSearch from './KeywordSearch'

export default function Search(): ReactNode {
    const t = useTranslations('default')

    const columns = useMemo<ColumnDef<SearchResult>[]>(
        () => [
            {
                id: 'type',
                header: t('Type'),
                cell: ({ row }) => {
                    const { type } = row.original
                    return (
                        <div className='text-center'>
                            {(() => {
                                if (type === 'package') {
                                    return (
                                        <svg
                                            className='package_icon mb-1'
                                            height={18}
                                            width={18}
                                        >
                                            <use href={`${icons.src}#project`}></use>
                                        </svg>
                                    )
                                } else {
                                    return (
                                        <svg
                                            className={`${type}_icon mb-1`}
                                            height={18}
                                            width={18}
                                        >
                                            <use href={`${icons.src}#${type}`}></use>
                                        </svg>
                                    )
                                }
                            })()}
                        </div>
                    )
                },
                meta: {
                    width: '10%',
                },
            },
            {
                id: 'text',
                header: t('Text'),
                cell: ({ row }) => {
                    const { id, type, name } = row.original
                    return (
                        <>
                            {(() => {
                                if (type === 'project') {
                                    return (
                                        <Link
                                            href={`/projects/detail/${id}`}
                                            className='text-link'
                                        >
                                            {name}
                                        </Link>
                                    )
                                } else if (type === 'release') {
                                    return (
                                        <Link
                                            href={`/components/releases/detail/${id}`}
                                            className='text-link'
                                        >
                                            {name}
                                        </Link>
                                    )
                                } else if (type === 'component') {
                                    return (
                                        <Link
                                            href={`/components/detail/${id}`}
                                            className='text-link'
                                        >
                                            {name}
                                        </Link>
                                    )
                                } else if (type === 'license') {
                                    return (
                                        <Link
                                            href={`/licenses/detail/?id=${id}`}
                                            className='text-link'
                                        >
                                            {name}
                                        </Link>
                                    )
                                } else if (type === 'package') {
                                    return (
                                        <Link
                                            href={`/packages/detail/${id}`}
                                            className='text-link'
                                        >
                                            {name}
                                        </Link>
                                    )
                                } else if (type === 'obligation') {
                                    return (
                                        <Link
                                            href={`/obligations/detail/${id}`}
                                            className='text-link'
                                        >
                                            {name}
                                        </Link>
                                    )
                                } else if (type === 'vendor') {
                                    return <p>{name}</p>
                                } else if (type === 'user') {
                                    return <p>{name}</p>
                                }
                            })()}
                        </>
                    )
                },
                meta: {
                    width: '90%',
                },
            },
        ],
        [
            t,
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
    const [searchData, setSearchData] = useState<SearchResult[]>(() => [])
    const memoizedData = useMemo(
        () => searchData,
        [
            searchData,
        ],
    )
    const [showProcessing, setShowProcessing] = useState(false)

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
    })

    return (
        <>
            <div className='container page-content'>
                <div className='row mt-2'>
                    <div className='col-lg-2'>
                        <KeywordSearch
                            setData={setSearchData}
                            setShowProcessing={setShowProcessing}
                            setPaginationMeta={setPaginationMeta}
                            pageableQueryParam={pageableQueryParam}
                        />
                    </div>
                    <div className='col'>
                        <div className='row d-flex justify-content-end'>
                            <div className='col text-truncate buttonheader-title'>
                                {t('SEARCH RESULTS')} ({paginationMeta?.totalElements ?? 0})
                            </div>
                        </div>
                        <div className='row'>
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
                            <div className='col-lg-8'>
                                <Alert
                                    variant='warning'
                                    dismissible
                                >
                                    {t.rich('SEARCH_NOTE', {
                                        p: (chunks) => <p>{chunks}</p>,
                                        ul: (chunks) => <ul>{chunks}</ul>,
                                        li: (chunks) => <li>{chunks}</li>,
                                        underline: (chunks) => (
                                            <span className='text-decoration-underline'>{chunks}</span>
                                        ),
                                        bold: (chunks) => <span className='fw-medium'>{chunks}</span>,
                                    })}
                                </Alert>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
