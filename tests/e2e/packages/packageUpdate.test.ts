// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { expect, test } from '@playwright/test'
import { selectors } from './selectors'
import { createPackageApi, deletePackageApi, fillPackageForm, gotoPackageDetail, gotoPackageEdit, waitForPackagePageLoad } from './utils'

const ts = Date.now().toString(36)

/**
 * Packages Update — Tests for the edit page and update flow.
 */
test.describe.configure({ mode: 'serial' })
test.describe('Packages - Update', () => {
    let packageId: string
    const originalName = `PW Pkg Update ${ts}`
    const version = '1.0.0'
    const purl = `pkg:npm/pw-pkg-update-${ts}@1.0.0`
    const updatedName = `PW Pkg Update ${ts} Modified`
    const updatedDescription = 'Updated description by Playwright.'

    test.beforeAll(async () => {
        packageId = await createPackageApi({
            name: originalName,
            version,
            packageType: 'LIBRARY',
            purl,
        })
    })

    test.afterAll(async () => {
        await deletePackageApi(packageId)
    })

    test('TC47: Navigate to edit page from detail', async ({ page }) => {
        await gotoPackageDetail(page, packageId)
        await page.locator(selectors.detail.editButton).first().click()
        await page.waitForURL(`**/packages/edit/${packageId}**`, { timeout: 15000 })
        await waitForPackagePageLoad(page)
        await expect(page.locator(selectors.form.name)).toBeVisible()
    })

    test('TC48: Edit page has pre-populated name', async ({ page }) => {
        await gotoPackageEdit(page, packageId)
        await expect(page.locator(selectors.form.name)).toHaveValue(originalName, { timeout: 15000 })
    })

    test('TC49: Edit page has pre-populated version', async ({ page }) => {
        await gotoPackageEdit(page, packageId)
        await expect(page.locator(selectors.form.version)).toHaveValue(version, { timeout: 15000 })
    })

    test('TC50: Edit page has pre-populated PURL', async ({ page }) => {
        await gotoPackageEdit(page, packageId)
        await expect(page.locator(selectors.form.purl)).toHaveValue(purl, { timeout: 15000 })
    })

    test('TC51: Edit page has pre-populated package type', async ({ page }) => {
        await gotoPackageEdit(page, packageId)
        await expect(page.locator(selectors.form.packageType)).toHaveValue('LIBRARY', { timeout: 15000 })
    })

    test('TC52: Package Manager is disabled on edit page', async ({ page }) => {
        await gotoPackageEdit(page, packageId)
        await expect(page.locator(selectors.form.packageManager)).toBeDisabled()
    })

    test('TC53: Update package name', async ({ page }) => {
        await gotoPackageEdit(page, packageId)
        await expect(page.locator(selectors.form.name)).toHaveValue(originalName, { timeout: 15000 })
        await fillPackageForm(page, { name: updatedName })
        await page.waitForTimeout(500)
        await page.locator(selectors.actions.updatePackage).click()
        // Should redirect to detail page
        await page.waitForURL(`**/packages/detail/${packageId}**`, { timeout: 30000 })
    })

    test('TC54: Updated name persists after reload', async ({ page }) => {
        await gotoPackageEdit(page, packageId)
        await expect(page.locator(selectors.form.name)).toHaveValue(updatedName, { timeout: 15000 })
    })

    test('TC55: Update package description', async ({ page }) => {
        await gotoPackageEdit(page, packageId)
        await expect(page.locator(selectors.form.name)).not.toHaveValue('', { timeout: 15000 })
        await fillPackageForm(page, { description: updatedDescription })
        await page.waitForTimeout(500)
        await page.locator(selectors.actions.updatePackage).click()
        await page.waitForURL(`**/packages/detail/${packageId}**`, { timeout: 30000 })
    })

    test('TC56: Updated description visible on detail page', async ({ page }) => {
        await gotoPackageDetail(page, packageId)
        await expect(page.getByText(updatedDescription).first()).toBeVisible({ timeout: 10000 })
    })

    test('TC57: Cancel button navigates back from edit', async ({ page }) => {
        await gotoPackageEdit(page, packageId)
        await page.locator(selectors.actions.cancelButton).click()
        // Should navigate back (detail or list)
        await page.waitForTimeout(2000)
        expect(page.url()).not.toContain('/packages/edit/')
    })

    test('TC58: Delete Package button is visible on edit page', async ({ page }) => {
        await gotoPackageEdit(page, packageId)
        await expect(page.locator(selectors.actions.deletePackage).first()).toBeVisible({ timeout: 10000 })
    })
})
