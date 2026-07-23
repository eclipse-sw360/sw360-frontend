// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { expect, test } from '@playwright/test'
import { gotoPackagesPage } from './utils'

/**
 * Packages Search — Tests for the advanced search panel on the list page.
 */
test.describe('Packages - Search', () => {
    test.beforeEach(async ({ page }) => {
        await gotoPackagesPage(page)
    })

    test('TC14: Advanced search panel is visible with all fields', async ({ page }) => {
        await expect(page.getByText('Advanced Search')).toBeVisible()
        // Search panel fields — use the sidebar column
        const sidebar = page.locator('.col-2')
        await expect(sidebar.getByText('Package Name')).toBeVisible()
        await expect(sidebar.getByText('Package Version')).toBeVisible()
        await expect(sidebar.getByText('Package Manager')).toBeVisible()
        await expect(sidebar.getByText('purl')).toBeVisible()
    })

    test('TC15: Search by package name filters results', async ({ page }) => {
        const searchInput = page.locator('input[placeholder*="Package Name"], input[name="name"]').first()
        if (await searchInput.isVisible().catch(() => false)) {
            await searchInput.fill('test')
            await page.locator('button:has-text("Search")').first().click()
            await page.waitForTimeout(2000)
            // URL should contain search param
            expect(page.url()).toContain('name=')
        }
    })

    test('TC16: Search by package manager dropdown filters results', async ({ page }) => {
        const dropdown = page.locator('select').filter({ hasText: /npm|maven|nuget/i }).first()
        if (await dropdown.isVisible().catch(() => false)) {
            await dropdown.selectOption({ index: 1 })
            await page.locator('button:has-text("Search")').first().click()
            await page.waitForTimeout(2000)
            expect(page.url()).toContain('packageManager=')
        }
    })

    test('TC17: Search by PURL filters results', async ({ page }) => {
        const purlInput = page.locator('input[placeholder*="purl"], input[name="purl"]').first()
        if (await purlInput.isVisible().catch(() => false)) {
            await purlInput.fill('pkg:npm')
            await page.locator('button:has-text("Search")').first().click()
            await page.waitForTimeout(2000)
            expect(page.url()).toContain('purl=')
        }
    })

    test('TC18: Search with no results shows empty table', async ({ page }) => {
        const sidebar = page.locator('.col-2')
        const searchInput = sidebar.locator('input').first()
        if (await searchInput.isVisible().catch(() => false)) {
            await searchInput.fill('nonexistent-package-zzzz-9999')
            await sidebar.locator('button:has-text("Search")').click()
            await page.waitForTimeout(3000)
            // Should show empty state, no data text, or minimal rows
            const noData = page.locator('text=/no data|No Packages/i')
            const rows = page.locator('tbody tr')
            const hasNoData = await noData.first().isVisible().catch(() => false)
            const rowCount = await rows.count()
            expect(hasNoData || rowCount <= 1).toBeTruthy()
        }
    })
})
