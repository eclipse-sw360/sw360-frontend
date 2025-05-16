// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { Button } from '@/components/ui/button'
import { TableBody, TableCell, TableHead, TableHeader, TableRow, Table as UITable } from '@/components/ui/table'
import { ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table'
import React from 'react'

type MessageFormat = (...args: any[]) => string
type Message = string | MessageFormat
export type Language = { [key: string]: Message | Language }

export interface TableProps {
    columns: any[]
    data: any[]
    pagination?: { limit?: number }
    selector?: boolean
    language?: {
        noRecordsFound?: string
    }
    // Add more props as needed from the original TableProps
}

function Table({ columns, data, pagination = { limit: 10 }, selector = false, language = {} }: TableProps) {
    // Convert GridJS-style columns to TanStack format
    const columnDefs = React.useMemo<ColumnDef<any>[]>(
        () =>
            columns.map((col: any) => {
                if (typeof col === 'string') {
                    return { accessorKey: col, header: col }
                } else {
                    return {
                        accessorKey: col.id,
                        header: col.name,
                        cell: (info) => (col.formatter ? col.formatter(info.getValue()) : info.getValue()),
                    }
                }
            }),
        [columns],
    )

    const table = useReactTable({
        data,
        columns: columnDefs,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: {
                pageSize: pagination.limit ?? 10,
            },
        },
    })

    const noRecordsFound = language.noRecordsFound ?? 'No records found'

    return (
        <div>
            <UITable>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <TableHead key={header.id}>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(header.column.columnDef.header, header.getContext())}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={columns.length}
                                className='text-center'
                            >
                                {noRecordsFound}
                            </TableCell>
                        </TableRow>
                    ) : (
                        table.getRowModel().rows.map((row) => (
                            <TableRow key={row.id}>
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </UITable>

            {/* Pagination Controls */}
            <div className='flex justify-between items-center mt-4'>
                <div>
                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                </div>
                <div className='flex gap-2'>
                    <Button
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default Table
