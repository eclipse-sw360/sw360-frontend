// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { expect, test } from '@playwright/test'
import { selectors } from './selectors'
import { clickDetailTab, createComponentApi, deleteComponentApi, waitForComponentPageLoad } from './utils'

const ts = Date.now().toString(36)

/**
 * Components Detail Page — Tests for all tabs and detail view rendering.
 */
test.describe('Components - Detail Page', () => {
    let componentId: string
    const componentName = `PW Comp Detail ${ts}`

    test.beforeAll(async () => {
        componentId = await createComponentApi({
            name: componentName,
            categories: 'Library',
            componentType: 'OSS',
            description: 'Component for testing detail page tabs',
        })
    })

    test.afterAll(async () => {
        await deleteComponentApi(componentId)
    })

    test.beforeEach(async ({ page }) => {
        await page.goto(`/components/detail/${componentId}`)
        await waitForComponentPageLoad(page)
        await expect(page.getByRole('tab', { name: 'Summary' }).first()).toBeVisible({ timeout: 15000 })
    })

    // ─── Tab Visibility ──────────────────────────────────────

    test('TC29: Detail page shows all expected tabs', async ({ page }) => {
        const expectedTabs = ['Summary', 'Release Overview', 'Attachments', 'Vulnerabilities', 'Change Log']
        for (const tab of expectedTabs) {
            await expect(page.getByRole('tab', { name: tab }).first()).toBeVisible()
        }
    })

    test('TC30: Summary tab is active by default', async ({ page }) => {
        await expect(page.getByRole('tab', { name: 'Summary' }).first()).toHaveAttribute('aria-selected', 'true')
    })

    // ─── Summary Tab ─────────────────────────────────────────

    test('TC31: Summary tab displays component name', async ({ page }) => {
        await expect(page.getByText(componentName).first()).toBeVisible()
    })

    test('TC32: Summary tab displays component type', async ({ page }) => {
        await expect(page.getByText(/OSS/).first()).toBeVisible()
    })

    test('TC33: Summary tab displays description', async ({ page }) => {
        await expect(page.getByText('Component for testing detail page tabs')).toBeVisible()
    })

    test('TC34: Summary tab shows created by info', async ({ page }) => {
        await expect(page.getByText(/SW360 Admin|setup@sw360/).first()).toBeVisible()
    })

    // ─── Release Overview Tab ────────────────────────────────

    test('TC35: Release Overview tab renders', async ({ page }) => {
        await clickDetailTab(page, 'Release Overview')
        await expect(page.getByRole('tab', { name: 'Release Overview' }).first()).toHaveAttribute(
            'aria-selected',
            'true',
        )
    })

    // ─── Attachments Tab ─────────────────────────────────────

    test('TC36: Attachments tab renders', async ({ page }) => {
        await clickDetailTab(page, 'Attachments')
        await expect(page.getByRole('tab', { name: 'Attachments' }).first()).toHaveAttribute(
            'aria-selected',
            'true',
        )
    })

    // ─── Vulnerabilities Tab ─────────────────────────────────

    test('TC37: Vulnerabilities tab renders', async ({ page }) => {
        await clickDetailTab(page, 'Vulnerabilities')
        await expect(page.getByRole('tab', { name: 'Vulnerabilities' }).first()).toHaveAttribute(
            'aria-selected',
            'true',
            { timeout: 10000 },
        )
    })

    // ─── Change Log Tab ──────────────────────────────────────

    test('TC38: Change Log tab renders', async ({ page }) => {
        await clickDetailTab(page, /Change Log/)
        await expect(page.getByRole('tab', { name: /Change Log/ }).first()).toHaveAttribute(
            'aria-selected',
            'true',
            { timeout: 10000 },
        )
    })

    // ─── Detail Page Buttons ─────────────────────────────────

    test('TC39: Edit component button is visible', async ({ page }) => {
        await expect(page.locator(selectors.detailActions.editButton).first()).toBeVisible()
    })

    test('TC40: Edit component button navigates to edit page', async ({ page }) => {
        await page.locator(selectors.detailActions.editButton).first().click()
        await page.waitForURL(`**/components/edit/${componentId}**`, { timeout: 15000 })
    })

    test('TC41: Merge button is visible on detail page', async ({ page }) => {
        await expect(page.locator(selectors.detailActions.mergeButton).first()).toBeVisible()
    })

    test('TC42: Split button is visible on detail page', async ({ page }) => {
        await expect(page.locator(selectors.detailActions.splitButton).first()).toBeVisible()
    })

    test('TC43: Subscribe button is visible', async ({ page }) => {
        const subscribeBtn = page.locator(selectors.detailActions.subscribeButton)
        const unsubscribeBtn = page.locator(selectors.detailActions.unsubscribeButton)
        // One of subscribe/unsubscribe should be visible
        const isSubscribe = await subscribeBtn.isVisible().catch(() => false)
        const isUnsubscribe = await unsubscribeBtn.isVisible().catch(() => false)
        expect(isSubscribe || isUnsubscribe).toBeTruthy()
    })
})
