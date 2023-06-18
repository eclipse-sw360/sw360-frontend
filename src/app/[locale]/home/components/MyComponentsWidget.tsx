// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import React, { useEffect, useState } from 'react'

import { useTranslations } from 'next-intl'
import { COMMON_NAMESPACE } from '@/object-types/Constants'

import HomeTableHeader from './HomeTableHeader'

import { Table } from '@/components/sw360'
import { sw360FetchData } from '@/utils/sw360fetchdata'

function MyComponentsWidget() {
    const [data, setData] = useState([])
    const t = useTranslations(COMMON_NAMESPACE)

    useEffect(() => {
        const fetchData = async () => {
            const data = await sw360FetchData('/components/mycomponents', 'components')
            setData(data.map((item: { name: string; description: string }) => [item.name, item.description]))
        }
        fetchData()
    }, [])

    const title = t('My Components')
    const columns = [t('Component Name'), t('Description')]

    return (
        <div>
            <HomeTableHeader title={title} />
            <Table columns={columns} data={data} selector={false} />
        </div>
    )
}

// We need use this to override typescript issue
// Reference: https://github.com/vercel/next.js/issues/42292
export default MyComponentsWidget as unknown as () => JSX.Element
