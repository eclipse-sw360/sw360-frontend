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

test.describe('Admin Users Page', () => {
    test.beforeEach(async ({ page }) => {
        await navigateToAdminPage(page, fixtures.urls.users)
    })

    test('TC01: should display the Users page', async ({ page }) => {
        await expect(page.locator(selectors.page.container)).toBeVisible()
    })

    test('TC02: should display Users title with count', async ({ page }) => {
        await expect(page.locator(selectors.users.title)).toContainText('Users')
    })

    test('TC03: should display Add User button', async ({ page }) => {
        await expect(page.locator(selectors.users.addButton)).toBeVisible()
    })

    test('TC04: should display Download Users button', async ({ page }) => {
        await expect(page.locator(selectors.users.downloadButton)).toBeVisible()
    })

    test('TC05: should display the users data table', async ({ page }) => {
        await expect(page.locator(selectors.users.table)).toBeVisible()
    })

    test('TC06: should display all expected user table columns', async ({ page }) => {
        for (const col of fixtures.usersColumns) {
            await expect(
                page.getByRole('columnheader', { name: col, exact: true }),
            ).toBeVisible()
        }
    })

    test('TC07: should display page size selector', async ({ page }) => {
        await expect(page.locator(selectors.users.pageSizeSelector)).toBeVisible()
    })

    test('TC08: should display at least one user row', async ({ page }) => {
        const rows = page.locator(selectors.users.tableRows)
        await expect(rows.first()).toBeVisible()
    })

    test('TC09: should display pagination footer', async ({ page }) => {
        await expect(page.locator(selectors.users.footer)).toBeVisible()
    })
})
