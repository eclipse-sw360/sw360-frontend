// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

export const extractPackageManagerFromPurl = (purl?: string): string | undefined => {
    if (!purl) {
        return undefined
    }

    const normalizedPurl = purl.trim()
    if (!normalizedPurl.toLowerCase().startsWith('pkg:')) {
        return undefined
    }

    const packageDescriptor = normalizedPurl.slice(4)
    const separatorIndex = packageDescriptor.search(/[/@?]/)
    const packageManager = separatorIndex >= 0 ? packageDescriptor.slice(0, separatorIndex) : packageDescriptor

    return packageManager ? packageManager.toUpperCase() : undefined
}
