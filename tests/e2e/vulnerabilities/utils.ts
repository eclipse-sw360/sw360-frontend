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
 * Navigate to the vulnerabilities list page.
 */
export async function gotoVulnerabilitiesPage(page: Page): Promise<void> {
    await page.goto('/vulnerabilities', { waitUntil: 'domcontentloaded' })
    await waitForVulnerabilityPageLoad(page)
}

/**
 * Navigate to the vulnerability detail page.
 */
export async function gotoVulnerabilityDetail(page: Page, vulnId: string): Promise<void> {
    await page.goto(`/vulnerabilities/detail/${vulnId}`, { waitUntil: 'domcontentloaded' })
    await waitForVulnerabilityPageLoad(page)
}

/**
 * Navigate to the vulnerability edit page.
 */
export async function gotoVulnerabilityEdit(page: Page, vulnId: string): Promise<void> {
    await page.goto(`/vulnerabilities/edit/${vulnId}`, { waitUntil: 'domcontentloaded' })
    await waitForVulnerabilityPageLoad(page)
}

/**
 * Wait for the vulnerability page to fully load.
 */
export async function waitForVulnerabilityPageLoad(page: Page): Promise<void> {
    await page.waitForLoadState('domcontentloaded')
    const spinner = page.locator(selectors.common.spinner)
    if (await spinner.first().isVisible().catch(() => false)) {
        await spinner.first().waitFor({ state: 'hidden', timeout: 30000 })
    }
    const contentIndicator = page.locator(
        `${selectors.form.externalId}, ${selectors.list.table}, ${selectors.detail.summaryTable}`
    ).first()
    await contentIndicator.waitFor({ state: 'visible', timeout: 30000 }).catch(() => {
        // Fallback for non-standard layouts
    })
    await page.waitForTimeout(500)
}

/**
 * Fill the vulnerability form fields.
 */
export async function fillVulnerabilityForm(
    page: Page,
    data: {
        externalId?: string
        title?: string
        description?: string
        priority?: string
        priorityText?: string
        action?: string
        legalNotice?: string
        cwe?: string
        extendedDescription?: string
        cvssScore?: string
        cvssDate?: string
        cvssTime?: string
        publishDate?: string
        publishTime?: string
        lastExternalUpdateDate?: string
        lastExternalUpdateTime?: string
        impact?: { availability?: string; confidentiality?: string; integrity?: string }
        access?: { authentication?: string; complexity?: string; vector?: string }
    }
): Promise<void> {
    if (data.externalId !== undefined) {
        await page.locator(selectors.form.externalId).fill(data.externalId)
    }
    if (data.title !== undefined) {
        await page.locator(selectors.form.title).fill(data.title)
    }
    if (data.description !== undefined) {
        await page.locator(selectors.form.description).fill(data.description)
    }
    if (data.priority !== undefined) {
        await page.locator(selectors.form.priority).fill(data.priority)
    }
    if (data.priorityText !== undefined) {
        await page.locator(selectors.form.priorityText).fill(data.priorityText)
    }
    if (data.action !== undefined) {
        await page.locator(selectors.form.action).fill(data.action)
    }
    if (data.legalNotice !== undefined) {
        await page.locator(selectors.form.legalNotice).fill(data.legalNotice)
    }
    if (data.cwe !== undefined) {
        await page.locator(selectors.form.cwe).fill(data.cwe)
    }
    if (data.extendedDescription !== undefined) {
        await page.locator(selectors.form.extendedDescription).fill(data.extendedDescription)
    }
    if (data.cvssScore !== undefined) {
        await page.locator(selectors.form.cvssScore).fill(data.cvssScore)
    }
    if (data.cvssDate !== undefined) {
        await page.locator(selectors.form.cvssDate).fill(data.cvssDate)
    }
    if (data.cvssTime !== undefined) {
        await page.locator(selectors.form.cvssTime).fill(data.cvssTime)
    }
    if (data.publishDate !== undefined) {
        await page.locator(selectors.form.publishDate).fill(data.publishDate)
    }
    if (data.publishTime !== undefined) {
        await page.locator(selectors.form.publishTime).fill(data.publishTime)
    }
    if (data.lastExternalUpdateDate !== undefined) {
        await page.locator(selectors.form.lastExternalUpdateDate).fill(data.lastExternalUpdateDate)
    }
    if (data.lastExternalUpdateTime !== undefined) {
        await page.locator(selectors.form.lastExternalUpdateTime).fill(data.lastExternalUpdateTime)
    }
    // Impact dropdowns
    if (data.impact?.availability) {
        await page.locator(selectors.form.availability).selectOption(data.impact.availability)
    }
    if (data.impact?.confidentiality) {
        await page.locator(selectors.form.confidentiality).selectOption(data.impact.confidentiality)
    }
    if (data.impact?.integrity) {
        await page.locator(selectors.form.integrity).selectOption(data.impact.integrity)
    }
    // Access dropdowns
    if (data.access?.authentication) {
        await page.locator(selectors.form.authentication).selectOption(data.access.authentication)
    }
    if (data.access?.complexity) {
        await page.locator(selectors.form.complexity).selectOption(data.access.complexity)
    }
    if (data.access?.vector) {
        await page.locator(selectors.form.vector).selectOption(data.access.vector)
    }
}

