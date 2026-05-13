// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

/**
 * TODO: Revisit these tests after PR #1665 is reviewed and merged:
 * https://github.com/eclipse-sw360/sw360-frontend/pull/1665
 * [feat(auth): add RBAC restrictions for VIEWER role across UI]
 *
 * Currently SW360 does not have a true VIEWER role with read-only restrictions.
 * The tests for write action restrictions (TC12-TC17) are skipped until
 * the RBAC implementation is complete.
 */

import { test, expect } from '@playwright/test'
import { fixtures } from './fixtures'
import { selectors } from './selectors'
import { navigateToPage, hasPageAccess, isActionVisible, isActionHidden, isAdminNavVisible } from './utils'

/**
 * Access Control Tests - VIEWER Role
 *
 * These tests verify that a VIEWER (read-only user):
 * - Can access public pages (components, projects, licenses, etc.)
 * - Cannot access admin-only pages
 * - Cannot see write actions (add, edit, delete buttons)
 * - Cannot access create/edit pages
 *
 * PREREQUISITE: Create 'viewer@sw360.org' with VIEWER role in backend,
 * then remove test.skip() below.
 */

test.describe('VIEWER Role - Admin Access Denied', () => {
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
})

test.describe('VIEWER Role - Public Page Access (Read-Only)', () => {
    test('TC04: should access Home page', async ({ page }) => {
        const hasAccess = await hasPageAccess(page, '/home')
        expect(hasAccess).toBe(true)
    })

    test('TC05: should access Components page', async ({ page }) => {
        const hasAccess = await hasPageAccess(page, '/components')
        expect(hasAccess).toBe(true)
    })

    test('TC06: should access Projects page', async ({ page }) => {
        const hasAccess = await hasPageAccess(page, '/projects')
        expect(hasAccess).toBe(true)
    })

    test('TC07: should access Licenses page', async ({ page }) => {
        const hasAccess = await hasPageAccess(page, '/licenses')
        expect(hasAccess).toBe(true)
    })

    test('TC08: should access Packages page', async ({ page }) => {
        const hasAccess = await hasPageAccess(page, '/packages')
        expect(hasAccess).toBe(true)
    })

    // Note: Vulnerabilities page requires SECURITY role access
    test.skip('TC09: should access Vulnerabilities page', async ({ page }) => {
        const hasAccess = await hasPageAccess(page, '/vulnerabilities')
        expect(hasAccess).toBe(true)
    })

    test('TC10: should access Search page', async ({ page }) => {
        const hasAccess = await hasPageAccess(page, '/search')
        expect(hasAccess).toBe(true)
    })

    test('TC11: should access Preferences page', async ({ page }) => {
        const hasAccess = await hasPageAccess(page, '/preferences')
        expect(hasAccess).toBe(true)
    })
})

/**
 * Note: The following tests are skipped because SW360 does not have a true VIEWER role.
 * The 'viewer' test user was created with userGroup 'USER', which has write access.
 * These tests document expected behavior if SW360 implements a read-only VIEWER role.
 *
 * TODO: Enable after PR #1665 is merged:
 * https://github.com/eclipse-sw360/sw360-frontend/pull/1665
 */
test.describe.skip('VIEWER Role - Write Actions Hidden (Skipped: pending PR #1665)', () => {
    test('TC12: should NOT see Add Component button on Components page', async ({ page }) => {
        await navigateToPage(page, '/components')
        const hidden = await isActionHidden(page, 'Add Component')
        expect(hidden).toBe(true)
    })

    test('TC13: should NOT see Add Project button on Projects page', async ({ page }) => {
        await navigateToPage(page, '/projects')
        const hidden = await isActionHidden(page, 'Add Project')
        expect(hidden).toBe(true)
    })

    test('TC14: should NOT see Add Package button on Packages page', async ({ page }) => {
        await navigateToPage(page, '/packages')
        const hidden = await isActionHidden(page, 'Add Package')
        expect(hidden).toBe(true)
    })
})

test.describe.skip('VIEWER Role - Create Pages Denied (Skipped: pending PR #1665)', () => {
    test('TC15: should be denied access to Add Component page', async ({ page }) => {
        const hasAccess = await hasPageAccess(page, '/components/add')
        expect(hasAccess).toBe(false)
    })

    test('TC16: should be denied access to Add Project page', async ({ page }) => {
        const hasAccess = await hasPageAccess(page, '/projects/add')
        expect(hasAccess).toBe(false)
    })

    test('TC17: should be denied access to Add Package page', async ({ page }) => {
        const hasAccess = await hasPageAccess(page, '/packages/add')
        expect(hasAccess).toBe(false)
    })
})
