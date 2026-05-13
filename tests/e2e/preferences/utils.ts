// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { Page } from '@playwright/test'
import { config } from '../../config'
import { fixtures } from './fixtures'
import { selectors } from './selectors'

/** Navigate to the Preferences page and wait for it to load */
export async function navigateToPreferences(page: Page): Promise<void> {
    await page.goto(`${config.baseUrl}/${config.locale}${fixtures.preferencesUrl}`)
    await page.waitForSelector(selectors.page.container)
    await page.waitForResponse(
        (resp) => resp.url().includes('/api/auth/session') && resp.status() === 200,
        { timeout: 15000 },
    ).catch(() => {})
    await page.waitForTimeout(500)
}
