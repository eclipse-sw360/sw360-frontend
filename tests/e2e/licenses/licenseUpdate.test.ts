// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { expect, test } from '@playwright/test'
import { selectors } from './selectors'
import {
    clickButtonPreventingLink,
    createLicenseApi,
    deleteLicenseApi,
    fillLicenseForm,
    gotoLicenseDetail,
    gotoLicenseEdit,
    waitForLicensePageLoad,
} from './utils'

const ts = Date.now().toString(36)

/**
 * Licenses Update — Tests for the edit page and update flow.
 */
test.describe.configure({ mode: 'serial' })
test.describe('Licenses - Update', () => {
    let licenseShortName: string
    const originalFullName = `PW License Update ${ts}`
    const shortName = `PW-Upd-${ts}`
    const updatedFullName = `PW License Update ${ts} Modified`
    const updatedNote = 'Updated note by Playwright test'

    test.beforeAll(async () => {
        licenseShortName = await createLicenseApi({
            fullName: originalFullName,
            shortName: shortName,
            note: 'Original note',
        })
    })

    test.afterAll(async () => {
        await deleteLicenseApi(licenseShortName)
    })

    // ─── Navigate to Edit ────────────────────────────────

    test('TC41: Navigate to edit page from detail', async ({ page }) => {
        await gotoLicenseDetail(page, licenseShortName)
        await page.locator(selectors.actions.editLicense).first().click()
        await page.waitForURL(`**/licenses/edit?id=${licenseShortName}**`, { timeout: 15000 })
        await waitForLicensePageLoad(page)
        await expect(page.locator(selectors.form.fullName)).toBeVisible()
    })

    // ─── Pre-populated Fields ────────────────────────────

    test('TC42: Edit page has pre-populated full name', async ({ page }) => {
        await gotoLicenseEdit(page, licenseShortName)
        await expect(page.locator(selectors.form.fullName)).toHaveValue(originalFullName, { timeout: 15000 })
    })

    test('TC43: Edit page has read-only short name', async ({ page }) => {
        await gotoLicenseEdit(page, licenseShortName)
        const shortNameInput = page.locator(selectors.form.shortName)
        await expect(shortNameInput).toHaveValue(shortName)
        await expect(shortNameInput).toHaveAttribute('readonly', '')
    })

    test('TC44: Edit page shows Details and Obligations tabs', async ({ page }) => {
        await gotoLicenseEdit(page, licenseShortName)
        await expect(page.locator(selectors.tabs.details)).toBeVisible()
        await expect(page.locator(selectors.tabs.obligations)).toBeVisible()
    })

    // ─── Update Flow ─────────────────────────────────────

    test('TC45: Update license full name', async ({ page }) => {
        await gotoLicenseEdit(page, licenseShortName)
        await expect(page.locator(selectors.form.fullName)).toHaveValue(originalFullName, { timeout: 15000 })
        await fillLicenseForm(page, { fullName: updatedFullName })
        // Wait for React state update
        await page.waitForTimeout(1000)

        await clickButtonPreventingLink(page.locator(selectors.actions.updateLicense).first())
        await page.waitForURL(`**/licenses/detail?id=${licenseShortName}**`, { timeout: 30000 })
    })

    test('TC46: Updated full name persists after reload', async ({ page }) => {
        await gotoLicenseEdit(page, licenseShortName)
        await expect(page.locator(selectors.form.fullName)).toHaveValue(updatedFullName, { timeout: 15000 })
    })

    test('TC47: Update license note', async ({ page }) => {
        await gotoLicenseEdit(page, licenseShortName)
        await expect(page.locator(selectors.form.fullName)).not.toHaveValue('', { timeout: 15000 })
        await fillLicenseForm(page, { note: updatedNote })
        await page.waitForTimeout(1000)

        await clickButtonPreventingLink(page.locator(selectors.actions.updateLicense).first())
        await page.waitForURL(`**/licenses/detail?id=${licenseShortName}**`, { timeout: 30000 })
    })

    test('TC48: Updated note visible on detail page', async ({ page }) => {
        await gotoLicenseDetail(page, licenseShortName)
        await expect(page.getByText(updatedNote).first()).toBeVisible({ timeout: 10000 })
    })

    test('TC49: Update OSI Approved field', async ({ page }) => {
        await gotoLicenseEdit(page, licenseShortName)
        await expect(page.locator(selectors.form.fullName)).not.toHaveValue('', { timeout: 15000 })
        await page.locator(selectors.form.osiApproved).selectOption('YES')
        await page.waitForTimeout(1000)

        await clickButtonPreventingLink(page.locator(selectors.actions.updateLicense).first())
        await page.waitForURL(`**/licenses/detail?id=${licenseShortName}**`, { timeout: 30000 })
    })

    // ─── Cancel from Edit ────────────────────────────────

    test('TC50: Cancel button returns to detail page', async ({ page }) => {
        await gotoLicenseEdit(page, licenseShortName)
        await page.locator(selectors.actions.cancelButton).first().click()
        await page.waitForURL(`**/licenses/detail?id=${licenseShortName}**`, { timeout: 30000 })
    })

    // ─── Delete Button on Edit Page ──────────────────────

    test('TC51: Delete License button is visible on edit page', async ({ page }) => {
        await gotoLicenseEdit(page, licenseShortName)
        await expect(page.locator(selectors.actions.deleteLicense).first()).toBeVisible({ timeout: 10000 })
    })
})
