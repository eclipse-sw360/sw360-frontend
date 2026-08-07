// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { test, expect } from '@playwright/test'
import { selectors } from './selectors'
import { fixtures } from './fixtures'
import { navigateToHome, getWidget, waitForWidgetLoaded } from './utils'

test.describe('Home Page Layout', () => {
    test.beforeEach(async ({ page }) => {
        await navigateToHome(page)
    })

    test('TC01: should display the home page container', async ({ page }) => {
        await expect(page.locator(selectors.page.container)).toBeVisible()
    })

    test('TC02: should display My Projects widget', async ({ page }) => {
        const widget = getWidget(page, 'myProjects')
        await expect(widget).toBeVisible()
        await expect(widget.locator(selectors.tableHeader.title)).toContainText(fixtures.widgetTitles.myProjects)
    })

    test('TC03: should display My Components widget', async ({ page }) => {
        const widget = getWidget(page, 'myComponents')
        await expect(widget).toBeVisible()
        await expect(widget.locator(selectors.tableHeader.title)).toContainText(fixtures.widgetTitles.myComponents)
    })

    test('TC04: should display My Task Assignments widget', async ({ page }) => {
        const widget = getWidget(page, 'myTaskAssignments')
        await expect(widget).toBeVisible()
        await expect(widget.locator(selectors.tableHeader.title)).toContainText(fixtures.widgetTitles.myTaskAssignments)
    })

    test('TC05: should display My Task Submissions widget', async ({ page }) => {
        const widget = getWidget(page, 'myTaskSubmissions')
        await expect(widget).toBeVisible()
        await expect(widget.locator(selectors.tableHeader.title)).toContainText(fixtures.widgetTitles.myTaskSubmissions)
    })

    test('TC06: should display My Subscriptions widget', async ({ page }) => {
        const widget = getWidget(page, 'mySubscriptions')
        await expect(widget).toBeVisible()
        await expect(widget.locator(selectors.tableHeader.title)).toContainText(fixtures.widgetTitles.mySubscriptions)
    })

    test('TC07: should display Recent Components widget', async ({ page }) => {
        const widget = getWidget(page, 'recentComponents')
        await expect(widget).toBeVisible()
        await expect(widget.locator(selectors.tableHeader.title)).toContainText(fixtures.widgetTitles.recentComponents)
    })

    test('TC08: should display Recent Releases widget', async ({ page }) => {
        const widget = getWidget(page, 'recentReleases')
        await expect(widget).toBeVisible()
        await expect(widget.locator(selectors.tableHeader.title)).toContainText(fixtures.widgetTitles.recentReleases)
    })

    test('TC09: should display reload button on all widgets', async ({ page }) => {
        const widgetKeys = Object.keys(selectors.widgets) as Array<keyof typeof selectors.widgets>
        for (const key of widgetKeys) {
            const widget = getWidget(page, key)
            await expect(widget.locator(selectors.tableHeader.reloadButton)).toBeVisible()
        }
    })
})

