// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import { createContext, ReactNode, useContext } from 'react'
import { useSW360BackendConfig } from '@/hooks'
import { ConfigKeys, Configuration } from '@/object-types'

interface SW360BackendConfigContextType {
    config: Configuration | null
    isLoading: boolean
    refreshConfig: () => void
}

const SW360BackendConfigContext = createContext<SW360BackendConfigContextType | undefined>(undefined)

export function SW360BackendConfigProvider({ children }: { children: ReactNode }) {
    const sw360BackendConfigData = useSW360BackendConfig()

    return (
        <SW360BackendConfigContext.Provider value={sw360BackendConfigData}>
            {children}
        </SW360BackendConfigContext.Provider>
    )
}

export function useSW360BackendConfigContext() {
    const context = useContext(SW360BackendConfigContext)
    if (context === undefined) {
        throw new Error('useSW360BackendConfigContext must be used within a SW360BackendConfigProvider')
    }
    return context
}

export function useConfigKeyValue(key: ConfigKeys): string | null {
    const { config } = useSW360BackendConfigContext()

    if (!config || !(key in config)) {
        return null
    }

    return config[key]
}
