// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { test, expect } from '@playwright/test'
import { selectors } from './selectors'
import { navigateToSearch, verifyAllUnchecked } from './utils'

test.describe('Search Filters', () => {
    test.beforeEach(async ({ page }) => {
        await navigateToSearch(page)
    })

    test('TC16: Entire Document checkbox is checked by default', async ({ page }) => {
        await expect(page.locator(selectors.checkboxes.entireDocument)).toBeChecked()
    })

    test('TC17: Projects checkbox is unchecked by default', async ({ page }) => {
        await expect(page.locator(selectors.checkboxes.projects)).not.toBeChecked()
    })

    test('TC18: Components checkbox is unchecked by default', async ({ page }) => {
        await expect(page.locator(selectors.checkboxes.components)).not.toBeChecked()
    })

    test('TC19: Licenses checkbox is unchecked by default', async ({ page }) => {
        await expect(page.locator(selectors.checkboxes.licenses)).not.toBeChecked()
    })

    test('TC20: Releases checkbox is unchecked by default', async ({ page }) => {
        await expect(page.locator(selectors.checkboxes.releases)).not.toBeChecked()
    })

    test('TC21: Packages checkbox is unchecked by default', async ({ page }) => {
        await expect(page.locator(selectors.checkboxes.packages)).not.toBeChecked()
    })

    test('TC22: Obligations checkbox is unchecked by default', async ({ page }) => {
        await expect(page.locator(selectors.checkboxes.obligations)).not.toBeChecked()
    })

    test('TC23: Users checkbox is unchecked by default', async ({ page }) => {
        await expect(page.locator(selectors.checkboxes.users)).not.toBeChecked()
    })

    test('TC24: Vendors checkbox is unchecked by default', async ({ page }) => {
        await expect(page.locator(selectors.checkboxes.vendors)).not.toBeChecked()
    })

    test('TC25: Clicking Projects checkbox toggles it on', async ({ page }) => {
        await page.locator(selectors.checkboxes.projects).check()
        await expect(page.locator(selectors.checkboxes.projects)).toBeChecked()
    })

    test('TC26: Clicking a checked checkbox toggles it off', async ({ page }) => {
        await page.locator(selectors.checkboxes.entireDocument).uncheck()
        await expect(page.locator(selectors.checkboxes.entireDocument)).not.toBeChecked()
    })

    test('TC27: Toggle button inverts all checkbox states', async ({ page }) => {
        // Initially: entireDocument=checked, all others=unchecked
        await page.click(selectors.buttons.toggle)
        // After toggle: entireDocument=unchecked, all others=checked
        await expect(page.locator(selectors.checkboxes.entireDocument)).not.toBeChecked()
        await expect(page.locator(selectors.checkboxes.projects)).toBeChecked()
        await expect(page.locator(selectors.checkboxes.components)).toBeChecked()
        await expect(page.locator(selectors.checkboxes.licenses)).toBeChecked()
        await expect(page.locator(selectors.checkboxes.releases)).toBeChecked()
        await expect(page.locator(selectors.checkboxes.packages)).toBeChecked()
        await expect(page.locator(selectors.checkboxes.obligations)).toBeChecked()
        await expect(page.locator(selectors.checkboxes.users)).toBeChecked()
        await expect(page.locator(selectors.checkboxes.vendors)).toBeChecked()
    })

    test('TC28: Deselect All button unchecks all checkboxes', async ({ page }) => {
        // Check some boxes first
        await page.locator(selectors.checkboxes.projects).check()
        await page.locator(selectors.checkboxes.components).check()

        await page.click(selectors.buttons.deselectAll)
        await verifyAllUnchecked(page)
    })

    test('TC29: Deselect All also unchecks Entire Document', async ({ page }) => {
        // Entire Document is checked by default
        await expect(page.locator(selectors.checkboxes.entireDocument)).toBeChecked()

        await page.click(selectors.buttons.deselectAll)
        await expect(page.locator(selectors.checkboxes.entireDocument)).not.toBeChecked()
    })

    test('TC30: Multiple checkboxes can be selected simultaneously', async ({ page }) => {
        await page.locator(selectors.checkboxes.projects).check()
        await page.locator(selectors.checkboxes.licenses).check()
        await page.locator(selectors.checkboxes.users).check()

        await expect(page.locator(selectors.checkboxes.projects)).toBeChecked()
        await expect(page.locator(selectors.checkboxes.licenses)).toBeChecked()
        await expect(page.locator(selectors.checkboxes.users)).toBeChecked()
    })

    test('TC31: Toggle button works after Deselect All', async ({ page }) => {
        await page.click(selectors.buttons.deselectAll)
        await verifyAllUnchecked(page)

        await page.click(selectors.buttons.toggle)
        // After toggle from all-unchecked: all should be checked
        await expect(page.locator(selectors.checkboxes.projects)).toBeChecked()
        await expect(page.locator(selectors.checkboxes.entireDocument)).toBeChecked()
    })
})
