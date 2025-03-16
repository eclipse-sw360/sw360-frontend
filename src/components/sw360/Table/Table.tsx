// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table'
import * as React from 'react'

const defaultOptions = {
    pagination: { limit: 10 },
    search: false,
    selector: true,
    sort: true,
}
type MessageFormat = (...args: []) => string
type Message = string | MessageFormat
export type Language = { [key: string]: Message | Language }

type Column = {
    id: string
    name: string
    sort?: boolean
    formatter?: (value: any) => React.ReactNode | null
}

type ServerPaginationConfig = {
    pageIndex: number
    pageSize: number
    totalCount: number
    onPageChange: (pageIndex: number) => void
}

type TableProps = {
    columns: Column[]
    data: Record<string, any>[]
    selector?: boolean
    server?: ServerPaginationConfig
    handleClickDelete?: (id: string) => void
}

const Table: React.FC<TableProps> = ({ columns, data = [], handleClickDelete, selector = false, server }) => {
    const tableColumns: ColumnDef<Record<string, any>>[] = [
        ...(selector
            ? [
                  {
                      id: 'select',
                      header: () => <input type='checkbox' />, // Placeholder for select all
                      cell: () => <input type='checkbox' />, // Row selection
                  },
              ]
            : []),
        ...columns.map((col) => ({
            accessorKey: col.id,
            header: () => col.name,
            cell: (info) => {
                const value = info.getValue()
                return col.formatter ? (col.formatter(value) ?? null) : value
            },
        })),
    ]

    const table = useReactTable({
        columns: tableColumns,
        data,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: server ? getPaginationRowModel() : undefined,
        pageCount: server ? Math.ceil(server.totalCount / server.pageSize) : undefined,
        debugTable: true,
    })

    return (
        <div>
            <table className='table-auto w-full border-collapse border border-gray-300'>
                <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr
                            key={headerGroup.id}
                            className='bg-gray-200'
                        >
                            {headerGroup.headers.map((header) => (
                                <th
                                    key={header.id}
                                    className='border border-gray-300 p-2'
                                >
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.length > 0 ? (
                        table.getRowModel().rows.map((row) => (
                            <tr
                                key={row.id}
                                className='border border-gray-300'
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <td
                                        key={cell.id}
                                        className='border border-gray-300 p-2'
                                    >
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td
                                colSpan={columns.length + (selector ? 1 : 0)}
                                className='text-center p-4 text-gray-500'
                            >
                                No data available
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            {server && (
                <div className='flex justify-between p-2'>
                    <button
                        onClick={() => server.onPageChange(server.pageIndex - 1)}
                        disabled={server.pageIndex === 0}
                    >
                        Previous
                    </button>
                    <span>
                        Page {server.pageIndex + 1} of {Math.ceil(server.totalCount / server.pageSize)}
                    </span>
                    <button
                        onClick={() => server.onPageChange(server.pageIndex + 1)}
                        disabled={server.pageIndex >= Math.ceil(server.totalCount / server.pageSize) - 1}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    )
}

export default Table
