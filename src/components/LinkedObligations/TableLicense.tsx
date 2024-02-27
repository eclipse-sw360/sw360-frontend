// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import FilterSearch from '@/components/LinkedObligations/TableLinkedObligations/FilterSearch'
import { Config, Grid } from 'gridjs'
import * as React from 'react'
import { Component, RefObject, createRef } from 'react'
import { Form } from 'react-bootstrap'
import styles from './TableLinkedObligations/TableLinkedObligations.module.css'

const defaultOptions = {
    pagination: { limit: 10 },
    search: false,
    selector: true,
    sort: false,
}
type MessageFormat = (...args: []) => string
type Message = string | MessageFormat
export type Language = { [key: string]: Message | Language }

interface TableProps extends Partial<Config> {
    title?: string
    searchFunction?: (event: React.KeyboardEvent<HTMLInputElement>) => void
    selector?: boolean
    language?: Language
}

class TableLicense extends Component<TableProps, unknown> {
    private wrapper: RefObject<HTMLDivElement> = createRef()
    // Grid.js instance
    private readonly instance: Grid = null
    private tableProps: TableProps = {}

    constructor(props: TableProps) {
        super(props)
        this.tableProps = { ...defaultOptions, ...props }

        if (this.tableProps.server) {
            this.tableProps = {
                ...this.tableProps,
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

        this.instance = new Grid(this.tableProps)
    }

    getInstance(): Grid {
        return this.instance
    }

    componentDidMount(): void {
        if (this.wrapper.current.childNodes.length > 0) {
            this.wrapper.current.innerHTML = ''
        }
        this.instance.render(this.wrapper.current)
    }

    componentDidUpdate(): void {
        this.instance.config.plugin.remove('pagination')
        this.instance.config.plugin.remove('search')
        this.instance.updateConfig(this.props).forceRender()
    }

    handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
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

    render(): React.ReactElement {
        return (
            <>
                <div className={styles['div-table-license']}>
                    {this.props.selector && (
                        <>
                            <div className='col-auto' style={{ fontSize: '14px' }}>
                                <div className='dataTables_length' style={{ fontSize: '0.875rem' }}>
                                    <span className='my-2'>Show</span>
                                    <label className={styles['lable-table-license']}>
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
                            {this.props.searchFunction && (
                                <FilterSearch title={this.props.title} searchFunction={this.props.searchFunction} />
                            )}
                        </>
                    )}
                </div>
                <div ref={this.wrapper} />
            </>
        )
    }
}

export default TableLicense
