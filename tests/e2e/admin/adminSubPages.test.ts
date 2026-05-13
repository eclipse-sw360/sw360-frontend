// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { test, expect } from '@playwright/test'
import { selectors } from './selectors'
import { fixtures } from './fixtures'
import { navigateToAdminPage } from './utils'

test.describe('Admin Vendors Page', () => {
    test.beforeEach(async ({ page }) => {
        await navigateToAdminPage(page, fixtures.urls.vendors)
    })

    test('TC01: should display the Vendors page', async ({ page }) => {
        await expect(page.locator(selectors.page.container)).toBeVisible()
    })

    test('TC02: should display Add Vendor button', async ({ page }) => {
        await expect(page.locator(selectors.vendors.addButton)).toBeVisible()
    })

    test('TC03: should display the vendors data table', async ({ page }) => {
        await expect(page.locator(selectors.vendors.table)).toBeVisible()
    })

    test('TC04: should display all expected vendor table columns', async ({ page }) => {
        for (const col of fixtures.vendorsColumns) {
            await expect(
                page.locator(selectors.vendors.tableHeaders).filter({ hasText: col }),
            ).toBeVisible()
        }
    })

    test('TC05: should display quick filter input', async ({ page }) => {
        await expect(page.locator(selectors.vendors.quickFilter).first()).toBeVisible()
    })

    test('TC06: should allow typing in quick filter', async ({ page }) => {
        const input = page.locator(selectors.vendors.quickFilter).first()
        await input.fill('test')
        await expect(input).toHaveValue('test')
    })
})

test.describe('Admin License Types Page', () => {
    test.beforeEach(async ({ page }) => {
        await navigateToAdminPage(page, fixtures.urls.licenseTypes)
    })

    test('TC07: should display the License Types page', async ({ page }) => {
        await expect(page.locator(selectors.page.container)).toBeVisible()
    })

    test('TC08: should display the license types table', async ({ page }) => {
        await expect(page.locator(selectors.licenseTypes.table)).toBeVisible()
    })

    test('TC09: should display all expected license types columns', async ({ page }) => {
        for (const col of fixtures.licenseTypesColumns) {
            await expect(
                page.locator(selectors.licenseTypes.tableHeaders).filter({ hasText: col }),
            ).toBeVisible()
        }
    })
})

test.describe('Admin Obligations Page', () => {
    test.beforeEach(async ({ page }) => {
        await navigateToAdminPage(page, fixtures.urls.obligations)
    })

    test('TC10: should display the Obligations page', async ({ page }) => {
        await expect(page.locator(selectors.page.container)).toBeVisible()
    })

    test('TC11: should display Add Obligation button', async ({ page }) => {
        await expect(page.locator(selectors.obligations.addButton)).toBeVisible()
    })

    test('TC12: should display the obligations table', async ({ page }) => {
        await expect(page.locator(selectors.obligations.table)).toBeVisible()
    })

    test('TC13: should display all expected obligations columns', async ({ page }) => {
        for (const col of fixtures.obligationsColumns) {
            await expect(
                page.locator(selectors.obligations.tableHeaders).filter({ hasText: col }),
            ).toBeVisible()
        }
    })
})

test.describe('Admin Schedule Page', () => {
    test.beforeEach(async ({ page }) => {
        await navigateToAdminPage(page, fixtures.urls.schedule)
    })

    test('TC14: should display the Schedule page', async ({ page }) => {
        await expect(page.locator(selectors.page.container)).toBeVisible()
    })

    test('TC15: should display Schedule Task Administration title', async ({ page }) => {
        await expect(page.locator(selectors.schedule.title).first()).toContainText(fixtures.scheduleTitle)
    })

    test('TC16: should display Cancel all Scheduled Tasks button', async ({ page }) => {
        await expect(page.locator(selectors.schedule.cancelAllButton)).toBeVisible()
    })
})

test.describe('Admin Fossology Page', () => {
    test.beforeEach(async ({ page }) => {
        await navigateToAdminPage(page, fixtures.urls.fossology)
    })

    test('TC17: should display the Fossology page', async ({ page }) => {
        await expect(page.locator(selectors.page.adminContent)).toBeVisible()
    })

    test('TC18: should display the Fossology URL input', async ({ page }) => {
        await expect(page.locator(selectors.fossology.urlInput)).toBeVisible()
    })

    test('TC19: should display Re-Check connection button', async ({ page }) => {
        await expect(page.locator(selectors.fossology.recheckButton)).toBeVisible()
    })

    test('TC20: should display Save configuration button', async ({ page }) => {
        await expect(page.locator(selectors.fossology.saveButton)).toBeVisible()
    })
})

