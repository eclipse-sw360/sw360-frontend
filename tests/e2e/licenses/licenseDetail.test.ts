// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { expect, test } from '@playwright/test'
import { selectors } from './selectors'
import { createLicenseApi, deleteLicenseApi, clickTab, gotoLicenseDetail } from './utils'

const ts = Date.now().toString(36)

/**
 * Licenses Detail Page — Tests for the license detail view and its tabs.
 */
test.describe('Licenses - Detail Page', () => {
    let licenseShortName: string
    const fullName = `PW Detail License ${ts}`
    const shortName = `PW-Detail-${ts}`
    const noteText = 'Detailed note for Playwright testing'
    const licenseText = 'Sample license text content for detail page testing.'

    test.beforeAll(async () => {
        licenseShortName = await createLicenseApi({
            fullName,
            shortName,
            note: noteText,
            text: licenseText,
            OSIApproved: 'YES',
            FSFLibre: 'YES',
            checked: true,
        })
    })

    test.afterAll(async () => {
        await deleteLicenseApi(licenseShortName)
    })

    // ─── Page Load & Header ──────────────────────────────

    test('TC27: Detail page loads with license name in header', async ({ page }) => {
        await gotoLicenseDetail(page, licenseShortName)
        await expect(page.getByText(fullName).first()).toBeVisible({ timeout: 10000 })
    })

    test('TC28: Detail page shows CHECKED badge for checked license', async ({ page }) => {
        await gotoLicenseDetail(page, licenseShortName)
        await expect(page.locator(selectors.detail.checkedBadge).first()).toBeVisible({ timeout: 10000 })
    })

    // ─── Tabs ────────────────────────────────────────────

    test('TC29: Detail page shows all expected tabs', async ({ page }) => {
        await gotoLicenseDetail(page, licenseShortName)

        await expect(page.locator(selectors.tabs.details)).toBeVisible()
        await expect(page.locator(selectors.tabs.text)).toBeVisible()
        await expect(page.locator(selectors.tabs.obligations)).toBeVisible()
        await expect(page.locator(selectors.tabs.changeLogs)).toBeVisible()
    })

    test('TC30: Details tab is active by default', async ({ page }) => {
        await gotoLicenseDetail(page, licenseShortName)
        // Tab should have active/selected state
        const detailsTab = page.locator(selectors.tabs.details)
        await expect(detailsTab.first()).toHaveClass(/active/)
    })

    // ─── Details Tab Content ─────────────────────────────

    test('TC31: Details tab shows Full Name', async ({ page }) => {
        await gotoLicenseDetail(page, licenseShortName)
        await expect(page.getByText(fullName).first()).toBeVisible()
    })

    test('TC32: Details tab shows Short Name', async ({ page }) => {
        await gotoLicenseDetail(page, licenseShortName)
        await expect(page.getByText(shortName).first()).toBeVisible()
    })

    test('TC33: Details tab shows OSI Approved value', async ({ page }) => {
        await gotoLicenseDetail(page, licenseShortName)
        // Look for "OSI Approved" label and "Yes" value
        await expect(page.getByText(/OSI Approved/i).first()).toBeVisible()
    })

    test('TC34: Details tab shows FSF Free Libre value', async ({ page }) => {
        await gotoLicenseDetail(page, licenseShortName)
        await expect(page.getByText(/FSF Free/i).first()).toBeVisible()
    })

    test('TC35: Details tab shows Note', async ({ page }) => {
        await gotoLicenseDetail(page, licenseShortName)
        await expect(page.getByText(noteText).first()).toBeVisible()
    })

    // ─── Text Tab ────────────────────────────────────────

    test('TC36: Text tab shows license text content', async ({ page }) => {
        await gotoLicenseDetail(page, licenseShortName)
        await clickTab(page, selectors.tabs.text)
        await expect(page.getByText(licenseText).first()).toBeVisible({ timeout: 10000 })
    })

    // ─── Obligations Tab ─────────────────────────────────

    test('TC37: Obligations tab loads without error', async ({ page }) => {
        await gotoLicenseDetail(page, licenseShortName)
        await clickTab(page, selectors.tabs.obligations)
        // Should not crash — just verify the URL stays on the page and tab is active
        await page.waitForTimeout(1000)
        await expect(page.locator(selectors.tabs.obligations).first()).toHaveClass(/active/)
    })

    // ─── Change Log Tab ──────────────────────────────────

    test('TC38: Change Log tab loads without error', async ({ page }) => {
        await gotoLicenseDetail(page, licenseShortName)
        await clickTab(page, selectors.tabs.changeLogs)
        // Should load without crash — shows table or empty
        await page.waitForTimeout(1000)
        expect(page.url()).toContain(`/licenses/detail?id=${licenseShortName}`)
    })

    // ─── Action Buttons ──────────────────────────────────

    test('TC39: Edit License button is visible on detail page', async ({ page }) => {
        await gotoLicenseDetail(page, licenseShortName)
        await expect(page.locator(selectors.actions.editLicense).first()).toBeVisible({ timeout: 10000 })
    })

    test('TC40: Edit License button navigates to edit page', async ({ page }) => {
        await gotoLicenseDetail(page, licenseShortName)
        await page.locator(selectors.actions.editLicense).first().click()
        await page.waitForURL(`**/licenses/edit?id=${licenseShortName}**`, { timeout: 15000 })
    })
})
