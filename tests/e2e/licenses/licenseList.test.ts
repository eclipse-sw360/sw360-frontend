// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { expect, test } from '@playwright/test'
import { selectors } from './selectors'
import { gotoLicensesPage, waitForLicensePageLoad } from './utils'

/**
 * Licenses List Page — Tests for the main license list view.
 */
test.describe('Licenses List Page', () => {
    test.beforeEach(async ({ page }) => {
        await gotoLicensesPage(page)
    })

    test('TC01: Page title contains Licenses', async ({ page }) => {
        await expect(page.locator(selectors.list.titleArea).first()).toContainText(/Licenses/i)
    })

    test('TC02: Licenses table is visible', async ({ page }) => {
        await expect(page.locator(selectors.list.table)).toBeVisible({ timeout: 15000 })
    })

    test('TC03: Add License button is visible', async ({ page }) => {
        await expect(page.locator(selectors.list.addLicenseButton).first()).toBeVisible({ timeout: 10000 })
    })

    test('TC04: Export Spreadsheet button is visible', async ({ page }) => {
        await expect(page.locator(selectors.list.exportButton).first()).toBeVisible({ timeout: 10000 })
    })

    test('TC05: Table has License Shortname column', async ({ page }) => {
        await expect(page.getByRole('columnheader', { name: /License Shortname/i }).first()).toBeVisible()
    })

    test('TC06: Table has License Fullname column', async ({ page }) => {
        await expect(page.getByRole('columnheader', { name: /License Fullname/i }).first()).toBeVisible()
    })

    test('TC07: Table has Is Checked column', async ({ page }) => {
        await expect(page.getByRole('columnheader', { name: /Is Checked/i }).first()).toBeVisible()
    })

    test('TC08: Table has License Type column', async ({ page }) => {
        await expect(page.getByRole('columnheader', { name: /License Type/i }).first()).toBeVisible()
    })

    test('TC09: License shortname links navigate to detail page', async ({ page }) => {
        const firstLink = page.locator(selectors.list.licenseLinks).first()
        const hasLink = await firstLink.isVisible().catch(() => false)
        if (hasLink) {
            const href = await firstLink.getAttribute('href')
            expect(href).toContain('/licenses/detail?id=')
        } else {
            // If list has no links, validate the empty-state is rendered instead of silently skipping.
            await expect(page.getByText('No data available in table')).toBeVisible({ timeout: 10000 })
        }
    })

    test('TC10: Quick filter input is visible', async ({ page }) => {
        await expect(page.locator(selectors.list.quickFilterInput)).toBeVisible({ timeout: 10000 })
    })

    test('TC11: Add License button navigates to add page', async ({ page }) => {
        await page.locator(selectors.list.addLicenseButton).first().click()
        await page.waitForURL('**/licenses/add**', { timeout: 15000 })
        await waitForLicensePageLoad(page)
        await expect(page.locator(selectors.form.fullName)).toBeVisible()
    })
})
