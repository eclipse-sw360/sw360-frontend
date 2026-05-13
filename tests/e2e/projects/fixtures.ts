// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

/**
 * Complete test fixtures for the Projects module.
 * Covers all form fields, API payloads, and validation scenarios.
 *
 * Names include a timestamp suffix to avoid 409 Conflict on repeated runs.
 */

const ts = Date.now().toString(36)

export const projectFixtures = {
    /** Minimal project — required fields only */
    requiredFields: {
        name: `PW Required ${ts}`,
        version: '1.0.0',
        visibility: 'EVERYONE',
        projectType: 'PRODUCT',
    },

    /** Full summary fields */
    allSummaryFields: {
        name: `PW AllSummary ${ts}`,
        version: '2.0.0',
        visibility: 'EVERYONE',
        projectType: 'INTERNAL',
        tag: 'automation',
        description: 'Comprehensive test project created by Playwright E2E automation',
    },

    /** Administration tab fields */
    administrationFields: {
        clearingState: 'IN_PROGRESS',
        clearingSummary: 'Playwright test clearing summary',
        specialRisksOSS: 'No OSS risks identified for this test',
        generalRisks3rdParty: 'Standard 3rd party risks apply',
        specialRisks3rdParty: 'None identified',
        deliveryChannels: 'Digital download',
        remarksAdditionalRequirements: 'Automated test remarks',
    },

    /** Life cycle fields */
    lifeCycleFields: {
        state: 'ACTIVE',
        systemTestStart: '2025-01-15',
        systemTestEnd: '2025-06-30',
        deliveryStart: '2025-07-01',
        phaseOutSince: '',
    },

    /** Update scenario — original and modified values */
    update: {
        original: {
            name: `PW Update ${ts}`,
            version: '1.0.0',
            visibility: 'EVERYONE',
            projectType: 'PRODUCT',
            description: 'Original description',
        },
        modified: {
            name: `PW Updated ${ts}`,
            version: '1.1.0',
            description: 'Updated description by Playwright test',
            projectType: 'INTERNAL',
        },
    },

    /** Duplicate test data */
    duplicate: {
        source: {
            name: `PW Duplicate Src ${ts}`,
            version: '1.0.0',
            visibility: 'EVERYONE',
            projectType: 'PRODUCT',
            description: 'Source project to duplicate',
        },
        duplicated: {
            name: `PW Duplicated ${ts}`,
            version: '2.0.0',
        },
    },

    /** Conflict test (same name + version) */
    conflict: {
        name: `PW Conflict ${ts}`,
        version: '1.0.0',
    },

    /** Delete test data */
    delete: {
        name: `PW Delete ${ts}`,
        version: '1.0.0',
        comment: 'Deleting project created by Playwright automation test',
    },

    /** Various project types for filter testing */
    projectTypes: [
        { name: `PW Customer ${ts}`, projectType: 'CUSTOMER' },
        { name: `PW Internal ${ts}`, projectType: 'INTERNAL' },
        { name: `PW Product ${ts}`, projectType: 'PRODUCT' },
        { name: `PW Service ${ts}`, projectType: 'SERVICE' },
        { name: `PW InnerSrc ${ts}`, projectType: 'INNER_SOURCE' },
        { name: `PW Cloud ${ts}`, projectType: 'CLOUD_BACKEND' },
    ],

    /** API payload for programmatic project creation (REST API format) */
    apiPayload(overrides: Partial<ApiProjectPayload> = {}): ApiProjectPayload {
        return {
            name: `PW API ${ts}`,
            version: '1.0.0',
            visibility: 'EVERYONE',
            projectType: 'PRODUCT',
            description: 'Created via API for test setup',
            state: 'ACTIVE',
            clearingState: 'OPEN',
            ...overrides,
        }
    },

    /** Search test data */
    search: {
        name: `PW Search ${ts}`,
        version: '1.0.0',
        projectType: 'PRODUCT',
        tag: 'searchable-tag',
        description: 'A unique searchable description for filtering tests',
    },
} as const

export interface ApiProjectPayload {
    name: string
    version: string
    visibility: string
    projectType: string
    description: string
    state: string
    clearingState: string
    [key: string]: unknown
}