test.describe('Admin Bulk Release Edit Page', () => {
    test.beforeEach(async ({ page }) => {
        await navigateToAdminPage(page, fixtures.urls.bulkReleaseEdit)
    })

    test('TC21: should display the Bulk Release Edit page', async ({ page }) => {
        await expect(page.locator(selectors.page.container)).toBeVisible()
    })

    test('TC22: should display the bulk release edit table', async ({ page }) => {
        await expect(page.locator(selectors.bulkReleaseEdit.table)).toBeVisible()
    })

    test('TC23: should display all expected bulk release edit columns', async ({ page }) => {
        for (const col of fixtures.bulkReleaseEditColumns) {
            await expect(
                page.locator(selectors.bulkReleaseEdit.tableHeaders).filter({ hasText: col }),
            ).toBeVisible()
        }
    })
})

test.describe('Admin Import/Export Page', () => {
    test.beforeEach(async ({ page }) => {
        await navigateToAdminPage(page, fixtures.urls.importExport)
    })

    test('TC24: should display the Import/Export page', async ({ page }) => {
        await expect(page.locator(selectors.page.adminContent)).toBeVisible()
    })

    test('TC25: should display download buttons', async ({ page }) => {
        const buttons = page.locator(selectors.importExport.downloadButtons)
        await expect(buttons.first()).toBeVisible()
    })
})

test.describe('Admin Database Sanitation Page', () => {
    test.beforeEach(async ({ page }) => {
        await navigateToAdminPage(page, fixtures.urls.databaseSanitation)
    })

    test('TC26: should display the Database Sanitation page', async ({ page }) => {
        await expect(page.locator(selectors.page.adminContent)).toBeVisible()
    })

    test('TC27: should display Search Duplicates button', async ({ page }) => {
        await expect(page.locator(selectors.databaseSanitation.searchButton)).toBeVisible()
    })
})

test.describe('Admin OAuth Client Page', () => {
    test.beforeEach(async ({ page }) => {
        await navigateToAdminPage(page, fixtures.urls.oauthClient)
    })

    test('TC28: should display the OAuth Client page', async ({ page }) => {
        await expect(page.locator(selectors.page.container)).toBeVisible()
    })

    test('TC29: should display OAuth Client title', async ({ page }) => {
        await expect(page.locator(selectors.oauthClient.title)).toContainText('OAuth Client')
    })

    test('TC30: should display Add Client button', async ({ page }) => {
        await expect(page.locator(selectors.oauthClient.addButton)).toBeVisible()
    })
})

test.describe('Admin Configurations Page', () => {
    test.beforeEach(async ({ page }) => {
        await navigateToAdminPage(page, fixtures.urls.configurations)
    })

    test('TC31: should display the Configurations page', async ({ page }) => {
        await expect(page.locator(selectors.page.container).first()).toBeVisible()
    })

    test('TC32: should display Backend Configurations tab', async ({ page }) => {
        await expect(page.locator(selectors.configurations.tabBackend)).toBeVisible()
    })

    test('TC33: should display Frontend Configurations tab', async ({ page }) => {
        await expect(page.locator(selectors.configurations.tabFrontend)).toBeVisible()
    })

    test('TC34: should switch to Frontend Configurations tab', async ({ page }) => {
        await page.locator(selectors.configurations.tabFrontend).click()
        await page.waitForTimeout(300)
        await expect(page.locator(selectors.configurations.tabFrontend)).toHaveAttribute('aria-selected', 'true')
    })
})

test.describe('Admin Departments Page', () => {
    test.beforeEach(async ({ page }) => {
        await navigateToAdminPage(page, fixtures.urls.departments)
    })

    test('TC35: should display the Departments page', async ({ page }) => {
        await expect(page.locator(selectors.page.container)).toBeVisible()
    })

    test('TC36: should display the departments table', async ({ page }) => {
        await expect(page.locator('.sw360-table')).toBeVisible()
    })

    test('TC37: should display all expected department table columns', async ({ page }) => {
        for (const col of fixtures.departmentsColumns) {
            await expect(
                page.locator('.sw360-table thead th').filter({ hasText: col }),
            ).toBeVisible()
        }
    })
})
