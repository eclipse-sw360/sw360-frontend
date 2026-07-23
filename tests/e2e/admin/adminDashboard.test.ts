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
        await Promise.all([
            page.waitForURL(/\/(en\/)?admin\/users/, { waitUntil: 'domcontentloaded' }),
            page.getByRole('link', { name: 'User' }).first().click(),
        ])
        await expect(page).toHaveURL(/\/(en\/)?admin\/users/)
    })

    test('TC05: should navigate to Vendors page when Vendors button is clicked', async ({ page }) => {
        await Promise.all([
            page.waitForURL(/\/(en\/)?admin\/vendors/, { waitUntil: 'domcontentloaded' }),
            page.getByRole('link', { name: 'Vendors' }).click(),
        ])
        await expect(page).toHaveURL(/\/(en\/)?admin\/vendors/)
    })

    test('TC06: should navigate to Schedule page when Schedule button is clicked', async ({ page }) => {
        await Promise.all([
            page.waitForURL(/\/(en\/)?admin\/schedule/, { waitUntil: 'domcontentloaded' }),
            page.getByRole('link', { name: 'Schedule' }).click(),
        ])
        await expect(page).toHaveURL(/\/(en\/)?admin\/schedule/)
    })

    test('TC07: should navigate to Obligations page when Obligations button is clicked', async ({ page }) => {
        await Promise.all([
            page.waitForURL(/\/(en\/)?admin\/obligations/, { waitUntil: 'domcontentloaded' }),
            page.getByRole('link', { name: 'Obligations' }).click(),
        ])
        await expect(page).toHaveURL(/\/(en\/)?admin\/obligations/)
    })

    test('TC08: should navigate to License Types page', async ({ page }) => {
        await Promise.all([
            page.waitForURL(/\/(en\/)?admin\/licenseTypes/, { waitUntil: 'domcontentloaded' }),
            page.getByRole('link', { name: 'License Types' }).click(),
        ])
        await expect(page).toHaveURL(/\/(en\/)?admin\/licenseTypes/)
    })

    test('TC09: should navigate to Fossology page', async ({ page }) => {
        await Promise.all([
            page.waitForURL(/\/(en\/)?admin\/fossology/, { waitUntil: 'domcontentloaded' }),
            page.getByRole('link', { name: 'Fossology' }).click(),
        ])
        await expect(page).toHaveURL(/\/(en\/)?admin\/fossology/)
    })

    test('TC10: should navigate to Import Export page', async ({ page }) => {
        await Promise.all([
            page.waitForURL(/\/(en\/)?admin\/importexport/, { waitUntil: 'domcontentloaded' }),
            page.getByRole('link', { name: 'Import & Export' }).click(),
        ])
        await expect(page).toHaveURL(/\/(en\/)?admin\/importexport/)
    })

    test('TC11: should navigate to Database Sanitation page', async ({ page }) => {
        await Promise.all([
            page.waitForURL(/\/(en\/)?admin\/databaseSanitation/, { waitUntil: 'domcontentloaded' }),
            page.getByRole('link', { name: 'Database Sanitation' }).click(),
        ])
        await expect(page).toHaveURL(/\/(en\/)?admin\/databaseSanitation/)
    })

    test('TC12: should navigate to OAuth Client page', async ({ page }) => {
        await Promise.all([
            page.waitForURL(/\/(en\/)?admin\/oauthclient/, { waitUntil: 'domcontentloaded' }),
            page.getByRole('link', { name: 'OAuth Client' }).click(),
        ])
        await expect(page).toHaveURL(/\/(en\/)?admin\/oauthclient/)
    })

    test('TC13: should navigate to Configurations page', async ({ page }) => {
        await Promise.all([
            page.waitForURL(/\/(en\/)?admin\/configurations/, { waitUntil: 'domcontentloaded' }),
            page.getByRole('link', { name: 'Configurations' }).click(),
        ])
        await expect(page).toHaveURL(/\/(en\/)?admin\/configurations/)
    })

    test('TC14: should navigate to Department page', async ({ page }) => {
        await Promise.all([
            page.waitForURL(/\/(en\/)?admin\/departments/, { waitUntil: 'domcontentloaded' }),
            page.getByRole('link', { name: 'Department' }).click(),
        ])
        await expect(page).toHaveURL(/\/(en\/)?admin\/departments/)
    })

    test('TC15: should navigate to Bulk Release Edit page', async ({ page }) => {
        await Promise.all([
            page.waitForURL(/\/(en\/)?admin\/bulkreleaseedit/, { waitUntil: 'domcontentloaded' }),
            page.getByRole('link', { name: 'Bulk Release Edit' }).click(),
        ])
        await expect(page).toHaveURL(/\/(en\/)?admin\/bulkreleaseedit/)
    })
})
