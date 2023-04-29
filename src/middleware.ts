// Copyright (C) SW360 Frontend Authors (see <https://github.com/eclipse-sw360/sw360-frontend/blob/main/NOTICE>)

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

export { default } from "next-auth/middleware";

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - auth (auth routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!auth|_next/static|_next/image|favicon.ico).*)',
    ],
};