// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.
// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

'use client'

import React, { useEffect, useState, type JSX } from 'react'
import { Dropdown } from 'react-bootstrap'
import { BsCaretDownFill, BsCaretRightFill } from 'react-icons/bs'

import { NodeData } from '@/object-types'
import { OneDArray, TColumn } from 'gridjs/dist/src/types'
import { SearchConfig } from 'gridjs/dist/src/view/plugin/search/search'
import { Table, _ } from 'next-sw360'
import { ComponentChild } from 'preact'
import { Language } from '../Table/Table'

interface Props {
    children: React.ReactNode
    padLength: number
    parent?: boolean
    needExpand?: boolean
    expandRow?: () => void
    collapseRow?: () => void
}

const PaddedCell: React.FC<Props> = ({
    children,
    padLength,
    parent = false,
    needExpand = false,
    expandRow,
    collapseRow,
}) => {
    return (
        <div className='d-flex'>
            <span
                className='indenter'
                style={{ paddingLeft: `${padLength * 1}rem` }}
                role='button'
            >
                {parent &&
                    (needExpand ? (
                        <BsCaretDownFill
                            color='gray'
                            onClick={collapseRow}
                        />
                    ) : (
                        <BsCaretRightFill
                            color='gray'
                            onClick={expandRow}
                        />
                    ))}{' '}
            </span>
            {children}
        </div>
    )
}

// Define the structure for filter props
interface FilterProps {
    enabled: boolean
    options: string[]
    onChange: (value: string) => void
}

interface ColumnWithFilter extends TColumn {
    filter?: FilterProps
}

interface TreeTableProps {
    data: Array<any>
    setData: React.Dispatch<React.SetStateAction<Array<any>>>
    columns: OneDArray<ColumnWithFilter | string | ComponentChild>
    onExpand?: (item: NodeData) => void
    search?: SearchConfig | boolean
    language?: Language
    selector?: boolean
    sort?: boolean
}

// Custom header component to include filter dropdown
const FilterHeader = ({ column, t }: { column: ColumnWithFilter; t?: (key: string) => string }) => {
    const translate = t || ((key: string) => key)

    if (column.filter?.enabled) {
        return (
            <div className='d-flex align-items-center justify-content-between'>
                <span>{column.name}</span>
                <Dropdown>
                    <Dropdown.Toggle
                        variant='link'
                        size='sm'
                        className='p-0 ms-2'
                    >
                        <span className='filter-icon'>
                            {/* Unicode character for filter or checkmark inside a square */}
                            <svg
                                xmlns='http://www.w3.org/2000/svg'
                                width='16'
                                height='16'
                                fill='white'
                                className='bi bi-check-square'
                                viewBox='0 0 16 16'
                            >
                                <path d='M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z' />
                                <path d='M10.97 4.97a.75.75 0 0 1 1.071 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.235.235 0 0 1 .02-.022z' />
                            </svg>
                        </span>
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item
                            key='all'
                            onClick={() => column.filter?.onChange('')}
                        >
                            {translate('All')}
                        </Dropdown.Item>
                        {column.filter.options.map((option) => (
                            <Dropdown.Item
                                key={option}
                                onClick={() => column.filter?.onChange(option)}
                            >
                                {option}
                            </Dropdown.Item>
                        ))}
                    </Dropdown.Menu>
                </Dropdown>
            </div>
        )
    }

    return <>{column.name}</>
}

const TreeTable = ({
    data,
    setData,
    columns,
    onExpand,
    search,
    language,
    selector,
    sort,
}: TreeTableProps): JSX.Element => {
    const [tabledata, setTableData] = useState<any[]>([])

    // Process columns to add filter headers
    const processedColumns = columns.map((column: any) => {
        if (column.filter?.enabled) {
            return {
                ...column,
                name: _(<FilterHeader column={column} />),
            }
        }
        return column
    })

    useEffect(() => {
        const newData: any[] = []
        data.forEach((item: NodeData) => {
            manipulateData(item, 0, newData)
        })
        setTableData(newData)
    }, [data])

    const expandRow = (item: NodeData) => {
        if (!onExpand) {
            item.isExpanded = true
            setData([...data])
            return
        }
        onExpand(item)
    }

    const collapseRow = (item: NodeData) => {
        item.isExpanded = false
        setData([...data])
    }

    const parseRowData = (item: NodeData, isExpanded: boolean, isParent: boolean, level: number) => {
        const parsedRowData: Array<any> = []

        Object.entries(item.rowData).forEach(([index, cell]: any) => {
            if (index === '0') {
                if (isParent) {
                    parsedRowData.push(
                        _(
                            <PaddedCell
                                padLength={level}
                                parent={true}
                                needExpand={isExpanded}
                                expandRow={() => expandRow(item)}
                                collapseRow={() => collapseRow(item)}
                            >
                                {cell}
                            </PaddedCell>,
                        ),
                    )
                } else {
                    parsedRowData.push(_(<PaddedCell padLength={level}>{cell}</PaddedCell>))
                }
            } else {
                parsedRowData.push(_(<>{cell}</>))
            }
        })
        return parsedRowData
    }

    const manipulateData = (item: NodeData, level = 0, newData: any[] = []) => {
        if ((item.children !== undefined && item.children.length > 0) || item.isExpandable === true) {
            const isExpanded: boolean = item.isExpanded === true
            newData.push(parseRowData(item, isExpanded, true, level))
            if (isExpanded) {
                level += 1
                item.children?.forEach((childItem: NodeData) => manipulateData(childItem, level, newData))
            }
        } else {
            newData.push(parseRowData(item, false, false, level))
        }
    }

    return (
        <Table
            data={tabledata}
            pagination={false}
            columns={processedColumns}
            sort={sort}
            search={search}
            language={language}
            selector={selector}
        />
    )
}

export default TreeTable
