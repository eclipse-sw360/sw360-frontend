// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useState } from 'react'
import {
    ConfigurationContainers,
    HttpStatus,
    ProcessedUiConfig,
    parseRawUiConfig,
    UiConfiguration,
} from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'
import { useLocalStorage } from './index'

interface CachedUiConfig {
    data: ProcessedUiConfig
    timestamp: number
}

export function useUiConfig() {
    const [processedConfig, setProcessedConfig] = useLocalStorage<CachedUiConfig | null>('uiConfig', null)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const { status } = useSession()
    const t = useTranslations('default')
    const apiEndpoint = `configurations/container/${ConfigurationContainers.UI_CONFIGURATION}`

    const CACHE_TTL = 15 * 60 * 1000

    const isConfigExpired = useCallback(() => {
        if (!processedConfig || !processedConfig.timestamp) return true
        return Date.now() - processedConfig.timestamp > CACHE_TTL
    }, [
        processedConfig,
    ])

    const fetchAndProcessUiConfig = useCallback(
        async (force = false) => {
            if (status !== 'authenticated') {
                setIsLoading(false)
                return
            }

            if (!force && processedConfig && !isConfigExpired()) {
                setIsLoading(false)
                return
            }

            setIsLoading(true)

            const session = await getSession()
            if (CommonUtils.isNullOrUndefined(session)) {
                MessageService.error(t('Session has expired'))
                signOut()
                return
            }

            const response = await ApiUtils.GET(apiEndpoint, session.user.access_token)
            if (response.status == HttpStatus.OK) {
                const rawData = (await response.json()) as UiConfiguration
                const processedData = parseRawUiConfig(rawData)
                setProcessedConfig({
                    data: processedData,
                    timestamp: Date.now(),
                })
            } else if (response.status == HttpStatus.UNAUTHORIZED) {
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
        if (status === 'authenticated') {
            fetchAndProcessUiConfig()
        }
    }, [
        status,
        fetchAndProcessUiConfig,
    ])

    useEffect(() => {
        const intervalId = setInterval(() => {
            if (status === 'authenticated' && isConfigExpired()) {
                fetchAndProcessUiConfig(true)
            }
        }, CACHE_TTL)

        return () => clearInterval(intervalId)
    }, [
        status,
        fetchAndProcessUiConfig,
        isConfigExpired,
    ])

    return {
        config: processedConfig?.data || null,
        isLoading,
        refreshConfig: () => fetchAndProcessUiConfig(true),
    }
}
