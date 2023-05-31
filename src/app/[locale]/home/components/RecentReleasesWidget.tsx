// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import React from 'react'
import HomeTableHeader from './HomeTableHeader'
import { sw360FetchData } from '@/utils/sw360fetchdata'

interface Release {

    name: string
}

let recentReleaseData: Release[] = []

const title = 'Recent Releases'

async function RecentReleasesWidget() {
    const fetchRecentReleaseData = (await sw360FetchData('/releases/recentReleases', 'releases')) as Release[]

    if (fetchRecentReleaseData !== null) {
        recentReleaseData = fetchRecentReleaseData.map((item) => ({
            name: item.name
        }))
    }

    return (
        <div className="content-container">
            <HomeTableHeader title={title} />
                <ul style={{ listStyleType: "disc", color: "black" }}>
                    {recentReleaseData.map((item) => (
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
export default RecentReleasesWidget as unknown as () => JSX.Element
