// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { expect, type Page, test } from '@playwright/test'
import ExportReportFormat from '../../../src/object-types/enums/ExportReportFormat'
import { selectors } from './selectors'
import {
    clickButtonPreventingLink,
    clickDetailTab,
    createComponentApi,
    deleteComponentApi,
    gotoComponentsPage,
    waitForComponentPageLoad,
} from './utils'

const ts = Date.now().toString(36)

/**
 * Components Workflows — Import SBOM, Export, Release Overview tab, Merge/Split navigation.
 */
test.describe('Components - Workflows', () => {
    // ─── Import SBOM ─────────────────────────────────────

    test.describe('Import SBOM', () => {
        test('TC62: Import SBOM button opens dialog', async ({ page }) => {
            await gotoComponentsPage(page)
            const importBtn = page.locator(selectors.list.importSBOMButton).first()
            if (await importBtn.isVisible().catch(() => false)) {
                await importBtn.click()
                await expect(page.locator(selectors.importSbom.modal)).toBeVisible({ timeout: 10000 })
            } else {
                // Button might not be present for all users
                test.skip()
            }
        })

        test('TC63: Import SBOM dialog has file input', async ({ page }) => {
            await gotoComponentsPage(page)
            const importBtn = page.locator(selectors.list.importSBOMButton).first()
            if (await importBtn.isVisible().catch(() => false)) {
                await importBtn.click()
                await expect(page.locator(selectors.importSbom.modal)).toBeVisible({ timeout: 10000 })
                // File input is hidden (d-none) but should exist in DOM
                const fileInput = page.locator(selectors.importSbom.fileInput)
                await expect(fileInput).toBeAttached()
            } else {
                test.skip()
            }
        })

        test('TC64: Import SBOM dialog can be closed', async ({ page }) => {
            await gotoComponentsPage(page)
            const importBtn = page.locator(selectors.list.importSBOMButton).first()
            if (await importBtn.isVisible().catch(() => false)) {
                await importBtn.click()
                await expect(page.locator(selectors.importSbom.modal)).toBeVisible({ timeout: 10000 })
                await page.locator(selectors.importSbom.closeButton).first().click()
                await expect(page.locator(selectors.importSbom.modal)).toBeHidden({ timeout: 5000 })
            } else {
                test.skip()
            }
        })
    })

    test.describe('Export List', () => {
        async function openExportModal(page: Page, mailEnabled = false) {
            await page.addInitScript((enabled) => {
                const cached = JSON.parse(localStorage.getItem('sw360BackendConfig') ?? 'null')
                localStorage.setItem('sw360BackendConfig', JSON.stringify({
                    data: { ...cached?.data, 'send.export.to.mail.enabled': String(enabled) },
                    timestamp: Date.now(),
                }))
            }, mailEnabled)
            await gotoComponentsPage(page)
            await page.locator(selectors.list.exportListButton).click()
            return page.getByRole('dialog', { name: 'Export List' })
        }

        test('TC65: Export modal defaults to Components only and XLSX', async ({ page }) => {
            const modal = await openExportModal(page)
            await expect(modal.getByRole('radio', { name: 'Components Only', exact: true })).toBeChecked()
            await expect(modal.getByLabel('Export format')).toHaveValue(ExportReportFormat.XLSX)
        })

        for (const format of Object.values(ExportReportFormat)) {
            test(`TC66: Download components as ${format}`, async ({ page }) => {
                const modal = await openExportModal(page)
                await page.route('**/reports?**', async (route) => {
                    const query = new URL(route.request().url()).searchParams
                    expect(query.get('module')).toBe('components')
                    expect(query.get('format')).toBe(format)
                    expect(query.get('withlinkedreleases')).toBe('false')
                    expect(query.get('mailrequest')).toBe('false')
                    await route.fulfill({ status: 200, body: 'mock report' })
                })
                await modal.getByLabel('Export format').selectOption(format)
                const downloadPromise = page.waitForEvent('download')
                await modal.getByRole('button', { name: 'Export', exact: true }).click()
                const download = await downloadPromise
                expect(download.suggestedFilename()).toMatch(new RegExp(`^components-\\d{4}-\\d{2}-\\d{2}\\.${format}$`))
                await expect(modal).toBeHidden()
                await expect(page.locator('.global-message .alert-success')).toContainText('Report download is successful')
            })
        }

        test('TC67: Export linked releases reports access denied and allows retry', async ({ page }) => {
            const modal = await openExportModal(page)
            await page.route('**/reports?**', async (route) => {
                expect(new URL(route.request().url()).searchParams.get('withlinkedreleases')).toBe('true')
                await route.fulfill({ status: 403, body: 'Forbidden' })
            })
            await modal.getByRole('radio', { name: 'Components with releases' }).check()
            await expect(modal.getByRole('radio', { name: 'Components Only', exact: true })).not.toBeChecked()
            await modal.getByRole('button', { name: 'Export', exact: true }).click()
            await expect(page.locator('.global-message .alert-warning')).toContainText('Access Denied!')
            await expect(modal.getByRole('alert')).toHaveCount(0)
            await expect(modal.getByRole('button', { name: 'Export', exact: true })).toBeEnabled()
        })

        test('Export by email does not download locally', async ({ page }) => {
            const modal = await openExportModal(page, true)
            await page.route('**/reports?**', async (route) => {
                const query = new URL(route.request().url()).searchParams
                expect(query.get('format')).toBe(ExportReportFormat.CSV)
                expect(query.get('mailrequest')).toBe('true')
                await route.fulfill({ status: 200, body: '' })
            })
            let downloaded = false
            page.on('download', () => { downloaded = true })
            await modal.getByLabel('Export format').selectOption(ExportReportFormat.CSV)
            await modal.getByRole('button', { name: 'Export', exact: true }).click()
            await expect(modal).toBeHidden()
            await expect(page.locator('.global-message .alert-success')).toContainText('Report generation has started')
            expect(downloaded).toBe(false)
        })
    })

    // ─── Release Overview Tab in Detail ──────────────────

    test.describe('Release Overview', () => {
        let componentId: string
        const componentName = `PW Comp Releases ${ts}`

        test.beforeAll(async () => {
            componentId = await createComponentApi({
                name: componentName,
                categories: 'Library',
                componentType: 'OSS',
            })
        })

        test.afterAll(async () => {
            await deleteComponentApi(componentId)
        })

        test('TC68: Release Overview tab shows on detail page', async ({ page }) => {
            await page.goto(`/components/detail/${componentId}`)
            await waitForComponentPageLoad(page)
            await clickDetailTab(page, 'Release Overview')
            await expect(page.getByRole('tab', { name: 'Release Overview' }).first()).toHaveAttribute(
                'aria-selected',
                'true',
            )
        })

        test('TC69: Release Overview tab shows Add Release button or empty state', async ({ page }) => {
            await page.goto(`/components/detail/${componentId}`)
            await waitForComponentPageLoad(page)
            await clickDetailTab(page, 'Release Overview')
            // Should show either "Add Release" link/button, "No data available in table", or an empty table
            const noData = page.getByText('No data available in table')
            const addRelease = page.getByRole('link', { name: /Add Release/i })
            const table = page.locator('table')
            await expect(noData.or(addRelease).or(table).first()).toBeVisible({ timeout: 10000 })
        })
    })

    // ─── Merge Navigation ────────────────────────────────

    test.describe('Merge', () => {
        let componentId: string

        test.beforeAll(async () => {
            componentId = await createComponentApi({
                name: `PW Comp Merge ${ts}`,
                categories: 'Library',
                componentType: 'OSS',
            })
        })

        test.afterAll(async () => {
            await deleteComponentApi(componentId)
        })

        test('TC70: Merge button navigates to merge page', async ({ page }) => {
            await page.goto(`/components/detail/${componentId}`)
            await waitForComponentPageLoad(page)
            const mergeBtn = page.locator(selectors.detailActions.mergeButton).first()
            if (await mergeBtn.isVisible().catch(() => false)) {
                await mergeBtn.click()
                await page.waitForURL(`**/components/detail/${componentId}/merge**`, { timeout: 15000 })
            } else {
                test.skip()
            }
        })
    })

    // ─── Split Navigation ────────────────────────────────

    test.describe('Split', () => {
        let componentId: string

        test.beforeAll(async () => {
            componentId = await createComponentApi({
                name: `PW Comp Split ${ts}`,
                categories: 'Library',
                componentType: 'OSS',
            })
        })

        test.afterAll(async () => {
            await deleteComponentApi(componentId)
        })

        test('TC71: Split button navigates to split page', async ({ page }) => {
            await page.goto(`/components/detail/${componentId}`)
            await waitForComponentPageLoad(page)
            const splitBtn = page.locator(selectors.detailActions.splitButton).first()
            if (await splitBtn.isVisible().catch(() => false)) {
                await splitBtn.click()
                await page.waitForURL(`**/components/detail/${componentId}/split**`, { timeout: 15000 })
            } else {
                test.skip()
            }
        })
    })

    // ─── Subscribe Toggle ────────────────────────────────

    test.describe('Subscribe', () => {
        let componentId: string

        test.beforeAll(async () => {
            componentId = await createComponentApi({
                name: `PW Comp Subscribe ${ts}`,
                categories: 'Library',
                componentType: 'OSS',
            })
        })

        test.afterAll(async () => {
            await deleteComponentApi(componentId)
        })

        test('TC72: Subscribe/Unsubscribe button is present on detail page', async ({ page }) => {
            await page.goto(`/components/detail/${componentId}`)
            await waitForComponentPageLoad(page)
            const subscribe = page.locator(selectors.detailActions.subscribeButton)
            const unsubscribe = page.locator(selectors.detailActions.unsubscribeButton)
            const isSubscribe = await subscribe.isVisible().catch(() => false)
            const isUnsubscribe = await unsubscribe.isVisible().catch(() => false)
            expect(isSubscribe || isUnsubscribe).toBeTruthy()
        })

        // Backend subscription endpoint returns 400 in CI; keep this as fixme until backend is stable.
        test.fixme('TC73: Subscribe toggles to Unsubscribe on click', async ({ page }) => {
            await page.goto(`/components/detail/${componentId}`)
            await waitForComponentPageLoad(page)
            const subscribe = page.locator(selectors.detailActions.subscribeButton)
            const unsubscribe = page.locator(selectors.detailActions.unsubscribeButton)

            if (await subscribe.isVisible().catch(() => false)) {
                const responsePromise = page.waitForResponse(
                    (resp) => resp.url().includes('/subscriptions') && resp.request().method() === 'POST',
                    { timeout: 15000 },
                )
                await clickButtonPreventingLink(subscribe)
                await responsePromise
                await page.reload()
                await waitForComponentPageLoad(page)
                await expect(unsubscribe).toBeVisible({ timeout: 10000 })
            } else if (await unsubscribe.isVisible().catch(() => false)) {
                const responsePromise = page.waitForResponse(
                    (resp) => resp.url().includes('/subscriptions') && resp.request().method() === 'POST',
                    { timeout: 15000 },
                )
                await clickButtonPreventingLink(unsubscribe)
                await responsePromise
                await page.reload()
                await waitForComponentPageLoad(page)
                await expect(subscribe).toBeVisible({ timeout: 10000 })
            }
        })
    })

    // ─── Breadcrumb on Detail Page ───────────────────────

    test.describe('Breadcrumb', () => {
        let componentId: string

        test.beforeAll(async () => {
            componentId = await createComponentApi({
                name: `PW Comp Breadcrumb ${ts}`,
                categories: 'Library',
                componentType: 'OSS',
            })
        })

        test.afterAll(async () => {
            await deleteComponentApi(componentId)
        })

        test('TC74: Detail page shows breadcrumb navigation', async ({ page }) => {
            await page.goto(`/components/detail/${componentId}`)
            await waitForComponentPageLoad(page)
            const breadcrumb = page.locator(selectors.common.breadcrumb)
            await expect(breadcrumb.first()).toBeVisible({ timeout: 10000 })
        })
    })
})
