// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import { StatusCodes } from 'http-status-codes'
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Configuration, ConfigurationContainers } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'
import { useLocalStorage } from './index'

interface CachedSW360Config {
    data: Configuration
    timestamp: number
}

export function useSW360BackendConfig() {
    const [processedConfig, setProcessedConfig] = useLocalStorage<CachedSW360Config | null>('sw360BackendConfig', null)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const { status } = useSession()
    const t = useTranslations('default')
    const apiEndpoint = `configurations/container/${ConfigurationContainers.SW360_CONFIGURATION}`
    const hasFetchedRef = useRef(false)

    const CACHE_TTL = 15 * 60 * 1000

    const isConfigExpired = useCallback(() => {
        if (!processedConfig || !processedConfig.timestamp) return true
        return Date.now() - processedConfig.timestamp > CACHE_TTL
    }, [
        processedConfig,
    ])

    const fetchAndProcessSW360Config = useCallback(
        async (force = false) => {
            if (status !== 'authenticated') {
                setIsLoading(false)
                return
            }

            if (!force && processedConfig && !isConfigExpired()) {
                setIsLoading(false)
                return
            }

            if (!force && hasFetchedRef.current) {
                return
            }

            setIsLoading(true)
            hasFetchedRef.current = true

            const session = await getSession()
            if (CommonUtils.isNullOrUndefined(session)) {
                MessageService.error(t('Session has expired'))
                signOut()
                return
            }

            const response = await ApiUtils.GET(apiEndpoint, session.user.access_token)
            if (response.status == StatusCodes.OK) {
                const configData = (await response.json()) as Configuration
                setProcessedConfig({
                    data: configData,
                    timestamp: Date.now(),
                })
            } else if (response.status == StatusCodes.UNAUTHORIZED) {
                await signOut()
            } else {
                setProcessedConfig(null)
            }
            setIsLoading(false)
        },
        [
            status,
            processedConfig,
            isConfigExpired,
            setProcessedConfig,
        ],
    )

    useEffect(() => {
        if (status === 'authenticated' && !hasFetchedRef.current) {
            fetchAndProcessSW360Config()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        status,
    ])

    useEffect(() => {
        const intervalId = setInterval(() => {
            if (status === 'authenticated' && isConfigExpired()) {
                fetchAndProcessSW360Config(true)
            }
        }, CACHE_TTL)

        return () => clearInterval(intervalId)
    }, [
        status,
        fetchAndProcessSW360Config,
        isConfigExpired,
    ])

    return {
        config: processedConfig?.data || null,
        isLoading,
        refreshConfig: () => fetchAndProcessSW360Config(true),
    }
}
