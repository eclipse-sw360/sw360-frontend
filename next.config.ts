// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin()
const isDev = process.env.NODE_ENV === 'development'

const csp = `
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https://secure.gravatar.com https://www.gravatar.com;
  font-src 'self' data:;
  connect-src 'self' https://www.gravatar.com${isDev ? ' http://localhost:*' : ''};
  object-src 'none';
  frame-ancestors 'self';
  require-trusted-types-for 'script';
`
    .replace(/\s{2,}/g, ' ')
    .trim()

const config: NextConfig = {
    productionBrowserSourceMaps: true,
    reactStrictMode: true,
    output: 'standalone',
    typescript: {
        ignoreBuildErrors: false,
    },
    // biome-ignore-start lint: Next.js config requires this async method pattern for custom headers
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
                        // Disable built-in XSS protection to avoid conflicts with modern browsers
                        key: 'X-XSS-Protection',
                        value: '0',
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
                        value: csp,
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
    // biome-ignore-end lint: Next.js config requires this async method pattern for custom headers
}

export default withNextIntl(config)
