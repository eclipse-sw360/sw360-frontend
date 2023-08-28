// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.
// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import React, { useState, useEffect } from 'react'
import { _, Table } from '@/components/sw360'
import { CaretRightFill, CaretDownFill } from 'react-bootstrap-icons'
import NodeData from '@/object-types/NodeData'

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
    const style = { paddingLeft: `${padLength}em` }
    return (
        <div style={style}>
            {parent &&
                (needExpand ? (
                    <CaretDownFill color='gray' onClick={collapseRow} />
                ) : (
                    <CaretRightFill color='gray' onClick={expandRow} />
                ))}{' '}
            {children}
        </div>
    )
}

const TreeTable = ({ data, setData, columns }: any) => {
    const [tabledata, setTableData] = useState([])

    useEffect(() => {
        const newData: any = []
        data.forEach((item: NodeData) => {
            manipulateData(item, 0, newData)
        })
        setTableData(newData)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data])

    const expandRow = (item: NodeData) => {
        item.isExpanded = true
        setData([...data])
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
                            </PaddedCell>
                        )
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

    const manipulateData = (item: NodeData, level = 0, newData: any = []) => {
        if (item.children.length > 0) {
            const isExpanded: boolean = item.isExpanded
            newData.push(parseRowData(item, isExpanded, true, level))
            if (isExpanded) {
                level += 1
                item.children.forEach((childItem: NodeData) => manipulateData(childItem, level, newData))
            }
        } else {
            newData.push(parseRowData(item, false, false, level))
        }
    }

    return (
        <div className='container' style={{ maxWidth: '98vw', marginTop: '10px' }}>
            <div className='row'>
                <div className='row'>
                    <Table data={tabledata} pagination={false} columns={columns} sort={false} />
                </div>
            </div>
        </div>
    )
}
export default TreeTable
