// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import React from 'react'

import SW360Table from '@/components/SW360Table/SW360Table'
import HomeTableHeader from './HomeTableHeader'

import { sw360FetchProjectData } from './sw360fetchprojectdata.service'

interface Project {
    name: string
    description: string
    version: string
}

let data: Project[] = []

const title = 'My Projects'
const columns = ['Project Name', 'Description', 'Approved Releases']
const noRecordsFound = 'No project data to show'

async function MyProjectsWidget() {
    const fetchData = (await sw360FetchProjectData('/projects/myprojects', 'projects')) as Project[]

    if (fetchData !== null) {
        data = fetchData.map((item) => ({
            name: item.name,
            description: item.description,
            version: item.version,
        }))
    }

    return (
        <div>
            <HomeTableHeader title={title} />
            <SW360Table
                columns={columns}
                data={data.map((data) => [data.name, data.description, data.version])}
                noRecordsFound={noRecordsFound}
            />
        </div>
    )
}

// We need use this to override typescript issue
// Reference: https://github.com/vercel/next.js/issues/42292
export default MyProjectsWidget as unknown as () => JSX.Element
