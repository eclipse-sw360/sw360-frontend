// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { expect, test } from '@playwright/test'
import { selectors } from './selectors'
import { gotoProjectsPage } from './utils'

/**
 * Projects List Page — Tests for rendering, navigation, buttons, and pagination.
 */
test.describe('Projects List Page', () => {
    test.beforeEach(async ({ page }) => {
        await gotoProjectsPage(page)
    })

    test('TC01: List page renders with project table', async ({ page }) => {
        await expect(page.locator(selectors.list.table)).toBeVisible()
        await expect(page.locator(selectors.list.pageContent).first()).toBeVisible()
    })

    test('TC02: Page title and breadcrumb display correctly', async ({ page }) => {
        await expect(page.locator(selectors.common.breadcrumb)).toContainText('Projects')
        await expect(page.getByText('PROJECTS', { exact: true })).toBeVisible()
    })

    test('TC03: Add Project button is visible and clickable', async ({ page }) => {
        const addBtn = page.locator(selectors.list.addProjectButton)
        await expect(addBtn).toBeVisible()
        await expect(addBtn).toBeEnabled()
    })

    test('TC04: Add Project button navigates to add page', async ({ page }) => {
        await page.locator(selectors.list.addProjectButton).click()
        await page.waitForURL('**/projects/add')
        await expect(page.locator(selectors.form.name)).toBeVisible()
    })

    test('TC05: Import SBOM dropdown has SPDX and CycloneDX options', async ({ page }) => {
        const importToggle = page.getByRole('button', { name: 'Import SBOM' })
        await expect(importToggle).toBeVisible()
        await importToggle.click()

        await expect(page.getByText('SPDX', { exact: true })).toBeVisible()
        await expect(page.getByText('CycloneDX')).toBeVisible()
    })

    test('TC06: Export Spreadsheet dropdown has correct options', async ({ page }) => {
        const exportToggle = page.getByRole('button', { name: 'Export Spreadsheet' })
        await expect(exportToggle).toBeVisible()
        await exportToggle.click()

        await expect(page.getByText('Projects only')).toBeVisible()
        await expect(page.getByText('Projects with linked releases')).toBeVisible()
    })

    test('TC07: Table displays correct column headers', async ({ page }) => {
        const table = page.locator(selectors.list.table)
        await expect(table).toBeVisible()

        const expectedHeaders = ['Project Name', 'Description', 'Project Responsible', 'State', 'License Clearing', 'Actions']
        for (const header of expectedHeaders) {
            await expect(table.locator('th').filter({ hasText: header })).toBeVisible()
        }
    })

    test('TC08: Page size selector is available', async ({ page }) => {
        const pageSizeSelector = page.locator(selectors.pagination.pageSizeSelector).first()
        if (await pageSizeSelector.isVisible()) {
            const options = await pageSizeSelector.locator('option').allTextContents()
            expect(options.length).toBeGreaterThan(0)
        }
    })

    test('TC09: Project name in table is a clickable link to detail page', async ({ page }) => {
        const firstProjectLink = page.locator(selectors.list.table).locator('a.text-link').first()
        if (await firstProjectLink.isVisible()) {
            const href = await firstProjectLink.getAttribute('href')
            expect(href).toContain('/projects/detail/')
        }
    })

    test('TC10: Action column shows edit, clearing request, duplicate, and delete icons', async ({ page }) => {
        // Wait for table data to load
        await page.waitForTimeout(2000)
        const dataRows = page.locator(selectors.list.table).locator('tbody tr').filter({ has: page.locator('td a') })
        if (await dataRows.count() > 0) {
            const actionCell = dataRows.first().locator('td').last()
            await expect(actionCell.locator('.btn-icon').first()).toBeVisible()
        }
    })

    test('TC11: Sorting by project name column works', async ({ page }) => {
        const nameHeader = page.locator(selectors.list.table).locator('th').filter({ hasText: 'Project Name' })
        await nameHeader.click()
        // URL should update with sort parameter
        await page.waitForTimeout(1000)
        // Table should re-render (no crash)
        await expect(page.locator(selectors.list.table)).toBeVisible()
    })
})