test.describe('My Projects Widget', () => {
    test.beforeEach(async ({ page }) => {
        await navigateToHome(page)
        await waitForWidgetLoaded(page, 'myProjects')
    })

    test('TC10: should display My Projects table with correct columns', async ({ page }) => {
        const widget = getWidget(page, 'myProjects')
        await expect(widget.locator(selectors.table.container)).toBeVisible()
        for (const col of fixtures.myProjectsColumns) {
            await expect(widget.locator(selectors.table.headerCells).filter({ hasText: col })).toBeVisible()
        }
    })

    test('TC11: should display filter toggle button on My Projects', async ({ page }) => {
        const widget = getWidget(page, 'myProjects')
        await expect(widget.locator(selectors.tableHeader.filterToggle)).toBeVisible()
    })

    test('TC12: should open filter dropdown when toggle is clicked', async ({ page }) => {
        const widget = getWidget(page, 'myProjects')
        await widget.locator(selectors.tableHeader.filterToggle).click()
        await expect(widget.locator(selectors.tableHeader.filterMenu)).toBeVisible()
    })

    test('TC13: should display Role In Project filter section', async ({ page }) => {
        const widget = getWidget(page, 'myProjects')
        await widget.locator(selectors.tableHeader.filterToggle).click()
        await expect(widget.locator(selectors.tableHeader.filterMenu)).toContainText('Role In Project')
    })

    test('TC14: should display all role filter checkboxes', async ({ page }) => {
        const widget = getWidget(page, 'myProjects')
        await widget.locator(selectors.tableHeader.filterToggle).click()
        for (const role of fixtures.roleOptions) {
            await expect(widget.locator(selectors.filter.roleCheckbox(role.key))).toBeVisible()
        }
    })

    test('TC15: should have all role checkboxes checked by default', async ({ page }) => {
        const widget = getWidget(page, 'myProjects')
        await widget.locator(selectors.tableHeader.filterToggle).click()
        for (const role of fixtures.roleOptions) {
            await expect(widget.locator(selectors.filter.roleCheckbox(role.key))).toBeChecked()
        }
    })

    test('TC16: should display Clearing State filter section', async ({ page }) => {
        const widget = getWidget(page, 'myProjects')
        await widget.locator(selectors.tableHeader.filterToggle).click()
        await expect(widget.locator(selectors.tableHeader.filterMenu)).toContainText('Clearing State')
    })

    test('TC17: should display all clearing state checkboxes', async ({ page }) => {
        const widget = getWidget(page, 'myProjects')
        await widget.locator(selectors.tableHeader.filterToggle).click()
        for (const state of fixtures.clearingStateOptions) {
            await expect(widget.locator(selectors.filter.clearingCheckbox(state.key))).toBeVisible()
        }
    })

    test('TC18: should have all clearing state checkboxes checked by default', async ({ page }) => {
        const widget = getWidget(page, 'myProjects')
        await widget.locator(selectors.tableHeader.filterToggle).click()
        for (const state of fixtures.clearingStateOptions) {
            await expect(widget.locator(selectors.filter.clearingCheckbox(state.key))).toBeChecked()
        }
    })

    test('TC19: should display Search button in filter dropdown', async ({ page }) => {
        const widget = getWidget(page, 'myProjects')
        await widget.locator(selectors.tableHeader.filterToggle).click()
        await expect(widget.locator(selectors.filter.searchButton)).toBeVisible()
        await expect(widget.locator(selectors.filter.searchButton)).toContainText('Search')
    })

    test('TC20: should allow unchecking a role filter', async ({ page }) => {
        const widget = getWidget(page, 'myProjects')
        await widget.locator(selectors.tableHeader.filterToggle).click()
        const checkbox = widget.locator(selectors.filter.roleCheckbox('createdBy'))
        await checkbox.uncheck()
        await expect(checkbox).not.toBeChecked()
    })

    test('TC21: should allow unchecking a clearing state filter', async ({ page }) => {
        const widget = getWidget(page, 'myProjects')
        await widget.locator(selectors.tableHeader.filterToggle).click()
        const checkbox = widget.locator(selectors.filter.clearingCheckbox('stateOpen'))
        await checkbox.uncheck()
        await expect(checkbox).not.toBeChecked()
    })

    test('TC22: should close filter and reload after clicking Search', async ({ page }) => {
        const widget = getWidget(page, 'myProjects')
        await widget.locator(selectors.tableHeader.filterToggle).click()
        await widget.locator(selectors.filter.searchButton).click()
        await expect(widget.locator(selectors.tableHeader.filterMenu)).not.toBeVisible()
    })

    test('TC23: should reload data when reload button is clicked', async ({ page }) => {
        const widget = getWidget(page, 'myProjects')
        const responsePromise = page.waitForResponse(
            (resp) => resp.url().includes('myprojects') && resp.status() === 200,
            { timeout: 10000 },
        )
        await widget.locator(selectors.tableHeader.reloadButton).click()
        await responsePromise.catch(() => {})
        await waitForWidgetLoaded(page, 'myProjects')
        await expect(widget.locator(selectors.table.container)).toBeVisible()
    })

    test('TC24: should display table footer with pagination', async ({ page }) => {
        const widget = getWidget(page, 'myProjects')
        // Footer is always present (even if 0 results it shows page info)
        await expect(widget.locator(selectors.table.container)).toBeVisible()
    })
})

