// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { ArrayTypeUIConfigKeys, StringTypeUIConfigKeys, UIConfigKeys } from './enums/UIConfigKeys'

export type UiConfiguration = {
    [key in UIConfigKeys]: string
}

// Extended type for processed configuration after parsing
export type ProcessedUiConfig = {
    [key in UIConfigKeys]: key extends (typeof ArrayTypeUIConfigKeys)[number]
        ? string[]
        : key extends (typeof StringTypeUIConfigKeys)[number]
          ? string
          : boolean
}

// Helper functions to process raw configuration
export function parseConfigValue(key: UIConfigKeys, value: string): string[] | string | boolean {
    if (ArrayTypeUIConfigKeys.includes(key)) {
        if (value === undefined) {
            return []
        }
        let parsedValues: string[]
        try {
            parsedValues = JSON.parse(value) as string[]
        } catch {
            parsedValues = []
        }
        return parsedValues.map((item) => item.trim()).filter(Boolean)
    } else if (StringTypeUIConfigKeys.includes(key)) {
        // Handle string type configurations
        return value || ''
    } else {
        // Handle boolean type configurations
        return value ? value.toLowerCase() === 'true' : false
    }
}

// Function to transform raw config to processed config
export function parseRawUiConfig(rawConfig: UiConfiguration): ProcessedUiConfig {
    const processedConfig = {} as ProcessedUiConfig

    for (const key of Object.values(UIConfigKeys)) {
        // @ts-expect-error The types are assigned dynamically
        processedConfig[key] = parseConfigValue(key, rawConfig[key])
    }

    return processedConfig
}
