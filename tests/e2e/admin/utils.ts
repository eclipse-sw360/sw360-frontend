// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { Page } from '@playwright/test'
import { config } from '../../config'
import { fixtures } from './fixtures'

/** Navigate to the admin dashboard page */
export async function navigateToAdmin(page: Page): Promise<void> {
    await page.goto(`${config.baseUrl}/${config.locale}${fixtures.urls.admin}`, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
    })
    await page.waitForURL(/\/((en)\/)?admin$/, { timeout: 10000 })
    await page.waitForSelector('.admin-button, .buttonheader-title', { timeout: 10000 })
}

/** Navigate to a specific admin sub-page */
export async function navigateToAdminPage(page: Page, path: string): Promise<void> {
    await page.goto(`${config.baseUrl}/${config.locale}${path}`, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
    })
    await page.waitForURL((url) => url.pathname.endsWith(path), { timeout: 10000 }).catch(() => {})
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {})
    await page.waitForSelector('.container.page-content, .buttonheader-title, .sw360-table', { timeout: 8000 }).catch(() => {})
}
