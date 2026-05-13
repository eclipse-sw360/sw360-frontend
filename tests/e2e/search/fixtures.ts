// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

/**
 * Test fixtures and data for the Search module E2E tests.
 */
export const fixtures = {
    /** Search page URL */
    searchUrl: '/search',

    /** Known search terms likely to return results from existing data */
    keywords: {
        /** A project name known to exist */
        project: 'Test',
        /** A component name known to exist */
        component: 'Angular',
        /** A license name known to exist */
        license: 'Apache',
        /** A generic term that returns multiple types */
        generic: 'test',
        /** A term that should return no results */
        noResults: 'xyznonexistent99999',
    },

    /** Checkbox labels in the RESTRICT TO TYPE section */
    typeLabels: [
        'Projects',
        'Components',
        'Licenses',
        'Releases',
        'Packages',
        'Obligations',
        'Users',
        'Vendors',
        'Entire Document',
    ],

    /** Expected result link patterns per type */
    linkPatterns: {
        project: '/projects/detail/',
        component: '/components/detail/',
        release: '/components/releases/detail/',
        license: '/licenses/detail/',
        package: '/packages/detail/',
        obligation: '/obligations/detail/',
    },
}
