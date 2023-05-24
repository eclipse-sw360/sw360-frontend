// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import React, { useState } from 'react'
import { useTable, usePagination, useSortBy, Column } from 'react-table'
import buildTableStyles from './buildTable.module.css'
import Pagination from '@/utils/pagination/Pagination'

import { TableContentProps } from "@/types/table";

export default function TableContent(props: TableContentProps) {
    const columns = props.schema;
    const data = props.data;
    const [currentPage, setCurrentPage] = useState(1)
    const tableItemsPerPage = props.tableItemCount

    const tableInstance = useTable({
        columns,
        data
    },
        useSortBy,
        usePagination)

    const { getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow } = tableInstance

    const lastTableItemIndex = currentPage * tableItemsPerPage;
    const firstTableItemIndex = lastTableItemIndex - tableItemsPerPage;
    const currentTableItems = rows.slice(firstTableItemIndex, lastTableItemIndex)

    return (
        <div className='container mt-3 mb-3' id="table_div">
            <table className="table table-striped" {...getTableProps()}>
                <thead>
                    {headerGroups.map((headerGroup) => (
                        <tr {...headerGroup.getHeaderGroupProps()} key="">
                            {headerGroup.headers.map((column: Column) => (
                                <th className={buildTableStyles.tableTh} {...column.getHeaderProps(column.getSortByToggleProps())} colSpan={1}
                                    key=""
                                    style={{ width: 'auto' }}>
                                    {
                                        column.render('Header')
                                    }
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                    {
                        currentTableItems.map((row) => {
                            prepareRow(row)
                            return (
                                <tr {...row.getRowProps()} key="">
                                    {row.cells.map((cell) => {
                                        return <td {...cell.getCellProps()}
                                            className={buildTableStyles.tableTd}
                                            colSpan={1}
                                            key=""
                                            style={{
                                                verticalAlign: 'middle',
                                                height: '10px',
                                                paddingBlock: '1px'
                                            }}>
                                            {
                                                cell.render('Cell')
                                            }
                                        </td>
                                    })}
                                </tr>
                            )
                        })
                    }
                </tbody>
            </table>
            <Pagination className="paginationBar" totalCount={rows.length} pageSize={tableItemsPerPage}
                onPageChange={(page: number) => setCurrentPage(page)} currentPage={currentPage} />
        </div>
    );
}
