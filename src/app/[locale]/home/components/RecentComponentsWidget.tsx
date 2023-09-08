// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.
// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import React, { useEffect, useState } from 'react'

import HomeTableHeader from './HomeTableHeader'
import { sw360FetchData } from '@/utils/sw360fetchdata'

function RecentComponentsWidget() {
    const [data, setData] = useState([])

    useEffect(() => {
        const fetchData = async () => {
            const data = await sw360FetchData('/components/recentComponents', 'components')
            data &&
                setData(
                    data.map((item: { name: string }) => [
                        <li key={item.name}>
                            <span style={{ color: 'orange' }}>{item.name}</span>
                        </li>,
                    ])
                )
        }
        fetchData()
    }, [])

    const title = 'Recent Components'

    return (
        <div className='content-container'>
            <HomeTableHeader title={title} />
            <ul style={{ listStyleType: 'disc', color: 'black' }}>{data}</ul>
        </div>
    )
}

// We need use this to override typescript issue
// Reference: https://github.com/vercel/next.js/issues/42292
export default RecentComponentsWidget as unknown as () => JSX.Element
