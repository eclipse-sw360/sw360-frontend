// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

/**
 * Centralized selectors for the Requests module E2E tests.
 */
export const selectors = {
    page: {
        container: '.container.page-content',
    },
    tabs: {
        listGroup: '.list-group',
        openModeration: '.list-group-item[data-rr-ui-event-key="openModerationrequests"]',
        closedModeration: '.list-group-item[data-rr-ui-event-key="closedModerationrequests"]',
        openClearing: '.list-group-item[data-rr-ui-event-key="openClearingRequests"]',
        closedClearing: '.list-group-item[data-rr-ui-event-key="closedClearingRequests"]',
    },
    tabContent: {
        active: '.tab-pane.active.show',
    },
    table: {
        container: '.sw360-table',
        headerCells: '.sw360-table thead th',
        rows: '.sw360-table tbody tr',
        links: '.sw360-table .text-link',
        pageSizeSelector: '.dataTables_length select.form-select',
        footer: '.pagination',
    },
    moderation: {
        bulkActionsButton: '.btn-danger',
        checkboxes: 'input[name="moderationRequestId"]',
    },
    clearing: {
        editButton: '.btn-transparent',
    },
}
