// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { test as setup, expect } from '@playwright/test'
import { config } from '../config'

/**
 * Authentication Setup
 *
 * This runs ONCE before all tests. It performs a real UI login and saves
 * the session cookies + localStorage to a JSON file. All subsequent tests
 * load this state — zero login overhead per test.
 *
 * Key considerations for SW360:
 * - Login is a Bootstrap modal on the root page (not a separate /login route)
 * - NextAuth uses CSRF tokens managed automatically via cookies
 * - We must wait for the full redirect to /home before saving state
 * - The storageState captures HttpOnly cookies (next-auth.session-token)
 */

const adminAuthFile = config.authFiles.admin

setup('authenticate as admin', async ({ page }) => {
    // Increase timeout for CI (backend may be slow to respond on first auth)
    setup.setTimeout(120000)

    // 1. Navigate to root — middleware will redirect to locale-prefixed route
    await page.goto('/')

    // 2. Wait for the welcome page to load (locale redirect may happen)
    await expect(page.locator('#portlet_sw360_portlet_welcome')).toBeVisible({ timeout: 30000 })

    // 3. Click "Sign In" button to open the login modal
    await page.getByRole('button', { name: 'Sign In' }).click()

    // 4. Wait for the login modal to be visible
    await expect(page.locator('.login-modal')).toBeVisible()

    // 5. Fill email — clear the default @sw360.org and type full email
    const emailInput = page.locator('.login-modal input[type="email"]')
    await emailInput.clear()
    await emailInput.fill(config.users.admin.email)

    // 6. Fill password
    const passwordInput = page.locator('.login-modal input[type="password"]')
    await passwordInput.fill(config.users.admin.password)

    // 7. Click the login button
    await page.locator('.login-btn').click()

    // 8. Wait for successful login — must reach /home before saving state
    //    This ensures the session cookie is fully set
    //    Use longer timeout in CI where backend may be slower
    await page.waitForURL('**/home', { timeout: 60000 })

    // 9. Verify we're on the home page
    await expect(page).toHaveTitle(/Home|SW360/)

    // 10. Save authentication state (cookies + localStorage)
    //     This includes the HttpOnly next-auth.session-token cookie
    await page.context().storageState({ path: adminAuthFile })
})
