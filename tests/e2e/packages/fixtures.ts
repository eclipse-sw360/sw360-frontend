// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

/**
 * Test fixtures for the Packages module.
 */
const ts = Date.now().toString(36)

export const packageFixtures = {
    /** Package with required fields only */
    requiredFields: {
        name: `PW Pkg Required ${ts}`,
        version: '1.0.0',
        packageType: 'LIBRARY',
        purl: `pkg:npm/pw-pkg-required-${ts}@1.0.0`,
    },

    /** Package with all fields */
    allFields: {
        name: `PW Pkg Full ${ts}`,
        version: '2.0.0',
        packageType: 'APPLICATION',
        purl: `pkg:maven/com.example/pw-pkg-full-${ts}@2.0.0`,
        vcs: 'https://github.com/example/pw-pkg-full.git',
        homepageUrl: 'https://example.com/pw-pkg-full',
        description: 'Full package for Playwright E2E testing with all fields populated.',
    },

    /** Data for update tests */
    update: {
        name: `PW Pkg Update ${ts}`,
        version: '1.0.0',
        packageType: 'LIBRARY',
        purl: `pkg:npm/pw-pkg-update-${ts}@1.0.0`,
    },

    /** Data for delete tests */
    delete: {
        name: `PW Pkg Delete ${ts}`,
        version: '1.0.0',
        packageType: 'FILE',
        purl: `pkg:npm/pw-pkg-delete-${ts}@1.0.0`,
    },

    /** Data for detail page tests */
    detail: {
        name: `PW Pkg Detail ${ts}`,
        version: '3.0.0',
        packageType: 'FRAMEWORK',
        purl: `pkg:nuget/pw-pkg-detail-${ts}@3.0.0`,
        vcs: 'https://github.com/example/pw-pkg-detail.git',
        homepageUrl: 'https://example.com/pw-pkg-detail',
        description: 'Package for testing the detail page.',
    },

    /** Package type options */
    packageTypes: [
        'APPLICATION',
        'CONTAINER',
        'DEVICE',
        'FILE',
        'FIRMWARE',
        'FRAMEWORK',
        'LIBRARY',
        'OPERATING_SYSTEM',
    ],

    /** Sample package managers (subset for testing) */
    packageManagers: ['npm', 'maven', 'nuget', 'pypi', 'gem', 'cargo', 'golang', 'docker'],
}
