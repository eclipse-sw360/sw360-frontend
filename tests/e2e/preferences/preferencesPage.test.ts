// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { type Page, test, expect } from '@playwright/test'
import { fixtures as adminFixtures } from '../admin/fixtures'
import { selectors as adminSelectors } from '../admin/selectors'
import { navigateToAdminPage } from '../admin/utils'
import { selectors } from './selectors'
import { fixtures } from './fixtures'
import { navigateToPreferences } from './utils'

test.describe('Preferences Page Layout', () => {
    test.beforeEach(async ({ page }) => {
        await navigateToPreferences(page)
    })

    test('TC01: should display the preferences page container', async ({ page }) => {
        await expect(page.locator(selectors.page.container)).toBeVisible()
    })

    test('TC02: should display the Update settings button', async ({ page }) => {
        await expect(page.locator(selectors.buttons.updateSettings)).toBeVisible()
    })
})

test.describe('Email Notification Settings', () => {
    test.beforeEach(async ({ page }) => {
        await navigateToPreferences(page)
    })

    test('TC03: should display the email notification checkbox', async ({ page }) => {
        await expect(page.locator(selectors.notifications.emailCheckbox)).toBeVisible()
    })

    test('TC04: should have email notification checkbox with label', async ({ page }) => {
        const label = page.locator('label[for="wants_mail_notification"]')
        await expect(label).toBeVisible()
    })

    test('TC05: should display notification settings accordion', async ({ page }) => {
        await expect(page.locator(selectors.notifications.accordion)).toBeVisible()
    })

    test('TC06: should display all notification accordion sections', async ({ page }) => {
        for (const section of fixtures.notificationSections) {
            await expect(
                page.locator(selectors.notifications.accordionHeaders).filter({ hasText: section }),
            ).toBeVisible()
        }
    })

    test('TC07: should toggle email notification checkbox', async ({ page }) => {
        const checkbox = page.locator(selectors.notifications.emailCheckbox)
        const initialState = await checkbox.isChecked()
        await checkbox.click()
        if (initialState) {
            await expect(checkbox).not.toBeChecked()
        } else {
            await expect(checkbox).toBeChecked()
        }
        // Restore original state
        await checkbox.click()
    })

    test('TC08: should expand a notification accordion section', async ({ page }) => {
        const firstHeader = page.locator(selectors.notifications.accordionHeaders).first()
        await firstHeader.click()
        // After clicking, the accordion body should be visible
        const firstItem = page.locator(selectors.notifications.accordionItems).first()
        await expect(firstItem.locator('.accordion-collapse')).toBeVisible()
    })

    test('TC09: should display checkboxes inside expanded accordion section', async ({ page }) => {
        const firstHeader = page.locator(selectors.notifications.accordionHeaders).first()
        await firstHeader.click()
        const firstItem = page.locator(selectors.notifications.accordionItems).first()
        const checkboxes = firstItem.locator('input[type="checkbox"]')
        await expect(checkboxes.first()).toBeVisible()
    })
})

test.describe('User Information', () => {
    test.beforeEach(async ({ page }) => {
        await navigateToPreferences(page)
    })

    test('TC10: should display user name field', async ({ page }) => {
        await expect(page.locator(selectors.userInfo.name)).toBeVisible()
    })

    test('TC11: should display user email field', async ({ page }) => {
        await expect(page.locator(selectors.userInfo.email)).toBeVisible()
    })

    test('TC12: should display user department field', async ({ page }) => {
        await expect(page.locator(selectors.userInfo.department)).toBeVisible()
    })

    test('TC13: should display user role field', async ({ page }) => {
        await expect(page.locator(selectors.userInfo.role)).toBeVisible()
    })

    test('TC14: should show the logged-in user email', async ({ page }) => {
        const emailField = page.locator(selectors.userInfo.email)
        await expect(emailField).not.toBeEmpty()
    })
})

