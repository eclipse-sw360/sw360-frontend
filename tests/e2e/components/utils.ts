// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { expect, type Locator, type Page, request as playwrightRequest } from '@playwright/test'
import { config } from '../../config'
import { selectors } from './selectors'

/**
 * Navigate to a components-related page.
 */
export async function gotoComponentsPage(page: Page, subpath = ''): Promise<void> {
    const url = `/components${subpath ? `/${subpath}` : ''}`
    await page.goto(url)
    await waitForComponentPageLoad(page)
}

/**
 * Wait for the components page to fully load.
 * Waits for the spinner to disappear and for meaningful content to render
 * (form fields on edit/add pages, or table on list/detail pages).
 */
export async function waitForComponentPageLoad(page: Page): Promise<void> {
    await page.waitForLoadState('domcontentloaded')
    const spinner = page.locator('.spinner.spinner-border')
    if (await spinner.isVisible().catch(() => false)) {
        await spinner.waitFor({ state: 'hidden', timeout: 30000 })
    }
    // Wait for actual content — form field (#name) on add/edit, or table/tab on list/detail
    const contentIndicator = page.locator('#name, .sw360-table, [role="tab"]').first()
    await contentIndicator.waitFor({ state: 'visible', timeout: 30000 }).catch(() => {
        // Fallback: page might be a non-standard layout — just wait a bit
    })
    // Short stabilization wait for React hydration / data binding
    await page.waitForTimeout(500)
}

/**
 * Fill the component summary form.
 */
export async function fillComponentSummary(
    page: Page,
    data: {
        name?: string
        categories?: string
        componentType?: string
        homepage?: string
        blogUrl?: string
        wikiUrl?: string
        mailingListUrl?: string
        description?: string
    },
): Promise<void> {
    if (data.name !== undefined) {
        const nameInput = page.locator(selectors.form.name)
        await nameInput.clear()
        await nameInput.fill(data.name)
    }
    if (data.categories !== undefined) {
        const catInput = page.locator(selectors.form.categories)
        await catInput.clear()
        await catInput.fill(data.categories)
        // Dismiss autocomplete dropdown by pressing Escape then clicking elsewhere
        await catInput.press('Escape')
        await page.waitForTimeout(300)
    }
    if (data.componentType !== undefined) {
        await page.locator(selectors.form.componentType).selectOption(data.componentType)
    }
    if (data.homepage !== undefined) {
        const input = page.locator(selectors.form.homepage)
        await input.clear()
        await input.fill(data.homepage)
    }
    if (data.blogUrl !== undefined) {
        const input = page.locator(selectors.form.blogUrl)
        await input.clear()
        await input.fill(data.blogUrl)
    }
    if (data.wikiUrl !== undefined) {
        const input = page.locator(selectors.form.wikiUrl)
        await input.clear()
        await input.fill(data.wikiUrl)
    }
    if (data.mailingListUrl !== undefined) {
        const input = page.locator(selectors.form.mailingListUrl)
        await input.clear()
        await input.fill(data.mailingListUrl)
    }
    if (data.description !== undefined) {
        const descInput = page.locator(selectors.form.description)
        await descInput.clear()
        await descInput.fill(data.description)
    }
}

/**
 * Click a tab on the detail page.
 */
export async function clickDetailTab(page: Page, tabName: string | RegExp): Promise<void> {
    await page.getByRole('tab', { name: tabName }).first().click()
    await page.waitForTimeout(500)
}

/**
 * Click a tab on the edit page.
 */
export async function clickEditTab(page: Page, tabName: string): Promise<void> {
    await page.getByText(tabName, { exact: true }).first().click()
    await page.waitForTimeout(300)
}

/**
 * Navigate to edit page from a component detail page.
 */
export async function gotoEditFromDetail(page: Page): Promise<void> {
    await page.locator(selectors.detailActions.editButton).first().click()
    await page.waitForURL('**/components/edit/**', { timeout: 15000 })
    await waitForComponentPageLoad(page)
}

/**
 * Verify a success message appears.
 */
