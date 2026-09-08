// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin()
const isDev = process.env.NODE_ENV === 'development'
const sw360ApiUrl = process.env.NEXT_PUBLIC_SW360_API_URL || ''

/**
 * Resolved frontend build  metadata (version, git branch, git commit)
 *
 * Resolution order for git values:
 *   1. Explicit env vars (NEXT_PUBLIC_APP_GIT_* / SOURCE_BRANCH / SOURCE_COMMIT)
 *         — set by CI / Docker build-args.
 *   2. `git` command against the local working tree — for `pnpm build` in a dev checkout.
 *   3. 'unknown' — final fallback so the build never fails on missing metadata.
 *
 * Values are inlined into the client bundle via the Next.js `env` field.
 */
function resolveFrontendBuildInfo(): Record<string, string> {
    const pkg = JSON.parse(readFileSync(resolve(process.cwd(), 'package.json'), 'utf-8')) as {
        version: string
    }

    const tryGit = (args: string): string | undefined => {
        try {
            const out = execSync(`git ${args}`, {
                stdio: [
                    'ignore',
                    'pipe',
                    'ignore',
                ],
            })
                .toString()
                .trim()
            return out || undefined
        } catch {
            return undefined
        }
    }

    const gitBranch =
        process.env.NEXT_PUBLIC_APP_GIT_BRANCH ||
        process.env.SOURCE_BRANCH ||
        tryGit('rev-parse --abbrev-ref HEAD') ||
        'unknown'

    const gitCommit =
        process.env.NEXT_PUBLIC_APP_GIT_COMMIT ||
        process.env.SOURCE_COMMIT ||
        tryGit('rev-parse --short HEAD') ||
        'unknown'

    return {
        NEXT_PUBLIC_APP_VERSION: pkg.version,
        NEXT_PUBLIC_APP_GIT_BRANCH: gitBranch,
        NEXT_PUBLIC_APP_GIT_COMMIT: gitCommit,
    }
}

const frontendBuildInfo = resolveFrontendBuildInfo()

const csp = `
  default-src 'self';
  script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''};
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https://secure.gravatar.com https://www.gravatar.com;
  font-src 'self' data:;
  connect-src 'self' https://www.gravatar.com${isDev ? ' http://localhost:*' : ''}${sw360ApiUrl ? ` ${sw360ApiUrl}` : ''};
  object-src 'none';
  frame-ancestors 'self';
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
    // Inline frontend build metadata into the client bundle (compile-time constants).
    env: frontendBuildInfo,
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
