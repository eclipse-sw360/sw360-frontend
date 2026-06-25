// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

/**
 * Test fixtures and data for the Preferences module E2E tests.
 */
export const fixtures = {
    /** Preferences page URL */
    preferencesUrl: '/preferences',

    /** Notification accordion sections */
    notificationSections: ['Project', 'Component', 'Release', 'Moderation', 'Clearing'],

    /** Token table columns (only those with explicit header text) */
    tokenTableColumns: ['Token Name', 'Expiration Date', 'Authorities'],

    /** User info fields expected */
    userInfoLabels: ['Name', 'Email', 'Primary Department', 'External Id', 'Role', 'Secondary Departments and Roles'],

    /** REST API Token section title */
    tokenSectionTitle: 'REST API Token',
}
