// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { expect, test } from '@playwright/test'
import { packageFixtures } from './fixtures'
import { selectors } from './selectors'
import { deletePackageApi, fillPackageForm, gotoPackagesPage, waitForPackagePageLoad } from './utils'

const ts = Date.now().toString(36)

/**
 * Packages Create — Tests for the package creation page.
 */
test.describe('Packages - Create', () => {
    test('TC19: Create package with required fields only', async ({ page }) => {
        const data = packageFixtures.requiredFields
        await gotoPackagesPage(page, 'add')
        await fillPackageForm(page, data)
        await page.locator(selectors.actions.createPackage).click()

        // Should redirect to detail page on success
        await page.waitForURL('**/packages/detail/**', { timeout: 30000 })
        // Cleanup — extract ID from URL
        const url = page.url()
        const packageId = url.split('/packages/detail/').pop()?.split('?')[0] ?? ''
        if (packageId) await deletePackageApi(packageId)
    })

    test('TC20: Create package with all fields', async ({ page }) => {
        const data = packageFixtures.allFields
        await gotoPackagesPage(page, 'add')
        await fillPackageForm(page, data)
        await page.locator(selectors.actions.createPackage).click()

        await page.waitForURL('**/packages/detail/**', { timeout: 30000 })
        const url = page.url()
        const packageId = url.split('/packages/detail/').pop()?.split('?')[0] ?? ''
        if (packageId) await deletePackageApi(packageId)
    })

    test('TC21: Name field is required — form validation prevents submit', async ({ page }) => {
        await gotoPackagesPage(page, 'add')
        await fillPackageForm(page, {
            version: '1.0.0',
            packageType: 'LIBRARY',
            purl: `pkg:npm/no-name-${ts}@1.0.0`,
        })
        await page.locator(selectors.actions.createPackage).click()

        // HTML5 validation should prevent submit — stay on same page
        await page.waitForTimeout(1000)
        expect(page.url()).toContain('/packages/add')
    })

    test('TC22: Version field is required — form validation prevents submit', async ({ page }) => {
        await gotoPackagesPage(page, 'add')
        await fillPackageForm(page, {
            name: `PW NoVer ${ts}`,
            packageType: 'LIBRARY',
            purl: `pkg:npm/pw-nover-${ts}@1.0.0`,
        })
        // Clear version explicitly
        await page.locator(selectors.form.version).clear()
        await page.locator(selectors.actions.createPackage).click()

        await page.waitForTimeout(1000)
        expect(page.url()).toContain('/packages/add')
    })

    test('TC23: PURL field is required — form validation prevents submit', async ({ page }) => {
        await gotoPackagesPage(page, 'add')
        await fillPackageForm(page, {
            name: `PW NoPurl ${ts}`,
            version: '1.0.0',
            packageType: 'LIBRARY',
        })
        await page.locator(selectors.actions.createPackage).click()

        await page.waitForTimeout(1000)
        expect(page.url()).toContain('/packages/add')
    })

    test('TC24: Package Type is required — form validation prevents submit', async ({ page }) => {
        await gotoPackagesPage(page, 'add')
        await fillPackageForm(page, {
            name: `PW NoType ${ts}`,
            version: '1.0.0',
            purl: `pkg:npm/pw-notype-${ts}@1.0.0`,
        })
        // Ensure package type is at the blank default
        await page.locator(selectors.form.packageType).selectOption('')
        await page.locator(selectors.actions.createPackage).click()

        await page.waitForTimeout(1000)
        expect(page.url()).toContain('/packages/add')
    })

    test('TC25: Cancel button navigates back', async ({ page }) => {
        await gotoPackagesPage(page, 'add')
        await page.locator(selectors.actions.cancelButton).click()
        // Cancel uses router.back() — may go to list or any prev page
        await page.waitForTimeout(3000)
        expect(page.url()).not.toContain('/packages/add')
    })

    test('TC26: Default values are correct on add page', async ({ page }) => {
        await gotoPackagesPage(page, 'add')
        await expect(page.locator(selectors.form.name)).toHaveValue('')
        await expect(page.locator(selectors.form.version)).toHaveValue('')
        await expect(page.locator(selectors.form.purl)).toHaveValue('')
        await expect(page.locator(selectors.form.description)).toHaveValue('')
    })

    test('TC27: Package Type dropdown has all expected options', async ({ page }) => {
        await gotoPackagesPage(page, 'add')
        const options = await page.locator(selectors.form.packageType).locator('option').allTextContents()
        expect(options.some((o) => o.includes('Application'))).toBeTruthy()
        expect(options.some((o) => o.includes('Library'))).toBeTruthy()
        expect(options.some((o) => o.includes('Framework'))).toBeTruthy()
        expect(options.some((o) => o.includes('Container'))).toBeTruthy()
    })

    test('TC28: Package Manager field is disabled (auto-derived from PURL)', async ({ page }) => {
        await gotoPackagesPage(page, 'add')
        await expect(page.locator(selectors.form.packageManager)).toBeDisabled()
    })

    test('TC29: PURL input uses text type with purl validation pattern', async ({ page }) => {
        await gotoPackagesPage(page, 'add')
        const purlInput = page.locator(selectors.form.purl)
        await expect(purlInput).toHaveAttribute('type', 'text')
        await expect(purlInput).toHaveAttribute('pattern', /\[Pp\]\[Kk\]\[Gg\]/)
    })

    test('TC30: Description textarea accepts multiline input', async ({ page }) => {
        await gotoPackagesPage(page, 'add')
        const desc = 'Line one\nLine two\nLine three'
        await page.locator(selectors.form.description).fill(desc)
        await expect(page.locator(selectors.form.description)).toHaveValue(desc)
    })
})
