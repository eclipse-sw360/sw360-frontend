// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { expect, test } from '@playwright/test'
import { selectors } from './selectors'
import { createPackageApi, deletePackageApi, gotoPackagesPage } from './utils'

/**
 * Packages List Page — Tests for the package listing page.
 */
test.describe('Packages List Page', () => {
    test.beforeEach(async ({ page }) => {
        await gotoPackagesPage(page)
    })

    test('TC01: Page renders with packages table', async ({ page }) => {
        await expect(page.locator(selectors.list.table)).toBeVisible({ timeout: 15000 })
    })

    test('TC02: Page header displays PACKAGES title', async ({ page }) => {
        await expect(page.locator(selectors.list.headerTitle)).toContainText('PACKAGES')
    })

    test('TC03: Add Package button is visible and clickable', async ({ page }) => {
        const addBtn = page.locator(selectors.list.addButton)
        await expect(addBtn).toBeVisible()
        await expect(addBtn).toBeEnabled()
    })

    test('TC04: Add Package button navigates to add page', async ({ page }) => {
        await page.locator(selectors.list.addButton).click()
        await page.waitForURL('**/packages/add**', { timeout: 15000 })
    })

    test('TC05: Table has Package Name column', async ({ page }) => {
        await expect(page.locator('th:has-text("Package Name")')).toBeVisible()
    })

    test('TC06: Table has Release Name column', async ({ page }) => {
        await expect(page.locator('th:has-text("Release Name")')).toBeVisible()
    })

    test('TC07: Table has Release Clearing State column', async ({ page }) => {
        await expect(page.locator('th:has-text("Release Clearing State")')).toBeVisible()
    })

    test('TC08: Table has Licenses column', async ({ page }) => {
        await expect(page.locator('th:has-text("Licenses")')).toBeVisible()
    })

    test('TC09: Table has Package Manager column', async ({ page }) => {
        await expect(page.locator('th:has-text("Package Manager")')).toBeVisible()
    })

    test('TC10: Table has Actions column', async ({ page }) => {
        await expect(page.locator('th:has-text("Actions")')).toBeVisible()
    })

    test('TC11: Page size selector is available', async ({ page }) => {
        await expect(page.locator(selectors.list.pageSizeSelector)).toBeVisible()
    })

    test('TC12: Package name links navigate to detail page', async ({ page }) => {
        const firstLink = page.locator('td a.text-link').first()
        if (await firstLink.isVisible().catch(() => false)) {
            const href = await firstLink.getAttribute('href')
            expect(href).toContain('/packages/detail/')
        }
    })

    test('TC13: Action column shows edit and delete icons', async ({ page }) => {
        // Ensure at least one package exists via API fixture
        const ts = Date.now().toString(36)
        const pkgId = await createPackageApi({
            name: `PW TC13 Fixture ${ts}`,
            version: '1.0.0',
            packageType: 'LIBRARY',
            purl: `pkg:npm/pw-tc13-fixture-${ts}@1.0.0`,
        })
        try {
            await gotoPackagesPage(page)
            const firstRow = page.locator('tbody tr').first()
            await expect(firstRow).toBeVisible({ timeout: 10000 })
            const icons = firstRow.locator('svg.btn-icon')
            await expect(icons.first()).toBeVisible({ timeout: 5000 })
        } finally {
            await deletePackageApi(pkgId)
        }
    })
})
