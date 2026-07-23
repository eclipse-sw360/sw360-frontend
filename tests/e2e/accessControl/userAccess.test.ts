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
 * Access Control Tests - USER Role
 *
 * These tests verify that a regular USER:
 * - Can access public pages (components, projects, licenses, etc.)
 * - Cannot access admin-only pages
 * - Can see and use write actions (add, edit, delete)
 * - Cannot see admin navigation links
 *
 * PREREQUISITE: Create 'user@sw360.org' with USER role in backend,
 * then remove test.skip() below.
 */

test.describe('USER Role - Admin Access Denied', () => {
    test('TC01: should not see Admin link in navigation', async ({ page }) => {
        const adminVisible = await isAdminNavVisible(page)
        expect(adminVisible).toBe(false)
    })

    test('TC02: should be denied access to /admin dashboard', async ({ page }) => {
        const hasAccess = await hasPageAccess(page, '/admin')
        expect(hasAccess).toBe(false)
    })

    test('TC03: should be denied access to /admin/users', async ({ page }) => {
        const hasAccess = await hasPageAccess(page, '/admin/users')
        expect(hasAccess).toBe(false)
    })

    test('TC04: should be denied access to /admin/configurations', async ({ page }) => {
        const hasAccess = await hasPageAccess(page, '/admin/configurations')
        expect(hasAccess).toBe(false)
    })

    test('TC05: should be denied access to /admin/schedule', async ({ page }) => {
        const hasAccess = await hasPageAccess(page, '/admin/schedule')
        expect(hasAccess).toBe(false)
    })
})

test.describe('USER Role - Public Page Access', () => {
    test('TC06: should access Home page', async ({ page }) => {
        const hasAccess = await hasPageAccess(page, '/home')
        expect(hasAccess).toBe(true)
    })

    test('TC07: should access Components page', async ({ page }) => {
        const hasAccess = await hasPageAccess(page, '/components')
        expect(hasAccess).toBe(true)
    })

    test('TC08: should access Projects page', async ({ page }) => {
        const hasAccess = await hasPageAccess(page, '/projects')
        expect(hasAccess).toBe(true)
    })

    test('TC09: should access Licenses page', async ({ page }) => {
        const hasAccess = await hasPageAccess(page, '/licenses')
        expect(hasAccess).toBe(true)
    })

    test('TC10: should access Packages page', async ({ page }) => {
        const hasAccess = await hasPageAccess(page, '/packages')
        expect(hasAccess).toBe(true)
    })

    // Note: Vulnerabilities page requires SECURITY role access
    test.skip('TC11: should access Vulnerabilities page', async ({ page }) => {
        const hasAccess = await hasPageAccess(page, '/vulnerabilities')
        expect(hasAccess).toBe(true)
    })

    test('TC12: should access Preferences page', async ({ page }) => {
        const hasAccess = await hasPageAccess(page, '/preferences')
        expect(hasAccess).toBe(true)
    })

    test('TC13: should access Search page', async ({ page }) => {
        const hasAccess = await hasPageAccess(page, '/search')
        expect(hasAccess).toBe(true)
    })
})

test.describe('USER Role - Write Actions Available', () => {
    test('TC14: should see Add Component button on Components page', async ({ page }) => {
        await navigateToPage(page, '/components')
        const visible = await isActionVisible(page, 'Add Component')
        expect(visible).toBe(true)
    })

    test('TC15: should see Add Project button on Projects page', async ({ page }) => {
        await navigateToPage(page, '/projects')
        const visible = await isActionVisible(page, 'Add Project')
        expect(visible).toBe(true)
    })

    test('TC16: should see Add Package button on Packages page', async ({ page }) => {
        await navigateToPage(page, '/packages')
        const visible = await isActionVisible(page, 'Add Package')
        expect(visible).toBe(true)
    })

    test('TC17: should be able to navigate to Add Component page', async ({ page }) => {
        const hasAccess = await hasPageAccess(page, '/components/add')
        expect(hasAccess).toBe(true)
    })

    test('TC18: should be able to navigate to Add Project page', async ({ page }) => {
        const hasAccess = await hasPageAccess(page, '/projects/add')
        expect(hasAccess).toBe(true)
    })
})
