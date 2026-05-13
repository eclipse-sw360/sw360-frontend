// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

/**
 * Centralized selectors for the Search module E2E tests.
 */
export const selectors = {
    sidebar: {
        card: '#keyword-search',
        cardHeader: '#keyword-search .card-header',
        searchInput: '#keyword-search input.form-control',
        restrictToTypeHeader: '#keyword-search h6.fw-bold',
        infoIcon: '#keyword-search svg',
    },
    checkboxes: {
        projects: '#keyboard-check-projects',
        components: '#keyboard-check-components',
        licenses: '#keyboard-check-licenses',
        releases: '#keyboard-check-releases',
        packages: '#keyboard-check-packages',
        obligations: '#keyboard-check-obligations',
        users: '#keyboard-check-users',
        vendors: '#keyboard-check-vendors',
        entireDocument: '#keyboard-check-entire-document',
    },
    buttons: {
        search: '#keyword-search button.btn-primary',
        toggle: 'button:has-text("Toggle")',
        deselectAll: 'button:has-text("Deselect All")',
    },
    results: {
        headerTitle: '.buttonheader-title',
        table: '.sw360-table',
        pageSizeSelector: '.dataTables_length select.form-select',
        resultLinks: '.sw360-table .text-link',
        alertNote: '.alert-warning',
        spinner: '.spinner',
    },
}
