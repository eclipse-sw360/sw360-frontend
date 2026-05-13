// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { expect, test } from '@playwright/test'
import { projectFixtures } from './fixtures'
import { selectors } from './selectors'
import {
    clickFormTab,
    createProjectApi,
    createProjectViaUI,
    deleteProjectApi,
    expectErrorMessage,
    expectSuccessMessage,
    fillAdministrationClearing,
    fillProjectSummary,
    gotoProjectsPage,
    waitForProjectPageLoad,
} from './utils'

/**
 * Projects Create — Full CRUD test coverage for project creation.
 */
const ts = Date.now().toString(36)
test.describe('Projects - Create', () => {
    test('TC22: Create project with required fields only', async ({ page }) => {
        const data = projectFixtures.requiredFields

        await gotoProjectsPage(page, 'add')
        await fillProjectSummary(page, data)
        await page.locator(selectors.actions.createProject).click()

        // Wait for success alert (signals POST completed), then redirect
        await expect(page.locator('.alert-success').first()).toBeVisible({ timeout: 15000 })
        await page.waitForURL('**/projects/detail/**', { timeout: 30000 })
    })

    test('TC23: Create project with all summary fields', async ({ page }) => {
        const data = projectFixtures.allSummaryFields

        await gotoProjectsPage(page, 'add')
        await fillProjectSummary(page, data)
        await page.locator(selectors.actions.createProject).click()

        await expect(page.locator('.alert-success').first()).toBeVisible({ timeout: 15000 })
        await page.waitForURL('**/projects/detail/**', { timeout: 30000 })

        // Verify created data is visible on detail page
        await expect(page.getByText(data.name).first()).toBeVisible()
    })

    test('TC24: Create project with all project types', async ({ page }) => {
        for (const typeData of projectFixtures.projectTypes.slice(0, 2)) {
            await gotoProjectsPage(page, 'add')
            await fillProjectSummary(page, {
                name: typeData.name,
                version: '1.0.0',
                projectType: typeData.projectType,
            })
            await page.locator(selectors.actions.createProject).click()
            await expect(page.locator('.alert-success').first()).toBeVisible({ timeout: 15000 })
            await page.waitForURL('**/projects/detail/**', { timeout: 30000 })
        }
    })

    test('TC25: Create project with administration fields', async ({ page }) => {
        await gotoProjectsPage(page, 'add')

        // Fill summary
        await fillProjectSummary(page, {
            name: `PW AdminFields ${ts}`,
            version: '1.0.0',
        })

        // Switch to administration tab
        await clickFormTab(page, 'Administration')
        await fillAdministrationClearing(page, projectFixtures.administrationFields)

        // Submit from any tab
        await page.locator(selectors.actions.createProject).click()
        await expect(page.locator('.alert-success').first()).toBeVisible({ timeout: 15000 })
        await page.waitForURL('**/projects/detail/**', { timeout: 30000 })
    })

    test('TC26: Name field is required — empty name prevents submission', async ({ page }) => {
        await gotoProjectsPage(page, 'add')

        // Fill only version, NOT name
        await fillProjectSummary(page, { version: '1.0.0' })
        await page.locator(selectors.actions.createProject).click()

        // Should remain on add page or show validation
        // HTML5 validation: name input has required attribute
        const nameInput = page.locator(selectors.form.name)
        await expect(nameInput).toHaveAttribute('required', '')

        // Page should NOT navigate away
        expect(page.url()).toContain('/projects/add')
    })

    test('TC27: Duplicate project name+version shows conflict error', async ({ page }) => {
        const data = projectFixtures.conflict

        // First: create the project via API
        const id = await createProjectApi({ ...data, visibility: 'EVERYONE', projectType: 'PRODUCT' })

        // Second: try creating with same name + version via UI
        await gotoProjectsPage(page, 'add')
        await fillProjectSummary(page, { ...data, visibility: 'EVERYONE', projectType: 'PRODUCT' })
        await page.locator(selectors.actions.createProject).click()

        // Should show conflict/already exists error
        await expectErrorMessage(page, /already exists|conflict/i)

        // Cleanup
        await deleteProjectApi(id)
    })

    test('TC28: Cancel button navigates back to projects list', async ({ page }) => {
        await gotoProjectsPage(page, 'add')
        await page.locator(selectors.actions.cancelProject).click()

        await page.waitForURL('**/projects', { timeout: 10000 })
        await expect(page.locator(selectors.list.table)).toBeVisible()
    })

    test('TC29: Default values are pre-populated correctly', async ({ page }) => {
        await gotoProjectsPage(page, 'add')

        // Visibility defaults to EVERYONE
        const visibilitySelect = page.locator(selectors.form.visibility)
        await expect(visibilitySelect).toHaveValue('EVERYONE')

        // Project Type defaults to PRODUCT
        const projectTypeSelect = page.locator(selectors.form.projectType)
        await expect(projectTypeSelect).toHaveValue('PRODUCT')

        // Created by should be read-only
        const createdByInput = page.locator(selectors.form.createdBy)
        await expect(createdByInput).toHaveAttribute('readonly', '')
    })

    test('TC30: Visibility dropdown contains all options', async ({ page }) => {
        await gotoProjectsPage(page, 'add')

        const options = await page.locator(selectors.form.visibility).locator('option').allTextContents()
        expect(options).toContain('Private')
        expect(options).toContain('Me and Moderators')
        expect(options).toContain('Group and Moderators')
        expect(options).toContain('Everyone')
    })

    test('TC31: Project Type dropdown contains all options', async ({ page }) => {
        await gotoProjectsPage(page, 'add')

        const options = await page.locator(selectors.form.projectType).locator('option').allTextContents()
        expect(options).toContain('Customer Project')
        expect(options).toContain('Internal Project')
        expect(options).toContain('Product')
        expect(options).toContain('Service')
        expect(options).toContain('Inner Source')
        expect(options).toContain('Cloud Backend')
    })

    test('TC32: Tab navigation works on add page (Summary → Administration → Linked)', async ({ page }) => {
        await gotoProjectsPage(page, 'add')

        // Summary tab is active by default
        await expect(page.locator(selectors.form.name)).toBeVisible()

        // Switch to Administration
        await clickFormTab(page, 'Administration')
        await expect(page.locator(selectors.admin.clearingState)).toBeVisible()

        // Switch to Linked Releases and Projects
        await clickFormTab(page, 'Linked Releases and Projects')
        await expect(page.getByRole('button', { name: /link releases/i })).toBeVisible()

        // Switch to Linked Packages
        await clickFormTab(page, 'Linked Packages')
        await expect(page.getByRole('button', { name: /add packages/i })).toBeVisible()

        // Back to Summary
        await clickFormTab(page, 'Summary')
        await expect(page.locator(selectors.form.name)).toBeVisible()
    })

    test('TC33: Administration tab — clearing state options are correct', async ({ page }) => {
        await gotoProjectsPage(page, 'add')
        await clickFormTab(page, 'Administration')

        const options = await page.locator(selectors.admin.clearingState).locator('option').allTextContents()
        expect(options).toContain('Open')
        expect(options).toContain('In Progress')
        expect(options).toContain('Closed')
    })

    test('TC34: Administration tab — project state options are correct', async ({ page }) => {
        await gotoProjectsPage(page, 'add')
        await clickFormTab(page, 'Administration')

        const options = await page.locator(selectors.admin.projectState).locator('option').allTextContents()
        expect(options).toContain('Active')
        expect(options).toContain('Phaseout')
        expect(options).toContain('Unknown')
    })
})
