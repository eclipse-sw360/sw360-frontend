// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

/**
 * Centralized selectors for the Projects module.
 *
 * Selector strategy:
 * 1. #id (reliable for form fields — uses existing IDs like #addProjects.name)
 * 2. #id (reliable for form fields — uses existing IDs like #addProjects.name)
 * 3. aria-label / role (good for buttons/links)
 * 4. CSS class (fallback)
 *
 * Form field IDs follow the pattern: #addProjects.{fieldName}
 * Use CSS.escape() or backslash escaping for dots: #addProjects\\.name
 */
export const selectors = {
    // ─── List Page ─────────────────────────────────────────
    list: {
        table: '.sw360-table',
        addProjectButton: 'button.btn-primary:has-text(\"Add Project\")',
        importSBOMDropdown: 'text=Import SBOM',
        exportSpreadsheetDropdown: 'text=Export Spreadsheet',
        pageContent: '.container.page-content',
        processingSpinner: '.spinner',
        noDataRow: '.sw360-table tbody tr',
    },

    // ─── Advanced Search ───────────────────────────────────
    search: {
        panel: '.advanced-search, .card',
        nameField: 'input[name="name"]',
        versionField: 'input[name="version"]',
        typeField: 'select[name="type"]',
        responsibleField: 'input[name="projectResponsible"]',
        groupField: 'select[name="group"]',
        stateField: 'select[name="state"]',
        clearingStateField: 'select[name="clearingStatus"]',
        tagField: 'input[name="tag"]',
        additionalDataField: 'input[name="additionalData"]',
        searchButton: 'button:has-text("Search")',
    },

    // ─── Add/Edit Form — Summary Tab ──────────────────────
    form: {
        // General Information
        name: '#addProjects\\.name',
        version: '#addProjects\\.version',
        visibility: '#addProjects\\.visibility',
        createdBy: '#addProjects\\.createdBy',
        projectType: '#addProjects\\.projectType',
        tag: '#addProjects\\.tag',
        description: '#addProjects\\.description',
        domain: '#addProjects\\.domain',

        // Vendor
        vendorInput: '#addProjects\\.vendor',
        vendorDialogButton: 'button:has-text("Click to set Vendor")',
    },

    // ─── Add/Edit Form — Administration Tab ───────────────
    admin: {
        // Clearing section
        clearingState: '#addProjects\\.clearingState',
        clearingTeam: '#addProjects\\.clearingTeam',
        preevaluationDeadline: '#addProjects\\.deadlinePreEvaluation',
        clearingSummary: '#addProjects\\.clearingSummary',
        specialRisksOSS: '#addProjects\\.specialRiskOpenSourceSoftware',
        generalRisks3rdParty: '#addProjects\\.generalRiskThirdPartySoftware',
        specialRisks3rdParty: '#addProjects\\.specialRiskThirdPartySoftware',
        deliveryChannels: '#addProjects\\.salesAndDeliveryChannels',
        remarksAdditionalRequirements: '#addProjects\\.remarksAdditionalRequirements',

        // Life Cycle section
        projectState: '#addProjects\\.projectState',
        systemTestBeginDate: '#addProjects\\.systemTestBeginDate',
        systemTestEndDate: '#addProjects\\.systemTestEndDate',
        phaseOutDate: '#addProjects\\.phaseOutDate',

        // License Info Header
        licenseInfoHeader: '#addProjects\\.licenseInfoHeader',
        setDefaultTextButton: 'button:has-text("Set to default text")',
    },

    // ─── Form Action Buttons ──────────────────────────────
    actions: {
        createProject: 'button:has-text("Create Project")',
        updateProject: 'button:has-text("Update Project")',
        cancelProject: 'button:has-text("Cancel")',
        deleteProject: '.btn-icon, button:has-text("Delete")',
    },

    // ─── Tab Navigation (Add/Edit pages) ──────────────────
    tabs: {
        summary: 'text=Summary >> nth=0',
        administration: 'text=Administration >> nth=0',
        linkedReleasesAndProjects: 'text=Linked Releases and Projects',
        linkedPackages: 'text=Linked Packages >> nth=0',
        attachments: 'text=Attachments >> nth=0',
        obligations: 'text=Obligations >> nth=0',
    },

    // ─── Detail Page Tabs ─────────────────────────────────
    detailTabs: {
        summary: 'a:has-text("Summary")',
        administration: 'a:has-text("Administration")',
        licenseClearing: 'a:has-text("License Clearing")',
        linkedPackages: 'a:has-text("Linked Packages")',
        obligations: 'a:has-text("Obligations")',
        ecc: 'a:has-text("ECC")',
        vulnerabilityTrackingStatus: 'a:has-text("Vulnerability Tracking Status")',
        attachments: 'a:has-text("Attachments")',
        attachmentUsages: 'a:has-text("Attachment Usages")',
        vulnerabilities: 'a:has-text("Vulnerabilities")',
        changeLog: 'a:has-text("Change Log")',
    },

    // ─── Detail Page Buttons ──────────────────────────────
    detailActions: {
        editButton: 'button:has-text("Edit Projects")',
        linkToProjectsButton: 'button:has-text("Link to Projects")',
        importSbomButton: 'button:has-text("Import SBOM")',
        exportSbomDropdown: '#exportSBOM, button:has-text("Export SBOM")',
        deleteButton: 'button:has-text("Delete Project")',
    },

    // ─── Delete Dialog ────────────────────────────────────
    deleteDialog: {
        modal: '.modal.show',
        title: '.modal-title',
        commentInput: '.modal.show textarea',
        confirmButton: '.modal.show button.login-btn.btn-danger',
        cancelButton: '.modal.show button:has-text("Close")',
        alertMessage: '.modal.show .alert',
    },

    // ─── Import SBOM Dialog ───────────────────────────────
    importSbom: {
        modal: '.modal.show',
        title: '.modal-title',
        fileInput: '.modal.show input[type="file"]',
        uploadButton: '.modal.show button:has-text("Upload and Import")',
        closeButton: '.modal.show button:has-text("Close")',
        browseButton: '.modal.show button:has-text("Browse")',
    },

    // ─── Linked Releases / Projects ──────────────────────
    linkedReleases: {
        addReleaseButton: 'button:has-text("Add Releases")',
        linkProjectsButton: 'button:has-text("Link Projects")',
        releasesTable: '.sw360-table',
    },

    // ─── Linked Packages ─────────────────────────────────
    linkedPackages: {
        addPackagesButton: 'button:has-text("Add Packages")',
        packagesTable: '.sw360-table',
    },

    // ─── Pagination ──────────────────────────────────────
    pagination: {
        pageSizeSelector: '.page-size-selector select, select[aria-label*="entries"]',
        nextPageButton: 'button:has-text("Next"), a:has-text("Next")',
        previousPageButton: 'button:has-text("Previous"), a:has-text("Previous")',
        pageInfo: '.page-info, .pagination-info',
    },

    // ─── Common ──────────────────────────────────────────
    common: {
        breadcrumb: 'nav[aria-label="breadcrumb"]',
        successAlert: '.alert-success, .Toastify__toast--success',
        errorAlert: '.alert-danger, .Toastify__toast--error',
        warningAlert: '.alert-warning, .Toastify__toast--warning',
        infoAlert: '.alert-info, .Toastify__toast--info',
        spinner: '.spinner-border',
        modalShow: '.modal.show',
    },
} as const