export async function expectSuccessMessage(page: Page, text?: string | RegExp): Promise<void> {
    const alertLocator = text
        ? page.locator(selectors.common.successAlert).filter({ hasText: text })
        : page.locator(selectors.common.successAlert)
    await expect(alertLocator.first()).toBeVisible({ timeout: 10000 })
}

/**
 * Verify an error message appears.
 */
export async function expectErrorMessage(page: Page, text?: string | RegExp): Promise<void> {
    const alertLocator = text
        ? page.locator(selectors.common.errorAlert).filter({ hasText: text })
        : page.locator(selectors.common.errorAlert)
    await expect(alertLocator.first()).toBeVisible({ timeout: 10000 })
}

/**
 * Click a button that is wrapped in a Next.js <Link>, preventing
 * the Link's navigation so only the button's onClick fires.
 *
 * PageButtonHeader wraps every button in <Link href={...}><button onClick={...}/></Link>.
 * If the Link's href points to the same page (e.g. Update Component), the
 * client-side navigation can reset React state and abort the async onClick handler.
 *
 * Strategy: Remove the parent anchor's href temporarily, click the button,
 * then restore it. This lets the button's React onClick fire without Link interference.
 */
export async function clickButtonPreventingLink(buttonLocator: Locator): Promise<void> {
    // Remove the parent <a>'s href so Next.js Link doesn't trigger navigation
    const hadHref = await buttonLocator.evaluate((btn) => {
        const anchor = btn.closest('a')
        if (anchor && anchor.hasAttribute('href')) {
            anchor.dataset.originalHref = anchor.getAttribute('href') || ''
            anchor.removeAttribute('href')
            return true
        }
        return false
    })
    await buttonLocator.click()
    // Allow the async onClick to start before restoring
    await buttonLocator.page().waitForTimeout(200)
    if (hadHref) {
        await buttonLocator.evaluate((btn) => {
            const anchor = btn.closest('a')
            if (anchor && anchor.dataset.originalHref !== undefined) {
                anchor.setAttribute('href', anchor.dataset.originalHref)
                delete anchor.dataset.originalHref
            }
        }).catch(() => { /* element may have navigated away */ })
    }
}

// ─── API Helpers ─────────────────────────────────────────

function getBasicAuthToken(): string {
    const { email, password } = config.users.admin
    return `Basic ${Buffer.from(`${email}:${password}`).toString('base64')}`
}

/**
 * Create a component via REST API. Returns the component ID.
 */
export async function createComponentApi(data: {
    name: string
    categories?: string
    componentType?: string
    description?: string
}): Promise<string> {
    const token = getBasicAuthToken()
    const apiContext = await playwrightRequest.newContext()
    try {
        const componentData = {
            name: data.name,
            categories: data.categories ? [data.categories] : ['Library'],
            componentType: data.componentType || 'OSS',
            description: data.description || '',
        }
        let response = await apiContext.post(`${config.apiUrl}/resource/api/components`, {
            headers: {
                Authorization: token,
                'Content-Type': 'application/json',
            },
            data: componentData,
            timeout: 30000,
        })
        if (response.status() === 409) {
            componentData.name = `${data.name} ${Math.random().toString(36).slice(2, 6)}`
            response = await apiContext.post(`${config.apiUrl}/resource/api/components`, {
                headers: {
                    Authorization: token,
                    'Content-Type': 'application/json',
                },
                data: componentData,
                timeout: 30000,
            })
        }
        if (response.status() !== 201) {
            throw new Error(`API create component failed: ${response.status()} ${await response.text()}`)
        }
        const body = await response.json()
        const selfHref: string = body._links?.self?.href || ''
        return selfHref.split('/').pop() || body.id || ''
    } finally {
        await apiContext.dispose()
    }
}

/**
 * Delete a component via REST API.
 */
export async function deleteComponentApi(componentId: string): Promise<void> {
    if (!componentId) return
    const token = getBasicAuthToken()
    const apiContext = await playwrightRequest.newContext()
    try {
        await apiContext.delete(`${config.apiUrl}/resource/api/components/${componentId}`, {
            headers: { Authorization: token },
            timeout: 30000,
        })
    } catch {
        // Ignore cleanup errors
    } finally {
        await apiContext.dispose()
    }
}
