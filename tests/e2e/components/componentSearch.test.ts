// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { expect, test } from '@playwright/test'
import { selectors } from './selectors'
import { gotoComponentsPage, waitForComponentPageLoad } from './utils'

/**
 * Components Advanced Search — Tests for search fields and filtering.
 */
test.describe('Components Advanced Search', () => {
    test.beforeEach(async ({ page }) => {
        await gotoComponentsPage(page)
    })

    test('TC12: Advanced search panel is visible with fields', async ({ page }) => {
        await expect(page.getByText('Advanced Search')).toBeVisible()
        await expect(page.getByText('Component Name').first()).toBeVisible()
        await expect(page.getByText('Component Type').first()).toBeVisible()
    })

    test('TC13: Search by component name filters results', async ({ page }) => {
        const nameInput = page.locator(selectors.search.nameField)
        await nameInput.fill('PW')
        await page.locator(selectors.search.searchButton).click()
        await page.waitForURL('**/components?**', { timeout: 15000 })
        await waitForComponentPageLoad(page)

        expect(page.url()).toContain('name=PW')
    })

    test('TC14: Search by component type dropdown filters results', async ({ page }) => {
        const typeSelect = page.locator(selectors.search.typeField)
        await typeSelect.waitFor({ state: 'attached' })
        await typeSelect.selectOption('OSS')
        await page.locator(selectors.search.searchButton).click()
        await page.waitForURL('**/components?**', { timeout: 10000 })

        expect(page.url()).toContain('type=OSS')
    })

    test('TC15: Search by categories filters results', async ({ page }) => {
        const catInput = page.locator(selectors.search.categoriesField)
        await catInput.fill('Library')
        await page.locator(selectors.search.searchButton).click()
        await page.waitForTimeout(2000)

        expect(page.url()).toContain('categories=Library')
    })

    test('TC16: Search by created by email filters results', async ({ page }) => {
        const createdByInput = page.locator(selectors.search.createdByField)
        await createdByInput.fill('admin@sw360.org')
        await page.locator(selectors.search.searchButton).click()
        await page.waitForTimeout(2000)

        expect(page.url()).toContain('createdBy=admin')
    })

    test('TC17: Combined search with name and type', async ({ page }) => {
        await page.locator(selectors.search.nameField).fill('Test')
        await page.locator(selectors.search.typeField).selectOption('OSS')

        await page.locator(selectors.search.searchButton).click()
        await page.waitForURL(/name=Test/, { timeout: 10000 }).catch(() => {})
        await page.waitForTimeout(1000)

        const url = page.url()
        expect(url).toContain('name=Test')
        expect(url).toContain('type=OSS')
    })

    test('TC18: Search with no results shows empty table', async ({ page }) => {
        await page.locator(selectors.search.nameField).fill('NONEXISTENT_COMPONENT_XYZ999')
        await page.locator(selectors.search.searchButton).click()
        await page.waitForTimeout(2000)

        await expect(page.locator(selectors.list.table)).toBeVisible()
    })
})
