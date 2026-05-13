// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { Page, expect } from '@playwright/test'
import { selectors } from './selectors'
import { fixtures } from './fixtures'
import { config } from '../../config'

/**
 * Utility helpers for the Search module E2E tests.
 */

/** Navigate to the search page and wait for session to be ready */
export async function navigateToSearch(page: Page): Promise<void> {
    await page.goto(`${config.baseUrl}/${config.locale}${fixtures.searchUrl}`)
    await page.waitForSelector(selectors.sidebar.card)
    // Wait for session to be authenticated (next-auth session call)
    await page.waitForResponse(
        (resp) => resp.url().includes('/api/auth/session') && resp.status() === 200,
        { timeout: 15000 },
    ).catch(() => {})
    await page.waitForTimeout(300)
}

/** Perform a keyword search and wait for results */
export async function performSearch(page: Page, keyword: string): Promise<void> {
    const input = page.locator(selectors.sidebar.searchInput)
    await input.fill(keyword)

    // Listen for the search API response before clicking
    const responsePromise = page.waitForResponse(
        (resp) => resp.url().includes('/resource/api/search') && resp.request().method() === 'GET',
        { timeout: 20000 },
    ).catch(() => null)

    await page.click(selectors.buttons.search)
    await responsePromise
    // Allow React state to update and re-render
    await page.waitForTimeout(500)
}

/** Check a type checkbox by its selector */
export async function checkTypeFilter(page: Page, checkboxSelector: string): Promise<void> {
    const checkbox = page.locator(checkboxSelector)
    if (!(await checkbox.isChecked())) {
        await checkbox.check()
    }
}

/** Uncheck a type checkbox by its selector */
export async function uncheckTypeFilter(page: Page, checkboxSelector: string): Promise<void> {
    const checkbox = page.locator(checkboxSelector)
    if (await checkbox.isChecked()) {
        await checkbox.uncheck()
    }
}

/** Get result count from the header text */
export async function getResultCount(page: Page): Promise<number> {
    const headerText = await page.locator(selectors.results.headerTitle).textContent()
    const match = headerText?.match(/\((\d+)\)/)
    return match ? parseInt(match[1], 10) : 0
}

/** Verify that all type checkboxes are unchecked */
export async function verifyAllUnchecked(page: Page): Promise<void> {
    for (const selector of Object.values(selectors.checkboxes)) {
        await expect(page.locator(selector)).not.toBeChecked()
    }
}
