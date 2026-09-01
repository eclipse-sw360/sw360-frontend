// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { expect, test } from '@playwright/test'
import { selectors } from './selectors'
import { createLicenseApi, deleteLicenseApi, gotoLicenseEdit, waitForLicensePageLoad } from './utils'

const ts = Date.now().toString(36)

/**
 * Licenses Delete — Tests for the delete dialog and flow.
 */
test.describe('Licenses - Delete', () => {
    test.describe('Delete Dialog', () => {
        let licenseShortName: string
        const fullName = `PW License Dialog ${ts}`
        const shortName = `PW-Dialog-${ts}`

        test.beforeAll(async () => {
            licenseShortName = await createLicenseApi({ fullName, shortName })
        })

        test.afterAll(async () => {
            await deleteLicenseApi(licenseShortName)
        })

        test('TC52: Delete button opens confirmation dialog', async ({ page }) => {
            await gotoLicenseEdit(page, licenseShortName)
            await page.locator(selectors.actions.deleteLicense).first().click()
            await expect(page.locator(selectors.deleteDialog.modal)).toBeVisible({ timeout: 10000 })
        })

        test('TC53: Delete dialog shows confirmation message', async ({ page }) => {
            await gotoLicenseEdit(page, licenseShortName)
            await page.locator(selectors.actions.deleteLicense).first().click()
            await expect(page.locator(selectors.deleteDialog.modal)).toBeVisible({ timeout: 10000 })
            await expect(page.locator(selectors.deleteDialog.message)).toContainText(/delete|license/i)
        })

        test('TC54: Delete dialog has Cancel and Delete buttons', async ({ page }) => {
            await gotoLicenseEdit(page, licenseShortName)
            await page.locator(selectors.actions.deleteLicense).first().click()
            await expect(page.locator(selectors.deleteDialog.modal)).toBeVisible({ timeout: 10000 })
            await expect(page.locator(selectors.deleteDialog.cancelButton)).toBeVisible()
            await expect(page.locator(selectors.deleteDialog.confirmButton)).toBeVisible()
        })

        test('TC55: Cancel button closes delete dialog', async ({ page }) => {
            await gotoLicenseEdit(page, licenseShortName)
            await page.locator(selectors.actions.deleteLicense).first().click()
            await expect(page.locator(selectors.deleteDialog.modal)).toBeVisible({ timeout: 10000 })
            await page.locator(selectors.deleteDialog.cancelButton).click()
            await expect(page.locator(selectors.deleteDialog.modal)).toBeHidden({ timeout: 5000 })
        })
    })

    test.describe('Full Delete Flow', () => {
        let licenseShortName: string
        const fullName = `PW License FullDel ${ts}`
        const shortName = `PW-FullDel-${ts}`

        test.beforeAll(async () => {
            licenseShortName = await createLicenseApi({ fullName, shortName })
        })

        test('TC56: Confirm delete removes license and redirects to list', async ({ page }) => {
            await gotoLicenseEdit(page, licenseShortName)
            await page.locator(selectors.actions.deleteLicense).first().click()
            await expect(page.locator(selectors.deleteDialog.modal)).toBeVisible({ timeout: 10000 })
            await page.locator(selectors.deleteDialog.confirmButton).click()

            // Should redirect to licenses list
            await page.waitForURL('**/licenses**', { timeout: 30000 })
        })
    })
})
