// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import React, { useEffect, useState } from 'react'

import { useTranslations } from 'next-intl'

import { Table } from '@/components/sw360'

import HomeTableHeader from './HomeTableHeader'
import { sw360FetchData } from '@/utils/sw360fetchdata'

function MyProjectsWidget() {
    const [data, setdata] = useState([])
    const t = useTranslations('default')

    useEffect(() => {
        const fetchData = async () => {
            const data = await sw360FetchData('/projects/myprojects', 'projects')
            data &&
                setdata(
                    data.map((item: { name: string; description: string; version: string }) => [
                        item.name,
                        item.description,
                        item.version,
                    ])
                )
        }
        fetchData()
    }, [])

    const title = t('My Projects')
    const columns = [t('Project Name'), t('Description'), t('Approved Releases')]

    return (
        <div>
            <HomeTableHeader title={title} />
            <Table columns={columns} data={data} pagination={{ limit: 5 }} selector={false} />
        </div>
    )
}

// We need use this to override typescript issue
// Reference: https://github.com/vercel/next.js/issues/42292
export default MyProjectsWidget as unknown as () => JSX.Element
