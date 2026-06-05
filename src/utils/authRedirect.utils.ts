// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.
//
// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/
//
// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { locales } from '../object-types/Constants'

export const getLocalizedHomePath = (locale: string): string => `/${locale}/home`

const isWelcomePath = (pathname: string, locale: string): boolean => {
    const normalizedPath = pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname

    return normalizedPath === '' || normalizedPath === '/' || normalizedPath === `/${locale}`
}

const toInternalPath = (url: URL): string => `${url.pathname}${url.search}${url.hash}`

const hasLocalePrefix = (pathname: string): boolean => {
    return locales.some(
        (supportedLocale) => pathname === `/${supportedLocale}` || pathname.startsWith(`/${supportedLocale}/`),
    )
}

const normalizeInternalPath = (pathname: string, locale: string): string => {
    if (!pathname.startsWith('/')) {
        return getLocalizedHomePath(locale)
    }

    if (isWelcomePath(pathname, locale)) {
        return getLocalizedHomePath(locale)
    }

    if (hasLocalePrefix(pathname)) {
        return pathname
    }

    return `/${locale}${pathname}`
}

export const resolveAuthCallbackUrl = (
    rawCallbackUrl: string | null | undefined,
    locale: string,
    origin?: string,
): string => {
    const fallbackPath = getLocalizedHomePath(locale)

    if (!rawCallbackUrl) {
        return fallbackPath
    }

    if (rawCallbackUrl.startsWith('/') && !rawCallbackUrl.startsWith('//')) {
        return normalizeInternalPath(rawCallbackUrl, locale)
    }

    if (!origin) {
        return fallbackPath
    }

    try {
        const currentOrigin = new URL(origin)
        const callbackUrl = new URL(rawCallbackUrl)

        if (callbackUrl.origin !== currentOrigin.origin) {
            return fallbackPath
        }

        const internalPath = toInternalPath(callbackUrl)
        return normalizeInternalPath(internalPath, locale)
    } catch {
        return fallbackPath
    }
}
