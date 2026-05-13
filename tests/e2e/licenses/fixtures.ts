// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

/**
 * Test fixtures for the Licenses module.
 * Uses timestamp-based unique suffixes to avoid conflicts between test runs.
 */
const ts = Date.now().toString(36)

export const licenseFixtures = {
    /** License with required fields only */
    requiredFields: {
        fullName: `PW Test License ${ts}`,
        shortName: `PW-Test-${ts}`,
    },

    /** License with all summary fields */
    allFields: {
        fullName: `PW Full License ${ts}`,
        shortName: `PW-Full-${ts}`,
        osiApproved: 'YES',
        fsfLibre: 'YES',
        isChecked: true,
        note: 'Test note for Playwright license',
        licenseText: 'This is a sample license text for Playwright E2E testing. All rights reserved.',
    },

    /** Data for update tests */
    update: {
        original: {
            fullName: `PW License Update ${ts}`,
            shortName: `PW-Upd-${ts}`,
            note: 'Original note',
        },
        modified: {
            fullName: `PW License Update ${ts} Modified`,
            note: 'Updated note by Playwright test',
            osiApproved: 'YES',
        },
    },

    /** Data for conflict/duplicate tests */
    conflict: {
        fullName: `PW License Conflict ${ts}`,
        shortName: `PW-Conflict-${ts}`,
    },

    /** Data for delete tests */
    delete: {
        fullName: `PW License Delete ${ts}`,
        shortName: `PW-Del-${ts}`,
    },

    /** Invalid short names for validation testing */
    invalidShortNames: [
        'has spaces',
        'has@special',
        'has#hash',
        'has/slash',
    ],

    /** Valid short name pattern: letters, digits, dash, dot, plus */
    validShortNamePattern: /^[A-Za-z0-9\-.+]*$/,
}
