// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { locales } from '@/constants'

/**
 * Build a public app pathname that respects next-intl `localePrefix: 'never'`.
 *
 * Locale must not appear in the URL. Middleware rewrites `/home` → `/[locale]/home`
 * using the locale cookie / Accept-Language. Manually prefixing (e.g. `/ja/home`)
 * causes RSC requests that 307-redirect and can surface as NEXT_HTTP_ERROR_FALLBACK;404.
 */
export function toPublicPath(path: string): string {
    if (path === '#' || path === '/') {
        return path
    }

    const normalized = path.startsWith('/') ? path : `/${path}`
    const segments = normalized.split('/')
    const firstSegment = segments[1]

    if (firstSegment !== undefined && (locales as readonly string[]).includes(firstSegment)) {
        const rest = segments.slice(2).join('/')
        return rest.length > 0 ? `/${rest}` : '/'
    }

    return normalized
}

export function homePath(): string {
    return '/home'
}
