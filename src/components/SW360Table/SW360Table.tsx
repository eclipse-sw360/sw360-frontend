// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { Grid } from 'gridjs-react'
import React from 'react'

import styles from './SW360.module.css'

interface SW360TableProps {
    columns?: string[]
    data?: any[]
    search?: boolean
    limit?: number
}

function SW360Table({ columns = [], data = [], search = false, limit = 5 }: SW360TableProps) {
    return (
        <div className={styles.gridjs}>
            <Grid
                data={data}
                columns={columns}
                search={search}
                className={styles.gridjs}
                sort={true}
                pagination={{
                    enabled: true,
                    limit: limit,
                    className: styles.pagination,
                }}
            />
        </div>
    )
}

export default SW360Table
