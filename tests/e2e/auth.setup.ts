// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { test as setup, expect, Page } from '@playwright/test'
import { config } from '../config'
import { testUsers, createAllTestUsers, deleteAllTestUsers } from './helpers/testUserSetup'

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
 *
 * Setup order:
 * 1. Create test users in CouchDB (direct DB access)
 * 2. Authenticate as admin (required)
 * 3. Authenticate as other roles (user, viewer, clearingAdmin)
 */

/**
 * Helper function to perform login for any role
 */
async function loginAsRole(
    page: Page,
    email: string,
    password: string,
    authFile: string,
    timeoutMs = 120000,
): Promise<void> {
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
    await emailInput.fill(email)

    // 6. Fill password
    const passwordInput = page.locator('.login-modal input[type="password"]')
    await passwordInput.fill(password)

    // 7. Click the login button
    await page.locator('.login-btn').click()

    // 8. Wait for successful login — must reach /home before saving state
    await page.waitForURL('**/home', { timeout: timeoutMs })

    // 9. Verify we're on the home page
    await expect(page).toHaveTitle(/Home|SW360/)

    // 10. Save authentication state (cookies + localStorage)
    await page.context().storageState({ path: authFile })
}

/**
 * Helper function to attempt login, returning success status
 */
async function tryLoginAsRole(
    page: Page,
    email: string,
    password: string,
    authFile: string,
    roleName: string,
): Promise<boolean> {
    try {
        await loginAsRole(page, email, password, authFile)
        console.log(`✓ Authenticated as ${roleName}`)
        return true
    } catch (error) {
        console.log(`⚠ Could not authenticate as ${roleName}: ${error}`)
        return false
    }
}

// ============================================================================
// SETUP: Create test users in CouchDB (first step)
// This uses direct CouchDB access, no auth required
// ============================================================================
setup('create test users in couchdb', async () => {
    setup.setTimeout(60000)
    await createAllTestUsers()
})

// ============================================================================
// SETUP: Admin authentication (required)
// ============================================================================
setup('authenticate as admin', async ({ page }) => {
    setup.setTimeout(120000)
    await loginAsRole(page, config.users.admin.email, config.users.admin.password, config.authFiles.admin)
    console.log('✓ Admin authentication complete')
})

// ============================================================================
// SETUP: Role-based authentication
// Enable these after running 'create test users in couchdb' setup
// ============================================================================
setup('authenticate as user', async ({ page }) => {
    setup.setTimeout(120000)
    await tryLoginAsRole(
        page,
        testUsers.user.email,
        testUsers.user.password,
        config.authFiles.user,
        'USER',
    )
})

setup('authenticate as viewer', async ({ page }) => {
    setup.setTimeout(120000)
    await tryLoginAsRole(
        page,
        testUsers.viewer.email,
        testUsers.viewer.password,
        config.authFiles.viewer,
        'VIEWER',
    )
})

setup('authenticate as clearingAdmin', async ({ page }) => {
    setup.setTimeout(120000)
    await tryLoginAsRole(
        page,
        testUsers.clearingAdmin.email,
        testUsers.clearingAdmin.password,
        config.authFiles.clearingAdmin,
        'CLEARING_ADMIN',
    )
})
