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
 * Access Control Tests - ADMIN Role (Baseline)
 *
 * These tests verify that an ADMIN (SW360_ADMIN):
 * - Can access all public pages
 * - Can access all admin-only pages
 * - Can see and use all write actions
 * - Can see admin navigation links
 *
 * This serves as a baseline to compare against other roles.
 */

test.describe('ADMIN Role - Full Admin Access', () => {
    test('TC01: should see Admin link in navigation', async ({ page }) => {
        const adminVisible = await isAdminNavVisible(page)
        expect(adminVisible).toBe(true)
    })

    test('TC02: should access /admin dashboard', async ({ page }) => {
        const hasAccess = await hasPageAccess(page, '/admin')
        expect(hasAccess).toBe(true)
    })

    test('TC03: should access /admin/users', async ({ page }) => {
        const hasAccess = await hasPageAccess(page, '/admin/users')
        expect(hasAccess).toBe(true)
    })

    test('TC04: should access /admin/configurations', async ({ page }) => {
        const hasAccess = await hasPageAccess(page, '/admin/configurations')
        expect(hasAccess).toBe(true)
    })

    test('TC05: should access /admin/departments', async ({ page }) => {
        const hasAccess = await hasPageAccess(page, '/admin/departments')
        expect(hasAccess).toBe(true)
    })

    test('TC06: should access /admin/vendors', async ({ page }) => {
        const hasAccess = await hasPageAccess(page, '/admin/vendors')
        expect(hasAccess).toBe(true)
    })

    test('TC07: should access /admin/schedule', async ({ page }) => {
        const hasAccess = await hasPageAccess(page, '/admin/schedule')
        expect(hasAccess).toBe(true)
    })

    test('TC08: should access /admin/fossology', async ({ page }) => {
        const hasAccess = await hasPageAccess(page, '/admin/fossology')
        expect(hasAccess).toBe(true)
    })

    test('TC09: should access /admin/oauthclient', async ({ page }) => {
        const hasAccess = await hasPageAccess(page, '/admin/oauthclient')
        expect(hasAccess).toBe(true)
    })
})

test.describe('ADMIN Role - Public Page Access', () => {
    test('TC10: should access Home page', async ({ page }) => {
        const hasAccess = await hasPageAccess(page, '/home')
        expect(hasAccess).toBe(true)
    })

    test('TC11: should access Components page', async ({ page }) => {
        const hasAccess = await hasPageAccess(page, '/components')
        expect(hasAccess).toBe(true)
    })

    test('TC12: should access Projects page', async ({ page }) => {
        const hasAccess = await hasPageAccess(page, '/projects')
        expect(hasAccess).toBe(true)
    })

    test('TC13: should access Licenses page', async ({ page }) => {
        const hasAccess = await hasPageAccess(page, '/licenses')
        expect(hasAccess).toBe(true)
    })

    test('TC14: should access Packages page', async ({ page }) => {
        const hasAccess = await hasPageAccess(page, '/packages')
        expect(hasAccess).toBe(true)
    })

    test('TC15: should access Vulnerabilities page', async ({ page }) => {
        const hasAccess = await hasPageAccess(page, '/vulnerabilities')
        expect(hasAccess).toBe(true)
    })
})

test.describe('ADMIN Role - Write Actions Available', () => {
    test('TC16: should see Add Component button', async ({ page }) => {
        await navigateToPage(page, '/components')
        const visible = await isActionVisible(page, 'Add Component')
        expect(visible).toBe(true)
    })

    test('TC17: should see Add Project button', async ({ page }) => {
        await navigateToPage(page, '/projects')
        const visible = await isActionVisible(page, 'Add Project')
        expect(visible).toBe(true)
    })

    test('TC18: should see Add User button on admin users page', async ({ page }) => {
        await navigateToPage(page, '/admin/users')
        const visible = await isActionVisible(page, 'Add User')
        expect(visible).toBe(true)
    })

    test('TC19: should see Add Vendor button on admin vendors page', async ({ page }) => {
        await navigateToPage(page, '/admin/vendors')
        const visible = await isActionVisible(page, 'Add Vendor')
        expect(visible).toBe(true)
    })
})
