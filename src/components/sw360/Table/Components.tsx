// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { ColumnFiltersState, flexRender, Row, Table } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'
import { ChangeEvent, Dispatch, Fragment, ReactNode, SetStateAction } from 'react'
import { Dropdown, DropdownButton } from 'react-bootstrap'
import { BiSort } from 'react-icons/bi'
import { BsCaretDownFill, BsCaretRightFill } from 'react-icons/bs'
import { RiSortAsc, RiSortDesc } from 'react-icons/ri'
import { ColumnMeta, FilterOption, PageableQueryParam, PaginationMeta } from '@/object-types'

export function TableFooter({
    pageableQueryParam,
    setPageableQueryParam,
    paginationMeta,
}: {
    pageableQueryParam: PageableQueryParam
    setPageableQueryParam: Dispatch<SetStateAction<PageableQueryParam>>
    paginationMeta: PaginationMeta
}): ReactNode {
    const currentPage = paginationMeta.number
    const totalPages = paginationMeta.totalPages
    const totalElements = paginationMeta.totalElements
    const pageSize = pageableQueryParam.page_entries

    const entryStart = currentPage * pageSize + 1
    const entryEnd = Math.min(entryStart + paginationMeta.size - 1, paginationMeta.totalElements)

    const goToPage = (page: number) => {
        setPageableQueryParam({
            ...pageableQueryParam,
            page,
        })
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
        <TableFooterUI
            entryStart={entryStart}
            entryEnd={entryEnd}
            totalElements={totalElements}
            currentPage={currentPage}
            sortedPages={sortedPages}
            totalPages={totalPages}
            goToPage={goToPage}
        />
    )
}

export function ClientSideTableFooter<K>({ table }: { table: Table<K> }): ReactNode {
    const currentPage = table.getState().pagination.pageIndex
    const totalPages = table.getPageCount()
    const totalElements = table.getRowCount()
    const pageSize = table.getState().pagination.pageSize

    const entryStart = currentPage * pageSize + 1
    const entryEnd = Math.min(entryStart + pageSize - 1, totalElements)

    const goToPage = (page: number) => {
        table.setPageIndex(page)
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
        <TableFooterUI
            entryStart={entryStart}
            entryEnd={entryEnd}
            totalElements={totalElements}
            currentPage={currentPage}
            sortedPages={sortedPages}
            totalPages={totalPages}
            goToPage={goToPage}
        />
    )
}

