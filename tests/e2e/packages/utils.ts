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
 * Navigate to the packages list page.
 */
export async function gotoPackagesPage(page: Page, subpath = ''): Promise<void> {
    const url = `/packages${subpath ? `/${subpath}` : ''}`
    await page.goto(url, { waitUntil: 'domcontentloaded' })
    await waitForPackagePageLoad(page)
}

/**
 * Navigate to a package detail page.
 */
export async function gotoPackageDetail(page: Page, packageId: string): Promise<void> {
    await page.goto(`/packages/detail/${packageId}`, { waitUntil: 'domcontentloaded' })
    await waitForPackagePageLoad(page)
}

/**
 * Navigate to a package edit page.
 */
export async function gotoPackageEdit(page: Page, packageId: string): Promise<void> {
    await page.goto(`/packages/edit/${packageId}`, { waitUntil: 'domcontentloaded' })
    await waitForPackagePageLoad(page)
}

/**
 * Wait for the packages page to fully load.
 */
export async function waitForPackagePageLoad(page: Page): Promise<void> {
    await page.waitForLoadState('domcontentloaded')
    const spinner = page.locator(selectors.common.spinner)
    if (await spinner.first().isVisible().catch(() => false)) {
        await spinner.first().waitFor({ state: 'hidden', timeout: 30000 })
    }
    // Wait for form field or table to appear
    const contentIndicator = page.locator(`${selectors.form.name}, ${selectors.list.table}, ${selectors.detail.summaryTable}`).first()
    await contentIndicator.waitFor({ state: 'visible', timeout: 30000 }).catch(() => {
        // Fallback for non-standard layouts
    })
    await page.waitForTimeout(500)
}

/**
 * Fill the package form fields.
 */
export async function fillPackageForm(
    page: Page,
    data: {
        name?: string
        version?: string
        packageType?: string
        purl?: string
        vcs?: string
        homepageUrl?: string
        description?: string
    },
): Promise<void> {
    if (data.name !== undefined) {
        const input = page.locator(selectors.form.name)
        await input.clear()
        await input.fill(data.name)
    }
    if (data.version !== undefined) {
        const input = page.locator(selectors.form.version)
        await input.clear()
        await input.fill(data.version)
    }
    if (data.packageType !== undefined) {
        await page.locator(selectors.form.packageType).selectOption(data.packageType)
    }
    if (data.purl !== undefined) {
        const input = page.locator(selectors.form.purl)
        await input.clear()
        await input.fill(data.purl)
    }
    if (data.vcs !== undefined) {
        const input = page.locator(selectors.form.vcs)
        await input.clear()
        await input.fill(data.vcs)
    }
    if (data.homepageUrl !== undefined) {
        const input = page.locator(selectors.form.homepageUrl)
        await input.clear()
        await input.fill(data.homepageUrl)
    }
    if (data.description !== undefined) {
        const input = page.locator(selectors.form.description)
        await input.clear()
        await input.fill(data.description)
    }
}

/**
 * Click a tab on the package detail page.
 */
export async function clickTab(page: Page, tabSelector: string): Promise<void> {
    await page.locator(tabSelector).first().click()
    await page.waitForTimeout(500)
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
 * Create a package via REST API. Returns the package ID.
 */
export async function createPackageApi(data: {
    name: string
    version: string
    packageType: string
    purl: string
    vcs?: string
    homepageUrl?: string
    description?: string
    packageManager?: string
    licenseIds?: string[]
}): Promise<string> {
    const token = getBasicAuthToken()
    const apiContext = await playwrightRequest.newContext()
    try {
        // Derive packageManager from PURL if not provided
        let packageManager = data.packageManager
        if (!packageManager && data.purl) {
            const purlMatch = data.purl.match(/^pkg:([^/]+)\//)
            if (purlMatch) {
                packageManager = purlMatch[1].toUpperCase()
            }
        }

        const payload: Record<string, unknown> = {
            name: data.name,
            version: data.version,
            packageType: data.packageType,
            purl: data.purl,
            packageManager: packageManager || 'NPM',
            vcs: data.vcs || '',
            homepageUrl: data.homepageUrl || '',
            description: data.description || '',
        }
        if (data.licenseIds) {
            payload.licenseIds = data.licenseIds
        }

        const response = await apiContext.post(`${config.apiUrl}/resource/api/packages`, {
            headers: {
                Authorization: token,
                'Content-Type': 'application/json',
            },
            data: payload,
            timeout: 30000,
        })

        if (response.status() === 409) {
            // Already exists — try to get by purl
            return 'conflict'
        }
        if (response.status() !== 201) {
            throw new Error(`API create package failed: ${response.status()} ${await response.text()}`)
        }

        const body = await response.json()
        // Extract ID from self link
        const selfHref: string = body._links?.self?.href ?? ''
        const id = selfHref.split('/').pop() ?? ''
        return id
    } finally {
        await apiContext.dispose()
    }
}

/**
 * Delete a package via REST API.
 */
export async function deletePackageApi(packageId: string): Promise<void> {
    if (!packageId || packageId === 'conflict') return
    const token = getBasicAuthToken()
    const apiContext = await playwrightRequest.newContext()
    try {
        await apiContext.delete(`${config.apiUrl}/resource/api/packages/${packageId}`, {
            headers: { Authorization: token },
            timeout: 30000,
        })
    } finally {
        await apiContext.dispose()
    }
}

/**
 * Get a package via REST API.
 */
export async function getPackageApi(packageId: string): Promise<Record<string, unknown> | null> {
    const token = getBasicAuthToken()
    const apiContext = await playwrightRequest.newContext()
    try {
        const response = await apiContext.get(`${config.apiUrl}/resource/api/packages/${packageId}`, {
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
