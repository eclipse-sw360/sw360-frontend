// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import React from 'react'

import { Grid } from 'gridjs-react'

interface SW360TableProps {
    columns?: string[]
    data?: any[]
    search?: boolean
    pagination?: boolean
    limit?: number
    noRecordsFound?: string
}

function SW360Table({
    columns = [],
    data = [],
    search = false,
    pagination = true,
    limit = 5,
    noRecordsFound = '',
}: SW360TableProps) {
    return (
        <Grid
            data={data}
            columns={columns}
            search={search}
            sort={true}
            pagination={{
                enabled: { pagination },
                limit: limit,
            }}
            noRecordsFound={noRecordsFound}
        />
    )
}

export default SW360Table
