// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { withAuth } from 'next-auth/middleware'
import createIntlMiddleware from 'next-intl/middleware'
import { NextRequest } from 'next/server'
import { locales } from './object-types/Constants'

const publicPages = ['/']

const adminPages = ['/admin']

const intlMiddleware = createIntlMiddleware({
    locales,
    defaultLocale: 'en',
})

const authMiddleware = withAuth(
    // Note that this callback is only invoked if
    // the `authorized` callback has returned `true`
    // and not for pages listed in `pages`.
    (req) => intlMiddleware(req),
    {
        callbacks: {
            authorized: ({ token }) => token != null,
        },
        pages: {
            signIn: '/',
        },
    }
)

const authAdminMiddleware = withAuth(
    // Note that this callback is only invoked if
    // the `authorized` callback has returned `true`
    // and not for pages listed in `pages`.
    (req) => intlMiddleware(req),
    {
        callbacks: {
            authorized: ({ token }) => token !== null && token.userGroup === 'ADMIN',
        },
        pages: {
            signIn: '/',
        },
    }
)

export default function middleware(req: NextRequest) {
    const publicPathnameRegex = RegExp(
        `^(/(${locales.join('|')}))?(${publicPages.flatMap((p) => (p === '/' ? ['', '/'] : p)).join('|')})/?$`,
        'i'
    )
    const isPublicPage = publicPathnameRegex.test(req.nextUrl.pathname)

    const adminPathnameRegex = RegExp(
        `^(/(${locales.join('|')}))?(${adminPages.flatMap((p) => (p === '/' ? ['', '/'] : p)).join('|')})/?$`,
        'i'
    )
    const isAdminPage = adminPathnameRegex.test(req.nextUrl.pathname)

    if (isPublicPage) {
        return intlMiddleware(req)
    } else if (isAdminPage) {
        return (authAdminMiddleware as any)(req)
    } else {
        return (authMiddleware as any)(req)
    }
}

export const config = {
    // Skip all paths that should not be internationalized
    matcher: ['/((?!api|_next|.*\\..*).*)'],
}
