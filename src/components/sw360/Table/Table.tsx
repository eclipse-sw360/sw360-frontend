// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import * as React from 'react'
import { Component, createRef, RefObject } from 'react'
import { Grid as Gridjs, UserConfig } from 'gridjs'

const defaultOptions = {
    pagination: { limit: 10 },
    selector: true,
    search: false,
}

class Table extends Component<Partial<UserConfig>, unknown> {
    private wrapper: RefObject<HTMLDivElement> = createRef()
    // Grid.js instance
    private readonly instance: Gridjs = null

    constructor(props: Partial<UserConfig>) {
        super(props)

        this.instance = new Gridjs({ ...defaultOptions, ...props })
    }

    getInstance(): Gridjs {
        return this.instance
    }

    componentDidMount(): void {
        this.instance.render(this.wrapper.current)
    }

    componentDidUpdate(): void {
        this.instance.updateConfig(this.props).forceRender()
    }

    handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const pageSize = parseInt(event.target.value, 10)
        this.instance
            .updateConfig({
                pagination: { limit: pageSize },
            })
            .forceRender()
    }

    render(): React.ReactElement {
        return (
            <>
                {defaultOptions.selector && (
                    <div className='col-xl-2 d-flex'>
                        <p className='my-2'>Show</p>
                        <select
                            className='form-select form-select-sm mx-2'
                            aria-label='page size select'
                            onChange={this.handlePageSizeChange}
                        >
                            <option defaultValue={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                        <p className='my-2'>entries</p>
                    </div>
                )}
                <div ref={this.wrapper} />
            </>
        )
    }
}

export default Table
