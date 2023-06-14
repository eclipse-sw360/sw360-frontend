// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import React from 'react'

import SW360Table from '@/components/sw360/SW360Table/SW360Table'
import HomeTableHeader from './HomeTableHeader'

import { sw360FetchData } from '@/utils/sw360fetchdata'

interface TaskAssignment {
    name: string
    status: string
}

let data: TaskAssignment[] = []

const title = 'My Task Assignments'
const columns = ['Document Name', 'Status']
const noRecordsFound = 'There are no tasks assigned to you.'

async function MyTaskAssignmentsWidget() {
    const fetchData = (await sw360FetchData('/myTaskAssignments')) as TaskAssignment[]

    if (!fetchData === null) {
        data = fetchData.map((item) => ({
            name: item.name,
            status: item.status,
        }))
    }

    return (
        <div>
            <HomeTableHeader title={title} />
            <SW360Table
                columns={columns}
                data={data.map((data) => [data.name, data.status])}
                noRecordsFound={noRecordsFound}
            />
        </div>
    )
}

// We need use this to override typescript issue
// Reference: https://github.com/vercel/next.js/issues/42292
export default MyTaskAssignmentsWidget as unknown as () => JSX.Element
