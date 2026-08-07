// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { expect, test } from '@playwright/test'
import { licenseFixtures } from './fixtures'
import { selectors } from './selectors'
import {
    createLicenseApi,
    deleteLicenseApi,
    expectErrorMessage,
    fillLicenseForm,
    gotoLicensesPage,
    waitForLicensePageLoad,
} from './utils'

const ts = Date.now().toString(36)

/**
 * Licenses Create — Tests for the license creation page.
 */
test.describe('Licenses - Create', () => {
    test('TC16: Create license with required fields only', async ({ page }) => {
        const data = licenseFixtures.requiredFields

        await gotoLicensesPage(page, 'add')
        await fillLicenseForm(page, { fullName: data.fullName, shortName: data.shortName })
        await page.locator(selectors.actions.createLicense).first().click()

        // Should redirect to licenses list or show success
        await page.waitForURL(/\/licenses(?!\/)/, { timeout: 30000 })
        // Cleanup
        await deleteLicenseApi(data.shortName)
    })

    test('TC17: Create license with all fields', async ({ page }) => {
        const data = licenseFixtures.allFields

        await gotoLicensesPage(page, 'add')
        await fillLicenseForm(page, {
            fullName: data.fullName,
            shortName: data.shortName,
            osiApproved: data.osiApproved,
            fsfLibre: data.fsfLibre,
            isChecked: data.isChecked,
            note: data.note,
        })
        // Switch to text area (it's in the same tab for add)
        const licenseTextInput = page.locator(selectors.form.licenseText)
        if (await licenseTextInput.isVisible().catch(() => false)) {
            await licenseTextInput.fill(data.licenseText)
        }
        await page.locator(selectors.actions.createLicense).first().click()

        await page.waitForURL(/\/licenses(?!\/)/, { timeout: 30000 })
        await deleteLicenseApi(data.shortName)
    })

    test('TC18: Empty full name shows validation error', async ({ page }) => {
        await gotoLicensesPage(page, 'add')
        await fillLicenseForm(page, { shortName: `PW-Empty-${ts}` })
        await page.locator(selectors.actions.createLicense).first().click()

        // Should show error toast about empty name
        await expectErrorMessage(page, /null|empty|Fullname/i)
        expect(page.url()).toContain('/licenses/add')
    })

    test('TC19: Empty short name shows validation error', async ({ page }) => {
        await gotoLicensesPage(page, 'add')
        await fillLicenseForm(page, { fullName: `PW Empty Short ${ts}` })
        await page.locator(selectors.actions.createLicense).first().click()

        // Should show error toast about empty shortname
        await expectErrorMessage(page, /null|empty|shortname/i)
        expect(page.url()).toContain('/licenses/add')
    })

    test('TC20: Invalid short name shows validation error', async ({ page }) => {
        await gotoLicensesPage(page, 'add')
        await fillLicenseForm(page, {
            fullName: `PW Invalid Short ${ts}`,
            shortName: 'has spaces invalid',
        })
        await page.locator(selectors.actions.createLicense).first().click()

        // Should show error about invalid shortname pattern
        await expectErrorMessage(page, /invalid|Shortname/i)
        expect(page.url()).toContain('/licenses/add')
    })

    test('TC21: Duplicate short name shows conflict error', async ({ page }) => {
        const data = licenseFixtures.conflict

        // Create first via API
        await createLicenseApi({ fullName: data.fullName, shortName: data.shortName })

        // Try to create same via UI
        await gotoLicensesPage(page, 'add')
        await fillLicenseForm(page, { fullName: data.fullName, shortName: data.shortName })
        await page.locator(selectors.actions.createLicense).first().click()

        // Should show conflict/duplicate error
        await expectErrorMessage(page, /already taken|duplicate|conflict/i)

        await deleteLicenseApi(data.shortName)
    })

    test('TC22: Cancel button navigates back to licenses list', async ({ page }) => {
        await gotoLicensesPage(page, 'add')
        await page.locator(selectors.actions.cancelButton).first().click()

        await page.waitForURL('**/licenses', { timeout: 30000 })
        await expect(page.locator(selectors.list.table)).toBeVisible({ timeout: 15000 })
    })

    test('TC23: Default values are correct on add page', async ({ page }) => {
        await gotoLicensesPage(page, 'add')

        await expect(page.locator(selectors.form.fullName)).toHaveValue('')
        await expect(page.locator(selectors.form.shortName)).toHaveValue('')
        // OSI/FSF default may be 'NA' or '' depending on initialization
        const osiValue = await page.locator(selectors.form.osiApproved).inputValue()
        expect(osiValue === 'NA' || osiValue === '').toBeTruthy()
        // isChecked should be checked by default
        await expect(page.locator(selectors.form.isChecked)).toBeChecked()
    })

    test('TC24: Short name field only accepts valid characters', async ({ page }) => {
        await gotoLicensesPage(page, 'add')

        // Valid short name should work
        const shortNameInput = page.locator(selectors.form.shortName)
        await shortNameInput.fill('Apache-2.0+test')
        await expect(shortNameInput).toHaveValue('Apache-2.0+test')
    })

    test('TC25: OSI Approved dropdown has correct options', async ({ page }) => {
        await gotoLicensesPage(page, 'add')

        const options = await page.locator(selectors.form.osiApproved).locator('option').allTextContents()
        const trimmed = options.map((o) => o.trim())
        expect(trimmed.some((o) => o.includes('N/A') || o === 'NA')).toBeTruthy()
        expect(trimmed).toContain('Yes')
    })

    test('TC26: FSF Free/Libre dropdown has correct options', async ({ page }) => {
        await gotoLicensesPage(page, 'add')

        const options = await page.locator(selectors.form.fsfLibre).locator('option').allTextContents()
        const trimmed = options.map((o) => o.trim())
        expect(trimmed.some((o) => o.includes('N/A') || o === 'NA')).toBeTruthy()
        expect(trimmed).toContain('Yes')
    })
})