test.describe('REST API Token', () => {
    test.describe.configure({ mode: 'serial', timeout: 120_000 })

    const tokenGeneratorToggleSelector = '#ui-rest-apitoken-generator-enable input[type="checkbox"]'
    const tokenGeneratorSwitchSelector = '#ui-rest-apitoken-generator-enable label.switch'
    const writeAccessToggleSelector = '#rest-api-write-access-token-in-preferences-enabled input[type="checkbox"]'
    const writeAccessSwitchSelector = '#rest-api-write-access-token-in-preferences-enabled label.switch'
    const updateButtonSelector = 'button:has-text("Update Frontend Configurations"), a:has-text("Update Frontend Configurations")'

    const clearConfigurationCache = async (page: Page): Promise<void> => {
        await page.evaluate(() => {
            localStorage.removeItem('uiConfig')
            localStorage.removeItem('sw360BackendConfig')
        })
    }

    const openFrontendConfigurations = async (page: Page): Promise<void> => {
        await navigateToAdminPage(page, adminFixtures.urls.configurations)
        const frontendTab = page.locator(adminSelectors.configurations.tabFrontend)
        await expect(frontendTab).toBeVisible()
        await frontendTab.click()

        const tokenRow = page.locator('#ui-rest-apitoken-generator-enable')
        if ((await tokenRow.count()) === 0) {
            const backendTab = page.locator(adminSelectors.configurations.tabBackend)
            if (await backendTab.count()) {
                await backendTab.click()
            }
            await frontendTab.click()
        }

        await expect(tokenRow).toHaveCount(1, { timeout: 10000 })
    }

    const getTokenGeneratorState = async (page: Page): Promise<boolean> => {
        await openFrontendConfigurations(page)

        const toggle = page.locator(tokenGeneratorToggleSelector)
        await expect(toggle).toHaveCount(1)
        return await toggle.isChecked()
    }

    const setTokenGeneratorAndSave = async (page: Page, desiredState: boolean): Promise<void> => {
        await openFrontendConfigurations(page)

        const tokenGeneratorToggle = page.locator(tokenGeneratorToggleSelector)
        const tokenGeneratorSwitch = page.locator(tokenGeneratorSwitchSelector)
        await expect(tokenGeneratorToggle).toHaveCount(1)
        await expect(tokenGeneratorSwitch).toBeVisible()

        const currentState = await tokenGeneratorToggle.isChecked()
        if (currentState !== desiredState) {
            await tokenGeneratorSwitch.click()
        }

        const updateButton = page.locator(updateButtonSelector).first()
        await expect(updateButton).toBeVisible()
        await updateButton.click()

        await page
            .locator('text=Updated frontend configurations successfully')
            .first()
            .waitFor({ timeout: 10000 })
            .catch(() => {})

        await clearConfigurationCache(page)
    }

    const getWriteAccessState = async (page: Page): Promise<boolean> => {
        await openFrontendConfigurations(page)

        const toggle = page.locator(writeAccessToggleSelector)
        await expect(toggle).toHaveCount(1)
        return await toggle.isChecked()
    }

    const setWriteAccessAndSave = async (page: Page, desiredState: boolean): Promise<void> => {
        await openFrontendConfigurations(page)

        const writeAccessToggle = page.locator(writeAccessToggleSelector)
        const writeAccessSwitch = page.locator(writeAccessSwitchSelector)
        await expect(writeAccessToggle).toHaveCount(1)
        await expect(writeAccessSwitch).toBeVisible()

        const currentState = await writeAccessToggle.isChecked()
        if (currentState !== desiredState) {
            await writeAccessSwitch.click()
        }

        const updateButton = page.locator(updateButtonSelector).first()
        await expect(updateButton).toBeVisible()
        await updateButton.click()

        await page
            .locator('text=Updated frontend configurations successfully')
            .first()
            .waitFor({ timeout: 10000 })
            .catch(() => {})

        await clearConfigurationCache(page)
    }

    test.describe('when token generator is enabled', () => {
        let originalTokenGeneratorState = true

        test.beforeEach(async ({ page }) => {
            originalTokenGeneratorState = await getTokenGeneratorState(page)
            await setTokenGeneratorAndSave(page, true)
            await navigateToPreferences(page)
        })

        test.afterEach(async ({ page }) => {
            await setTokenGeneratorAndSave(page, originalTokenGeneratorState)
        })

        test('TC15: should display the token name input', async ({ page }) => {
            await expect(page.locator(selectors.token.nameInput)).toBeVisible()
        })

        test('TC16: should display the Read Access checkbox', async ({ page }) => {
            await expect(page.locator(selectors.token.readCheckbox)).toBeVisible()
        })

        test('TC17a: should display the Write Access checkbox when configuration is enabled', async ({ page }) => {
            const originalWriteAccessState = await getWriteAccessState(page)
            const writeAccessCheckbox = page.locator(selectors.token.writeCheckbox)

            try {
                await setWriteAccessAndSave(page, true)
                await navigateToPreferences(page)
                await expect(writeAccessCheckbox).toBeVisible()
            } finally {
                await setWriteAccessAndSave(page, originalWriteAccessState)
            }
        })

        test('TC17b: should hide the Write Access checkbox when configuration is disabled', async ({ page }) => {
            const originalWriteAccessState = await getWriteAccessState(page)
            const writeAccessCheckbox = page.locator(selectors.token.writeCheckbox)

            try {
                await setWriteAccessAndSave(page, false)
                await navigateToPreferences(page)
                await expect(writeAccessCheckbox).toHaveCount(0)
            } finally {
                await setWriteAccessAndSave(page, originalWriteAccessState)
            }
        })

        test('TC18: should display the expiration date input', async ({ page }) => {
            await expect(page.locator(selectors.token.expirationInput)).toBeVisible()
        })

        test('TC19: should display the Generate Token button', async ({ page }) => {
            await expect(page.locator(selectors.token.generateButton)).toBeVisible()
        })

        test('TC20: should allow typing a token name', async ({ page }) => {
            const input = page.locator(selectors.token.nameInput)
            await input.fill('test-token')
            await expect(input).toHaveValue('test-token')
        })

        test('TC21: should allow checking Read Access', async ({ page }) => {
            const checkbox = page.locator(selectors.token.readCheckbox)
            await checkbox.check()
            await expect(checkbox).toBeChecked()
        })

        test('TC22: should display tokens table', async ({ page }) => {
            await expect(page.locator(selectors.token.table)).toBeVisible()
        })

        test('TC23: should display token table column headers', async ({ page }) => {
            for (const col of fixtures.tokenTableColumns) {
                await expect(
                    page.locator(selectors.token.tableHeaders).filter({ hasText: col }),
                ).toBeVisible()
            }
        })
    })

    test.describe('when token generator is disabled', () => {
        let originalTokenGeneratorState = true

        test.beforeEach(async ({ page }) => {
            originalTokenGeneratorState = await getTokenGeneratorState(page)
            await setTokenGeneratorAndSave(page, false)
            await navigateToPreferences(page)
        })

        test.afterEach(async ({ page }) => {
            await setTokenGeneratorAndSave(page, originalTokenGeneratorState)
        })

        test('TC24: should persist token generator OFF and disable token generation controls in preferences', async ({ page }) => {
            await expect(page.locator('h4.title-decorator', { hasText: 'REST API Tokens' })).toBeVisible()
            await expect(page.locator(selectors.token.nameInput)).toBeDisabled()
            await expect(page.locator(selectors.token.expirationInput)).toBeDisabled()
            await expect(page.locator(selectors.token.readCheckbox)).toBeDisabled()
            await expect(page.locator(selectors.token.generateButton)).toBeDisabled()
            await expect(page.locator(selectors.token.table)).toBeVisible()

            await page.reload({ waitUntil: 'domcontentloaded' })
            await expect(page.locator('h4.title-decorator', { hasText: 'REST API Tokens' })).toBeVisible()
            await expect(page.locator(selectors.token.nameInput)).toBeDisabled()
        })
    })
})
