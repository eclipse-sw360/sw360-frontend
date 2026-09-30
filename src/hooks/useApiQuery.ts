// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE


import { type QueryKey,
         type UseQueryOptions,
         type UseQueryResult,
         useQuery } from '@tanstack/react-query'
import { fetchData } from '@/utils/api/queryFetch'

interface UseApiQueryArgs<TData>
          extends Omit<UseQueryOptions<TData, Error, TData, QueryKey>,
          'queryKey' | 'queryFn'> {
    queryKey: QueryKey
    path: string
}

export function useApiQuery<TData>({ queryKey, path, ...options }:
                                    UseApiQueryArgs<TData>):
                                    UseQueryResult<TData, Error> {
    return useQuery<TData, Error, TData, QueryKey>({
        queryKey,
        queryFn: ({ signal }) => fetchData<TData>(path, signal),
        ...options,
    })
}
