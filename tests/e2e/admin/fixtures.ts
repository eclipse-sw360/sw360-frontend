// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

/**
 * Test fixtures and data for the Admin module E2E tests.
 */
export const fixtures = {
    /** Admin page URLs */
    urls: {
        admin: '/admin',
        users: '/admin/users',
        departments: '/admin/departments',
        vendors: '/admin/vendors',
        bulkReleaseEdit: '/admin/bulkreleaseedit',
        licenses: '/admin/licenses',
        licenseTypes: '/admin/licenseTypes',
        obligations: '/admin/obligations',
        schedule: '/admin/schedule',
        fossology: '/admin/fossology',
        importExport: '/admin/importexport',
        databaseSanitation: '/admin/databaseSanitation',
        oauthClient: '/admin/oauthclient',
        configurations: '/admin/configurations',
    },

    /** Admin dashboard button labels */
    adminButtons: [
        'User',
        'Department',
        'Vendors',
        'Bulk Release Edit',
        'Licenses',
        'License Types',
        'Obligations',
        'Schedule',
        'Fossology',
        'Import & Export',
        'Database Sanitation',
        'Attachment Cleanup',
        'OAuth Client',
        'Configurations',
    ],

    /** Users table columns */
    usersColumns: [
        'Given Name',
        'Last Name',
        'Email',
        'Active status',
        'Primary Department',
        'Primary Department Role',
        'Secondary Departments and Roles',
        'Actions',
    ],

    /** Vendors table columns */
    vendorsColumns: ['Full Name', 'Short Name', 'URL', 'Actions'],

    /** License Types table columns */
    licenseTypesColumns: ['License Type', 'Actions'],

    /** Obligations table columns */
    obligationsColumns: ['Title', 'Text', 'Obligation Level', 'Actions'],

    /** Bulk Release Edit table columns */
    bulkReleaseEditColumns: ['CPE ID', 'Vendor', 'Release name', 'Release version', 'Update'],

    /** Departments table columns */
    departmentsColumns: ['Department', 'Member Emails', 'Actions'],

    /** Schedule page title */
    scheduleTitle: 'Schedule Task Administration',

    /** Import/Export section labels */
    exportLabels: [
        'Download Component CSV',
        'Download CSV template for Component upload',
    ],
}
