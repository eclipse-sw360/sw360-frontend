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

test.describe('Search Results', () => {
    test.setTimeout(60000)

    test.beforeEach(async ({ page }) => {
        await navigateToSearch(page)
    })

    test('TC32: Search with a generic term returns results', async ({ page }) => {
        await performSearch(page, fixtures.keywords.generic)
        const count = await getResultCount(page)
        expect(count).toBeGreaterThan(0)
    })

    test('TC33: Search results header updates with count', async ({ page }) => {
        await performSearch(page, fixtures.keywords.generic)
        const headerText = await page.locator(selectors.results.headerTitle).textContent()
        expect(headerText).toMatch(/SEARCH RESULTS \(\d+\)/)
    })

    test('TC34: Search with no results shows zero count', async ({ page }) => {
        await performSearch(page, fixtures.keywords.noResults)
        await expect(page.locator(selectors.results.headerTitle)).toContainText('(0)')
    })

    test('TC35: Search via Enter key triggers search', async ({ page }) => {
        const input = page.locator(selectors.sidebar.searchInput)
        await input.fill(fixtures.keywords.generic)

        const responsePromise = page.waitForResponse(
            (resp) => resp.url().includes('/search') && resp.status() === 200,
            { timeout: 20000 },
        ).catch(() => null)

        await input.press('Enter')
        await responsePromise
        await page.waitForTimeout(500)

        const count = await getResultCount(page)
        expect(count).toBeGreaterThan(0)
    })

    test('TC36: Search results table displays Type column', async ({ page }) => {
        await performSearch(page, fixtures.keywords.generic)
        const headers = page.locator(`${selectors.results.table} th`)
        await expect(headers.filter({ hasText: 'Type' })).toBeVisible()
    })

    test('TC37: Search results table displays Text column', async ({ page }) => {
        await performSearch(page, fixtures.keywords.generic)
        const headers = page.locator(`${selectors.results.table} th`)
        await expect(headers.filter({ hasText: 'Text' })).toBeVisible()
    })

    test('TC38: Type column shows SVG icons', async ({ page }) => {
        await performSearch(page, fixtures.keywords.generic)
        const count = await getResultCount(page)
        if (count > 0) {
            const firstRowIcon = page.locator(`${selectors.results.table} tbody tr`).first().locator('svg')
            await expect(firstRowIcon).toBeVisible()
        }
    })

    test('TC39: Search with Projects filter only shows project results', async ({ page }) => {
        // Uncheck Entire Document and check only Projects
        await page.locator(selectors.checkboxes.entireDocument).uncheck()
        await page.locator(selectors.checkboxes.projects).check()

        await performSearch(page, fixtures.keywords.generic)
        const count = await getResultCount(page)
        if (count > 0) {
            const links = page.locator(`${selectors.results.table} tbody a.text-link`)
            const firstHref = await links.first().getAttribute('href')
            expect(firstHref).toContain('/projects/detail/')
        }
    })

    test('TC40: Search with Components filter shows component links', async ({ page }) => {
        await page.locator(selectors.checkboxes.entireDocument).uncheck()
        await page.locator(selectors.checkboxes.components).check()

        await performSearch(page, fixtures.keywords.generic)
        const count = await getResultCount(page)
        if (count > 0) {
            const links = page.locator(`${selectors.results.table} tbody a.text-link`)
            const firstHref = await links.first().getAttribute('href')
            expect(firstHref).toContain('/components/detail/')
        }
    })

    test('TC41: Search with Licenses filter shows license links', async ({ page }) => {
        await page.locator(selectors.checkboxes.entireDocument).uncheck()
        await page.locator(selectors.checkboxes.licenses).check()

        await performSearch(page, fixtures.keywords.license)
        const count = await getResultCount(page)
        if (count > 0) {
            const links = page.locator(`${selectors.results.table} tbody a.text-link`)
            const firstHref = await links.first().getAttribute('href')
            expect(firstHref).toContain('/licenses/detail/')
        }
    })

    test('TC42: Search with Users filter shows user names as text (no links)', async ({ page }) => {
        await page.locator(selectors.checkboxes.entireDocument).uncheck()
        await page.locator(selectors.checkboxes.users).check()

        await performSearch(page, 'sw360')
        const count = await getResultCount(page)
        if (count > 0) {
            // Users are rendered as <p> text, not links
            const rows = page.locator(`${selectors.results.table} tbody tr`)
            const firstRow = rows.first()
            await expect(firstRow.locator('td').nth(1).locator('p')).toBeVisible()
        }
    })

    test('TC43: Page size selector changes number of displayed rows', async ({ page }) => {
        await performSearch(page, fixtures.keywords.generic)
        const count = await getResultCount(page)
        if (count > 10) {
            await page.locator(selectors.results.pageSizeSelector).selectOption('25')
            // Wait for the new page of results from the server
            await page.waitForResponse(
                (resp) => resp.url().includes('/resource/api/search') && resp.request().method() === 'GET',
                { timeout: 15000 },
            ).catch(() => {})
            await page.waitForTimeout(500)
            const rows = page.locator(`${selectors.results.table} tbody tr`)
            const rowCount = await rows.count()
            expect(rowCount).toBeGreaterThan(10)
        }
    })

    test('TC44: Empty search text with Entire Document still searches', async ({ page }) => {
        await performSearch(page, '')
        // Should not crash — may return results or empty
        await expect(page.locator(selectors.results.headerTitle)).toContainText('SEARCH RESULTS')
    })

    test('TC45: Pagination footer is visible when results exist', async ({ page }) => {
        await performSearch(page, fixtures.keywords.generic)
        const count = await getResultCount(page)
        if (count > 0) {
            await expect(page.locator('.pagination, [class*="pagination"]')).toBeVisible()
        }
    })
})