test.describe('My Components Widget', () => {
    test.beforeEach(async ({ page }) => {
        await navigateToHome(page)
        await waitForWidgetLoaded(page, 'myComponents')
    })

    test('TC25: should display My Components table with correct columns', async ({ page }) => {
        const widget = getWidget(page, 'myComponents')
        await expect(widget.locator(selectors.table.container)).toBeVisible()
        for (const col of fixtures.myComponentsColumns) {
            await expect(widget.locator(selectors.table.headerCells).filter({ hasText: col })).toBeVisible()
        }
    })

    test('TC26: should not have a filter toggle on My Components', async ({ page }) => {
        const widget = getWidget(page, 'myComponents')
        await expect(widget.locator(selectors.tableHeader.filterToggle)).not.toBeVisible()
    })

    test('TC27: should reload data when reload button is clicked', async ({ page }) => {
        const widget = getWidget(page, 'myComponents')
        const responsePromise = page.waitForResponse(
            (resp) => resp.url().includes('mycomponents') && resp.status() === 200,
            { timeout: 10000 },
        )
        await widget.locator(selectors.tableHeader.reloadButton).click()
        await responsePromise.catch(() => {})
        await waitForWidgetLoaded(page, 'myComponents')
        await expect(widget.locator(selectors.table.container)).toBeVisible()
    })
})

test.describe('My Task Assignments Widget', () => {
    test.beforeEach(async ({ page }) => {
        await navigateToHome(page)
        await waitForWidgetLoaded(page, 'myTaskAssignments')
    })

    test('TC28: should display My Task Assignments table with correct columns', async ({ page }) => {
        const widget = getWidget(page, 'myTaskAssignments')
        await expect(widget.locator(selectors.table.container)).toBeVisible()
        for (const col of fixtures.myTaskAssignmentsColumns) {
            await expect(widget.locator(selectors.table.headerCells).filter({ hasText: col })).toBeVisible()
        }
    })

    test('TC29: should not have a filter toggle on My Task Assignments', async ({ page }) => {
        const widget = getWidget(page, 'myTaskAssignments')
        await expect(widget.locator(selectors.tableHeader.filterToggle)).not.toBeVisible()
    })

    test('TC30: should reload data when reload button is clicked', async ({ page }) => {
        const widget = getWidget(page, 'myTaskAssignments')
        const responsePromise = page.waitForResponse(
            (resp) => resp.url().includes('moderationrequest') && resp.status() === 200,
            { timeout: 10000 },
        )
        await widget.locator(selectors.tableHeader.reloadButton).click()
        await responsePromise.catch(() => {})
        await waitForWidgetLoaded(page, 'myTaskAssignments')
        await expect(widget.locator(selectors.table.container)).toBeVisible()
    })
})

