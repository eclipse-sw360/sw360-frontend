// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { defineConfig, devices } from '@playwright/test'
import path from 'path'

/**
 * SW360 Frontend Playwright Configuration
 *
 * Environment variables:
 *   SW360_BASE_URL - Frontend URL (default: http://localhost:3000)
 *   SW360_API_URL  - Backend API URL (default: http://localhost:8080)
 */
const authFile = path.join(__dirname, 'tests', '.auth', 'admin.json')

export default defineConfig({
    testDir: './tests/e2e',
    outputDir: './tests/results',
    // Skip admin tests in CI — admin pages require additional backend configuration support
    testIgnore: process.env.SKIP_ADMIN_TESTS ? ['**/admin/**'] : [],
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 1,
    workers: process.env.CI ? 1 : undefined,
    reporter: [
        ['html', { outputFolder: './tests/reports', open: 'never' }],
        ['list'],
    ],
    use: {
        baseURL: process.env.SW360_BASE_URL || 'http://localhost:3000',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'on-first-retry',
        actionTimeout: 15000,
        navigationTimeout: 30000,
    },
    projects: [
        // Auth setup — runs once before all tests
        {
            name: 'setup',
            testMatch: /.*\.setup\.ts/,
            use: {
                launchOptions: {
                    args: ['--disable-web-security'],
                },
            },
        },
        // Main test suite (Chromium)
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                storageState: authFile,
                // Disable CORS — frontend (localhost:3000) calls backend API (localhost:8080) cross-origin
                launchOptions: {
                    args: ['--disable-web-security'],
                },
            },
            dependencies: ['setup'],
        },
        // Firefox (optional, CI-only)
        ...(process.env.CI
            ? [
                  {
                      name: 'firefox',
                      use: {
                          ...devices['Desktop Firefox'],
                          storageState: authFile,
                      },
                      dependencies: ['setup'],
                  },
              ]
            : []),
    ],
    // Dev server config.
    // For --ui mode: start your dev server first with `pnpm dev`, then run `pnpm test:pw:ui`.
    // For headless mode: the server starts automatically if not already running.
    webServer: process.env.CI
        ? undefined
        : {
              command: 'npx next dev --turbopack',
              url: 'http://localhost:3000',
              reuseExistingServer: true,
              timeout: 120000,
          },
})
