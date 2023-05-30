// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import React from 'react'

import HomeTableHeader from './HomeTableHeader'
import SW360Table from '@/components/SW360Table/SW360Table'

import { sw360FetchData } from '@/utils/sw360fetchdata'

interface Component {
    name: string
    description: string
}

let data: Component[] = []

const title = 'My Components'
const columns = ['Component Name', 'Description']
const noRecordsFound = 'You do not own any components.'

async function MyComponentsWidget() {
    const fetchData = (await sw360FetchData('/components/mycomponents', 'components')) as Component[]

    if (fetchData !== null) {
        data = fetchData.map((item) => ({
            name: item.name,
            description: item.description,
        }))
    }

    return (
        <div>
            <HomeTableHeader title={title} />
            <SW360Table
                columns={columns}
                data={data.map((data) => [data.name, data.description])}
                noRecordsFound={noRecordsFound}
            />
        </div>
    )
}

// We need use this to override typescript issue
// Reference: https://github.com/vercel/next.js/issues/42292
export default MyComponentsWidget as unknown as () => JSX.Element
