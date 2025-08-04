// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { ColumnMeta, PageableQueryParam, PaginationMeta } from '@/object-types'
import { Table, flexRender } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'
import { Dispatch, Fragment, ReactNode, SetStateAction } from 'react'
import { BiSort } from 'react-icons/bi'
import { RiSortAsc, RiSortDesc } from 'react-icons/ri'

export function TableFooter({
    pageableQueryParam,
    setPageableQueryParam,
    paginationMeta,
}: {
    pageableQueryParam: PageableQueryParam
    setPageableQueryParam: Dispatch<SetStateAction<PageableQueryParam>>
    paginationMeta: PaginationMeta
}): ReactNode {
    const t = useTranslations('default')

    if (paginationMeta.totalElements === 0) {
        return (
            <div className='table-component d-flex justify-content-between align-items-center mt-3'>
                <p className='mb-0'>
                    {t.rich('showing page entries', {
                        entryStart: 0,
                        entryEnd: 0,
                        totalElements: 0,
                    })}
                </p>
            </div>
        )
    }

    const currentPage = paginationMeta.number
    const totalPages = paginationMeta.totalPages
    const pageSize = pageableQueryParam.page_entries

    const entryStart = currentPage * pageSize + 1
    const entryEnd = Math.min(entryStart + paginationMeta.size - 1, paginationMeta.totalElements)

    const goToPage = (page: number) => {
        setPageableQueryParam({ ...pageableQueryParam, page })
    }

    const pageNumbers = new Set<number>()

    // Always show first and last
    pageNumbers.add(0)
    pageNumbers.add(totalPages - 1)

    // Two before and after current page
    for (let i = currentPage - 2; i <= currentPage + 2; i++) {
        if (i > 0 && i < totalPages - 1) pageNumbers.add(i)
    }

    const sortedPages = Array.from(pageNumbers).sort((a, b) => a - b)

    return (
        <div className='d-flex justify-content-between align-items-center mt-3'>
            <p className='mb-0 table-component'>
                {t.rich('showing page entries', {
                    entryStart,
                    entryEnd,
                    totalElements: paginationMeta.totalElements,
                })}
            </p>
            <nav>
                <ul className='pagination mb-0'>
                    <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
                        <button
                            className='page-link'
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 0}
                        >
                            {t('Previous')}
                        </button>
                    </li>

                    {sortedPages.map((page, index, arr) => (
                        <Fragment key={page}>
                            {index > 0 && page - arr[index - 1] > 1 && (
                                <li
                                    className='page-item disabled'
                                    key={`ellipsis-${page}`}
                                >
                                    <span className='page-link'>...</span>
                                </li>
                            )}
                            <li
                                className={`page-item ${page === currentPage ? 'active' : ''}`}
                                key={page}
                            >
                                <button
                                    className='page-link'
                                    onClick={() => goToPage(page)}
                                >
                                    {page + 1}
                                </button>
                            </li>
                        </Fragment>
                    ))}

                    <li className={`page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}`}>
                        <button
                            className='page-link'
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages - 1}
                        >
                            {t('Next')}
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
    )
}

export function PageSizeSelector({
    pageableQueryParam,
    setPageableQueryParam,
}: {
    pageableQueryParam: PageableQueryParam
    setPageableQueryParam: Dispatch<SetStateAction<PageableQueryParam>>
}): ReactNode {
    const t = useTranslations('default')
    return (
        <div className='table-component mt-3 mb-3'>
            <div className='dataTables_length'>
                <span className='my-2'>{t('Show')}</span>
                <label className='mx-2'>
                    <select
                        className='form-select'
                        value={pageableQueryParam.page_entries}
                        onChange={(e) =>
                            setPageableQueryParam({ ...pageableQueryParam, page_entries: Number(e.target.value) })
                        }
                    >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                </label>
                <span>{t('entries')}</span>
            </div>
        </div>
    )
}

export function SW360Table<K>({
    table,
    showProcessing,
    noRecordsFoundMessage,
}: {
    table: Table<K>
    showProcessing: boolean
    noRecordsFoundMessage?: string
}): ReactNode {
    const t = useTranslations('default')
    return (
        <div className='table-component position-relative'>
            <table className='sw360-table table-bordered mt-3'>
                <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th
                                    key={header.id}
                                    style={{
                                        width: (header.column.columnDef.meta as ColumnMeta | undefined)?.width,
                                    }}
                                >
                                    <div className='d-flex justify-content-between restrict-row-height'>
                                        <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                                        <span onClick={(e) => header.column.getToggleSortingHandler()?.(e)}>
                                            {header.column.getCanSort() === true &&
                                                (header.column.getIsSorted() === 'asc' ? (
                                                    <RiSortAsc />
                                                ) : header.column.getIsSorted() === 'desc' ? (
                                                    <RiSortDesc />
                                                ) : (
                                                    <BiSort />
                                                ))}
                                        </span>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {!showProcessing &&
                        table.getRowModel().rows.length === 0 &&
                        noRecordsFoundMessage !== undefined && (
                            <tr>
                                <td colSpan={table.getVisibleFlatColumns().length}>
                                    <div className='restrict-row-height text-center'>
                                        {noRecordsFoundMessage ?? t('No data available in table')}
                                    </div>
                                </td>
                            </tr>
                        )}
                    {table.getRowModel().rows.map((row) => (
                        <tr key={row.id}>
                            {row.getVisibleCells().map((cell) => (
                                <td key={cell.id}>
                                    <div className='restrict-row-height'>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </div>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            {showProcessing && (
                <div className='position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center'>
                    <div className='bg-white p-4 border rounded shadow'>{t('Processing')}…</div>
                </div>
            )}
        </div>
    )
}
