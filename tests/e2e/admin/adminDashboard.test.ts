// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { test, expect } from '@playwright/test'
import { selectors } from './selectors'
import { fixtures } from './fixtures'
import { navigateToAdmin } from './utils'

test.describe('Admin Dashboard Layout', () => {
    test.beforeEach(async ({ page }) => {
        await navigateToAdmin(page)
    })

    test('TC01: should display the admin dashboard page', async ({ page }) => {
        await expect(page.locator(selectors.page.adminWrapper)).toBeVisible()
    })

    test('TC02: should display all admin navigation buttons', async ({ page }) => {
        await page.waitForSelector(selectors.page.adminButtons, { timeout: 15000 })
        for (const label of fixtures.adminButtons) {
            await expect(
                page.locator(selectors.page.adminButtons).filter({ hasText: label }).first(),
            ).toBeVisible()
        }
    })

    test('TC03: should have 14 admin buttons total', async ({ page }) => {
        const buttons = page.locator(selectors.page.adminButtons)
        await expect(buttons).toHaveCount(14)
    })

    test('TC04: should navigate to Users page when User button is clicked', async ({ page }) => {
        await page.locator(selectors.page.adminButtons).filter({ hasText: 'User' }).first().click()
        await page.waitForURL(/\/admin\/users/)
        await expect(page).toHaveURL(/\/admin\/users/)
    })

    test('TC05: should navigate to Vendors page when Vendors button is clicked', async ({ page }) => {
        await page.locator(selectors.page.adminButtons).filter({ hasText: 'Vendors' }).click()
        await page.waitForURL(/\/admin\/vendors/)
        await expect(page).toHaveURL(/\/admin\/vendors/)
    })

    test('TC06: should navigate to Schedule page when Schedule button is clicked', async ({ page }) => {
        await page.locator(selectors.page.adminButtons).filter({ hasText: 'Schedule' }).click()
        await page.waitForURL(/\/admin\/schedule/)
        await expect(page).toHaveURL(/\/admin\/schedule/)
    })

    test('TC07: should navigate to Obligations page when Obligations button is clicked', async ({ page }) => {
        await page.locator(selectors.page.adminButtons).filter({ hasText: 'Obligations' }).click()
        await page.waitForURL(/\/admin\/obligations/)
        await expect(page).toHaveURL(/\/admin\/obligations/)
    })

    test('TC08: should navigate to License Types page', async ({ page }) => {
        await page.locator(selectors.page.adminButtons).filter({ hasText: 'License Types' }).click()
        await page.waitForURL(/\/admin\/licenseTypes/)
        await expect(page).toHaveURL(/\/admin\/licenseTypes/)
    })

    test('TC09: should navigate to Fossology page', async ({ page }) => {
        await page.locator(selectors.page.adminButtons).filter({ hasText: 'Fossology' }).click()
        await page.waitForURL(/\/admin\/fossology/)
        await expect(page).toHaveURL(/\/admin\/fossology/)
    })

    test('TC10: should navigate to Import Export page', async ({ page }) => {
        await page.locator(selectors.page.adminButtons).filter({ hasText: 'Import & Export' }).click()
        await page.waitForURL(/\/admin\/importexport/)
        await expect(page).toHaveURL(/\/admin\/importexport/)
    })

    test('TC11: should navigate to Database Sanitation page', async ({ page }) => {
        await page.locator(selectors.page.adminButtons).filter({ hasText: 'Database Sanitation' }).click()
        await page.waitForURL(/\/admin\/databaseSanitation/)
        await expect(page).toHaveURL(/\/admin\/databaseSanitation/)
    })

    test('TC12: should navigate to OAuth Client page', async ({ page }) => {
        await page.locator(selectors.page.adminButtons).filter({ hasText: 'OAuth Client' }).click()
        await page.waitForURL(/\/admin\/oauthclient/)
        await expect(page).toHaveURL(/\/admin\/oauthclient/)
    })

    test('TC13: should navigate to Configurations page', async ({ page }) => {
        await page.locator(selectors.page.adminButtons).filter({ hasText: 'Configurations' }).click()
        await page.waitForURL(/\/admin\/configurations/)
        await expect(page).toHaveURL(/\/admin\/configurations/)
    })

    test('TC14: should navigate to Department page', async ({ page }) => {
        await page.locator(selectors.page.adminButtons).filter({ hasText: 'Department' }).click()
        await page.waitForURL(/\/admin\/departments/)
        await expect(page).toHaveURL(/\/admin\/departments/)
    })

    test('TC15: should navigate to Bulk Release Edit page', async ({ page }) => {
        await page.locator(selectors.page.adminButtons).filter({ hasText: 'Bulk Release Edit' }).click()
        await page.waitForURL(/\/admin\/bulkreleaseedit/)
        await expect(page).toHaveURL(/\/admin\/bulkreleaseedit/)
    })
})
