// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { test, expect } from '@playwright/test'
import { selectors } from './selectors'
import { fixtures } from './fixtures'
import { navigateToEcc } from './utils'

test.describe('ECC Page Layout', () => {
    test.beforeEach(async ({ page }) => {
        await navigateToEcc(page)
    })

    test('TC01: should display the ECC page container', async ({ page }) => {
        await expect(page.locator(selectors.page.container)).toBeVisible()
    })

    test('TC02: should display the ECC Overview title', async ({ page }) => {
        await expect(page.locator(selectors.page.title)).toContainText(fixtures.pageTitle)
    })

    test('TC03: should display the quick filter input', async ({ page }) => {
        await expect(page.locator(selectors.quickFilter.input)).toBeVisible()
    })

    test('TC04: should display the ECC data table', async ({ page }) => {
        await expect(page.locator(selectors.table.container)).toBeVisible()
    })

    test('TC05: should display all expected table column headers', async ({ page }) => {
        for (const col of fixtures.columns) {
            await expect(page.getByRole('columnheader', { name: col, exact: true })).toBeVisible()
        }
    })

    test('TC06: should display page size selector', async ({ page }) => {
        await expect(page.locator(selectors.table.pageSizeSelector)).toBeVisible()
    })

    test('TC07: should have default page size of 10', async ({ page }) => {
        await expect(page.locator(selectors.table.pageSizeSelector)).toHaveValue(fixtures.defaultPageSize)
    })

    test('TC08: should display table footer', async ({ page }) => {
        // TableFooterUI always renders alongside SW360Table (both use .table-component class)
        // Use last() to target the footer specifically (it comes after the table wrapper)
        const tableComponents = page.locator('.table-component')
        await expect(tableComponents.last()).toBeVisible()
    })
})

test.describe('ECC Quick Filter', () => {
    test.beforeEach(async ({ page }) => {
        await navigateToEcc(page)
    })

    test('TC09: should allow typing in the quick filter input', async ({ page }) => {
        const input = page.locator(selectors.quickFilter.input)
        await input.fill('test')
        await expect(input).toHaveValue('test')
    })

    test('TC10: should clear the quick filter input', async ({ page }) => {
        const input = page.locator(selectors.quickFilter.input)
        await input.fill('test')
        await input.clear()
        await expect(input).toHaveValue('')
    })
})
