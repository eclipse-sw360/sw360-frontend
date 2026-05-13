// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

/**
 * Centralized selectors for the Admin module E2E tests.
 */
export const selectors = {
    page: {
        container: '.container.page-content',
        adminContent: '[class*="mx-5"]',
        adminWrapper: '.mx-5.mt-3',
        adminButtons: '.admin-button',
    },
    users: {
        title: '.buttonheader-title',
        addButton: 'button:has-text("Add User")',
        downloadButton: 'button:has-text("Download Users")',
        table: '.sw360-table',
        tableHeaders: '.sw360-table thead th',
        tableRows: '.sw360-table tbody tr',
        pageSizeSelector: '.dataTables_length select.form-select',
        footer: '.pagination',
    },
    vendors: {
        addButton: 'button:has-text("Add Vendor"), a:has-text("Add Vendor")',
        quickFilter: 'input[placeholder]',
        table: '.sw360-table',
        tableHeaders: '.sw360-table thead th',
        tableRows: '.sw360-table tbody tr',
    },
    licenseTypes: {
        quickFilter: 'input[placeholder]',
        table: '.sw360-table',
        tableHeaders: '.sw360-table thead th',
    },
    obligations: {
        addButton: 'a:has-text("Add Obligation")',
        quickFilter: 'input[placeholder]',
        table: '.sw360-table',
        tableHeaders: '.sw360-table thead th',
    },
    schedule: {
        title: '.buttonheader-title',
        cancelAllButton: 'button.btn-danger',
        scheduleItems: '.scheduleSec',
    },
    fossology: {
        urlInput: '#fossologyConfig\\.url',
        recheckButton: 'button:has-text("Re-Check connection")',
        saveButton: 'button:has-text("Save configuration")',
    },
    bulkReleaseEdit: {
        quickFilter: 'input[placeholder]',
        table: '.sw360-table',
        tableHeaders: '.sw360-table thead th',
    },
    importExport: {
        downloadButtons: 'button:has-text("Download")',
        uploadButtons: 'button:has-text("Upload")',
    },
    databaseSanitation: {
        searchButton: 'button:has-text("Search duplicate identifiers")',
    },
    oauthClient: {
        title: '.buttonheader-title',
        addButton: 'a:has-text("Add Client")',
    },
    configurations: {
        tabBackend: '.list-group-item[data-rr-ui-event-key="backend"]',
        tabFrontend: '.list-group-item[data-rr-ui-event-key="frontend"]',
    },
}
