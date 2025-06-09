// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from '@tanstack/react-table'
import * as React from 'react'
import { useState } from 'react'
import { Form, Pagination } from 'react-bootstrap'

type MessageFormat = (...args: []) => string
type Message = string | MessageFormat
export type Language = { [key: string]: Message | Language }

export interface TableProps<T extends object = any> {
    columns: ColumnDef<T, any>[]
    data: T[]
    selector?: boolean
    language?: Language
}

const PAGE_SIZES = [10, 25, 50, 100]

function Table<T extends object>({ columns, data, selector = true }: TableProps<T>): React.JSX.Element {
    const [pageSize, setPageSize] = useState<number>(PAGE_SIZES[0])
    const [pageIndex, setPageIndex] = useState<number>(0)
    const [sorting, setSorting] = useState<SortingState>([])

    const table = useReactTable<T>({
        data,
        columns,
        state: { pagination: { pageIndex, pageSize }, sorting },
        onPaginationChange: (updater) => {
            if (typeof updater === 'function') {
                const { pageIndex: newPageIndex, pageSize: newPageSize } = updater({ pageIndex, pageSize })
                setPageIndex(newPageIndex)
                setPageSize(newPageSize)
            } else {
                setPageIndex(updater.pageIndex)
                setPageSize(updater.pageSize)
            }
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        manualPagination: false,
        manualSorting: false,
        pageCount: Math.ceil(data.length / pageSize),
    })

    return (
        <>
            {selector && (
                <div className='col-11 mt-3 mb-3'>
                    <div className='dataTables_length'>
                        <span className='my-2'>Show</span>
                        <label style={{ marginLeft: '5px', marginRight: '5px' }}>
                            <Form.Select
                                size='sm'
                                value={pageSize}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                    setPageSize(Number(e.target.value))
                                    setPageIndex(0)
                                }}
                            >
                                {PAGE_SIZES.map((size) => (
                                    <option
                                        key={size}
                                        value={size}
                                    >
                                        {size}
                                    </option>
                                ))}
                            </Form.Select>
                        </label>
                        <span>entries</span>
                    </div>
                </div>
            )}
            <div className='table-responsive'>
                <table className='table table-striped table-bordered table-hover table-sm'>
                    <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        onClick={header.column.getToggleSortingHandler()}
                                        style={{ cursor: header.column.getCanSort() ? 'pointer' : undefined }}
                                    >
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                        {header.column.getIsSorted()
                                            ? header.column.getIsSorted() === 'asc'
                                                ? ' 🔼'
                                                : ' 🔽'
                                            : ''}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map((row) => (
                            <tr key={row.id}>
                                {row.getVisibleCells().map((cell) => (
                                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination className='justify-content-end'>
                <Pagination.First
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                />
                <Pagination.Prev
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                />
                {Array.from({ length: table.getPageCount() }, (_, i) => (
                    <Pagination.Item
                        key={i}
                        active={i === table.getState().pagination.pageIndex}
                        onClick={() => table.setPageIndex(i)}
                    >
                        {i + 1}
                    </Pagination.Item>
                ))}
                <Pagination.Next
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                />
                <Pagination.Last
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage()}
                />
            </Pagination>
        </>
    )
}

export default Table
