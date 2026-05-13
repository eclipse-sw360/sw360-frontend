// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

/**
 * Test fixtures and data for the Requests module E2E tests.
 */
export const fixtures = {
    /** Requests page URL */
    requestsUrl: '/requests',

    /** Tab labels */
    tabLabels: [
        'Open Moderation Requests',
        'Closed Moderation Requests',
        'Open Clearing Requests',
        'Closed Clearing Requests',
    ],

    /** Open/Closed Moderation Request table columns */
    moderationColumns: ['Date', 'Type', 'Document Name', 'Requesting User', 'Department', 'Moderators', 'State', 'Actions'],

    /** Clearing Request table columns */
    clearingColumns: [
        'Request ID',
        'BA-BL/Group',
        'Tag',
        'Project',
        'Open Releases',
        'Status',
        'Priority',
        'Requesting User',
        'Clearing Progress',
        'Created On',
        'Preferred Clearing Date',
        'Agreed Clearing Date',
        'Clearing Type',
        'Actions',
    ],

    /** Moderation states */
    moderationStates: ['In Progress', 'APPROVED', 'Pending', 'REJECTED'],
}
