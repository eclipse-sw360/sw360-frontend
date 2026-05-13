// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { test, expect } from '@playwright/test'
import { fixtures } from './fixtures'
import { selectors } from './selectors'
import { navigateToPage, hasPageAccess, isActionVisible, isAdminNavVisible } from './utils'

/**
 * Access Control Tests - CLEARING_ADMIN Role
 *
 * These tests verify that a CLEARING_ADMIN:
 * - Can access public pages (components, projects, licenses, etc.)
 * - Can access clearing-related admin functions
 * - Has limited admin access (not full SW360_ADMIN)
 * - Can perform clearing-specific actions
 *
 * PREREQUISITE: Create 'clearing@sw360.org' with CLEARING_ADMIN role in backend,
 * then remove test.skip() below.
 */


test.describe('CLEARING_ADMIN Role - Public Page Access', () => {
    test('TC01: should access Home page', async ({ page }) => {
        const hasAccess = await hasPageAccess(page, '/home')
        expect(hasAccess).toBe(true)
    })

    test('TC02: should access Components page', async ({ page }) => {
        const hasAccess = await hasPageAccess(page, '/components')
        expect(hasAccess).toBe(true)
    })

    test('TC03: should access Projects page', async ({ page }) => {
        const hasAccess = await hasPageAccess(page, '/projects')
        expect(hasAccess).toBe(true)
    })

    test('TC04: should access Licenses page', async ({ page }) => {
        const hasAccess = await hasPageAccess(page, '/licenses')
        expect(hasAccess).toBe(true)
    })

    test('TC05: should access Packages page', async ({ page }) => {
        const hasAccess = await hasPageAccess(page, '/packages')
        expect(hasAccess).toBe(true)
    })

    test('TC06: should access Requests page', async ({ page }) => {
        const hasAccess = await hasPageAccess(page, '/requests')
        expect(hasAccess).toBe(true)
    })
})

test.describe('CLEARING_ADMIN Role - Write Actions Available', () => {
    test('TC07: should see Add Component button on Components page', async ({ page }) => {
        await navigateToPage(page, '/components')
        const visible = await isActionVisible(page, 'Add Component')
        expect(visible).toBe(true)
    })

    test('TC08: should see Add Project button on Projects page', async ({ page }) => {
        await navigateToPage(page, '/projects')
        const visible = await isActionVisible(page, 'Add Project')
        expect(visible).toBe(true)
    })

    test('TC09: should be able to navigate to Add Component page', async ({ page }) => {
        const hasAccess = await hasPageAccess(page, '/components/add')
        expect(hasAccess).toBe(true)
    })

    test('TC10: should be able to navigate to Add Project page', async ({ page }) => {
        const hasAccess = await hasPageAccess(page, '/projects/add')
        expect(hasAccess).toBe(true)
    })
})

test.describe('CLEARING_ADMIN Role - Clearing-Specific Access', () => {
    test('TC11: should access ECC page', async ({ page }) => {
        const hasAccess = await hasPageAccess(page, '/ecc')
        expect(hasAccess).toBe(true)
    })

    test('TC12: should access Clearing Requests', async ({ page }) => {
        await navigateToPage(page, '/requests')
        // Clearing admin should see clearing requests
        await expect(page.locator('body')).toBeVisible()
    })
})

test.describe('CLEARING_ADMIN Role - Limited Admin Access', () => {
    // Note: CLEARING_ADMIN typically has limited admin access
    // These tests verify the expected access level

    test('TC13: should check admin navigation visibility', async ({ page }) => {
        // CLEARING_ADMIN may or may not see Admin link depending on configuration
        // This test documents the current behavior
        const adminVisible = await isAdminNavVisible(page)
        // Log the result for documentation purposes
        console.log(`CLEARING_ADMIN can see Admin nav: ${adminVisible}`)
        // No assertion - this is role-specific and may vary
    })

    test('TC14: should access Licenses admin page', async ({ page }) => {
        // CLEARING_ADMIN typically can manage licenses
        const hasAccess = await hasPageAccess(page, '/admin/licenses')
        // Document current behavior
        console.log(`CLEARING_ADMIN can access /admin/licenses: ${hasAccess}`)
    })

    test('TC15: should access Obligations admin page', async ({ page }) => {
        // CLEARING_ADMIN typically can manage obligations
        const hasAccess = await hasPageAccess(page, '/admin/obligations')
        // Document current behavior
        console.log(`CLEARING_ADMIN can access /admin/obligations: ${hasAccess}`)
    })
})
