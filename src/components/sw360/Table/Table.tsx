// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { Config, Grid } from 'gridjs'
import * as React from 'react'
import { Component, RefObject, createRef } from 'react'
import { Form } from 'react-bootstrap'
import type { JSX } from 'react'
const defaultOptions = {
    pagination: { limit: 10 },
    search: false,
    selector: true,
    sort: true,
}
type MessageFormat = (...args: []) => string
type Message = string | MessageFormat
export type Language = { [key: string]: Message | Language }

export interface TableProps extends Partial<Config> {
    selector?: boolean
    language?: Language
}

const createTableProps = (tableProps: TableProps) => {
    let newTableProps = { ...defaultOptions, ...tableProps }

    if (newTableProps.server) {
        newTableProps = {
            ...newTableProps,
            pagination: {
                limit: 10,
                server: {
                    url: (prev: string, page: number, limit: number) =>
                        `${prev}${prev.includes('?') ? '&' : '?'}page=${page}&page_entries=${limit}`,
                },
            },
            data: undefined,
        }
    }

    return newTableProps
}

class Table extends Component<TableProps, unknown> {
    private wrapper: RefObject<HTMLDivElement | null> = createRef()
    // Grid.js instance
    private readonly instance: Grid | null = null
    private tableProps: TableProps = {}

    constructor(props: TableProps) {
        super(props)
        this.tableProps = createTableProps(props)

        this.instance = new Grid(this.tableProps)
    }

    getInstance(): Grid | null {
        return this.instance
    }

    componentDidMount(): void {
        if (this.wrapper.current === null || this.instance === null) return
        if (this.wrapper.current.childNodes.length > 0) {
            this.wrapper.current.innerHTML = ''
        }
        this.instance.render(this.wrapper.current)
    }

    componentDidUpdate(): void {
        if (this.instance === null) return
        this.instance.config.plugin.remove('pagination')
        this.instance.config.plugin.remove('search')
        this.tableProps = createTableProps(this.props)
        this.instance.updateConfig(this.tableProps).forceRender()
    }

    handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
        if (this.instance === null) return

        this.instance.config.plugin.remove('pagination')
        const pageSize = parseInt(event.target.value, 10)
        this.instance
            .updateConfig({
                pagination: {
                    limit: pageSize,
                    server: this.tableProps.server
                        ? {
                              url: (prev: string, page: number, limit: number) =>
                                  `${prev}${prev.includes('?') ? '&' : '?'}page=${page}&page_entries=${limit}`,
                          }
                        : undefined,
                },
            })
            .forceRender()
    }

    render(): JSX.Element {
        return (
            <>
                {(this.props.selector === true) && (
                    <div className='col-11 mt-3 mb-3'>
                        <div className='dataTables_length'>
                            <span className='my-2'>Show</span>
                            <label style={{ marginLeft: '5px', marginRight: '5px' }}>
                                <Form.Select size='sm' onChange={this.handlePageSizeChange}>
                                    <option defaultValue={defaultOptions.pagination.limit}>
                                        {defaultOptions.pagination.limit}
                                    </option>
                                    <option value='25'>25</option>
                                    <option value='50'>50</option>
                                    <option value='100'>100</option>
                                </Form.Select>
                            </label>
                            <span>entries</span>
                        </div>
                    </div>
                )}
                <div ref={this.wrapper} />
            </>
        )
    }
}

export default Table