function TableFooterUI({
    entryStart,
    entryEnd,
    totalElements,
    currentPage,
    sortedPages,
    totalPages,
    goToPage,
}: {
    entryStart: number
    entryEnd: number
    totalElements: number
    currentPage: number
    sortedPages: number[]
    totalPages: number
    goToPage: (page: number) => void
}) {
    const t = useTranslations('default')
    if (totalElements === 0) {
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
    return (
        <div className='d-flex justify-content-between align-items-center mt-3'>
            <p className='mb-0 table-component'>
                {t.rich('showing page entries', {
                    entryStart,
                    entryEnd,
                    totalElements,
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
    const setPageSize = (sz: number) =>
        setPageableQueryParam({
            ...pageableQueryParam,
            page_entries: sz,
        })
    return (
        <PageSelectorUI
            pageSize={pageableQueryParam.page_entries}
            setPageSize={setPageSize}
        />
    )
}

export function ClientSidePageSizeSelector<K>({ table }: { table: Table<K> }): ReactNode {
    const setPageSize = (sz: number) => table.setPageSize(sz)
    return (
        <PageSelectorUI
            pageSize={table.getState().pagination.pageSize}
            setPageSize={setPageSize}
        />
    )
}

function PageSelectorUI({ pageSize, setPageSize }: { pageSize: number; setPageSize: (size: number) => void }) {
    const t = useTranslations('default')
    return (
        <div className='table-component mt-3 mb-3'>
            <div className='dataTables_length'>
                <span className='my-2'>{t('Show')}</span>
                <label className='mx-2'>
                    <select
                        className='form-select'
                        value={pageSize}
                        onChange={(e) => setPageSize(Number(e.target.value))}
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
            <table
                className='sw360-table table-bordered mt-3'
                style={{
                    width: '100%',
                    tableLayout: 'auto',
                }}
            >
                <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th
                                    key={header.id}
                                    colSpan={header.colSpan}
                                    style={{
                                        width: (header.column.columnDef.meta as ColumnMeta | undefined)?.width,
                                    }}
                                >
                                    {header.isPlaceholder ? null : (
                                        <div className='d-flex justify-content-between align-items-center'>
                                            <span>
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                            </span>

                                            {header.column.getCanSort() && (
                                                <span onClick={header.column.getToggleSortingHandler()}>
                                                    {header.column.getIsSorted() === 'asc' ? (
                                                        <RiSortAsc />
                                                    ) : header.column.getIsSorted() === 'desc' ? (
                                                        <RiSortDesc />
                                                    ) : (
                                                        <BiSort />
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {!showProcessing && table.getRowModel().rows.length === 0 && (
                        <tr>
                            <td colSpan={table.getVisibleFlatColumns().length}>
                                <div className='text-center'>
                                    {noRecordsFoundMessage ?? t('No data available in table')}
                                </div>
                            </td>
                        </tr>
                    )}
                    {table.getRowModel().rows.map((row) =>
                        row.meta?.isFullSpanRow ? (
                            <tr key={row.id}>
                                <td colSpan={table.getVisibleLeafColumns().length}>
                                    <div className={table.options.meta?.rowHeightConstant ? 'restrict-row-height' : ''}>
                                        {row.getVisibleCells()?.[0] &&
                                            flexRender(
                                                row.getVisibleCells()[0].column.columnDef.cell,
                                                row.getVisibleCells()[0].getContext(),
                                            )}
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            <tr key={row.id}>
                                {row.getVisibleCells().map((cell) => (
                                    <td key={cell.id}>
                                        <div
                                            className={
                                                table.options.meta?.rowHeightConstant ? 'restrict-row-height' : ''
                                            }
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </div>
                                    </td>
                                ))}
                            </tr>
                        ),
                    )}
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

export function PaddedCell<K>({ children, row }: { children?: ReactNode; row: Row<K> }): ReactNode {
    return (
        <div className='d-flex'>
            <span
                className='indenter'
                style={{
                    paddingLeft: `${row.depth}rem`,
                }}
                role='button'
                onClick={row.getToggleExpandedHandler()}
            >
                {row.getCanExpand() &&
                    (row.getIsExpanded() ? <BsCaretDownFill color='gray' /> : <BsCaretRightFill color='gray' />)}{' '}
            </span>
            {children}
        </div>
    )
}

export function FilterComponent({
    renderFilterOptions,
    setColumnFilters,
    columnFilters,
    id,
    show,
    setShow,
    header,
    resetPaginationParams,
}: {
    renderFilterOptions: FilterOption[]
    setColumnFilters: Dispatch<SetStateAction<ColumnFiltersState>>
    columnFilters: ColumnFiltersState
    id: string
    show: string | undefined
    setShow: Dispatch<SetStateAction<string | undefined>>
    header: string
    resetPaginationParams?: () => void
}): ReactNode {
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        const checked = e.target.checked

        const existingFilter = columnFilters.find((f) => f.id === id)
        const existingValues = (existingFilter?.value ?? []) as string[]

        let newFilterValues: string[]

        if (checked) {
            newFilterValues = [
                ...existingValues,
                value,
            ]
        } else {
            newFilterValues = existingValues.filter((v) => v !== value)
        }

        const newFilters = [
            ...columnFilters.filter((f) => f.id !== id),
            ...(newFilterValues.length > 0
                ? [
                      {
                          id,
                          value: newFilterValues,
                      },
                  ]
                : []),
        ]
        setColumnFilters(newFilters)
        resetPaginationParams?.()
    }

    const selectedValues = (columnFilters.find((f) => f.id === id)?.value ?? []) as string[]

    return (
        <DropdownButton
            size='sm'
            title=''
            as='span'
            className='filter-button'
            show={show === id}
            onToggle={() => setShow(show === id ? undefined : id)}
            autoClose={false}
        >
            <Dropdown.Item
                href='#'
                className='fw-medium'
            >
                {header}
            </Dropdown.Item>
            <Dropdown.Divider />
            {renderFilterOptions.map((op) => (
                <Dropdown.Item
                    href='#'
                    key={`check-${op.value}`}
                >
                    <div className='form-check'>
                        <input
                            className='form-check-input'
                            type='checkbox'
                            value={op.value}
                            id={`check-${op.value}`}
                            checked={selectedValues.includes(op.value)}
                            onChange={handleChange}
                        />
                        <label
                            className='form-check-label fw-medium'
                            htmlFor={`check-${op.value}`}
                        >
                            {op.tag}
                        </label>
                    </div>
                </Dropdown.Item>
            ))}
        </DropdownButton>
    )
}

export function TableSearch({
    searchFunction,
}: {
    searchFunction: (event: React.KeyboardEvent<HTMLInputElement>) => void
}) {
    const t = useTranslations('default')
    return (
        <div className='row mt-3'>
            <div className='col-auto px-0'>
                <label
                    htmlFor='table-search'
                    className='col-sm-2 col-form-label'
                >
                    {t('Search')}:
                </label>
            </div>
            <div className='col-auto'>
                <input
                    className='form-control'
                    type='text'
                    onKeyUp={searchFunction}
                    id='table-search'
                />
            </div>
        </div>
    )
}
