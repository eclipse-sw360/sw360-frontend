// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.
//
// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/
//
// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

const SESSION_EXPIRED_EVENT = 'sw360:session-expired'

const PROTECTED_ROUTE_PREFIXES = [
    '/admin',
    '/home',
    '/projects',
    '/components',
    '/licenses',
    '/ecc',
    '/vulnerabilities',
    '/requests',
    '/search',
    '/preferences',
    '/packages',
]

interface SessionExpiredEventDetail {
    callbackUrl?: string
}

export const buildLoginRedirectPath = (callbackUrl: string): string => {
    return `/?callbackUrl=${encodeURIComponent(callbackUrl)}`
}

export const isProtectedRoute = (pathname: string): boolean => {
    return PROTECTED_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

export const dispatchSessionExpiredEvent = (detail: SessionExpiredEventDetail = {}): void => {
    if (typeof window === 'undefined') {
        return
    }

    window.dispatchEvent(
        new CustomEvent<SessionExpiredEventDetail>(SESSION_EXPIRED_EVENT, {
            detail,
        }),
    )
}

export type { SessionExpiredEventDetail }
export { SESSION_EXPIRED_EVENT }
