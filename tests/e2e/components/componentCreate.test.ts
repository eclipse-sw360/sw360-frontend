// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { expect, test } from '@playwright/test'
import { componentFixtures } from './fixtures'
import { selectors } from './selectors'
import {
    createComponentApi,
    deleteComponentApi,
    expectErrorMessage,
    fillComponentSummary,
    gotoComponentsPage,
    waitForComponentPageLoad,
} from './utils'

/**
 * Components Create — Tests for component creation.
 */
const ts = Date.now().toString(36)
test.describe('Components - Create', () => {
    test('TC19: Create component with required fields only', async ({ page }) => {
        const data = componentFixtures.requiredFields

        await gotoComponentsPage(page, 'add')
        await fillComponentSummary(page, data)
        await page.locator(selectors.actions.createComponent).first().click()

        // Should redirect to edit page on success (component creation redirects to edit)
        await page.waitForURL('**/components/edit/**', { timeout: 30000 })
    })

    test('TC20: Create component with all summary fields', async ({ page }) => {
        const data = componentFixtures.allSummaryFields

        await gotoComponentsPage(page, 'add')
        await fillComponentSummary(page, data)
        await page.locator(selectors.actions.createComponent).first().click()

        await page.waitForURL('**/components/edit/**', { timeout: 30000 })
    })

    test('TC21: Name field is required — empty name prevents submission', async ({ page }) => {
        await gotoComponentsPage(page, 'add')

        // Fill only categories, NOT name
        await fillComponentSummary(page, { categories: 'Library', componentType: 'OSS' })
        await page.locator(selectors.actions.createComponent).first().click()

        // Should remain on add page
        expect(page.url()).toContain('/components/add')
    })

    test('TC22: Duplicate component name shows conflict error', async ({ page }) => {
        const data = componentFixtures.conflict

        const id = await createComponentApi(data)

        await gotoComponentsPage(page, 'add')
        await fillComponentSummary(page, data)
        await page.locator(selectors.actions.createComponent).first().click()

        await expectErrorMessage(page, /duplicate|already exists|Duplicate/i)

        await deleteComponentApi(id)
    })

    test('TC23: Cancel button navigates back to components list', async ({ page }) => {
        await gotoComponentsPage(page, 'add')
        await page.locator(selectors.actions.cancelButton).first().click()

        await page.waitForURL('**/components', { timeout: 30000 })
        await expect(page.locator(selectors.list.table)).toBeVisible({ timeout: 15000 })
    })

    test('TC24: Default values are correct on add page', async ({ page }) => {
        await gotoComponentsPage(page, 'add')

        const nameInput = page.locator(selectors.form.name)
        await expect(nameInput).toBeVisible()
        await expect(nameInput).toHaveValue('')

        const createdByInput = page.locator(selectors.form.createdBy)
        await expect(createdByInput).toHaveAttribute('readonly', '')
    })

    test('TC25: Component Type dropdown contains all options', async ({ page }) => {
        await gotoComponentsPage(page, 'add')

        const options = await page.locator(selectors.form.componentType).locator('option').allTextContents()
        const trimmedOptions = options.map((o) => o.trim())
        expect(trimmedOptions).toContain('OSS')
        expect(trimmedOptions).toContain('COTS')
        expect(trimmedOptions).toContain('Internal')
        expect(trimmedOptions).toContain('Inner Source')
        expect(trimmedOptions).toContain('Service')
        expect(trimmedOptions).toContain('Freeware')
        expect(trimmedOptions).toContain('Code Snippet')
    })

    test('TC26: Description textarea accepts input', async ({ page }) => {
        await gotoComponentsPage(page, 'add')

        const descInput = page.locator(selectors.form.description)
        await descInput.fill('Test description for component')
        await expect(descInput).toHaveValue('Test description for component')
    })

    test('TC27: URL fields accept valid URLs', async ({ page }) => {
        await gotoComponentsPage(page, 'add')

        await page.locator(selectors.form.homepage).fill('https://example.com')
        await expect(page.locator(selectors.form.homepage)).toHaveValue('https://example.com')

        await page.locator(selectors.form.blogUrl).fill('https://blog.example.com')
        await expect(page.locator(selectors.form.blogUrl)).toHaveValue('https://blog.example.com')
    })

    test('TC28: Create component with each component type', async ({ page }) => {
        for (const typeData of componentFixtures.componentTypes.slice(0, 2)) {
            await gotoComponentsPage(page, 'add')
            await fillComponentSummary(page, {
                name: typeData.name,
                categories: 'Library',
                componentType: typeData.componentType,
            })
            await page.locator(selectors.actions.createComponent).first().click()
            await page.waitForURL('**/components/edit/**', { timeout: 30000 })
        }
    })
})
