// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

/**
 * Centralized selectors for Access Control E2E tests.
 */
export const selectors = {
    /** Navigation elements */
    navigation: {
        adminLink: 'a[href*="/admin"]',
        homeLink: 'a[href*="/home"]',
        componentsLink: 'a[href*="/components"]',
        projectsLink: 'a[href*="/projects"]',
        licensesLink: 'a[href*="/licenses"]',
        packagesLink: 'a[href*="/packages"]',
        vulnerabilitiesLink: 'a[href*="/vulnerabilities"]',
        navbar: '.navbar, nav',
    },

    /** Action buttons */
    actions: {
        addButton: 'button:has-text("Add"), a:has-text("Add")',
        editButton: 'button:has-text("Edit"), a:has-text("Edit")',
        deleteButton: 'button:has-text("Delete")',
        saveButton: 'button:has-text("Save"), button[type="submit"]',
        cancelButton: 'button:has-text("Cancel")',
    },

    /** Page content */
    page: {
        container: '.container.page-content',
        title: '.buttonheader-title, h1, h2',
        errorMessage: '.alert-danger, .error-message, [role="alert"]',
        accessDenied: 'text=/Access Denied|Forbidden|403|not authorized/i',
    },

    /** Admin-specific elements */
    admin: {
        adminButtons: '.admin-button',
        adminDashboard: '.admin-dashboard, [class*="admin"]',
    },

    /** User profile */
    user: {
        profileMenu: '.user-profile, .dropdown-toggle',
        userEmail: '.user-email, [data-testid="user-email"]',
    },

    /** Tables */
    table: {
        dataTable: '.sw360-table',
        rows: '.sw360-table tbody tr',
        actionColumn: '.sw360-table td:last-child',
    },
}
