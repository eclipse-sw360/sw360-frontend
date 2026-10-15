// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { QueryClient } from '@tanstack/react-query'
import { expect, test } from '@playwright/test'
import { projectApiQueryKey, projectApiResponseQueryOptions } from '../../src/utils/api/projectApiQueries'

const createQueryClient = (): QueryClient =>
    new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    })

test('deduplicates concurrent requests and caches the response snapshot', async () => {
    const queryClient = createQueryClient()
    let calls = 0
    let finish: ((response: Response) => void) | undefined
    const fetchResponse = async (_path: string, _signal: AbortSignal): Promise<Response> => {
        calls += 1
        return new Promise((resolve) => {
            finish = resolve
        })
    }
    const queryOptions = projectApiResponseQueryOptions('projects/id', fetchResponse)
    const first = queryClient.fetchQuery(queryOptions)
    const second = queryClient.fetchQuery(queryOptions)
    finish?.(Response.json({ name: 'project' }))
    const results = await Promise.all([first, second])
    expect(results[0]).toEqual(results[1])
    expect(results[0].body).toContain('project')
    expect(calls).toBe(1)
    queryClient.clear()
})

test('query keys isolate endpoint paths', async () => {
    const queryClient = createQueryClient()
    let calls = 0
    const fetchResponse = async (_path: string, _signal: AbortSignal): Promise<Response> =>
        Response.json({ count: ++calls })
    await queryClient.fetchQuery(projectApiResponseQueryOptions('projects/one', fetchResponse))
    await queryClient.fetchQuery(projectApiResponseQueryOptions('projects/two', fetchResponse))
    expect(queryClient.getQueryData(projectApiQueryKey('projects/one'))).toBeDefined()
    expect(queryClient.getQueryData(projectApiQueryKey('projects/two'))).toBeDefined()
    expect(calls).toBe(2)
    queryClient.clear()
})

test('does not cache failed API responses and allows a later retry', async () => {
    const queryClient = createQueryClient()
    let calls = 0
    const fetchResponse = async (_path: string, _signal: AbortSignal): Promise<Response> => {
        calls += 1
        return Response.json({}, { status: calls === 1 ? 500 : 200 })
    }
    const queryOptions = projectApiResponseQueryOptions('projects/id', fetchResponse)
    await expect(queryClient.fetchQuery(queryOptions)).rejects.toThrow('Request failed with status 500')
    expect((await queryClient.fetchQuery(queryOptions)).status).toBe(200)
    expect(calls).toBe(2)
    queryClient.clear()
})

test('removing project API queries clears the cached response snapshot', async () => {
    const queryClient = createQueryClient()
    await queryClient.fetchQuery(
        projectApiResponseQueryOptions('projects/id', async () => Response.json({ name: 'project' })),
    )
    queryClient.removeQueries({ queryKey: ['project-api'] })
    expect(queryClient.getQueryData(projectApiQueryKey('projects/id'))).toBeUndefined()
})