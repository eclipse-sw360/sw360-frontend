// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { QueryCache, QueryClient } from '@tanstack/react-query'
import ApiUtils from '@/utils/api/api.util'

// Factory that builds a client with SW360-tuned defaults
function makeQueryClient(): QueryClient {
    return new QueryClient({
        queryCache: new QueryCache({
            onError: (error) => ApiUtils.reportError(error),
        }),
        defaultOptions: {
            queries: {
                staleTime: 2 * 60 * 1000, // default: 60s "fresh" → no refetch on revisit
                gcTime: 5 * 60 * 1000, // keep unused data 5 min before dropping it
                retry: false, // api.util already retries 5xx/network errors
                refetchOnWindowFocus: false, // don't refetch when the tab regains focus
            },
        },
    })
}
// Module-level singleton for the browser.
let browserQueryClient: QueryClient | undefined

export function getQueryClient(): QueryClient {
    // This if checks whether "Am I running on the server, or in the browser?".
    // If typeof window === 'object' then its a browser and if typeof window === 'undefined',
    // its on server.
    // So this single line is the switch that routes to "server → new client
    // (no data leaks between users)" vs "browser → keep the one shared cache."
    if (typeof window === 'undefined') {
        return makeQueryClient()
    }
    // Browser: reuse the SAME client across navigations → cache persists
    if (!browserQueryClient) {
        browserQueryClient = makeQueryClient()
    }
    return browserQueryClient
}
