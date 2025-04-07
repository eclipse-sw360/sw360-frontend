// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.
// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { NodeData } from '@/object-types'
import { OneDArray, TColumn } from 'gridjs/dist/src/types'
import { SearchConfig } from 'gridjs/dist/src/view/plugin/search/search'
import { CheckboxFilterDropdown, Table, _ } from 'next-sw360'
import React, { ReactNode, useEffect, useState, type JSX } from 'react'
import { BsCaretDownFill, BsCaretRightFill } from 'react-icons/bs'
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
        <div className='d-flex align-items-center'>
            {' '}
            <button
                className='indenter d-flex align-items-center justify-content-center'
                style={{
                    paddingLeft: `${padLength * 1}rem`,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    minWidth: '20px',
                    minHeight: '20px',
                }}
                onClick={needExpand ? collapseRow : expandRow}
            >
                {parent &&
                    (needExpand ? (
                        <BsCaretDownFill
                            color='gray'
                            size={16}
                        />
                    ) : (
                        <BsCaretRightFill
                            color='gray'
                            size={16}
                        />
                    ))}
            </button>
            {children}
        </div>
    )
}

interface FilterProps {
    enabled: boolean
    options: string[]
    onChange: (values: string[]) => void
    fullName?: string
}

interface ColumnWithFilter extends TColumn {
    filter?: FilterProps
}

interface TreeTableProps {
    data: Array<any>
    setData: React.Dispatch<React.SetStateAction<Array<any>>>
    columns: OneDArray<ColumnWithFilter | string | ReactNode>
    onExpand?: (item: NodeData) => void
    search?: SearchConfig | boolean
    language?: Language
    selector?: boolean
    sort?: boolean
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
    const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null)

    // Update the FilterHeader component to include the dropdown state
    const FilterHeader = ({ column, columnIndex }: { column: ColumnWithFilter; columnIndex: number }) => {
        if (column.filter?.enabled) {
            return (
                <div className='d-flex align-items-center justify-content-between'>
                    <span>{typeof column.name === 'string' ? column.name : ''}</span>
                    <CheckboxFilterDropdown
                        options={column.filter.options}
                        onChange={(selectedOptions) => column.filter?.onChange(selectedOptions)}
                        title={column.filter.fullName || (typeof column.name === 'string' ? column.name : '')}
                        isOpen={openDropdownIndex === columnIndex}
                        onToggle={() => {
                            setOpenDropdownIndex(openDropdownIndex === columnIndex ? null : columnIndex)
                        }}
                    />
                </div>
            )
        }

        return <>{typeof column.name === 'string' ? column.name : ''}</>
    }

    const processedColumns = columns.map((column: any, index: number) => {
        if (column.filter?.enabled) {
            return {
                ...column,
                name: _(
                    <FilterHeader
                        column={column}
                        columnIndex={index}
                    />,
                ),
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
