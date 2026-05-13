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
    deleteProjectApi,
    fillProjectSummary,
    gotoEditFromDetail,
    gotoProjectsPage,
    waitForProjectPageLoad,
} from './utils'

/**
 * Projects Update — Tests for editing existing projects.
 */
test.describe('Projects - Update', () => {
    let projectId: string

    test.beforeAll(async () => {
        projectId = await createProjectApi({
            name: projectFixtures.update.original.name,
            version: projectFixtures.update.original.version,
            visibility: projectFixtures.update.original.visibility,
            projectType: projectFixtures.update.original.projectType,
            description: projectFixtures.update.original.description,
        })
    })

    test.afterAll(async () => {
        await deleteProjectApi(projectId)
    })

    test('TC35: Navigate to edit page from detail page', async ({ page }) => {
        await page.goto(`/projects/detail/${projectId}`)
        await waitForProjectPageLoad(page)

        await gotoEditFromDetail(page)
        expect(page.url()).toContain(`/projects/edit/${projectId}`)
    })

    test('TC36: Edit page pre-populates existing project data', async ({ page }) => {
        await page.goto(`/projects/edit/${projectId}`)
        await waitForProjectPageLoad(page)

        const nameInput = page.locator(selectors.form.name)
        await expect(nameInput).toHaveValue(projectFixtures.update.original.name)

        const versionInput = page.locator(selectors.form.version)
        await expect(versionInput).toHaveValue(projectFixtures.update.original.version)
    })

    test('TC37: Update project name and version', async ({ page }) => {
        await page.goto(`/projects/edit/${projectId}`)
        await waitForProjectPageLoad(page)

        const modified = projectFixtures.update.modified
        await fillProjectSummary(page, {
            name: modified.name,
            version: modified.version,
            description: modified.description,
        })

        await page.locator(selectors.actions.updateProject).click()

        // Should redirect to detail page
        await page.waitForURL('**/projects/detail/**', { timeout: 20000 })
    })

    test('TC38: Updated values persist after save', async ({ page }) => {
        // Re-do the update in case TC37 had timing issues, then verify
        await page.goto(`/projects/edit/${projectId}`)
        await waitForProjectPageLoad(page)

        const modified = projectFixtures.update.modified
        await fillProjectSummary(page, {
            name: modified.name,
            version: modified.version,
        })
        await page.locator(selectors.actions.updateProject).click()
        await page.waitForURL('**/projects/detail/**', { timeout: 30000 })
        await waitForProjectPageLoad(page)

        await expect(page.getByText(modified.name).first()).toBeVisible({ timeout: 10000 })
    })

    test('TC39: Update project type via dropdown', async ({ page }) => {
        await page.goto(`/projects/edit/${projectId}`)
        await waitForProjectPageLoad(page)

        await page.locator(selectors.form.projectType).selectOption('SERVICE')
        await page.locator(selectors.actions.updateProject).click()

        await page.waitForURL('**/projects/detail/**', { timeout: 20000 })
    })

    test('TC40: Update administration clearing fields', async ({ page }) => {
        await page.goto(`/projects/edit/${projectId}`)
        await waitForProjectPageLoad(page)

        await clickFormTab(page, 'Administration')

        await page.locator(selectors.admin.clearingSummary).fill('Updated clearing summary')

        // clearingTeam is a <select>, use selectOption
        // Go back to Summary tab to submit (button is above tabs)
        await page.locator(selectors.actions.updateProject).click()
        await page.waitForURL('**/projects/detail/**', { timeout: 20000 })
    })

    test('TC41: Edit page has Delete Project button', async ({ page }) => {
        await page.goto(`/projects/edit/${projectId}`)
        await waitForProjectPageLoad(page)

        await expect(page.getByRole('button', { name: /delete project/i })).toBeVisible()
    })

    test('TC42: Cancel on edit page returns to projects list', async ({ page }) => {
        await page.goto(`/projects/edit/${projectId}`)
        await waitForProjectPageLoad(page)

        await page.getByRole('button', { name: 'Cancel' }).click()
        await page.waitForURL('**/projects', { timeout: 10000 })
    })

    test('TC43: Edit page shows all form tabs', async ({ page }) => {
        await page.goto(`/projects/edit/${projectId}`)
        await waitForProjectPageLoad(page)

        await expect(page.getByText('Summary', { exact: true }).first()).toBeVisible()
        await expect(page.getByText('Administration', { exact: true }).first()).toBeVisible()
        await expect(page.getByText('Linked Releases and Projects')).toBeVisible()
        await expect(page.getByText('Linked Packages').first()).toBeVisible()
    })
})
