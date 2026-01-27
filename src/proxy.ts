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
import { UserGroupType } from '@/object-types'
import { routing } from './i18n/routing'
import { locales } from './object-types/Constants'
import { CommonUtils } from './utils'

const LOGIN_PAGE_PATH = '/'

interface RouteProtection {
    roles?: UserGroupType[] // Roles required for this path
    authRequired?: boolean // True if any authentication is required
}

/*
    - Add configuration for role based access of different routes here
    - A route prefix not in this config object will be treated as a public 
      route by default
    - A longest prefix match will be performed on the paths to determine access
*/
const roleBasedAccessControl: {
    [pathPrefix: string]: RouteProtection
} = {
    '/admin': {
        roles: [
            UserGroupType.ADMIN,
        ],
        authRequired: true,
    },
    '/home': {
        authRequired: true,
    },
    '/projects': {
        authRequired: true,
    },
    '/components': {
        authRequired: true,
    },
    '/licenses': {
        authRequired: true,
    },
    '/ecc': {
        authRequired: true,
    },
    '/vulnerabilities': {
        authRequired: true,
    },
    '/requests': {
        authRequired: true,
    },
    '/search': {
        authRequired: true,
    },
    '/preferences': {
        authRequired: true,
    },
}

const getProtectionConfig = (pathname: string): RouteProtection | null => {
    const matchingPaths = Object.keys(roleBasedAccessControl)
        .filter((prefix) => pathname.startsWith(prefix))
        .sort((a, b) => b.length - a.length) // Sort by length for longest prefix matching

    if (matchingPaths.length > 0) {
        return roleBasedAccessControl[matchingPaths[0]]
    }
    return null
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

                // if protection config is not found or authRequired flag is undefined or false, it is a public page
                if (CommonUtils.isNullOrUndefined(protectionConfig?.authRequired) || !protectionConfig.authRequired) {
                    return true
                }

                // if authentication is required but token is not found, deny access
                if (CommonUtils.isNullOrUndefined(token)) {
                    return false
                }

                // if authentication is required but role based access is not required, allow
                if (!protectionConfig.roles || protectionConfig.roles.length === 0) {
                    return true
                }

                // check access permissions based on role
                const userGroup = token.userGroup as UserGroupType
                return protectionConfig.roles.includes(userGroup)
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
