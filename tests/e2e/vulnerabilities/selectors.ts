// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

/**
 * Centralized selectors for the Vulnerabilities module E2E tests.
 */
export const selectors = {
    list: {
        addButton: 'button:has-text("Add Vulnerability")',
        headerTitle: '.buttonheader-title',
        table: '.sw360-table',
        editIcon: 'a .btn-icon',
        deleteIcon: 'span .btn-icon',
        pageSizeSelector: '.dataTables_length select.form-select',
    },
    form: {
        externalId: '#vulnerabilityDetail\\.externalId',
        title: '#vulnerabilityDetail\\.title',
        description: '#vulnerabilityDetail\\.description',
        priority: '#vulnerabilityDetail\\.priority',
        priorityText: '#vulnerabilityDetail\\.priorityText',
        action: '#vulnerabilityDetail\\.action',
        legalNotice: '#vulnerabilityDetail\\.legalNotice',
        cwe: '#vulnerabilityDetail\\.cwe',
        extendedDescription: '#vulnerabilityDetail\\.extendedDescription',
        cvssScore: '#vulnerabilityDetail\\.cvssScore',
        cvssDate: '#vulnerabilityDetail\\.cvssDate',
        cvssTime: '#vulnerabilityDetail\\.cvssTime',
        publishDate: '#vulnerabilityDetail\\.publishDate',
        publishTime: '#vulnerabilityDetail\\.publishTime',
        lastExternalUpdateDate: '#vulnerabilityDetail\\.lastExternalUpdateDate',
        lastExternalUpdateTime: '#vulnerabilityDetail\\.lastExternalUpdateTime',
        // Impact section
        availability: 'select[name="availability"]',
        confidentiality: 'select[name="confidentiality"]',
        integrity: 'select[name="integrity"]',
        // Access section
        authentication: 'select[name="authentication"]',
        complexity: 'select[name="complexity"]',
        vector: 'select[name="vector"]',
        // CVE References
        cveYear: '#vulnerabilityDetail\\.cveReferences\\.year',
        cveNumber: '#vulnerabilityDetail\\.cveReferences\\.number',
        // Vendor Advisories
        advisoryVendor: '#vulnerabilityDetail\\.vendorAdvisories\\.vendor',
        advisoryName: '#vulnerabilityDetail\\.vendorAdvisories\\.name',
        advisoryUrl: '#vulnerabilityDetail\\.vendorAdvisories\\.url',
    },
    actions: {
        createVulnerability: 'button:has-text("Create Vulnerability")',
        updateVulnerability: 'button:has-text("Update Vulnerability")',
        deleteVulnerability: 'button:has-text("Delete Vulnerability")',
        cancelButton: '#createVulnerability\\.cancel',
    },
    detail: {
        summaryTable: 'table.summary-table',
        breadcrumb: '.breadcrumb',
        tabSummary: '.list-group-item[data-rr-ui-event-key="summary"]',
        tabMetadata: '.list-group-item[data-rr-ui-event-key="metadata"]',
        tabReferences: '.list-group-item[data-rr-ui-event-key="references"]',
    },
    deleteDialog: {
        modal: '.modal.show',
        message: '.modal.show .modal-body',
        confirmButton: '.modal.show button.btn-danger',
        cancelButton: '.modal.show .modal-footer button.btn-dark',
        alertMessage: '.modal.show .alert',
    },
    search: {
        sidebar: '.sidebar',
        searchButton: 'button:has-text("Search")',
    },
    common: {
        spinner: '.spinner',
    },
}
