// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { expect, test } from '@playwright/test'
import { selectors } from './selectors'
import { clickTab, createPackageApi, deletePackageApi, gotoPackageDetail } from './utils'

const ts = Date.now().toString(36)

/**
 * Packages Detail Page — Tests for the package detail view and tabs.
 */
test.describe('Packages - Detail Page', () => {
    let packageId: string
    const name = `PW Pkg Detail ${ts}`
    const version = '3.0.0'
    const packageType = 'FRAMEWORK'
    const purl = `pkg:nuget/pw-pkg-detail-${ts}@3.0.0`
    const vcs = 'https://github.com/example/pw-pkg-detail.git'
    const homepageUrl = 'https://example.com/pw-pkg-detail'
    const description = 'Package for testing the detail page.'

    test.beforeAll(async () => {
        packageId = await createPackageApi({
            name,
            version,
            packageType,
            purl,
            vcs,
            homepageUrl,
            description,
        })
    })

    test.afterAll(async () => {
        await deletePackageApi(packageId)
    })

    test('TC31: Detail page loads with package name in header', async ({ page }) => {
        await gotoPackageDetail(page, packageId)
        await expect(page.getByText(name).first()).toBeVisible({ timeout: 10000 })
    })

    test('TC32: Detail page shows version in header', async ({ page }) => {
        await gotoPackageDetail(page, packageId)
        await expect(page.getByText(version).first()).toBeVisible({ timeout: 10000 })
    })

    test('TC33: Detail page shows Summary tab', async ({ page }) => {
        await gotoPackageDetail(page, packageId)
        await expect(page.locator(selectors.tabs.summary)).toBeVisible()
    })

    test('TC34: Detail page shows Change Log tab', async ({ page }) => {
        await gotoPackageDetail(page, packageId)
        await expect(page.locator(selectors.tabs.changeLog)).toBeVisible()
    })

    test('TC35: Summary tab is active by default', async ({ page }) => {
        await gotoPackageDetail(page, packageId)
        await expect(page.locator(selectors.tabs.summary).first()).toHaveClass(/active/)
    })

    test('TC36: Summary tab shows package name', async ({ page }) => {
        await gotoPackageDetail(page, packageId)
        await expect(page.getByText(name).first()).toBeVisible()
    })

    test('TC37: Summary tab shows version', async ({ page }) => {
        await gotoPackageDetail(page, packageId)
        await expect(page.getByText(version).first()).toBeVisible()
    })

    test('TC38: Summary tab shows PURL', async ({ page }) => {
        await gotoPackageDetail(page, packageId)
        await expect(page.getByText(purl).first()).toBeVisible()
    })

    test('TC39: Summary tab shows package type', async ({ page }) => {
        await gotoPackageDetail(page, packageId)
        // Package type shown in summary table
        await expect(page.getByText(/Framework/i).first()).toBeVisible()
    })

    test('TC40: Summary tab shows description', async ({ page }) => {
        await gotoPackageDetail(page, packageId)
        await expect(page.getByText(description).first()).toBeVisible()
    })

    test('TC41: Summary tab shows homepage URL', async ({ page }) => {
        await gotoPackageDetail(page, packageId)
        await expect(page.getByText(homepageUrl).first()).toBeVisible()
    })

    test('TC42: Summary tab shows VCS', async ({ page }) => {
        await gotoPackageDetail(page, packageId)
        await expect(page.getByText(vcs).first()).toBeVisible()
    })

    test('TC43: Edit Package button is visible on detail page', async ({ page }) => {
        await gotoPackageDetail(page, packageId)
        await expect(page.locator(selectors.detail.editButton).first()).toBeVisible({ timeout: 10000 })
    })

    test('TC44: Edit Package button navigates to edit page', async ({ page }) => {
        await gotoPackageDetail(page, packageId)
        await page.locator(selectors.detail.editButton).first().click()
        await page.waitForURL(`**/packages/edit/${packageId}**`, { timeout: 15000 })
    })

    test('TC45: Change Log tab can be navigated to', async ({ page }) => {
        await gotoPackageDetail(page, packageId)
        await clickTab(page, selectors.tabs.changeLog)
        await expect(page.locator(selectors.tabs.changeLog).first()).toHaveClass(/active/)
    })

    test('TC46: Change Log tab loads without error', async ({ page }) => {
        await gotoPackageDetail(page, packageId)
        await clickTab(page, selectors.tabs.changeLog)
        await page.waitForTimeout(1000)
        // Should stay on same page without crash
        expect(page.url()).toContain(`/packages/detail/${packageId}`)
    })
})
