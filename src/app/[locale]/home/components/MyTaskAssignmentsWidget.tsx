// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import React from 'react'

import { useTranslations } from 'next-intl'
import { COMMON_NAMESPACE } from '@/object-types/Constants'

import { Table } from '@/components/sw360'
import { sw360FetchData } from '@/utils/sw360fetchdata'

import HomeTableHeader from './HomeTableHeader'

interface TaskAssignment {
    name: string
    status: string
}

async function MyTaskAssignmentsWidget() {
    const t = useTranslations(COMMON_NAMESPACE)

    const fetchData = (await sw360FetchData('/myTaskAssignments')) as TaskAssignment[]
    const title = t('My Task Assignments')
    const columns = [t('Document Name'), t('Status')]

    let data: unknown[] = []
    if (!fetchData === null) {
        data = fetchData.map((item) => [item.name, item.status])
    }

    return (
        <div>
            <HomeTableHeader title={title} />
            <Table columns={columns} data={data} />
        </div>
    )
}

// We need use this to override typescript issue
// Reference: https://github.com/vercel/next.js/issues/42292
export default MyTaskAssignmentsWidget as unknown as () => JSX.Element
