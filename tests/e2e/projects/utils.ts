// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { expect, type Page, request as playwrightRequest } from '@playwright/test'
import { config } from '../../config'
import { selectors } from './selectors'

/**
 * Navigate to a projects-related page.
 */
export async function gotoProjectsPage(page: Page, subpath = ''): Promise<void> {
    const url = `/projects${subpath ? `/${subpath}` : ''}`
    await page.goto(url)
    await waitForProjectPageLoad(page)
}

/**
 * Wait for the projects page to fully load (spinner hidden, content visible, React hydrated).
 */
export async function waitForProjectPageLoad(page: Page): Promise<void> {
    // Wait for the main page spinner to disappear (use specific selector for page-level spinner)
    const spinner = page.locator('.spinner.spinner-border')
    if (await spinner.isVisible().catch(() => false)) {
        await spinner.waitFor({ state: 'hidden', timeout: 30000 })
    }
    // Wait for DOM to be ready — avoid networkidle as Next.js dev HMR keeps connections open
    await page.waitForLoadState('domcontentloaded')
    // Give React a moment to hydrate
    await page.waitForTimeout(1000)
}

/**
 * Fill the project summary form (General Information section).
 */
export async function fillProjectSummary(
    page: Page,
    data: {
        name?: string
        version?: string
        visibility?: string
        projectType?: string
        tag?: string
        description?: string
    },
): Promise<void> {
    if (data.name !== undefined) {
        const nameInput = page.locator(selectors.form.name)
        await nameInput.clear()
        await nameInput.fill(data.name)
    }
    if (data.version !== undefined) {
        const versionInput = page.locator(selectors.form.version)
        await versionInput.clear()
        await versionInput.fill(data.version)
    }
    if (data.visibility !== undefined) {
        await page.locator(selectors.form.visibility).selectOption(data.visibility)
    }
    if (data.projectType !== undefined) {
        await page.locator(selectors.form.projectType).selectOption(data.projectType)
    }
    if (data.tag !== undefined) {
        const tagInput = page.locator(selectors.form.tag)
        await tagInput.clear()
        await tagInput.fill(data.tag)
    }
    if (data.description !== undefined) {
        const descInput = page.locator(selectors.form.description)
        await descInput.clear()
        await descInput.fill(data.description)
    }
}

/**
 * Fill the administration clearing fields.
 */
export async function fillAdministrationClearing(
    page: Page,
    data: {
        clearingState?: string
        clearingTeam?: string
        clearingSummary?: string
        specialRisksOSS?: string
        generalRisks3rdParty?: string
        specialRisks3rdParty?: string
        deliveryChannels?: string
        remarksAdditionalRequirements?: string
    },
): Promise<void> {
    if (data.clearingState) {
        await page.locator(selectors.admin.clearingState).selectOption(data.clearingState)
    }
    if (data.clearingTeam) {
        await page.locator(selectors.admin.clearingTeam).selectOption({ label: data.clearingTeam })
    }
    if (data.clearingSummary) {
        const input = page.locator(selectors.admin.clearingSummary)
        await input.clear()
        await input.fill(data.clearingSummary)
    }
    if (data.specialRisksOSS) {
        const input = page.locator(selectors.admin.specialRisksOSS)
        await input.clear()
        await input.fill(data.specialRisksOSS)
    }
    if (data.generalRisks3rdParty) {
        const input = page.locator(selectors.admin.generalRisks3rdParty)
        await input.clear()
        await input.fill(data.generalRisks3rdParty)
    }
    if (data.specialRisks3rdParty) {
        const input = page.locator(selectors.admin.specialRisks3rdParty)
        await input.clear()
        await input.fill(data.specialRisks3rdParty)
    }
    if (data.deliveryChannels) {
        const input = page.locator(selectors.admin.deliveryChannels)
        await input.clear()
        await input.fill(data.deliveryChannels)
    }
    if (data.remarksAdditionalRequirements) {
        const input = page.locator(selectors.admin.remarksAdditionalRequirements)
        await input.clear()
        await input.fill(data.remarksAdditionalRequirements)
    }
}

/**
 * Create a project via the UI (fills form + clicks Create).
 * Waits for redirect to detail page.
 * Returns the project ID from the URL.
 */
export async function createProjectViaUI(
    page: Page,
    data: {
        name: string
        version: string
        visibility?: string
        projectType?: string
        tag?: string
        description?: string
    },
): Promise<string> {
    await gotoProjectsPage(page, 'add')
    await fillProjectSummary(page, data)
    await page.locator(selectors.actions.createProject).click()
    await page.waitForURL('**/projects/detail/**', { timeout: 20000 })
    // Extract project ID from URL
    const url = page.url()
    const id = url.split('/projects/detail/').pop()?.split('?')[0] || ''
    return id
}

