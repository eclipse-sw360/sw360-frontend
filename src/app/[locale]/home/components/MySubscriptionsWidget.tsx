// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import React from 'react'
import HomeTableHeader from './HomeTableHeader'
import homePageStyles from '../home.module.css'
import { sw360FetchData } from '@/utils/sw360fetchdata'

interface Components {

    name: string
}

let mySubsCompData: Components[] = []
let mySubsReleaseData: Components[] = []

const title = 'My Subscriptions'

async function MySubscriptionsWidget() {
    const fetchMySubsCompData = (await sw360FetchData('/components/mySubscriptions', 'components')) as Components[]
    const fetchMySubsReleaseData = (await sw360FetchData('/releases/mySubscriptions', 'releases')) as Components[]

    if (fetchMySubsCompData !== null) {
        mySubsCompData = fetchMySubsCompData.map((item) => ({
            name: item.name
        }))
    }

    if (fetchMySubsReleaseData !== null) {
        mySubsReleaseData = fetchMySubsReleaseData.map((item) => ({
            name: item.name
        }))
    }

    return (
        <div className="content-container">
            <HomeTableHeader title={title} />
            <h3 className={`fw-bold ${homePageStyles.titleSubSideBar}`}>Components</h3>
                <ul style={{ listStyleType: "disc", color: "black" }}>
                    {mySubsCompData.map((item) => (
                        <li key={""}>
                            <span style={{ color: "orange"}}>{item.name}</span>
                        </li>
                    ))}
                </ul>
            <h3 className={`fw-bold ${homePageStyles.titleSubSideBar}`}>Releases</h3>
                <ul style={{ listStyleType: "disc", color: "black" }}>
                    {mySubsReleaseData.map((item) => (
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
export default MySubscriptionsWidget as unknown as () => JSX.Element
