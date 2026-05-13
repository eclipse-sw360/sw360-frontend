// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

/**
 * Centralized selectors for the ECC module E2E tests.
 */
export const selectors = {
    page: {
        container: '.container.page-content',
        title: '.buttonheader-title',
    },
    quickFilter: {
        input: '#vunerabilities\\.quickSearch',
    },
    table: {
        container: '.sw360-table',
        headerCells: '.sw360-table thead th',
        rows: '.sw360-table tbody tr',
        pageSizeSelector: '.dataTables_length select.form-select',
        footer: '.pagination',
    },
}
