// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { type APIRequestContext, type Page, expect } from '@playwright/test'
import { config } from '../../config'

/**
 * Navigate to a SW360 page
 */
export async function navigateTo(page: Page, path: string): Promise<void> {
    const url = `/${path}`.replace(/\/+/g, '/')
    await page.goto(url)
}

/**
 * Wait for page to finish loading (spinner gone, main content visible)
 */
export async function waitForPageLoad(page: Page): Promise<void> {
    // Wait for any loading spinners to disappear
    const spinner = page.locator('.spinner-border')
    if (await spinner.isVisible().catch(() => false)) {
        await spinner.waitFor({ state: 'hidden', timeout: 30000 })
    }
    // Wait for page content container
    await expect(page.locator('.page-content, .container')).toBeVisible({ timeout: 15000 })
}

/**
 * Get an API request context with admin authentication
 * Used for test data setup/teardown via the SW360 REST API
 */
export async function getApiToken(request: APIRequestContext): Promise<string> {
    const { email, password } = config.users.admin
    const credentials = Buffer.from(`${email}:${password}`).toString('base64')

    // Get OAuth token from SW360 API
    const response = await request.post(`${config.apiUrl}/authorization/client-management`, {
        headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/json',
        },
        data: {
            description: 'playwright-test-token',
            authorities: ['READ', 'WRITE'],
        },
    })

    if (response.ok()) {
        const data = await response.json()
        return data.token || data.access_token
    }

    // Fallback: use basic auth directly
    return `Basic ${credentials}`
}

/**
 * Create a project via the SW360 REST API (for test data setup)
 */
export async function createProjectViaApi(
    request: APIRequestContext,
    token: string,
    projectData: Record<string, unknown>,
): Promise<string> {
    const response = await request.post(`${config.apiUrl}/resource/api/projects`, {
        headers: {
            Authorization: token,
            'Content-Type': 'application/json',
        },
        data: projectData,
    })

    expect(response.status()).toBe(201)
    const data = await response.json()
    // Extract ID from _links.self.href
    const selfHref = data._links?.self?.href || ''
    return selfHref.split('/').pop() || data.id || ''
}

/**
 * Delete a project via the SW360 REST API (for test data teardown)
 */
export async function deleteProjectViaApi(
    request: APIRequestContext,
    token: string,
    projectId: string,
): Promise<void> {
    await request.delete(`${config.apiUrl}/resource/api/projects/${projectId}`, {
        headers: {
            Authorization: token,
        },
    })
}

/**
 * Fill a form field by its label text
 */
export async function fillFormField(page: Page, label: string, value: string): Promise<void> {
    await page.getByLabel(label).fill(value)
}

/**
 * Select an option from a dropdown/select by label
 */
export async function selectOption(page: Page, label: string, value: string): Promise<void> {
    await page.getByLabel(label).selectOption(value)
}

/**
 * Click a tab by its name
 */
export async function clickTab(page: Page, tabName: string): Promise<void> {
    await page.getByRole('link', { name: tabName }).click()
}

/**
 * Assert a toast/alert message appears with expected text
 */
export async function expectMessage(page: Page, text: string | RegExp): Promise<void> {
    await expect(page.locator('.alert, .toast-body').filter({ hasText: text })).toBeVisible({ timeout: 10000 })
}

/**
 * Confirm a delete dialog
 */
export async function confirmDeleteDialog(page: Page): Promise<void> {
    const dialog = page.locator('.modal.show')
    await expect(dialog).toBeVisible()
    await dialog.getByRole('button', { name: /delete|confirm|yes/i }).click()
    await dialog.waitFor({ state: 'hidden' })
}
