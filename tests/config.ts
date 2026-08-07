// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

/**
 * SW360 Playwright Test Environment Configuration
 *
 * Override these values via environment variables or by editing this file
 * for your local development setup.
 */
export const config = {
    /** Frontend base URL */
    baseUrl: process.env.SW360_BASE_URL || 'http://localhost:3000',

    /** Backend API URL */
    apiUrl: process.env.SW360_API_URL || 'http://localhost:8080',

    /** Default locale used in tests */
    locale: 'en',

    /** CouchDB connection (for test data setup/teardown)
     * Local: admin/12345
     * CI: sw360/sw360fossie (from config/couchdb/default_secrets)
     */
    couchdb: {
        url: process.env.COUCHDB_URL || 'http://localhost:5984',
        username: process.env.COUCHDB_USERNAME || (process.env.CI ? 'sw360' : 'admin'),
        password: process.env.COUCHDB_PASSWORD || (process.env.CI ? 'sw360fossie' : '12345'),
        dbName: process.env.COUCHDB_DBNAME || 'sw360db',
        usersDbName: process.env.COUCHDB_USERS_DBNAME || 'sw360users',
    },

    /** Test user credentials (override via SW360_TEST_ADMIN_EMAIL / SW360_TEST_ADMIN_PASSWORD) */
    users: {
        admin: {
            email: process.env.SW360_TEST_ADMIN_EMAIL || 'setup@sw360.org',
            password: process.env.SW360_TEST_ADMIN_PASSWORD || '12345',
        },
        // Test users created via API during setup
        user: {
            email: process.env.SW360_TEST_USER_EMAIL || 'testuser@sw360.org',
            password: process.env.SW360_TEST_USER_PASSWORD || '12345',
        },
        viewer: {
            email: process.env.SW360_TEST_VIEWER_EMAIL || 'testviewer@sw360.org',
            password: process.env.SW360_TEST_VIEWER_PASSWORD || '12345',
        },
        clearingAdmin: {
            email: process.env.SW360_TEST_CLEARING_ADMIN_EMAIL || 'testclearing@sw360.org',
            password: process.env.SW360_TEST_CLEARING_ADMIN_PASSWORD || '12345',
        },
    },

    /** Auth state file paths */
    authFiles: {
        admin: './tests/.auth/admin.json',
        user: './tests/.auth/user.json',
        viewer: './tests/.auth/viewer.json',
        clearingAdmin: './tests/.auth/clearingAdmin.json',
    },
} as const
