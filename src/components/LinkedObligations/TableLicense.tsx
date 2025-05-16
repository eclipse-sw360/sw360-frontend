// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import FilterSearch from '@/components/LinkedObligations/TableLinkedObligations/FilterSearch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table'
import React, { useMemo, useState } from 'react'
import styles from './TableLinkedObligations/TableLinkedObligations.module.css'

export type Language = { [key: string]: string | ((...args: []) => string) | Language }

interface TableProps {
    title?: string
    data: any[]
    columns: any[] // should be tanstack-style or wrapped gridjs-style
    searchFunction?: (event: React.KeyboardEvent<HTMLInputElement>) => void
    selector?: boolean
    pagination?: {
        limit?: number
    }
    language?: Language
}

export function TableLicense({
    title,
    data,
    columns,
    searchFunction,
    selector = true,
    pagination = { limit: 10 },
    language = {},
}: TableProps) {
    const [pageSize, setPageSize] = useState(pagination.limit ?? 10)

    const columnDefs = useMemo<ColumnDef<any>[]>(() => {
        return columns.map((col) => {
            if (typeof col === 'string') {
                return { accessorKey: col, header: col }
            } else {
                return {
                    accessorKey: col.id,
                    header: col.name,
                    cell: (info: any) =>
                        typeof col.formatter === 'function' ? col.formatter(info.getValue()) : info.getValue(),
                }
            }
        })
    }, [columns])

    const table = useReactTable({
        data,
        columns: columnDefs,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: {
                pageSize,
            },
        },
        onPaginationChange: (updater) => {
            const next = typeof updater === 'function' ? updater(table.getState().pagination) : updater
            setPageSize(next.pageSize)
        },
        manualPagination: false, // change to true for server-side pagination
    })

    return (
        <div className={styles['div-table-license']}>
            {selector && (
                <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4'>
                    <div className='flex items-center gap-2 text-sm'>
                        <span>Show</span>
                        <Label
                            htmlFor='pageSizeSelect'
                            className='sr-only'
                        >
                            Entries per page
                        </Label>
                        <Select
                            value={String(pageSize)}
                            onValueChange={(value) => {
                                const newSize = parseInt(value, 10)
                                setPageSize(newSize)
                                table.setPageSize(newSize)
                            }}
                        >
                            <SelectTrigger
                                className='w-20'
                                id='pageSizeSelect'
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {[10, 25, 50, 100].map((size) => (
                                    <SelectItem
                                        key={size}
                                        value={String(size)}
                                    >
                                        {size}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <span>entries</span>
                    </div>
                    {searchFunction && (
                        <FilterSearch
                            title={title}
                            searchFunction={searchFunction}
                        />
                    )}
                </div>
            )}

            <div className='overflow-auto rounded-md border'>
                <table className='w-full border-collapse text-sm'>
                    <thead className='bg-muted'>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        className='px-4 py-2 text-left font-medium'
                                    >
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map((row) => (
                            <tr
                                key={row.id}
                                className='border-t'
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <td
                                        key={cell.id}
                                        className='px-4 py-2'
                                    >
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default TableLicense
