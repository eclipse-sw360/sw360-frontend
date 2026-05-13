// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

/**
 * Test fixtures for Access Control E2E tests.
 *
 * These tests verify role-based access control across the SW360 Frontend.
 */
export const fixtures = {
    /** Admin-only pages that should deny access to non-admin users */
    adminOnlyPages: [
        '/admin',
        '/admin/users',
        '/admin/departments',
        '/admin/vendors',
        '/admin/bulkreleaseedit',
        '/admin/licenseTypes',
        '/admin/obligations',
        '/admin/schedule',
        '/admin/fossology',
        '/admin/importexport',
        '/admin/databaseSanitation',
        '/admin/oauthclient',
        '/admin/configurations',
    ],

    /** Pages accessible to all authenticated users */
    publicPages: [
        '/home',
        '/components',
        '/projects',
        '/licenses',
        '/packages',
        '/vulnerabilities',
        '/requests',
        '/search',
        '/preferences',
    ],

    /** Pages that require write access (not accessible to VIEWER) */
    writeAccessPages: {
        components: '/components/add',
        projects: '/projects/add',
        licenses: '/admin/licenses/add',
    },

    /** Action buttons that should be hidden for VIEWER role */
    writeActionButtons: {
        addComponent: 'Add Component',
        addProject: 'Add Project',
        addRelease: 'Add Release',
        delete: 'Delete',
        edit: 'Edit',
    },

    /** Expected error messages */
    errorMessages: {
        accessDenied: /Access Denied|Forbidden|403|not authorized/i,
        notFound: /Not Found|404/i,
    },

    /** Role descriptions */
    roles: {
        admin: 'SW360_ADMIN - Full administrative access',
        user: 'USER - Regular user with read/write access',
        viewer: 'VIEWER - Read-only access',
        clearingAdmin: 'CLEARING_ADMIN - Clearing administration access',
    },
}
