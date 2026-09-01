// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { Page, expect } from '@playwright/test'
import { config } from '../../config'
import { selectors } from './selectors'

/**
 * Navigate to a page and wait for it to load
 */
export async function navigateToPage(page: Page, path: string): Promise<void> {
    await page.goto(`${config.baseUrl}/${config.locale}${path}`, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
    })
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})
}

/**
 * Check if user has access to a page (no error/redirect/stuck loading)
 */
export async function hasPageAccess(page: Page, path: string): Promise<boolean> {
    await navigateToPage(page, path)
    const url = page.url()

    // Check if redirected to home or shows access denied
    if (url.includes('/home') && !path.includes('/home')) {
        return false
    }

    // Check for error messages
    const errorVisible = await page.locator(selectors.page.accessDenied).isVisible().catch(() => false)
    if (errorVisible) {
        return false
    }

    // Check if page is stuck on loading spinner (no actual content loaded)
    // Wait a bit for content to appear
    await page.waitForTimeout(2000)

    // Check if main content loaded (not just spinner)
    const hasContent = await page
        .locator('.container.page-content, main, [class*="page-content"], .admin-dashboard, table, form')
        .first()
        .isVisible({ timeout: 3000 })
        .catch(() => false)

    if (!hasContent) {
        // Page stuck on spinner = no access
        return false
    }

    return true
}

/**
 * Verify that a button/action is visible on the page
 */
export async function isActionVisible(page: Page, buttonText: string): Promise<boolean> {
    const button = page.getByRole('button', { name: buttonText }).or(page.getByRole('link', { name: buttonText }))
    return button.first().isVisible().catch(() => false)
}

/**
 * Verify that a button/action is NOT visible on the page
 */
export async function isActionHidden(page: Page, buttonText: string): Promise<boolean> {
    const visible = await isActionVisible(page, buttonText)
    return !visible
}

/**
 * Get the current user's role from the page (if displayed)
 */
export async function getCurrentUserRole(page: Page): Promise<string | null> {
    try {
        // Look for role indicator in user menu or page
        const roleElement = page.locator('[data-testid="user-role"], .user-role')
        if (await roleElement.isVisible()) {
            return roleElement.textContent()
        }
        return null
    } catch {
        return null
    }
}

/**
 * Verify admin navigation is visible/hidden based on role
 */
export async function isAdminNavVisible(page: Page): Promise<boolean> {
    await page.goto(`${config.baseUrl}/${config.locale}/home`, {
        waitUntil: 'domcontentloaded',
    })
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})

    const adminLink = page.locator(selectors.navigation.adminLink)
    return adminLink.isVisible().catch(() => false)
}

/**
 * Check if table has action buttons (edit/delete) in rows
 */
export async function tableHasActionButtons(page: Page): Promise<boolean> {
    const actionColumn = page.locator(selectors.table.actionColumn).first()
    if (!(await actionColumn.isVisible().catch(() => false))) {
        return false
    }

    const hasEdit = await actionColumn.locator('text=/Edit/i').isVisible().catch(() => false)
    const hasDelete = await actionColumn.locator('text=/Delete/i').isVisible().catch(() => false)

    return hasEdit || hasDelete
}
