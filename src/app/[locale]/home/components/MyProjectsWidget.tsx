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

import HomeTableHeader from './HomeTableHeader'
import { sw360FetchProjectData } from './sw360fetchprojectdata.service'

interface Project {
    name: string
    description: string
    version: string
}

async function MyProjectsWidget() {
    const t = useTranslations(COMMON_NAMESPACE)

    let data: unknown[] = []
    // Fetch sw360 data
    const fetchData = (await sw360FetchProjectData('/projects/myprojects', 'projects')) as Project[]

    const title = t('My Projects')
    const columns = [t('Project Name'), t('Description'), t('Approved Releases')]

    if (fetchData !== null) {
        data = fetchData.map((item) => [item.name, item.description, item.version])
    }

    return (
        <div>
            <HomeTableHeader title={title} />
            <Table columns={columns} data={data} pagination={{ limit: 5 }} />
        </div>
    )
}

// We need use this to override typescript issue
// Reference: https://github.com/vercel/next.js/issues/42292
export default MyProjectsWidget as unknown as () => JSX.Element
