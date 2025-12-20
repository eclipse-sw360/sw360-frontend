// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'
const withNextIntl = createNextIntlPlugin()

const config: NextConfig = {
    productionBrowserSourceMaps: true,
    reactStrictMode: true,
    output: 'standalone',
    typescript: {
        ignoreBuildErrors: false,
    },
    async headers() {
        return [
            {
                // Apply security headers to all routes
                source: '/:path*',
                headers: [
                    {
                        // HTTP Strict Transport Security (HSTS) - RFC 6797
                        key: 'Strict-Transport-Security',
                        value: 'max-age=31536000; includeSubDomains; preload',
                    },
                    {
                        // Prevent MIME type sniffing
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        // Enable XSS protection
                        key: 'X-XSS-Protection',
                        value: '1; mode=block',
                    },
                    {
                        // Control how much referrer information should be included
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                    {
                        // Prevent clickjacking attacks
                        key: 'X-Frame-Options',
                        value: 'SAMEORIGIN',
                    },
                    {
                        // Content Security Policy
                        key: 'Content-Security-Policy',
                        value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;",
                    },
                    {
                        // Permissions Policy (formerly Feature-Policy)
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()',
                    },
                ],
            },
        ]
    },
}

export default withNextIntl(config)
