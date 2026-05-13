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
 * Navigate to a licenses-related page.
 */
export async function gotoLicensesPage(page: Page, subpath = ''): Promise<void> {
    const url = `/licenses${subpath ? `/${subpath}` : ''}`
    await page.goto(url, { waitUntil: 'domcontentloaded' })
    await waitForLicensePageLoad(page)
}

/**
 * Navigate to a license detail page.
 */
export async function gotoLicenseDetail(page: Page, shortName: string): Promise<void> {
    await page.goto(`/licenses/detail?id=${shortName}`, { waitUntil: 'domcontentloaded' })
    await waitForLicensePageLoad(page)
}

/**
 * Navigate to a license edit page.
 */
export async function gotoLicenseEdit(page: Page, shortName: string): Promise<void> {
    await page.goto(`/licenses/edit?id=${shortName}`, { waitUntil: 'domcontentloaded' })
    await waitForLicensePageLoad(page)
}

/**
 * Wait for the licenses page to fully load.
 */
export async function waitForLicensePageLoad(page: Page): Promise<void> {
    await page.waitForLoadState('domcontentloaded')
    const spinner = page.locator('.spinner-border')
    if (await spinner.isVisible().catch(() => false)) {
        await spinner.waitFor({ state: 'hidden', timeout: 30000 })
    }
    // Wait for content: form field (#fullName) on add/edit, table on list, or tab on detail
    const contentIndicator = page.locator('#fullName, .sw360-table, [role="tab"], table.summary-table').first()
    await contentIndicator.waitFor({ state: 'visible', timeout: 30000 }).catch(() => {
        // Fallback for non-standard layout
    })
    await page.waitForTimeout(500)
}

/**
 * Fill the license form fields.
 */
export async function fillLicenseForm(
    page: Page,
    data: {
        fullName?: string
        shortName?: string
        osiApproved?: string
        fsfLibre?: string
        isChecked?: boolean
        note?: string
        licenseText?: string
    },
): Promise<void> {
    if (data.fullName !== undefined) {
        const input = page.locator(selectors.form.fullName)
        await input.clear()
        await input.fill(data.fullName)
    }
    if (data.shortName !== undefined) {
        const input = page.locator(selectors.form.shortName)
        await input.clear()
        await input.fill(data.shortName)
    }
    if (data.osiApproved !== undefined) {
        await page.locator(selectors.form.osiApproved).selectOption(data.osiApproved)
    }
    if (data.fsfLibre !== undefined) {
        await page.locator(selectors.form.fsfLibre).selectOption(data.fsfLibre)
    }
    if (data.isChecked !== undefined) {
        const checkbox = page.locator(selectors.form.isChecked)
        const isCurrentlyChecked = await checkbox.isChecked()
        if (data.isChecked !== isCurrentlyChecked) {
            await checkbox.click()
        }
    }
    if (data.note !== undefined) {
        const input = page.locator(selectors.form.note)
        await input.clear()
        await input.fill(data.note)
    }
    if (data.licenseText !== undefined) {
        const input = page.locator(selectors.form.licenseText)
        await input.clear()
        await input.fill(data.licenseText)
    }
}

/**
 * Click a tab on the license detail/edit page.
 */
export async function clickTab(page: Page, tabSelector: string): Promise<void> {
    await page.locator(tabSelector).first().click()
    await page.waitForTimeout(500)
}

/**
 * Click a button that is wrapped in a Next.js <Link>, preventing
 * the Link's navigation so only the button's onClick fires.
 */
export async function clickButtonPreventingLink(buttonLocator: Locator): Promise<void> {
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

/**
 * Verify a success message appears.
 */
export async function expectSuccessMessage(page: Page, text?: string | RegExp): Promise<void> {
    const alertLocator = text
        ? page.locator(selectors.common.successAlert).filter({ hasText: text })
        : page.locator(selectors.common.successAlert)
    await expect(alertLocator.first()).toBeVisible({ timeout: 15000 })
}

/**
 * Verify an error message appears.
 */
export async function expectErrorMessage(page: Page, text?: string | RegExp): Promise<void> {
    const alertLocator = text
        ? page.locator(selectors.common.errorAlert).filter({ hasText: text })
        : page.locator(selectors.common.errorAlert)
    await expect(alertLocator.first()).toBeVisible({ timeout: 15000 })
}

// ─── API Helpers ─────────────────────────────────────────

function getBasicAuthToken(): string {
    const { email, password } = config.users.admin
    return `Basic ${Buffer.from(`${email}:${password}`).toString('base64')}`
}

/**
 * Create a license via REST API. Returns the license shortName (used as ID).
 */
export async function createLicenseApi(data: {
    fullName: string
    shortName: string
    note?: string
    text?: string
    OSIApproved?: string
    FSFLibre?: string
    checked?: boolean
}): Promise<string> {
    const token = getBasicAuthToken()
    const apiContext = await playwrightRequest.newContext()
    try {
        const payload = {
            fullName: data.fullName,
            shortName: data.shortName,
            note: data.note || '',
            text: data.text || '',
            OSIApproved: data.OSIApproved || 'NA',
            FSFLibre: data.FSFLibre || 'NA',
            checked: data.checked ?? true,
        }
        const response = await apiContext.post(`${config.apiUrl}/resource/api/licenses`, {
            headers: {
                Authorization: token,
                'Content-Type': 'application/json',
            },
            data: payload,
            timeout: 30000,
        })
        if (response.status() === 409) {
            // Already exists — return shortName
            return data.shortName
        }
        if (response.status() !== 201) {
            throw new Error(`API create license failed: ${response.status()} ${await response.text()}`)
        }
        return data.shortName
    } finally {
        await apiContext.dispose()
    }
}

/**
 * Delete a license via REST API.
 */
export async function deleteLicenseApi(shortName: string): Promise<void> {
    if (!shortName) return
    const token = getBasicAuthToken()
    const apiContext = await playwrightRequest.newContext()
    try {
        await apiContext.delete(`${config.apiUrl}/resource/api/licenses/${shortName}`, {
            headers: { Authorization: token },
            timeout: 30000,
        })
    } catch {
        // Ignore cleanup errors
    } finally {
        await apiContext.dispose()
    }
}

/**
 * Get a license via REST API.
 */
export async function getLicenseApi(shortName: string): Promise<Record<string, unknown> | null> {
    const token = getBasicAuthToken()
    const apiContext = await playwrightRequest.newContext()
    try {
        const response = await apiContext.get(`${config.apiUrl}/resource/api/licenses/${shortName}`, {
            headers: { Authorization: token },
            timeout: 30000,
        })
        if (response.status() === 200) {
            return await response.json()
        }
        return null
    } finally {
        await apiContext.dispose()
    }
}
