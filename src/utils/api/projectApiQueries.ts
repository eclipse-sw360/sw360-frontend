// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { QueryClient } from '@tanstack/react-query'
import { ApiError } from '@/utils/api/api.util'
import ApiUtils from '@/utils/api/authenticatedApi.util'
import { SESSION_EXPIRED_EVENT } from '@/utils/sessionExpiry.utils'

export const PROJECT_API_STALE_TIME = 30_000

export const projectQueryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: PROJECT_API_STALE_TIME,
            gcTime: 5 * 60_000,
            retry: false,
            refetchOnWindowFocus: false,
        },
    },
})

let sessionListenerRegistered = false

export type PrefetchEvent =
    | 'started'
    | 'completed'
    | 'failed'
    | 'cache-hit'
    | 'in-flight'
    | 'cleared'
    | 'intent'
    | 'route-requested'

export const logPrefetch = (event: PrefetchEvent, path: string, duration?: number): void => {
    // biome-ignore lint/suspicious/noConsole: Prefetch diagnostics are required for development verification.
    console.info('[prefetch]', event, path, duration === undefined ? '' : `${Math.round(duration)} ms`)
}

interface CachedApiResponse {
    status: number
    statusText: string
    headers: Array<
        [
            string,
            string,
        ]
    >
    body: string
}

export const projectApiQueryKey = (path: string) => [
    'project-api',
    path,
]

const toResponse = (cached: CachedApiResponse): Response => {
    const body = [
        204,
        205,
        304,
    ].includes(cached.status)
        ? null
        : cached.body
    return new Response(body, {
        status: cached.status,
        statusText: cached.statusText,
        headers: cached.headers,
    })
}

const registerSessionListener = (): void => {
    if (sessionListenerRegistered || typeof window === 'undefined') return
    window.addEventListener(SESSION_EXPIRED_EVENT, clearProjectLicensePrefetchCache)
    sessionListenerRegistered = true
}

export type ProjectApiResponseFetcher = (path: string, signal: AbortSignal) => Promise<Response>

export const projectApiResponseQueryOptions = (
    path: string,
    fetchResponse: ProjectApiResponseFetcher = (requestPath, signal) => ApiUtils.GET(requestPath, signal),
) => ({
    queryKey: projectApiQueryKey(path),
    staleTime: PROJECT_API_STALE_TIME,
    retry: false,
    queryFn: async ({ signal }: { signal: AbortSignal }): Promise<CachedApiResponse> => {
        const startedAt = performance.now()
        logPrefetch('started', path)
        try {
            const response = await fetchResponse(path, signal)
            const body = await response.text()
            if (!response.ok) {
                let message = `Request failed with status ${response.status}`
                try {
                    const errorDetails = JSON.parse(body) as {
                        message?: string
                    }
                    message = errorDetails.message ?? message
                } catch {
                    if (body !== '') message = body
                }
                throw new ApiError(message, {
                    status: response.status,
                })
            }
            logPrefetch('completed', path, performance.now() - startedAt)
            return {
                status: response.status,
                statusText: response.statusText,
                headers: Array.from(response.headers.entries()),
                body,
            }
        } catch (error) {
            logPrefetch('failed', path, performance.now() - startedAt)
            throw error
        }
    },
})

export const getProjectApiResponse = async (path: string, signal?: AbortSignal): Promise<Response> => {
    registerSessionListener()
    signal?.throwIfAborted()
    const queryKey = projectApiQueryKey(path)
    const state = projectQueryClient.getQueryState(queryKey)
    const isFresh = state?.data !== undefined && Date.now() - state.dataUpdatedAt < PROJECT_API_STALE_TIME
    if (isFresh) {
        logPrefetch('cache-hit', path)
    } else if (state?.fetchStatus === 'fetching') {
        logPrefetch('in-flight', path)
    }

    const cached = await projectQueryClient.query<CachedApiResponse>(projectApiResponseQueryOptions(path))

    signal?.throwIfAborted()
    return toResponse(cached)
}

