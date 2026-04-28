// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { withAuth } from 'next-auth/middleware'
import createMiddleware from 'next-intl/middleware'
import { type RoutePermission, routePermissions } from '@/config/permissions'
import { UserGroupType } from '@/object-types'
import { routing } from './i18n/routing'
import { locales } from './object-types/Constants'
import { CommonUtils } from './utils'

const LOGIN_PAGE_PATH = '/'

/**
 * Get the route protection configuration for a given pathname
 * Uses longest prefix matching to find the most specific route config
 */
const getProtectionConfig = (pathname: string): RoutePermission | null => {
    const matchingPaths = Object.keys(routePermissions)
        .filter((prefix) => pathname.startsWith(prefix))
        .sort((a, b) => b.length - a.length) // Sort by length for longest prefix matching

    if (matchingPaths.length > 0) {
        return routePermissions[matchingPaths[0]]
    }
    return null
}

/**
 * Evaluate if a user role is allowed based on route permission config
 * Blocked roles (blacklist) take precedence over allowed roles (whitelist)
 */
const isRoleAllowed = (userRole: UserGroupType, config: RoutePermission): boolean => {
    // Check blocked roles first (blacklist takes precedence)
    if (config.blockedRoles && config.blockedRoles.includes(userRole)) {
        return false
    }

    // Check allowed roles (whitelist)
    if (config.allowedRoles && config.allowedRoles.length > 0) {
        return config.allowedRoles.includes(userRole)
    }

    // No specific role restrictions, allow by default
    return true
}

const intlMiddleware = createMiddleware(routing)

const authMiddleware = withAuth(
    // Note that this callback is only invoked if
    // the `authorized` callback has returned `true`
    // and not for pages listed in `pages`.
    (req) => intlMiddleware(req),
    {
        callbacks: {
            authorized: ({ req, token }) => {
                const { pathname } = req.nextUrl
                const currentLocale = locales.find(
                    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
                )
                const pathWithoutLocale = currentLocale ? pathname.replace(`/${currentLocale}`, '') : pathname

                const protectionConfig = getProtectionConfig(pathWithoutLocale)

                // If no protection config exists, it's a public page - allow access
                if (CommonUtils.isNullOrUndefined(protectionConfig)) {
                    return true
                }

                // Protection config exists - require authentication
                if (CommonUtils.isNullOrUndefined(token)) {
                    return false
                }

                // Check role-based access
                const userGroup = token.userGroup as UserGroupType
                return isRoleAllowed(userGroup, protectionConfig)
            },
        },
        pages: {
            signIn: LOGIN_PAGE_PATH,
        },
    },
)

import { NextRequest, NextResponse } from 'next/server'

export default function proxy(req: NextRequest): NextResponse | Promise<NextResponse> {
    // The middleware does not run for routes present in the pages param of withAuth, thus this workaround
    if (req.nextUrl.pathname === LOGIN_PAGE_PATH) {
        return intlMiddleware(req)
    } else {
        return (authMiddleware as (req: NextRequest) => ReturnType<typeof intlMiddleware>)(req)
    }
}

export const config = {
    // Skip all paths that should not be internationalized
    matcher: [
        '/((?!api|_next|.*\\..*).*)',
    ],
}