/**
 * Delete a project via the delete dialog on the detail page.
 */
export async function deleteProjectFromDetailPage(page: Page, comment: string): Promise<void> {
    // Click the Delete Project button in the detail page header
    await page.locator(selectors.detailActions.deleteButton).click()
    const modal = page.locator(selectors.deleteDialog.modal)
    await expect(modal).toBeVisible()

    // Type the required comment
    await modal.locator('textarea').fill(comment)

    // Click confirm delete
    await page.locator(selectors.deleteDialog.confirmButton).click()
}

/**
 * Navigate to the edit page from a project detail page.
 */
export async function gotoEditFromDetail(page: Page): Promise<void> {
    await page.locator(selectors.detailActions.editButton).click()
    await page.waitForURL('**/projects/edit/**', { timeout: 15000 })
    await waitForProjectPageLoad(page)
}

/**
 * Click a tab in the add/edit form.
 */
export async function clickFormTab(page: Page, tabName: string): Promise<void> {
    await page.getByText(tabName, { exact: true }).click()
    // Brief wait for tab content to render
    await page.waitForTimeout(300)
}

/**
 * Click a tab in the detail page.
 */
export async function clickDetailTab(page: Page, tabName: string | RegExp): Promise<void> {
    await page.getByRole('tab', { name: tabName }).first().click()
    await page.waitForTimeout(500)
}

/**
 * Verify a success message appears (toast or alert).
 */
export async function expectSuccessMessage(page: Page, text?: string | RegExp): Promise<void> {
    const alertLocator = text
        ? page.locator(selectors.common.successAlert).filter({ hasText: text })
        : page.locator(selectors.common.successAlert)
    await expect(alertLocator.first()).toBeVisible({ timeout: 10000 })
}

/**
 * Verify an error message appears (toast or alert).
 */
export async function expectErrorMessage(page: Page, text?: string | RegExp): Promise<void> {
    const alertLocator = text
        ? page.locator(selectors.common.errorAlert).filter({ hasText: text })
        : page.locator(selectors.common.errorAlert)
    await expect(alertLocator.first()).toBeVisible({ timeout: 10000 })
}

// ─── API Helpers for test setup/teardown ─────────────────

function getBasicAuthToken(): string {
    const { email, password } = config.users.admin
    return `Basic ${Buffer.from(`${email}:${password}`).toString('base64')}`
}

/**
 * Create a project via REST API. Use in beforeAll for fast, reliable setup.
 * Returns the project ID.
 */
export async function createProjectApi(data: {
    name: string
    version: string
    visibility?: string
    projectType?: string
    description?: string
    tag?: string
}): Promise<string> {
    const token = getBasicAuthToken()
    const apiContext = await playwrightRequest.newContext()
    try {
        const projectData = {
            name: data.name,
            version: data.version || '1.0.0',
            visibility: data.visibility || 'EVERYONE',
            projectType: data.projectType || 'PRODUCT',
            description: data.description || '',
            tag: data.tag || '',
        }
        let response = await apiContext.post(`${config.apiUrl}/resource/api/projects`, {
            headers: {
                Authorization: token,
                'Content-Type': 'application/json',
            },
            data: projectData,
        })
        // If 409 (name conflict), append random suffix and retry
        if (response.status() === 409) {
            projectData.name = `${data.name} ${Math.random().toString(36).slice(2, 6)}`
            response = await apiContext.post(`${config.apiUrl}/resource/api/projects`, {
                headers: {
                    Authorization: token,
                    'Content-Type': 'application/json',
                },
                data: projectData,
            })
        }
        if (response.status() !== 201) {
            throw new Error(`API create project failed: ${response.status()} ${await response.text()}`)
        }
        const body = await response.json()
        const selfHref: string = body._links?.self?.href || ''
        return selfHref.split('/').pop() || body.id || ''
    } finally {
        await apiContext.dispose()
    }
}

/**
 * Delete a project via REST API. Use in afterAll for cleanup.
 */
export async function deleteProjectApi(projectId: string): Promise<void> {
    if (!projectId) return
    const token = getBasicAuthToken()
    const apiContext = await playwrightRequest.newContext()
    try {
        await apiContext.delete(`${config.apiUrl}/resource/api/projects/${projectId}`, {
            headers: { Authorization: token },
            timeout: 30000,
        })
    } catch {
        // Ignore cleanup errors — project may already be deleted
    } finally {
        await apiContext.dispose()
    }
}
