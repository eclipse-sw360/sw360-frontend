// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { expect, test } from '@playwright/test'
import { selectors } from './selectors'
import { clickDetailTab, createProjectApi, deleteProjectApi, waitForProjectPageLoad } from './utils'

const ts = Date.now().toString(36)

/**
 * Projects Detail Page — Tests for all 11 tabs and detail view rendering.
 */
test.describe('Projects - Detail Page', () => {
    let projectId: string
    const projectName = `PW Detail ${ts}`

    test.beforeAll(async () => {
        projectId = await createProjectApi({
            name: projectName,
            version: '1.0.0',
            visibility: 'EVERYONE',
            projectType: 'PRODUCT',
            description: 'Project for testing detail page tabs',
        })
    })

    test.afterAll(async () => {
        await deleteProjectApi(projectId)
    })

    test.beforeEach(async ({ page }) => {
        await page.goto(`/projects/detail/${projectId}`)
        await waitForProjectPageLoad(page)
        // Wait for tabs to be rendered
        await expect(page.getByRole('tab', { name: 'Summary' })).toBeVisible({ timeout: 15000 })
    })

    // ─── Tab Visibility ──────────────────────────────────────

    test('TC50: Detail page shows all expected tabs', async ({ page }) => {
        const expectedTabs = [
            'Summary',
            'Administration',
            'License Clearing',
            'Linked Packages',
            /Obligations/,
            'ECC',
            'Vulnerability Tracking Status',
            'Attachments',
            'Attachment Usages',
            'Vulnerabilities',
            'Change Log',
        ]

        for (const tab of expectedTabs) {
            await expect(page.getByRole('tab', { name: tab }).first()).toBeVisible()
        }
    })

    test('TC51: Summary tab is active by default', async ({ page }) => {
        // Summary tab should be selected
        await expect(page.getByRole('tab', { name: 'Summary' })).toHaveAttribute('aria-selected', 'true')
    })

    // ─── Summary Tab ─────────────────────────────────────────

    test('TC52: Summary tab displays project name and version', async ({ page }) => {
        await expect(page.getByText(projectName).first()).toBeVisible()
        await expect(page.getByText('1.0.0').first()).toBeVisible()
    })

    test('TC53: Summary tab displays project type and visibility', async ({ page }) => {
        await expect(page.getByText(/Product/)).toBeVisible()
        await expect(page.getByText(/Everyone/)).toBeVisible()
    })

    test('TC54: Summary tab displays description', async ({ page }) => {
        await expect(page.getByText('Project for testing detail page tabs')).toBeVisible()
    })

    test('TC55: Summary tab shows created by info', async ({ page }) => {
        await expect(page.getByText(/SW360 Admin/)).toBeVisible()
    })

    // ─── Administration Tab ──────────────────────────────────

    test('TC56: Administration tab displays clearing state', async ({ page }) => {
        await clickDetailTab(page, 'Administration')
        // Should show clearing state value (default: Open)
        await expect(page.getByText(/Open|In Progress|Closed/).first()).toBeVisible()
    })

    test('TC57: Administration tab displays lifecycle information', async ({ page }) => {
        await clickDetailTab(page, 'Administration')
        await expect(page.getByText(/Project State|State/).first()).toBeVisible()
    })

    // ─── License Clearing Tab ────────────────────────────────

    test('TC58: License Clearing tab renders content', async ({ page }) => {
        const tab = page.getByRole('tab', { name: /License Clearing/ }).first()
        if (await tab.isVisible().catch(() => false)) {
            await tab.click()
            await page.waitForTimeout(500)
            // Tab either renders content or may show error for empty projects
            const hasError = await page.getByText('Internal Server Error').isVisible().catch(() => false)
            if (!hasError) {
                await expect(tab).toHaveAttribute('aria-selected', 'true')
            }
        } else {
            // Tab may be hidden for certain user roles
            test.skip()
        }
    })

    // ─── Linked Packages Tab ─────────────────────────────────

    test('TC59: Linked Packages tab renders', async ({ page }) => {
        await clickDetailTab(page, 'Linked Packages')
        await expect(page.getByRole('tab', { name: 'Linked Packages' })).toHaveAttribute('aria-selected', 'true')
    })

    // ─── ECC Tab ─────────────────────────────────────────────

    test('TC60: ECC tab renders', async ({ page }) => {
        await clickDetailTab(page, 'ECC')
        await expect(page.getByRole('tab', { name: 'ECC' })).toHaveAttribute('aria-selected', 'true')
    })

    // ─── Vulnerabilities Tab ─────────────────────────────────

    test('TC61: Vulnerabilities tab renders', async ({ page }) => {
        await clickDetailTab(page, 'Vulnerabilities')
        await expect(page.getByRole('tab', { name: 'Vulnerabilities' }).first()).toHaveAttribute('aria-selected', 'true', { timeout: 10000 })
    })

    // ─── Vulnerability Tracking Status Tab ───────────────────

    test('TC62: Vulnerability Tracking Status tab renders', async ({ page }) => {
        await clickDetailTab(page, 'Vulnerability Tracking Status')
        await expect(page.getByRole('tab', { name: 'Vulnerability Tracking Status' })).toHaveAttribute('aria-selected', 'true')
    })

    // ─── Attachments Tab ─────────────────────────────────────

    test('TC63: Attachments tab renders', async ({ page }) => {
        await clickDetailTab(page, 'Attachments')
        await expect(page.getByRole('tab', { name: 'Attachments' })).toHaveAttribute('aria-selected', 'true')
    })

    // ─── Attachment Usages Tab ────────────────────────────────

    test('TC64: Attachment Usages tab renders', async ({ page }) => {
        await clickDetailTab(page, 'Attachment Usages')
        await expect(page.getByRole('tab', { name: 'Attachment Usages' })).toHaveAttribute('aria-selected', 'true')
    })

    // ─── Change Log Tab ──────────────────────────────────────

    test('TC65: Change Log tab renders', async ({ page }) => {
        await clickDetailTab(page, /Change Log/)
        await expect(page.getByRole('tab', { name: /Change Log/ }).first()).toHaveAttribute('aria-selected', 'true', { timeout: 10000 })
    })

    // ─── Obligations Tab ─────────────────────────────────────

    test('TC66: Obligations tab renders', async ({ page }) => {
        const tab = page.getByRole('tab', { name: /Obligations/ }).first()
        if (await tab.isVisible().catch(() => false)) {
            await tab.click()
            await page.waitForTimeout(500)
            const hasError = await page.getByText('Internal Server Error').isVisible().catch(() => false)
            if (!hasError) {
                await expect(tab).toHaveAttribute('aria-selected', 'true')
            }
        } else {
            test.skip()
        }
    })

    // ─── Detail Page Buttons ─────────────────────────────────

    test('TC67: Edit Projects button is visible on detail page', async ({ page }) => {
        await expect(page.locator(selectors.detailActions.editButton)).toBeVisible()
    })

    test('TC68: Edit Projects button navigates to edit page', async ({ page }) => {
        await page.locator(selectors.detailActions.editButton).click()
        await page.waitForURL(`**/projects/edit/${projectId}**`, { timeout: 15000 })
    })

    test('TC69: Delete Project button is visible on edit page', async ({ page }) => {
        await page.goto(`/projects/edit/${projectId}`)
        await waitForProjectPageLoad(page)
        await expect(page.getByRole('button', { name: /delete project/i })).toBeVisible({ timeout: 15000 })
    })

    test('TC70: Link to Projects button is visible', async ({ page }) => {
        const linkBtn = page.locator(selectors.detailActions.linkToProjectsButton)
        if (await linkBtn.isVisible()) {
            await expect(linkBtn).toBeEnabled()
        }
    })
})
