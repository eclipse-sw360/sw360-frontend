// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

/**
 * Test fixtures for the Components module.
 * Names include a timestamp suffix to avoid 409 Conflict on repeated runs.
 */

const ts = Date.now().toString(36)

export const componentFixtures = {
    /** Minimal component — required fields only */
    requiredFields: {
        name: `PW Comp Required ${ts}`,
        categories: 'Library',
        componentType: 'OSS',
    },

    /** Full summary fields */
    allSummaryFields: {
        name: `PW Comp Full ${ts}`,
        categories: 'Library,Cloud',
        componentType: 'INTERNAL',
        homepage: 'https://example.com/component',
        blogUrl: 'https://example.com/blog',
        wikiUrl: 'https://example.com/wiki',
        mailingListUrl: 'https://example.com/mailing',
        description: 'Comprehensive test component created by Playwright E2E automation',
    },

    /** Update scenario */
    update: {
        original: {
            name: `PW Comp Update ${ts}`,
            categories: 'Library',
            componentType: 'OSS',
            description: 'Original description',
        },
        modified: {
            name: `PW Comp Updated ${ts}`,
            description: 'Updated description by Playwright test',
            componentType: 'INTERNAL',
        },
    },

    /** Conflict test (same name) */
    conflict: {
        name: `PW Comp Conflict ${ts}`,
        categories: 'Library',
        componentType: 'OSS',
    },

    /** Delete test data */
    delete: {
        name: `PW Comp Delete ${ts}`,
        categories: 'Library',
        componentType: 'OSS',
        comment: 'Deleting component created by Playwright automation test',
    },

    /** Various component types for filter testing */
    componentTypes: [
        { name: `PW Comp OSS ${ts}`, componentType: 'OSS' },
        { name: `PW Comp COTS ${ts}`, componentType: 'COTS' },
        { name: `PW Comp Internal ${ts}`, componentType: 'INTERNAL' },
        { name: `PW Comp InnerSrc ${ts}`, componentType: 'INNER_SOURCE' },
        { name: `PW Comp Service ${ts}`, componentType: 'SERVICE' },
        { name: `PW Comp Free ${ts}`, componentType: 'FREESOFTWARE' },
    ],

    /** Search test data */
    search: {
        name: `PW Comp Search ${ts}`,
        categories: 'SearchCategory',
        componentType: 'OSS',
        description: 'A unique searchable component for filtering tests',
    },
} as const
