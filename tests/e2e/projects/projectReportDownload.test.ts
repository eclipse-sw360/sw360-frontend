// Copyright (C) Smit Barvaliya, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { expect, type Page, test } from '@playwright/test'

// Link format the backend e-mails when "send export to mail" is enabled
const reportDownloadUrl = '/en/reports/download?module=projects&token=missing-report-token&extendedByReleases=false'

const isReportDownloadApi = (url: URL) => url.pathname.endsWith('/resource/api/reports/download')

/** Make every report download API call fail with HTTP 500 and count the calls. */
async function failReportDownloads(page: Page): Promise<() => number> {
    let calls = 0
    await page.route(isReportDownloadApi, async (route) => {
        calls++
        await route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({
                message: 'Report file not found',
            }),
        })
    })
    return () => calls
}

/**
 * Projects Report Download Page — the page opened from the e-mailed export link.
 */
test.describe('Projects - Report Download Page', () => {
    test('TC90: failed download is attempted only once and shows an error', async ({ page }) => {
        const downloadCalls = await failReportDownloads(page)

        await page.goto(reportDownloadUrl)

        await expect(page.locator('.alert-danger')).toContainText('Download failed with status 500')

        // Give a re-trigger loop time to show up before counting
        await page.waitForTimeout(2000)
        expect(downloadCalls()).toBe(1)
    })

    test('TC91: Retry button sends exactly one new download request', async ({ page }) => {
        const downloadCalls = await failReportDownloads(page)

        await page.goto(reportDownloadUrl)
        const retryButton = page.getByRole('button', { name: 'Retry' })
        await expect(retryButton).toBeVisible()

        await retryButton.click()
        await expect(retryButton).toBeVisible()

        await page.waitForTimeout(2000)
        expect(downloadCalls()).toBe(2)
    })
})
