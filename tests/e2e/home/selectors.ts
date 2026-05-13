// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

/**
 * Centralized selectors for the Home module E2E tests.
 */
export const selectors = {
    page: {
        container: '.homePage',
    },
    widgets: {
        myProjects: '.homePage .row .col-md-10 .row:nth-child(1) .col-sm:nth-child(1)',
        myComponents: '.homePage .row .col-md-10 .row:nth-child(1) .col-sm:nth-child(2)',
        myTaskAssignments: '.homePage .row .col-md-10 .row:nth-child(2) .col-sm:nth-child(1)',
        myTaskSubmissions: '.homePage .row .col-md-10 .row:nth-child(2) .col-sm:nth-child(2)',
        mySubscriptions: '.homePage .row .col-md-2 .col-sm:nth-child(1)',
        recentComponents: '.homePage .row .col-md-2 .col-sm:nth-child(2)',
        recentReleases: '.homePage .row .col-md-2 .col-sm:nth-child(3)',
    },
    tableHeader: {
        title: '.tableHeaderTitle',
        reloadButton: '.tableReloadButton',
        filterToggle: '.tableHeaderFilterToggle',
        filterMenu: '.tableHeaderFilterMenu',
    },
    filter: {
        roleCheckbox: (key: string) => `#role-${key}`,
        clearingCheckbox: (key: string) => `#clearing-${key}`,
        searchButton: '.tableHeaderFilterMenu button.btn-warning',
    },
    table: {
        container: '.sw360-table',
        headerCells: '.sw360-table thead th',
        rows: '.sw360-table tbody tr',
        links: '.sw360-table .text-link',
        noRecords: '.sw360-table tbody tr td',
        footer: '.pagination',
    },
    subscriptions: {
        componentsHeader: '.content-container h3.titleSubSideBar',
        listItems: '.content-container ul li',
        links: '.content-container ul li a',
    },
    spinner: '.spinner',
}
