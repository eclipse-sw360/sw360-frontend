// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import dotenv from 'dotenv'
import { defineConfig, devices } from '@playwright/test'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, 'tests', '.env.local') })

/**
 * SW360 Frontend Playwright Configuration
 *
 * Environment variables:
 *   SW360_BASE_URL - Frontend URL (default: http://localhost:3000)
 *   SW360_API_URL  - Backend API URL (default: http://localhost:8080)
 *
 * Role-based testing:
 *   - chromium (admin): Full admin access tests
 *   - chromium-user: Regular user role tests
 *   - chromium-viewer: Read-only viewer role tests
 *   - chromium-clearing: Clearing admin role tests
 */
const authFiles = {
    admin: path.join(__dirname, 'tests', '.auth', 'admin.json'),
    user: path.join(__dirname, 'tests', '.auth', 'user.json'),
    viewer: path.join(__dirname, 'tests', '.auth', 'viewer.json'),
    clearingAdmin: path.join(__dirname, 'tests', '.auth', 'clearingAdmin.json'),
}

export default defineConfig({
    testDir: './tests/e2e',
    outputDir: './tests/results',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 1,
    workers: process.env.CI ? 1 : undefined,
    reporter: [
        ['html', { outputFolder: './tests/reports', open: 'never' }],
        ['list'],
    ],
    // Global setup/teardown for role-based testing (ENABLE_ROLE_TESTS=true)
    globalSetup: process.env.ENABLE_ROLE_TESTS === 'true' ? './tests/global-setup.ts' : undefined,
    globalTeardown: process.env.ENABLE_ROLE_TESTS === 'true' ? './tests/global-teardown.ts' : undefined,
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
        // Main test suite (Chromium) — Admin role
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                storageState: authFiles.admin,
                // Disable CORS — frontend (localhost:3000) calls backend API (localhost:8080) cross-origin
                launchOptions: {
                    args: ['--disable-web-security'],
                },
            },
            dependencies: ['setup'],
        },
        // User role tests — Regular user without admin privileges
        {
            name: 'chromium-user',
            testMatch: /.*\/accessControl\/userAccess\.test\.ts/,
            use: {
                ...devices['Desktop Chrome'],
                storageState: authFiles.user,
                launchOptions: {
                    args: ['--disable-web-security'],
                },
            },
            dependencies: ['setup'],
        },
        // Viewer role tests — Read-only access
        {
            name: 'chromium-viewer',
            testMatch: /.*\/accessControl\/viewerAccess\.test\.ts/,
            use: {
                ...devices['Desktop Chrome'],
                storageState: authFiles.viewer,
                launchOptions: {
                    args: ['--disable-web-security'],
                },
            },
            dependencies: ['setup'],
        },
        // Clearing Admin role tests — Clearing administration
        {
            name: 'chromium-clearing',
            testMatch: /.*\/accessControl\/clearingAdminAccess\.test\.ts/,
            use: {
                ...devices['Desktop Chrome'],
                storageState: authFiles.clearingAdmin,
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
                          storageState: authFiles.admin,
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
