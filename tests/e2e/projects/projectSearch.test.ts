// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { expect, test } from '@playwright/test'
import { selectors } from './selectors'
import { gotoProjectsPage } from './utils'

/**
 * Projects Advanced Search & Filter — Tests for all 9 search parameters.
 */
test.describe('Projects Advanced Search', () => {
    test.beforeEach(async ({ page }) => {
        await gotoProjectsPage(page)
    })

    test('TC12: Advanced search panel is visible with all fields', async ({ page }) => {
        // Advanced search should have these fields
        await expect(page.getByText('Advanced Search')).toBeVisible()
        await expect(page.getByText('Project Name').first()).toBeVisible()
        await expect(page.getByText('Project Version').first()).toBeVisible()
        await expect(page.getByText('Project Type').first()).toBeVisible()
    })

    test('TC13: Search by project name filters results', async ({ page }) => {
        const nameInput = page.locator(selectors.search.nameField)
        await nameInput.fill('PW')
        await page.locator(selectors.search.searchButton).click()
        await page.waitForTimeout(2000)

        // URL should contain search param
        expect(page.url()).toContain('name=PW')
    })

    test('TC14: Search by project version filters results', async ({ page }) => {
        const versionInput = page.locator(selectors.search.versionField)
        await versionInput.fill('1.0.0')
        await page.locator(selectors.search.searchButton).click()
        await page.waitForTimeout(2000)

        expect(page.url()).toContain('version=1.0.0')
    })

    test('TC15: Search by project type dropdown filters results', async ({ page }) => {
        const typeSelect = page.locator(selectors.search.typeField)
        await typeSelect.waitFor({ state: 'attached' })
        await typeSelect.selectOption('PRODUCT')
        await page.locator(selectors.search.searchButton).click()
        await page.waitForURL('**/projects?**', { timeout: 10000 })

        expect(page.url()).toContain('type=PRODUCT')
    })

    test('TC16: Search by project responsible filters results', async ({ page }) => {
        const responsibleInput = page.locator(selectors.search.responsibleField)
        await responsibleInput.fill('admin@sw360.org')
        await page.locator(selectors.search.searchButton).click()
        await page.waitForTimeout(2000)

        expect(page.url()).toContain('projectResponsible=admin')
    })

    test('TC17: Search by state dropdown filters results', async ({ page }) => {
        const stateSelect = page.locator(selectors.search.stateField)
        await stateSelect.waitFor({ state: 'attached' })
        await stateSelect.selectOption('ACTIVE')
        await page.locator(selectors.search.searchButton).click()
        await page.waitForURL('**/projects?**', { timeout: 10000 })

        expect(page.url()).toContain('state=ACTIVE')
    })

    test('TC18: Search by clearing state dropdown filters results', async ({ page }) => {
        const clearingSelect = page.locator(selectors.search.clearingStateField)
        await clearingSelect.waitFor({ state: 'attached' })
        await clearingSelect.selectOption('OPEN')
        await page.locator(selectors.search.searchButton).click()
        await page.waitForURL('**/projects?**', { timeout: 10000 })

        expect(page.url()).toContain('clearingStatus=OPEN')
    })

    test('TC19: Search by tag filters results', async ({ page }) => {
        const tagInput = page.locator(selectors.search.tagField)
        await tagInput.fill('searchable-tag')
        await page.locator(selectors.search.searchButton).click()
        await page.waitForTimeout(2000)

        expect(page.url()).toContain('tag=searchable-tag')
    })

    test('TC20: Combined search with multiple fields', async ({ page }) => {
        await page.locator(selectors.search.nameField).fill('Test')
        const typeSelect = page.locator(selectors.search.typeField)
        await typeSelect.selectOption('PRODUCT')

        await page.locator(selectors.search.searchButton).click()
        await page.waitForURL(/name=Test/, { timeout: 10000 }).catch(() => {})
        await page.waitForTimeout(1000)

        const url = page.url()
        expect(url).toContain('name=Test')
        expect(url).toContain('type=PRODUCT')
    })

    test('TC21: Search with no results shows empty table gracefully', async ({ page }) => {
        await page.locator(selectors.search.nameField).fill('NONEXISTENT_PROJECT_XYZ123')
        await page.locator(selectors.search.searchButton).click()
        await page.waitForTimeout(2000)

        // Table should still be visible (even if empty)
        await expect(page.locator(selectors.list.table)).toBeVisible()
    })
})