const prefetchRequests = async (paths: string[]): Promise<void> => {
    const uniquePaths = new Set(paths)
    const results = await Promise.allSettled(
        [
            ...uniquePaths,
        ].map((path) => projectQueryClient.query(projectApiResponseQueryOptions(path))),
    )
    const failedRequest = results.find((result) => result.status === 'rejected')
    if (failedRequest?.status === 'rejected') throw failedRequest.reason
}

const licenseClearingPaths = (projectId: string): string[] => [
    `projects/${projectId}/linkedProjects?transitive=true`,
    `projects/${projectId}/licenseClearing?transitive=true`,
]

const runTabPrefetch = async (projectId: string, name: string, paths: string[]): Promise<void> => {
    logPrefetch('intent', `project ${projectId}: ${name}`)
    try {
        await prefetchRequests(paths)
    } catch {
        logPrefetch('failed', `${name} prefetch for project ${projectId}`)
    }
}

export const prefetchLicenseClearing = async (projectId: string): Promise<void> => {
    await prefetchRequests(licenseClearingPaths(projectId))
}

export const prefetchGenerateLicenseInfo = async (projectId: string, withSubProjects: boolean): Promise<void> => {
    logPrefetch('intent', 'generateLicenseInfo route hovered')
    try {
        const paths = [
            `projects/${projectId}`,
        ]
        if (withSubProjects) paths.push(`projects/${projectId}/linkedProjects?transitive=true`)
        await prefetchRequests(paths)
    } catch (error) {
        logPrefetch('failed', 'generateLicenseInfo inputs')
        throw error
    }
}

export type ProjectPrefetchTarget =
    | 'licenseClearing'
    | 'attachmentUsages'
    | 'obligations'
    | 'vulnerabilities'
    | 'changeLog'

const projectPrefetchPaths = (projectId: string, target: ProjectPrefetchTarget): string[] => {
    switch (target) {
        case 'licenseClearing':
            return licenseClearingPaths(projectId)
        case 'attachmentUsages':
            return [
                `projects/${projectId}/linkedProjects?transitive=true`,
                `projects/${projectId}/attachmentUsage?transitive=true`,
            ]
        case 'obligations':
            return [
                `projects/${projectId}/licenseObligations?page=0&page_entries=10&sort=`,
            ]
        case 'vulnerabilities':
            return [
                `projects/${projectId}/linkedProjects?transitive=true`,
                `projects/${projectId}/vulnerabilitySummary?page=0&page_entries=10&sort=`,
            ]
        case 'changeLog':
            return [
                `changelog/document/${projectId}?page=0&page_entries=10&sort=changeTimestamp%2Cdesc`,
            ]
    }
}

export const prefetchProjectTabData = async (projectId: string, target: ProjectPrefetchTarget): Promise<void> => {
    await runTabPrefetch(projectId, target, projectPrefetchPaths(projectId, target))
}

export const cancelProjectTabPrefetch = async (
    projectId: string,
    target: ProjectPrefetchTarget,
    preserveTarget?: ProjectPrefetchTarget,
): Promise<void> => {
    const preservedPaths = new Set(preserveTarget ? projectPrefetchPaths(projectId, preserveTarget) : [])
    const pathsToCancel = projectPrefetchPaths(projectId, target).filter((path) => !preservedPaths.has(path))
    await Promise.all(
        pathsToCancel.map((path) =>
            projectQueryClient.cancelQueries({
                queryKey: projectApiQueryKey(path),
                exact: true,
            }),
        ),
    )
}

export const clearProjectLicensePrefetchCache = (): void => {
    const queryKey = [
        'project-api',
    ]
    void projectQueryClient.cancelQueries({
        queryKey,
    })
    projectQueryClient.removeQueries({
        queryKey,
    })
    logPrefetch('cleared', 'project API queries')
}
