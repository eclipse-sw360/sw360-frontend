// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

/**
 * Test fixtures and data for the Vulnerabilities module E2E tests.
 */

const timestamp = Date.now()

export const fixtures = {
    requiredFields: {
        externalId: `PW-VUL-${timestamp}`,
        cvssScore: '7.5',
    },
    allFields: {
        externalId: `PW-VUL-FULL-${timestamp}`,
        title: `Test Vulnerability Full ${timestamp}`,
        description: `Description for vulnerability ${timestamp}`,
        priority: 'HIGH',
        priorityText: 'Critical priority vulnerability',
        action: 'Upgrade to latest version',
        legalNotice: 'Disclosed under responsible disclosure',
        cwe: '79',
        extendedDescription: 'Extended description with more details',
        cvssScore: '9.8',
        cvssDate: '2024-01-15',
        cvssTime: '10:30:00',
        publishDate: '2024-01-10',
        publishTime: '08:00:00',
        lastExternalUpdateDate: '2024-02-01',
        lastExternalUpdateTime: '14:00:00',
        impact: {
            availability: 'COMPLETE',
            confidentiality: 'PARTIAL',
            integrity: 'COMPLETE',
        },
        access: {
            authentication: 'NONE',
            complexity: 'LOW',
            vector: 'NETWORK',
        },
    },
    update: {
        title: `Updated Vulnerability ${timestamp}`,
        description: `Updated description ${timestamp}`,
        priority: 'MEDIUM',
        cvssScore: '5.5',
    },
    delete: {
        externalId: `PW-VUL-DEL-${timestamp}`,
        cvssScore: '3.0',
        title: `Delete Test Vuln ${timestamp}`,
    },
    detail: {
        externalId: `PW-VUL-DET-${timestamp}`,
        title: `Detail Test Vuln ${timestamp}`,
        description: 'A vulnerability for detail page testing',
        cvssScore: '8.1',
        priority: 'HIGH',
        priorityText: 'High severity',
        action: 'Patch immediately',
        legalNotice: 'Legal notice text',
        cwe: '89',
        extendedDescription: 'SQL injection vulnerability',
    },
    impactOptions: ['NONE', 'PARTIAL', 'COMPLETE'],
    accessAuthOptions: ['MULTIPLE', 'SINGLE', 'NONE'],
    accessComplexityOptions: ['LOW', 'MEDIUM', 'HIGH'],
    accessVectorOptions: ['LOCAL', 'ADJACENT_NETWORK', 'NETWORK'],
    cveReference: {
        year: '2024',
        number: '12345',
    },
    vendorAdvisory: {
        vendor: 'TestVendor',
        name: 'Advisory-001',
        url: 'https://example.com/advisory/001',
    },
}
