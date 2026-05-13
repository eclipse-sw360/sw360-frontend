// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { test, expect } from '@playwright/test'
import { selectors } from './selectors'
import { fixtures } from './fixtures'
import { navigateToRequests } from './utils'

test.describe('Requests Page Layout', () => {
    test.beforeEach(async ({ page }) => {
        await navigateToRequests(page)
    })

    test('TC01: should display the requests page container', async ({ page }) => {
        await expect(page.locator(selectors.page.container)).toBeVisible()
    })

    test('TC02: should display the tab navigation list', async ({ page }) => {
        await expect(page.locator(selectors.tabs.listGroup)).toBeVisible()
    })

    test('TC03: should display all four tab items', async ({ page }) => {
        for (const label of fixtures.tabLabels) {
            await expect(page.locator(selectors.tabs.listGroup).locator(`text=${label}`)).toBeVisible()
        }
    })

    test('TC04: should have Open Moderation Requests tab active by default', async ({ page }) => {
        await expect(page.locator(selectors.tabs.openModeration)).toHaveAttribute('aria-selected', 'true')
    })

    test('TC05: should display active tab content', async ({ page }) => {
        await expect(page.locator(selectors.tabContent.active)).toBeVisible()
    })
})

test.describe('Open Moderation Requests Tab', () => {
    test.beforeEach(async ({ page }) => {
        await navigateToRequests(page)
    })

    test('TC06: should display data table in Open Moderation tab', async ({ page }) => {
        await expect(page.locator(selectors.tabContent.active).locator(selectors.table.container)).toBeVisible()
    })

    test('TC07: should display correct column headers for Open Moderation', async ({ page }) => {
        const activeTab = page.locator(selectors.tabContent.active)
        for (const col of fixtures.moderationColumns) {
            await expect(activeTab.locator(selectors.table.headerCells).filter({ hasText: col })).toBeVisible()
        }
    })

    test('TC08: should display Bulk Actions button in Open Moderation tab', async ({ page }) => {
        const activeTab = page.locator(selectors.tabContent.active)
        await expect(activeTab.locator(selectors.moderation.bulkActionsButton)).toBeVisible()
    })
})

test.describe('Closed Moderation Requests Tab', () => {
    test.beforeEach(async ({ page }) => {
        await navigateToRequests(page)
        await page.locator(selectors.tabs.closedModeration).click()
        await page.waitForTimeout(300)
    })

    test('TC09: should switch to Closed Moderation Requests tab', async ({ page }) => {
        await expect(page.locator(selectors.tabs.closedModeration)).toHaveAttribute('aria-selected', 'true')
    })

    test('TC10: should display data table in Closed Moderation tab', async ({ page }) => {
        await expect(page.locator(selectors.tabContent.active).locator(selectors.table.container)).toBeVisible()
    })

    test('TC11: should display correct column headers for Closed Moderation', async ({ page }) => {
        const activeTab = page.locator(selectors.tabContent.active)
        for (const col of fixtures.moderationColumns) {
            await expect(activeTab.locator(selectors.table.headerCells).filter({ hasText: col })).toBeVisible()
        }
    })
})

test.describe('Open Clearing Requests Tab', () => {
    test.beforeEach(async ({ page }) => {
        await navigateToRequests(page)
        await page.locator(selectors.tabs.openClearing).click()
        await page.waitForTimeout(500)
    })

    test('TC12: should switch to Open Clearing Requests tab', async ({ page }) => {
        await expect(page.locator(selectors.tabs.openClearing)).toHaveAttribute('aria-selected', 'true')
    })

    test('TC13: should display data table in Open Clearing tab', async ({ page }) => {
        await expect(page.locator(selectors.tabContent.active).locator(selectors.table.container)).toBeVisible()
    })

    test('TC14: should display correct column headers for Open Clearing', async ({ page }) => {
        const activeTab = page.locator(selectors.tabContent.active)
        for (const col of fixtures.clearingColumns) {
            await expect(activeTab.locator(selectors.table.headerCells).filter({ hasText: col })).toBeVisible()
        }
    })

    test('TC15: should display page size selector in Clearing tab', async ({ page }) => {
        const activeTab = page.locator(selectors.tabContent.active)
        await expect(activeTab.locator(selectors.table.pageSizeSelector)).toBeVisible()
    })
})

test.describe('Closed Clearing Requests Tab', () => {
    test.beforeEach(async ({ page }) => {
        await navigateToRequests(page)
        await page.locator(selectors.tabs.closedClearing).click()
        await page.waitForTimeout(500)
    })

    test('TC16: should switch to Closed Clearing Requests tab', async ({ page }) => {
        await expect(page.locator(selectors.tabs.closedClearing)).toHaveAttribute('aria-selected', 'true')
    })

    test('TC17: should display data table in Closed Clearing tab', async ({ page }) => {
        await expect(page.locator(selectors.tabContent.active).locator(selectors.table.container)).toBeVisible()
    })

    test('TC18: should display correct column headers for Closed Clearing', async ({ page }) => {
        const activeTab = page.locator(selectors.tabContent.active)
        for (const col of fixtures.clearingColumns) {
            await expect(activeTab.locator(selectors.table.headerCells).filter({ hasText: col })).toBeVisible()
        }
    })
})

test.describe('Tab Navigation', () => {
    test.beforeEach(async ({ page }) => {
        await navigateToRequests(page)
    })

    test('TC19: should navigate between all tabs', async ({ page }) => {
        // Open Moderation (default)
        await expect(page.locator(selectors.tabs.openModeration)).toHaveAttribute('aria-selected', 'true')

        // Click Closed Moderation
        await page.locator(selectors.tabs.closedModeration).click()
        await expect(page.locator(selectors.tabs.closedModeration)).toHaveAttribute('aria-selected', 'true')

        // Click Open Clearing
        await page.locator(selectors.tabs.openClearing).click()
        await expect(page.locator(selectors.tabs.openClearing)).toHaveAttribute('aria-selected', 'true')

        // Click Closed Clearing
        await page.locator(selectors.tabs.closedClearing).click()
        await expect(page.locator(selectors.tabs.closedClearing)).toHaveAttribute('aria-selected', 'true')

        // Click back to Open Moderation
        await page.locator(selectors.tabs.openModeration).click()
        await expect(page.locator(selectors.tabs.openModeration)).toHaveAttribute('aria-selected', 'true')
    })

    test('TC20: should preserve tab content when switching back', async ({ page }) => {
        // Go to Closed Moderation
        await page.locator(selectors.tabs.closedModeration).click()
        await page.waitForTimeout(300)

        // Go back to Open Moderation
        await page.locator(selectors.tabs.openModeration).click()
        await page.waitForTimeout(300)

        // Table should still be visible
        await expect(page.locator(selectors.tabContent.active).locator(selectors.table.container)).toBeVisible()
    })
})
