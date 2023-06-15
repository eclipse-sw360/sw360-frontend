// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.
// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import React from 'react'
import HomeTableHeader from './HomeTableHeader'
import { sw360FetchData } from '@/utils/sw360fetchdata'

interface Components {

    name: string
}

let recentComponentData: Components[] = []

const title = 'Recent Components'

async function RecentComponentsWidget() {
    const fetchRecentComponentData = (await sw360FetchData('/components/recentComponents', 'components')) as Components[]

    if (fetchRecentComponentData !== null) {
        recentComponentData = fetchRecentComponentData.map((item) => ({
            name: item.name
        }))
    }

    return (
        <div className="content-container">
            <HomeTableHeader title={title} />
                <ul style={{ listStyleType: "disc", color: "black" }}>
                    {recentComponentData.map((item) => (
                        <li key={""}>
                            <span style={{ color: "orange"}}>{item.name}</span>
                        </li>
                    ))}
                </ul>
        </div>
    )
}

// We need use this to override typescript issue
// Reference: https://github.com/vercel/next.js/issues/42292
export default RecentComponentsWidget as unknown as () => JSX.Element
