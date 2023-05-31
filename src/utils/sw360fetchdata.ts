// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.
// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { SW360_API_URL, AUTH_TOKEN } from '@/utils/env'
import HttpStatus from '@/object-types/enums/HttpStatus'

export function commonHeaders(): Headers {
    const headers = new Headers()
    headers.append('Content-Type', 'application/json')
    headers.append('Authorization', `Bearer ${AUTH_TOKEN}`)
    return headers
}

// Common fetch data
export async function sw360FetchData(endpoint: string, embedded_endpoint: string | null = null) {
    // Retrieve SW360 URL from env.ts
    const url: URL = new URL(SW360_API_URL + '/resource/api' + endpoint)

    try {
        // Fetch data from SW360 API
        const response: Response = await fetch(url.href, {
            method: 'GET',
            headers: commonHeaders(),
        })

        if (response.status != HttpStatus.OK) {
            return null
        }
        const data = await response.json()

        if (embedded_endpoint != null || '_embedded' in data) {
            // Asembly endpoint for embedded data
            const inner: string = 'sw360:' + embedded_endpoint
            return data['_embedded'][inner]
        }
        return data
    } catch (error) {
        console.error('Fail Embedded')
        console.error(error)
    }
}
