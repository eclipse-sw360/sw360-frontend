// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

/**
 * Test fixtures and data for the Home module E2E tests.
 */
export const fixtures = {
    /** Home page URL */
    homeUrl: '/home',

    /** Widget titles */
    widgetTitles: {
        myProjects: 'My Projects',
        myComponents: 'My Components',
        myTaskAssignments: 'My Task Assignments',
        myTaskSubmissions: 'My Task Submissions',
        mySubscriptions: 'My Subscriptions',
        recentComponents: 'Recent Components',
        recentReleases: 'Recent Releases',
    },

    /** MyProjects table columns */
    myProjectsColumns: ['Project Name', 'Description', 'Approved Releases'],

    /** MyComponents table columns */
    myComponentsColumns: ['Component Name', 'Description'],

    /** MyTaskAssignments table columns */
    myTaskAssignmentsColumns: ['Document Name', 'Status'],

    /** MyTaskSubmissions table columns */
    myTaskSubmissionsColumns: ['Document Name', 'Status', 'Actions'],

    /** Role filter options */
    roleOptions: [
        { key: 'createdBy', label: 'Creator' },
        { key: 'moderator', label: 'Moderator' },
        { key: 'contributor', label: 'Contributor' },
        { key: 'projectOwner', label: 'Project Owner' },
        { key: 'leadArchitect', label: 'Lead Architect' },
        { key: 'projectResponsible', label: 'Project Responsible' },
        { key: 'securityResponsible', label: 'Security Responsible' },
    ],

    /** Clearing state filter options */
    clearingStateOptions: [
        { key: 'stateOpen', label: 'Open' },
        { key: 'stateClosed', label: 'Closed' },
        { key: 'stateInProgress', label: 'In Progress' },
    ],

    /** Subscription section headers */
    subscriptionSections: ['Components', 'Releases'],

    /** Task status values */
    taskStatuses: ['In Progress', 'APPROVED', 'Pending', 'REJECTED'],
}
