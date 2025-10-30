// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import { useUiConfig } from '@/hooks'
import { ProcessedUiConfig, UIConfigKeys } from '@/object-types'
import { createContext, ReactNode, useContext } from 'react'

interface UiConfigContextType {
    config: ProcessedUiConfig | null
    isLoading: boolean
    refreshConfig: () => void
}

const UiConfigContext = createContext<UiConfigContextType | undefined>(undefined)

export function UiConfigProvider({ children }: { children: ReactNode }) {
    const uiConfigData = useUiConfig()

    return <UiConfigContext.Provider value={uiConfigData}>{children}</UiConfigContext.Provider>
}

export function useUiConfigContext() {
    const context = useContext(UiConfigContext)
    if (context === undefined) {
        throw new Error('useUiConfigContext must be used within a UiConfigProvider')
    }
    return context
}

export function useConfigValue(key: UIConfigKeys): boolean | string[] | null {
    const { config } = useUiConfigContext()

    if (!config || !(key in config)) {
        return null
    }

    return config[key]
}
