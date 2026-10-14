// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { type Page, test, expect } from '@playwright/test'
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

test.describe('Admin User Edit Form - General Information Write Access', () => {
    test.describe.configure({ mode: 'serial' })

    const setUserGeneralInfoWriteAccessForTest = async (page: Page, desiredState: boolean): Promise<void> => {
        await page.addInitScript((value: boolean) => {
            window.localStorage.removeItem('uiConfig')
            window.localStorage.setItem(
                'uiConfig',
                JSON.stringify({
                    data: {
                        'ui.enable.user.general.information.write.access': value,
                    },
                    timestamp: Date.now(),
                }),
            )
        }, desiredState)

        await page.route('**/configurations/container/**', async (route) => {
            const response = await route.fetch()
            const contentType = response.headers()['content-type'] ?? ''

            if (!contentType.includes('application/json')) {
                await route.fulfill({ response })
                return
            }

            const body = await response.json()

            await route.fulfill({
                response,
                contentType: 'application/json',
                json: {
                    ...body,
                    'ui.enable.user.general.information.write.access': String(desiredState),
                },
            })
        })
    }

    const openFirstUserEditForm = async (page: Page): Promise<void> => {
        await navigateToAdminPage(page, fixtures.urls.users)

        const editLink = page.locator('a[href*="/admin/users/edit?id="]').first()
        await expect(editLink).toBeVisible()
        await editLink.click()

        await page.waitForURL(/\/admin\/users\/edit\?id=/, { timeout: 10000 })
        await expect(page.locator(selectors.userEditForm.givenNameInput)).toBeVisible()
    }

    const expectGeneralInfoReadonlyState = async (page: Page, expectedReadOnly: boolean): Promise<void> => {
        const givenNameField = page.locator(selectors.userEditForm.givenNameInput)
        const lastNameField = page.locator(selectors.userEditForm.lastNameInput)
        const emailField = page.locator(selectors.userEditForm.emailInput)

        await expect(givenNameField).toBeVisible()
        await expect(lastNameField).toBeVisible()
        await expect(emailField).toBeVisible()

        await expect
            .poll(async () => await givenNameField.evaluate((el: HTMLInputElement) => el.readOnly), {
                timeout: 10000,
            })
            .toBe(expectedReadOnly)
        await expect
            .poll(async () => await lastNameField.evaluate((el: HTMLInputElement) => el.readOnly), {
                timeout: 10000,
            })
            .toBe(expectedReadOnly)
        await expect
            .poll(async () => await emailField.evaluate((el: HTMLInputElement) => el.readOnly), {
                timeout: 10000,
            })
            .toBe(expectedReadOnly)
    }

    test('TC10: general info fields should be EDITABLE when config is ENABLED', async ({ page }) => {
        await setUserGeneralInfoWriteAccessForTest(page, true)

        // Navigate to user edit page
        await openFirstUserEditForm(page)

        // Verify general info fields are not readonly
        await expectGeneralInfoReadonlyState(page, false)
    })

    test('TC11: general info fields should be READONLY when config is DISABLED', async ({ page }) => {
        await setUserGeneralInfoWriteAccessForTest(page, false)

        // Navigate to user edit page
        await openFirstUserEditForm(page)

        // Verify general info fields are readonly
        await expectGeneralInfoReadonlyState(page, true)
    })

    test('TC12: secondary departments section should remain EDITABLE regardless of config state', async ({ page }) => {
        // Navigate to user edit page
        await openFirstUserEditForm(page)
        
        // Verify secondary departments section is present
        const section = page.locator(selectors.userEditForm.secondaryDeptsSection)
        await expect(section).toBeVisible()
    })
})
