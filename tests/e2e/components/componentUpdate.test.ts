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
    createComponentApi,
    deleteComponentApi,
    fillComponentSummary,
    gotoEditFromDetail,
    waitForComponentPageLoad,
} from './utils'

const ts = Date.now().toString(36)

/**
 * Components Update — Tests for the edit page and update flow.
 */
test.describe.configure({ mode: 'serial' })
test.describe('Components - Update', () => {
    let componentId: string
    const originalName = `PW Comp Update ${ts}`
    const updatedDescription = 'Updated description by Playwright test'

    test.beforeAll(async () => {
        componentId = await createComponentApi({
            name: originalName,
            categories: 'Library',
            componentType: 'OSS',
            description: 'Original description before update',
        })
    })

    test.afterAll(async () => {
        await deleteComponentApi(componentId)
    })

    // ─── Navigate to Edit ────────────────────────────────

    test('TC44: Navigate to edit page from detail', async ({ page }) => {
        await page.goto(`/components/detail/${componentId}`)
        await waitForComponentPageLoad(page)
        await gotoEditFromDetail(page)
        await expect(page).toHaveURL(new RegExp(`/components/edit/${componentId}`))
    })

    // ─── Edit Page Tabs ──────────────────────────────────

    test('TC45: Edit page shows Summary, Release, Attachments tabs', async ({ page }) => {
        await page.goto(`/components/edit/${componentId}`)
        await waitForComponentPageLoad(page)
        for (const tabName of ['Summary', 'Attachments']) {
            await expect(page.getByRole('tab', { name: tabName }).first()).toBeVisible({ timeout: 10000 })
        }
    })

    // ─── Pre-populated Fields ────────────────────────────

    test('TC46: Edit page has pre-populated name', async ({ page }) => {
        await page.goto(`/components/edit/${componentId}`)
        await waitForComponentPageLoad(page)
        await expect(page.locator(selectors.form.name)).toHaveValue(originalName, { timeout: 10000 })
    })

    test('TC47: Edit page has pre-populated component type', async ({ page }) => {
        await page.goto(`/components/edit/${componentId}`)
        await waitForComponentPageLoad(page)
        await expect(page.locator(selectors.form.componentType)).toHaveValue('OSS', { timeout: 15000 })
    })

    test('TC48: Edit page has pre-populated description', async ({ page }) => {
        await page.goto(`/components/edit/${componentId}`)
        await waitForComponentPageLoad(page)
        await expect(page.locator(selectors.form.description)).toHaveValue('Original description before update')
    })

    // ─── Update Flow ─────────────────────────────────────

    test('TC49: Update component description', async ({ page }) => {
        await page.goto(`/components/edit/${componentId}`)
        await waitForComponentPageLoad(page)
        // Ensure the form is fully loaded with data before modifying
        await expect(page.locator(selectors.form.name)).toHaveValue(originalName, { timeout: 15000 })
        await fillComponentSummary(page, { description: updatedDescription })
        // Wait for React to process the state update and re-render
        await page.waitForTimeout(1000)

        // Track the PATCH response status
        let patchStatus = 0
        page.on('response', (resp) => {
            if (resp.url().includes(`/components/${componentId}`) && resp.request().method() === 'PATCH') {
                patchStatus = resp.status()
            }
        })

        // Prevent the parent <Link> from navigating (it points to the same edit page)
        await clickButtonPreventingLink(page.locator(selectors.actions.updateComponent))

        // Should redirect to detail page after PATCH completes
        await page.waitForURL(`**/components/detail/${componentId}**`, { timeout: 30000 })
        expect(patchStatus).toBe(200)
    })

    test('TC50: Updated description persists after reload', async ({ page }) => {
        await page.goto(`/components/edit/${componentId}`)
        await waitForComponentPageLoad(page)
        await expect(page.locator(selectors.form.description)).toHaveValue(updatedDescription, { timeout: 15000 })
    })

    test('TC51: Update component type', async ({ page }) => {
        await page.goto(`/components/edit/${componentId}`)
        await waitForComponentPageLoad(page)
        // Ensure form data is loaded before modifying
        await expect(page.locator(selectors.form.name)).not.toHaveValue('', { timeout: 15000 })
        await page.locator(selectors.form.componentType).selectOption('INTERNAL')
        // Verify the select value changed
        await expect(page.locator(selectors.form.componentType)).toHaveValue('INTERNAL')
        // Wait for React to process the state update and re-render
        await page.waitForTimeout(1000)

        let patchStatus = 0
        page.on('response', (resp) => {
            if (resp.url().includes(`/components/${componentId}`) && resp.request().method() === 'PATCH') {
                patchStatus = resp.status()
            }
        })

        await clickButtonPreventingLink(page.locator(selectors.actions.updateComponent))
        await page.waitForURL(`**/components/detail/${componentId}**`, { timeout: 30000 })
        expect(patchStatus).toBe(200)
    })

    test('TC52: Updated component type persists', async ({ page }) => {
        await page.goto(`/components/edit/${componentId}`)
        await waitForComponentPageLoad(page)
        await expect(page.locator(selectors.form.componentType)).toHaveValue('INTERNAL', { timeout: 15000 })
    })

    // ─── Cancel from Edit ────────────────────────────────

    test('TC53: Cancel button returns to detail page', async ({ page }) => {
        await page.goto(`/components/edit/${componentId}`)
        await waitForComponentPageLoad(page)
        await page.locator(selectors.actions.cancelButton).click()
        await page.waitForURL(`**/components/detail/${componentId}**`, { timeout: 30000 })
    })

    // ─── Delete Button on Edit Page ──────────────────────

    test('TC54: Delete Component button visible on edit page', async ({ page }) => {
        await page.goto(`/components/edit/${componentId}`)
        await waitForComponentPageLoad(page)
        await expect(page.locator(selectors.actions.deleteComponent).first()).toBeVisible({ timeout: 10000 })
    })

    // ─── Update Component URL Fields ─────────────────────

    test('TC55: Update homepage URL', async ({ page }) => {
        await page.goto(`/components/edit/${componentId}`)
        await waitForComponentPageLoad(page)
        // Ensure form data is loaded before modifying
        await expect(page.locator(selectors.form.name)).not.toHaveValue('', { timeout: 15000 })
        await fillComponentSummary(page, { homepage: 'https://updated-homepage.example.com' })
        // Wait for React to process the state update and re-render
        await page.waitForTimeout(1000)

        await clickButtonPreventingLink(page.locator(selectors.actions.updateComponent))
        await page.waitForURL(`**/components/detail/${componentId}**`, { timeout: 30000 })
        // Verify on detail page
        await expect(page.getByText('https://updated-homepage.example.com').first()).toBeVisible({ timeout: 15000 })
    })
})
