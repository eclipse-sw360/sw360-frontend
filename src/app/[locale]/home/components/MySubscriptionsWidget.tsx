// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.
// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import React, { useEffect, useState } from 'react'
import HomeTableHeader from './HomeTableHeader'
import homePageStyles from '../home.module.css'
import { sw360FetchData } from '@/utils/sw360fetchdata'

function MySubscriptionsWidget() {
    const [componentData, setComponentData] = useState([])
    const [releaseData, setReleaseData] = useState([])

    useEffect(() => {
        const fetchData = async () => {
            const componentData = await sw360FetchData('/components/mySubscriptions', 'components')
            setComponentData(componentData.map((item: { name: string }) => [item.name]))
            const releaseData = await sw360FetchData('/releases/mySubscriptions', 'releases')
            setReleaseData(releaseData.map((item: { name: string }) => [item.name]))
        }
        fetchData()
    }, [])

    const title = 'My Subscriptions'

    return (
        <div className='content-container'>
            <HomeTableHeader title={title} />
            <h3 className={`fw-bold ${homePageStyles.titleSubSideBar}`}>Components</h3>
            <ul style={{ listStyleType: 'disc', color: 'black' }}>
                {componentData.map((item) => (
                    <li key={''}>
                        <span style={{ color: 'orange' }}>{item}</span>
                    </li>
                ))}
            </ul>
            <h3 className={`fw-bold ${homePageStyles.titleSubSideBar}`}>Releases</h3>
            <ul style={{ listStyleType: 'disc', color: 'black' }}>
                {releaseData.map((item) => (
                    <li key={''}>
                        <span style={{ color: 'orange' }}>{item}</span>
                    </li>
                ))}
            </ul>
        </div>
    )
}

// We need use this to override typescript issue
// Reference: https://github.com/vercel/next.js/issues/42292
export default MySubscriptionsWidget as unknown as () => JSX.Element
