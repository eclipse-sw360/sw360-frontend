// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import React from 'react'

import SW360Table from '@/components/SW360Table/SW360Table'
import HomeTableHeader from './HomeTableHeader'

import { sw360FetchData } from '@/utils/sw360fetchdata'

let data = [
    {
        documentName: 'No assigned task found',
        status: 'NA',
    },
]

const title = 'My Task Assignments'
const columns = ['Document Name', 'Status']

async function MyTaskAssignmentsWidget() {
    const fetchData: unknown = await sw360FetchData('/myTaskAssignments')

    if (!fetchData === null) {
        data = fetchData.map((item) => ({
            documentName: item.name,
            status: item.status,
        }))
    }

    return (
        <div>
            <HomeTableHeader title={title} />
            <SW360Table columns={columns} data={data} />
        </div>
    )
}

// We need use this to override typescript issue
// Reference: https://github.com/vercel/next.js/issues/42292
export default MyTaskAssignmentsWidget as unknown as () => JSX.Element
