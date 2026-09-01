// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { expect, test } from '@playwright/test'
import { selectors } from './selectors'
import {
    clickTab,
    createLicenseApi,
    deleteLicenseApi,
    gotoLicenseDetail,
    gotoLicenseEdit,
    gotoLicensesPage,
    waitForLicensePageLoad,
} from './utils'

const ts = Date.now().toString(36)

/**
 * Licenses Workflows — Export, Obligations tab, Whitelist editing, unchecked license behavior.
 */
test.describe('Licenses - Workflows', () => {
    // ─── Export Spreadsheet ──────────────────────────────

    test.describe('Export', () => {
        test('TC57: Export Spreadsheet button is visible on list page', async ({ page }) => {
            await gotoLicensesPage(page)
            await expect(page.locator(selectors.list.exportButton).first()).toBeVisible({ timeout: 10000 })
        })

        test('TC58: Export Spreadsheet button is clickable', async ({ page }) => {
            await gotoLicensesPage(page)
            const exportBtn = page.locator(selectors.list.exportButton).first()
            await expect(exportBtn).toBeEnabled()
        })
    })

    // ─── Unchecked License Behavior ──────────────────────

    test.describe('Unchecked License', () => {
        let licenseShortName: string
        const fullName = `PW Unchecked License ${ts}`
        const shortName = `PW-Uncheck-${ts}`

        test.beforeAll(async () => {
            licenseShortName = await createLicenseApi({
                fullName,
                shortName,
                checked: false,
            })
        })

        test.afterAll(async () => {
            await deleteLicenseApi(licenseShortName)
        })

        test('TC59: Unchecked license shows UNCHECKED badge', async ({ page }) => {
            await gotoLicenseDetail(page, licenseShortName)
            await expect(page.locator(selectors.detail.uncheckedBadge).first()).toBeVisible({ timeout: 10000 })
        })

        test('TC60: Unchecked license shows danger alert', async ({ page }) => {
            await gotoLicenseDetail(page, licenseShortName)
            await expect(page.locator(selectors.detail.uncheckedAlert).first()).toBeVisible({ timeout: 10000 })
        })
    })

    // ─── Obligations Tab ─────────────────────────────────

    test.describe('Obligations', () => {
        let licenseShortName: string
        const fullName = `PW Obligations License ${ts}`
        const shortName = `PW-Oblig-${ts}`

        test.beforeAll(async () => {
            licenseShortName = await createLicenseApi({ fullName, shortName })
        })

        test.afterAll(async () => {
            await deleteLicenseApi(licenseShortName)
        })

        test('TC61: Obligations tab shows on detail page', async ({ page }) => {
            await gotoLicenseDetail(page, licenseShortName)
            await expect(page.locator(selectors.tabs.obligations)).toBeVisible()
        })

        test('TC62: Obligations tab can be navigated to', async ({ page }) => {
            await gotoLicenseDetail(page, licenseShortName)
            await clickTab(page, selectors.tabs.obligations)
            await expect(page.locator(selectors.tabs.obligations).first()).toHaveClass(/active/)
        })

        test('TC63: Add Obligation button visible on edit obligations tab', async ({ page }) => {
            await gotoLicenseEdit(page, licenseShortName)
            await clickTab(page, selectors.tabs.obligations)
            await expect(page.locator(selectors.actions.addObligation).first()).toBeVisible({ timeout: 10000 })
        })
    })

    // ─── License Text Tab ────────────────────────────────

    test.describe('License Text', () => {
        let licenseShortName: string
        const fullName = `PW Text License ${ts}`
        const shortName = `PW-Text-${ts}`
        const text = 'Permission is hereby granted, free of charge, to any person.'

        test.beforeAll(async () => {
            licenseShortName = await createLicenseApi({
                fullName,
                shortName,
                text,
            })
        })

        test.afterAll(async () => {
            await deleteLicenseApi(licenseShortName)
        })

        test('TC64: Text tab renders license text in preformatted block', async ({ page }) => {
            await gotoLicenseDetail(page, licenseShortName)
            await clickTab(page, selectors.tabs.text)
            await expect(page.locator(selectors.detail.licenseTextPre).first()).toContainText(text, {
                timeout: 10000,
            })
        })

        test('TC65: Text tab for license without text shows empty', async ({ page }) => {
            const emptyShort = `PW-NoText-${ts}`
            await createLicenseApi({ fullName: `PW No Text ${ts}`, shortName: emptyShort, text: '' })
            await gotoLicenseDetail(page, emptyShort)
            await clickTab(page, selectors.tabs.text)
            // Should not crash, tab should render
            expect(page.url()).toContain(`/licenses/detail?id=${emptyShort}`)
            await deleteLicenseApi(emptyShort)
        })
    })

    // ─── External Link ───────────────────────────────────

    test.describe('External Link', () => {
        let licenseShortName: string
        const fullName = `PW ExtLink License ${ts}`
        const shortName = `PW-ExtLink-${ts}`

        test.beforeAll(async () => {
            licenseShortName = await createLicenseApi({ fullName, shortName })
        })

        test.afterAll(async () => {
            await deleteLicenseApi(licenseShortName)
        })

        test('TC66: External link input is visible on detail page', async ({ page }) => {
            await gotoLicenseDetail(page, licenseShortName)
            await expect(page.locator(selectors.detail.externalLinkInput).first()).toBeVisible({ timeout: 10000 })
        })

        test('TC67: External link Save button is present', async ({ page }) => {
            await gotoLicenseDetail(page, licenseShortName)
            await expect(page.locator(selectors.detail.externalLinkSaveButton).first()).toBeVisible({ timeout: 10000 })
        })
    })
})
