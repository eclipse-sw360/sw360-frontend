// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { sw360FetchData, commonHeaders } from '@/utils/sw360fetchdata'

export async function sw360FetchProjectData(endpoint: string, embedded_endpoint: string): Promise<unknown | null> {
    try {
        // Base data
        const data = await sw360FetchData(endpoint, embedded_endpoint)
        const promises = data.map(async (project: any) => {
            const response: Response = await fetch(project._links.self.href, {
                method: 'GET',
                headers: commonHeaders(),
            })
            const projdata = await response.json()
            project['description'] = projdata['description']
        })
        await Promise.all(promises)
        return data
    } catch (error) {
        console.error(error)
    }
}
