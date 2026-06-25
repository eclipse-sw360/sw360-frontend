// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { expect, test } from '@playwright/test'
import { selectors } from './selectors'
import { createPackageApi, deletePackageApi, gotoPackageEdit } from './utils'

const ts = Date.now().toString(36)

/**
 * Packages Delete — Tests for the delete dialog and flow.
 */
test.describe('Packages - Delete', () => {
    test.describe('Delete Dialog', () => {
        let packageId: string
        const name = `PW Pkg Dialog ${ts}`
        const version = '1.0.0'

        test.beforeAll(async () => {
            packageId = await createPackageApi({
                name,
                version,
                packageType: 'FILE',
                purl: `pkg:npm/pw-pkg-dialog-${ts}@1.0.0`,
            })
        })

        test.afterAll(async () => {
            await deletePackageApi(packageId)
        })

        test('TC59: Delete button opens confirmation dialog', async ({ page }) => {
            await gotoPackageEdit(page, packageId)
            await page.locator(selectors.actions.deletePackage).first().click()
            await expect(page.locator(selectors.deleteDialog.modal)).toBeVisible({ timeout: 10000 })
        })

        test('TC60: Delete dialog shows package name', async ({ page }) => {
            await gotoPackageEdit(page, packageId)
            await page.locator(selectors.actions.deletePackage).first().click()
            await expect(page.locator(selectors.deleteDialog.modal)).toBeVisible({ timeout: 10000 })
            // Dialog message contains "delete" and the package name
            await expect(page.locator(selectors.deleteDialog.message)).toContainText(/delete/i)
            await expect(page.locator(selectors.deleteDialog.message)).toContainText(name)
        })

        test('TC61: Delete dialog has Cancel and Delete buttons', async ({ page }) => {
            await gotoPackageEdit(page, packageId)
            await page.locator(selectors.actions.deletePackage).first().click()
            await expect(page.locator(selectors.deleteDialog.modal)).toBeVisible({ timeout: 10000 })
            await expect(page.locator(selectors.deleteDialog.cancelButton)).toBeVisible()
            await expect(page.locator(selectors.deleteDialog.confirmButton)).toBeVisible()
        })

        test('TC62: Cancel button closes delete dialog', async ({ page }) => {
            await gotoPackageEdit(page, packageId)
            await page.locator(selectors.actions.deletePackage).first().click()
            await expect(page.locator(selectors.deleteDialog.modal)).toBeVisible({ timeout: 10000 })
            await page.locator(selectors.deleteDialog.cancelButton).click()
            await expect(page.locator(selectors.deleteDialog.modal)).toBeHidden({ timeout: 5000 })
        })
    })

    test.describe('Full Delete Flow', () => {
        let packageId: string
        const name = `PW Pkg FullDel ${ts}`
        const version = '1.0.0'

        test.beforeAll(async () => {
            packageId = await createPackageApi({
                name,
                version,
                packageType: 'FILE',
                purl: `pkg:npm/pw-pkg-fulldel-${ts}@1.0.0`,
            })
        })

        test('TC63: Confirm delete removes package and navigates away', async ({ page }) => {
            await gotoPackageEdit(page, packageId)
            await page.locator(selectors.actions.deletePackage).first().click()
            await expect(page.locator(selectors.deleteDialog.modal)).toBeVisible({ timeout: 10000 })
            await page.locator(selectors.deleteDialog.confirmButton).click()

            // Should navigate away from the edit page (back to list or show success)
            await page.waitForTimeout(5000)
            expect(page.url()).not.toContain(`/packages/edit/${packageId}`)
        })
    })
})
