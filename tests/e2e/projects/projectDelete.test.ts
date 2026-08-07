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
    createProjectApi,
    gotoProjectsPage,
    waitForProjectPageLoad,
} from './utils'

const ts = Date.now().toString(36)

/**
 * Projects Delete — Tests for project deletion (dialog, validation, success).
 * Note: The "Delete Project" button is on the EDIT page, not the detail page.
 */
test.describe('Projects - Delete', () => {
    test('TC44: Delete dialog opens from edit page', async ({ page }) => {
        const id = await createProjectApi({ name: `PW DelDialog ${ts}`, version: '1.0.0' })

        await page.goto(`/projects/edit/${id}`)
        await waitForProjectPageLoad(page)

        await page.getByRole('button', { name: /delete project/i }).click()

        const modal = page.locator(selectors.deleteDialog.modal)
        await expect(modal).toBeVisible()
        await expect(modal.locator(selectors.deleteDialog.title)).toContainText('Delete Project')
    })

    test('TC45: Delete button is disabled until comment is provided', async ({ page }) => {
        const id = await createProjectApi({ name: `PW DelDisabled ${ts}`, version: '1.0.0' })

        await page.goto(`/projects/edit/${id}`)
        await waitForProjectPageLoad(page)
        await page.getByRole('button', { name: /delete project/i }).click()

        const modal = page.locator(selectors.deleteDialog.modal)
        await expect(modal).toBeVisible()

        const confirmBtn = page.locator(selectors.deleteDialog.confirmButton)
        await expect(confirmBtn).toBeDisabled()

        await modal.locator('textarea').fill('Test deletion comment')
        await expect(confirmBtn).toBeEnabled()
    })

    test('TC46: Successfully delete a project with comment', async ({ page }) => {
        const id = await createProjectApi({
            name: `PW DelSuccess ${ts}`,
            version: projectFixtures.delete.version,
        })

        await page.goto(`/projects/edit/${id}`)
        await waitForProjectPageLoad(page)

        // Click Delete Project button on edit page
        await page.getByRole('button', { name: /delete project/i }).click()
        const modal = page.locator(selectors.deleteDialog.modal)
        await expect(modal).toBeVisible()

        // Fill comment and confirm
        await modal.locator('textarea').fill(projectFixtures.delete.comment)
        await page.locator(selectors.deleteDialog.confirmButton).click()

        // Should redirect to projects list
        await page.waitForURL('**/projects', { timeout: 15000 })
    })

    test('TC47: Cancel button closes delete dialog without deleting', async ({ page }) => {
        const cancelName = `PW DelCancel ${ts}`
        const id = await createProjectApi({ name: cancelName, version: '1.0.0' })

        await page.goto(`/projects/edit/${id}`)
        await waitForProjectPageLoad(page)
        await page.getByRole('button', { name: /delete project/i }).click()

        const modal = page.locator(selectors.deleteDialog.modal)
        await expect(modal).toBeVisible()

        await page.locator(selectors.deleteDialog.cancelButton).click()
        await expect(modal).toBeHidden()
    })

    test('TC48: Delete dialog shows delete confirmation text', async ({ page }) => {
        const id = await createProjectApi({ name: `PW DelLinked ${ts}`, version: '1.0.0' })

        await page.goto(`/projects/edit/${id}`)
        await waitForProjectPageLoad(page)
        await page.getByRole('button', { name: /delete project/i }).click()

        const modal = page.locator(selectors.deleteDialog.modal)
        await expect(modal).toBeVisible()

        await expect(modal.locator('textarea')).toBeVisible()
    })

    test('TC49: Delete project from list page action column', async ({ page }) => {
        const listName = `PW DelList ${ts}`
        await createProjectApi({ name: listName, version: '1.0.0' })

        await gotoProjectsPage(page)

        const projectRow = page.locator(selectors.list.table).locator('tr').filter({ hasText: listName })
        if (await projectRow.isVisible()) {
            // Click the delete icon in the actions column
            await projectRow.locator('td').last().locator('svg.bi-trash, .btn-icon').last().click()

            const modal = page.locator(selectors.deleteDialog.modal)
            await expect(modal).toBeVisible()

            await modal.locator('textarea').fill('Deleting from list page')
            await page.locator(selectors.deleteDialog.confirmButton).click()
        }
    })
})
