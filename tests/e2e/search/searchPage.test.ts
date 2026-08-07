// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { test, expect } from '@playwright/test'
import { selectors } from './selectors'
import { fixtures } from './fixtures'
import { navigateToSearch } from './utils'

test.describe('Search Page Layout', () => {
    test.beforeEach(async ({ page }) => {
        await navigateToSearch(page)
    })

    test('TC01: should display the search page with keyword search sidebar', async ({ page }) => {
        await expect(page.locator(selectors.sidebar.card)).toBeVisible()
    })

    test('TC02: should display Keyword Search card header', async ({ page }) => {
        await expect(page.locator(selectors.sidebar.cardHeader)).toContainText('Keyword Search')
    })

    test('TC03: should display keyword search text input', async ({ page }) => {
        const input = page.locator(selectors.sidebar.searchInput)
        await expect(input).toBeVisible()
        await expect(input).toHaveAttribute('placeholder', 'Keyword Search')
    })

    test('TC04: should display RESTRICT TO TYPE section header', async ({ page }) => {
        await expect(page.locator(selectors.sidebar.restrictToTypeHeader)).toContainText('RESTRICT TO TYPE')
    })

    test('TC05: should display all type filter checkboxes', async ({ page }) => {
        await expect(page.locator(selectors.checkboxes.projects)).toBeVisible()
        await expect(page.locator(selectors.checkboxes.components)).toBeVisible()
        await expect(page.locator(selectors.checkboxes.licenses)).toBeVisible()
        await expect(page.locator(selectors.checkboxes.releases)).toBeVisible()
        await expect(page.locator(selectors.checkboxes.packages)).toBeVisible()
        await expect(page.locator(selectors.checkboxes.obligations)).toBeVisible()
        await expect(page.locator(selectors.checkboxes.users)).toBeVisible()
        await expect(page.locator(selectors.checkboxes.vendors)).toBeVisible()
        await expect(page.locator(selectors.checkboxes.entireDocument)).toBeVisible()
    })

    test('TC06: should display type labels with correct text', async ({ page }) => {
        for (const label of fixtures.typeLabels) {
            await expect(page.locator(`#keyword-search label, #keyword-search .form-check-label`).filter({ hasText: label }).first()).toBeVisible()
        }
    })

    test('TC07: should display Search button', async ({ page }) => {
        const searchBtn = page.locator(selectors.buttons.search)
        await expect(searchBtn).toBeVisible()
        await expect(searchBtn).toContainText('Search')
    })

    test('TC08: should display Toggle button', async ({ page }) => {
        await expect(page.locator(selectors.buttons.toggle)).toBeVisible()
    })

    test('TC09: should display Deselect All button', async ({ page }) => {
        await expect(page.locator(selectors.buttons.deselectAll)).toBeVisible()
    })

    test('TC10: should display SEARCH RESULTS header', async ({ page }) => {
        await expect(page.locator(selectors.results.headerTitle)).toContainText('SEARCH RESULTS')
    })

    test('TC11: should display result count in header as zero initially', async ({ page }) => {
        await expect(page.locator(selectors.results.headerTitle)).toContainText('(0)')
    })

    test('TC12: should display results table', async ({ page }) => {
        await expect(page.locator(selectors.results.table)).toBeVisible()
    })

    test('TC13: should display page size selector', async ({ page }) => {
        await expect(page.locator(selectors.results.pageSizeSelector)).toBeVisible()
    })

    test('TC14: should display search restriction alert note', async ({ page }) => {
        await expect(page.locator(selectors.results.alertNote)).toBeVisible()
    })

    test('TC15: should have info icon tooltip in RESTRICT TO TYPE section', async ({ page }) => {
        const infoIcon = page.locator('#keyword-search .row.header-1 svg')
        await expect(infoIcon).toBeVisible()
    })
})
