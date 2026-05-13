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

    /** CouchDB connection (for test data setup/teardown) */
    couchdb: {
        url: process.env.COUCHDB_URL || 'http://localhost:5984',
        username: process.env.COUCHDB_USERNAME || 'admin',
        password: process.env.COUCHDB_PASSWORD || 'password',
        dbName: process.env.COUCHDB_DBNAME || 'sw360db',
        usersDbName: process.env.COUCHDB_USERS_DBNAME || 'sw360users',
    },

    /** Test user credentials (override via SW360_TEST_ADMIN_EMAIL / SW360_TEST_ADMIN_PASSWORD) */
    users: {
        admin: {
            email: process.env.SW360_TEST_ADMIN_EMAIL || 'setup@sw360.org',
            password: process.env.SW360_TEST_ADMIN_PASSWORD || '12345',
        },
        user: {
            email: process.env.SW360_TEST_USER_EMAIL || 'user@sw360.org',
            password: process.env.SW360_TEST_USER_PASSWORD || '12345',
        },
    },

    /** Auth state file paths */
    authFiles: {
        admin: './tests/.auth/admin.json',
        user: './tests/.auth/user.json',
    },
} as const
