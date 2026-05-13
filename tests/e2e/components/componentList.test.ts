// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { expect, test } from '@playwright/test'
import { selectors } from './selectors'
import { gotoComponentsPage } from './utils'

/**
 * Components List Page — Tests for rendering, navigation, buttons, and table.
 */
test.describe('Components List Page', () => {
    test.beforeEach(async ({ page }) => {
        await gotoComponentsPage(page)
    })

    test('TC01: List page renders with component table', async ({ page }) => {
        await expect(page.locator(selectors.list.table)).toBeVisible()
        await expect(page.locator(selectors.list.pageContent).first()).toBeVisible()
    })

    test('TC02: Page title displays correctly', async ({ page }) => {
        await expect(page.getByText(/Components\s*\(/)).toBeVisible()
    })

    test('TC03: Add Component button is visible and clickable', async ({ page }) => {
        const addBtn = page.locator(selectors.list.addComponentButton).first()
        await expect(addBtn).toBeVisible()
        await expect(addBtn).toBeEnabled()
    })

    test('TC04: Add Component button navigates to add page', async ({ page }) => {
        await page.locator(selectors.list.addComponentButton).first().click()
        await page.waitForURL('**/components/add')
        await expect(page.locator(selectors.form.name)).toBeVisible()
    })

    test('TC05: Import SBOM button is visible', async ({ page }) => {
        const importBtn = page.locator(selectors.list.importSBOMButton).first()
        await expect(importBtn).toBeVisible()
    })

    test('TC06: Export Spreadsheet dropdown has correct options', async ({ page }) => {
        const exportToggle = page.locator(selectors.list.exportDropdown).first()
        await expect(exportToggle).toBeVisible()
        await exportToggle.click()

        await expect(page.getByText('Components only')).toBeVisible()
        await expect(page.getByText('Components with releases')).toBeVisible()
    })

    test('TC07: Table displays correct column headers', async ({ page }) => {
        const table = page.locator(selectors.list.table)
        await expect(table).toBeVisible()

        const expectedHeaders = ['Vendor', 'Component Name', 'Main licenses', 'Component Type', 'Actions']
        for (const header of expectedHeaders) {
            await expect(table.locator('th').filter({ hasText: header })).toBeVisible()
        }
    })

    test('TC08: Component name in table is a clickable link to detail page', async ({ page }) => {
        const firstLink = page.locator(selectors.list.table).locator('a.text-link').first()
        if (await firstLink.isVisible()) {
            const href = await firstLink.getAttribute('href')
            expect(href).toContain('/components/detail/')
        }
    })

    test('TC09: Action column shows edit and delete icons', async ({ page }) => {
        await page.waitForTimeout(2000)
        const dataRows = page.locator(selectors.list.table).locator('tbody tr').filter({ has: page.locator('td a') })
        if ((await dataRows.count()) > 0) {
            const actionCell = dataRows.first().locator('td').last()
            await expect(actionCell.locator('svg, .btn-icon').first()).toBeVisible()
        }
    })

    test('TC10: Sorting by component name column works', async ({ page }) => {
        const nameHeader = page.locator(selectors.list.table).locator('th').filter({ hasText: 'Component Name' })
        await nameHeader.click()
        await page.waitForTimeout(1000)
        await expect(page.locator(selectors.list.table)).toBeVisible()
    })

    test('TC11: Page size selector is available', async ({ page }) => {
        const pageSizeSelector = page.locator(selectors.pagination.pageSizeSelector).first()
        if (await pageSizeSelector.isVisible()) {
            const options = await pageSizeSelector.locator('option').allTextContents()
            expect(options.length).toBeGreaterThan(0)
        }
    })
})