/**
 * Click a tab on the detail page by event key.
 */
export async function clickTab(page: Page, tabSelector: string): Promise<void> {
    await page.locator(tabSelector).click()
    await page.waitForTimeout(500)
}

// ─── API Helpers ─────────────────────────────────────────

function getBasicAuthToken(): string {
    const { email, password } = config.users.admin
    return `Basic ${Buffer.from(`${email}:${password}`).toString('base64')}`
}

/**
 * Create a vulnerability via API for test setup.
 */
export async function createVulnerabilityApi(data: {
    externalId: string
    title?: string
    description?: string
    cvssScore?: string
    priority?: string
    priorityText?: string
    action?: string
    legalNotice?: string
    cwe?: string
    extendedDescription?: string
}): Promise<string> {
    const token = getBasicAuthToken()
    const apiContext = await playwrightRequest.newContext()
    try {
        const now = new Date().toISOString()
        const date = now.slice(0, now.lastIndexOf('T'))
        const time = now.slice(now.lastIndexOf('T') + 1, -5)

        const payload = {
            externalId: data.externalId,
            title: data.title || data.externalId,
            description: data.description || '',
            priority: data.priority || '',
            priorityText: data.priorityText || '',
            action: data.action || '',
            legalNotice: data.legalNotice || '',
            cwe: data.cwe ? `CWE-${data.cwe}` : undefined,
            extendedDescription: data.extendedDescription || '',
            cvss: parseFloat(data.cvssScore || '0'),
            cvssTime: `${date}T${time}`,
            publishDate: `${date}T${time}`,
            lastExternalUpdate: `${date}T${time}`,
        }
        const response = await apiContext.post(`${config.apiUrl}/resource/api/vulnerabilities`, {
            headers: {
                Authorization: token,
                'Content-Type': 'application/json',
            },
            data: payload,
            timeout: 30000,
        })
        expect(response.status()).toBe(201)
        const body = await response.json()
        return body.externalId as string
    } finally {
        await apiContext.dispose()
    }
}

/**
 * Delete a vulnerability via API for test cleanup.
 */
export async function deleteVulnerabilityApi(vulnId: string): Promise<void> {
    const token = getBasicAuthToken()
    const apiContext = await playwrightRequest.newContext()
    try {
        const response = await apiContext.delete(`${config.apiUrl}/resource/api/vulnerabilities/${vulnId}`, {
            headers: {
                Authorization: token,
                'Content-Type': 'application/json',
            },
            timeout: 30000,
        })
        // 207 MULTI_STATUS is the expected response
        expect([200, 207].includes(response.status())).toBeTruthy()
    } finally {
        await apiContext.dispose()
    }
}

/**
 * Get a vulnerability via API.
 */
export async function getVulnerabilityApi(vulnId: string): Promise<Record<string, unknown>> {
    const token = getBasicAuthToken()
    const apiContext = await playwrightRequest.newContext()
    try {
        const response = await apiContext.get(`${config.apiUrl}/resource/api/vulnerabilities/${vulnId}`, {
            headers: {
                Authorization: token,
                'Content-Type': 'application/json',
            },
            timeout: 30000,
        })
        expect(response.status()).toBe(200)
        const body = await response.json()
        return body as Record<string, unknown>
    } finally {
        await apiContext.dispose()
    }
}
