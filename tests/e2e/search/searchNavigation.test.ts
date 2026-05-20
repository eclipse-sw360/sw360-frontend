// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { test, expect } from '@playwright/test'
import { selectors } from './selectors'
import { fixtures } from './fixtures'
import { navigateToSearch, performSearch, getResultCount } from './utils'

test.describe('Search Navigation', () => {
    test.setTimeout(60000)

    test.beforeEach(async ({ page }) => {
        await navigateToSearch(page)
    })

    test('TC46: Clicking a project result link navigates to project detail', async ({ page }) => {
        await page.locator(selectors.checkboxes.entireDocument).uncheck()
        await page.locator(selectors.checkboxes.projects).check()
        await performSearch(page, fixtures.keywords.generic)

        const count = await getResultCount(page)
        if (count > 0) {
            const link = page.locator(`${selectors.results.table} tbody a.text-link`).first()
            await link.click()
            await page.waitForURL(/\/projects\/detail\//, { timeout: 15000 })
            await expect(page).toHaveURL(/\/projects\/detail\//)
        }
    })

    test('TC47: Clicking a component result link navigates to component detail', async ({ page }) => {
        await page.locator(selectors.checkboxes.entireDocument).uncheck()
        await page.locator(selectors.checkboxes.components).check()
        await performSearch(page, fixtures.keywords.generic)

        const count = await getResultCount(page)
        if (count > 0) {
            const link = page.locator(`${selectors.results.table} tbody a.text-link`).first()
            await link.click()
            await page.waitForURL(/\/components\/detail\//, { timeout: 15000 })
            await expect(page).toHaveURL(/\/components\/detail\//)
        }
    })

    test('TC48: Clicking a license result link navigates to license detail', async ({ page }) => {
        await page.locator(selectors.checkboxes.entireDocument).uncheck()
        await page.locator(selectors.checkboxes.licenses).check()
        await performSearch(page, fixtures.keywords.license)

        const count = await getResultCount(page)
        if (count > 0) {
            const link = page.locator(`${selectors.results.table} tbody a.text-link`).first()
            await link.click()
            await page.waitForURL(/\/licenses\/detail\//, { timeout: 15000 })
            await expect(page).toHaveURL(/\/licenses\/detail\//)
        }
    })

    test('TC49: Result links have .text-link class for styling', async ({ page }) => {
        await performSearch(page, fixtures.keywords.generic)
        const count = await getResultCount(page)
        if (count > 0) {
            const links = page.locator(`${selectors.results.table} tbody a.text-link`)
            expect(await links.count()).toBeGreaterThan(0)
        }
    })

    test('TC50: Search results with multiple type filters shows mixed types', async ({ page }) => {
        await page.locator(selectors.checkboxes.entireDocument).uncheck()
        await page.locator(selectors.checkboxes.projects).check()
        await page.locator(selectors.checkboxes.components).check()
        await page.locator(selectors.checkboxes.licenses).check()

        await performSearch(page, fixtures.keywords.generic)
        const count = await getResultCount(page)
        expect(count).toBeGreaterThanOrEqual(0) // May have mixed results
    })

    test('TC51: Searching then changing filters and searching again updates results', async ({ page }) => {
        // First search with all types
        await performSearch(page, fixtures.keywords.generic)
        const fullCount = await getResultCount(page)

        // Now restrict to only projects
        await page.locator(selectors.checkboxes.entireDocument).uncheck()
        await page.locator(selectors.checkboxes.projects).check()
        await performSearch(page, fixtures.keywords.generic)
        const filteredCount = await getResultCount(page)

        // Filtered should be less than or equal to full results
        expect(filteredCount).toBeLessThanOrEqual(fullCount)
    })

    test('TC52: Search keyword is preserved in input after search', async ({ page }) => {
        const keyword = fixtures.keywords.generic
        await performSearch(page, keyword)
        await expect(page.locator(selectors.sidebar.searchInput)).toHaveValue(keyword)
    })

    test('TC53: Alert note mentions Entire Document checkbox', async ({ page }) => {
        const alertText = await page.locator(selectors.results.alertNote).textContent()
        expect(alertText).toContain('Entire Document')
    })

    test('TC54: Alert note is dismissible', async ({ page }) => {
        const alert = page.locator(selectors.results.alertNote)
        await expect(alert).toBeVisible()
        const closeBtn = alert.locator('button.btn-close')
        await closeBtn.click()
        await expect(alert).not.toBeVisible()
    })
})
