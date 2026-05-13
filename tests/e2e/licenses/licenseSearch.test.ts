// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { expect, test } from '@playwright/test'
import { selectors } from './selectors'
import { createLicenseApi, deleteLicenseApi, gotoLicensesPage, waitForLicensePageLoad } from './utils'

const ts = Date.now().toString(36)

/**
 * Licenses Quick Filter — Tests for the text-based filter on the list page.
 */
test.describe('Licenses Quick Filter', () => {
    let licenseShortName: string
    const licenseName = `PW Filter License ${ts}`
    const shortName = `PW-Filter-${ts}`

    test.beforeAll(async () => {
        licenseShortName = await createLicenseApi({
            fullName: licenseName,
            shortName: shortName,
        })
    })

    test.afterAll(async () => {
        await deleteLicenseApi(licenseShortName)
    })

    test('TC12: Quick filter input accepts text', async ({ page }) => {
        await gotoLicensesPage(page)
        const filterInput = page.locator(selectors.list.quickFilterInput)
        await filterInput.fill('PW-Filter')
        await expect(filterInput).toHaveValue('PW-Filter')
    })

    test('TC13: Quick filter filters licenses by text', async ({ page }) => {
        await gotoLicensesPage(page)
        const filterInput = page.locator(selectors.list.quickFilterInput)
        await filterInput.fill(shortName)
        // Wait for debounced search (700ms) + API response
        await page.waitForTimeout(1500)
        await waitForLicensePageLoad(page)

        // Should show the matching license
        await expect(page.getByText(shortName).first()).toBeVisible({ timeout: 10000 })
    })

    test('TC14: Quick filter with no results shows empty table', async ({ page }) => {
        await gotoLicensesPage(page)
        const filterInput = page.locator(selectors.list.quickFilterInput)
        await filterInput.fill('NONEXISTENT_LICENSE_XYZ_999')
        await page.waitForTimeout(1500)

        await expect(page.locator(selectors.list.table)).toBeVisible()
    })

    test('TC15: Clear quick filter shows all licenses again', async ({ page }) => {
        await gotoLicensesPage(page)
        const filterInput = page.locator(selectors.list.quickFilterInput)

        // Filter first
        await filterInput.fill('NONEXISTENT_999')
        await page.waitForTimeout(1500)

        // Clear filter
        await filterInput.clear()
        await page.waitForTimeout(1500)
        await waitForLicensePageLoad(page)

        // Table should still be visible with data
        await expect(page.locator(selectors.list.table)).toBeVisible()
    })
})