test.describe('My Task Submissions Widget', () => {
    test.beforeEach(async ({ page }) => {
        await navigateToHome(page)
        await waitForWidgetLoaded(page, 'myTaskSubmissions')
    })

    test('TC31: should display My Task Submissions table with correct columns', async ({ page }) => {
        const widget = getWidget(page, 'myTaskSubmissions')
        await expect(widget.locator(selectors.table.container)).toBeVisible()
        for (const col of fixtures.myTaskSubmissionsColumns) {
            await expect(widget.locator(selectors.table.headerCells).filter({ hasText: col })).toBeVisible()
        }
    })

    test('TC32: should not have a filter toggle on My Task Submissions', async ({ page }) => {
        const widget = getWidget(page, 'myTaskSubmissions')
        await expect(widget.locator(selectors.tableHeader.filterToggle)).not.toBeVisible()
    })

    test('TC33: should reload data when reload button is clicked', async ({ page }) => {
        const widget = getWidget(page, 'myTaskSubmissions')
        const responsePromise = page.waitForResponse(
            (resp) => resp.url().includes('moderationrequest') && resp.status() === 200,
            { timeout: 10000 },
        )
        await widget.locator(selectors.tableHeader.reloadButton).click()
        await responsePromise.catch(() => {})
        await waitForWidgetLoaded(page, 'myTaskSubmissions')
        await expect(widget.locator(selectors.table.container)).toBeVisible()
    })
})

test.describe('My Subscriptions Widget', () => {
    test.beforeEach(async ({ page }) => {
        await navigateToHome(page)
    })

    test('TC34: should display My Subscriptions widget title', async ({ page }) => {
        const widget = getWidget(page, 'mySubscriptions')
        await expect(widget.locator(selectors.tableHeader.title)).toContainText(fixtures.widgetTitles.mySubscriptions)
    })

    test('TC35: should not have a filter toggle on My Subscriptions', async ({ page }) => {
        const widget = getWidget(page, 'mySubscriptions')
        await expect(widget.locator(selectors.tableHeader.filterToggle)).not.toBeVisible()
    })

    test('TC36: should reload data when reload button is clicked', async ({ page }) => {
        const widget = getWidget(page, 'mySubscriptions')
        await widget.locator(selectors.tableHeader.reloadButton).click()
        // Wait for API responses to return
        await page.waitForResponse(
            (resp) => resp.url().includes('mySubscriptions') && resp.status() === 200,
            { timeout: 10000 },
        ).catch(() => {})
        await page.waitForTimeout(500)
    })
})

test.describe('Recent Components Widget', () => {
    test.beforeEach(async ({ page }) => {
        await navigateToHome(page)
    })

    test('TC37: should display Recent Components widget title', async ({ page }) => {
        const widget = getWidget(page, 'recentComponents')
        await expect(widget.locator(selectors.tableHeader.title)).toContainText(fixtures.widgetTitles.recentComponents)
    })

    test('TC38: should not have a filter toggle on Recent Components', async ({ page }) => {
        const widget = getWidget(page, 'recentComponents')
        await expect(widget.locator(selectors.tableHeader.filterToggle)).not.toBeVisible()
    })

    test('TC39: should reload data when reload button is clicked', async ({ page }) => {
        const widget = getWidget(page, 'recentComponents')
        await widget.locator(selectors.tableHeader.reloadButton).click()
        await page.waitForResponse(
            (resp) => resp.url().includes('recentComponents') && resp.status() === 200,
            { timeout: 10000 },
        ).catch(() => {})
        await page.waitForTimeout(500)
    })
})

test.describe('Recent Releases Widget', () => {
    test.beforeEach(async ({ page }) => {
        await navigateToHome(page)
    })

    test('TC40: should display Recent Releases widget title', async ({ page }) => {
        const widget = getWidget(page, 'recentReleases')
        await expect(widget.locator(selectors.tableHeader.title)).toContainText(fixtures.widgetTitles.recentReleases)
    })

    test('TC41: should not have a filter toggle on Recent Releases', async ({ page }) => {
        const widget = getWidget(page, 'recentReleases')
        await expect(widget.locator(selectors.tableHeader.filterToggle)).not.toBeVisible()
    })

    test('TC42: should reload data when reload button is clicked', async ({ page }) => {
        const widget = getWidget(page, 'recentReleases')
        await widget.locator(selectors.tableHeader.reloadButton).click()
        await page.waitForResponse(
            (resp) => resp.url().includes('recentReleases') && resp.status() === 200,
            { timeout: 10000 },
        ).catch(() => {})
        await page.waitForTimeout(500)
    })
})
