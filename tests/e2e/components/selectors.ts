// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

/**
 * Centralized selectors for the Components module.
 *
 * Selector strategy:
 * 1. #id (reliable for form fields — uses existing IDs like #name, #component_type)
 * 2. aria-label / role (good for buttons/links)
 * 3. CSS class (fallback)
 *
 * Form field IDs use simple names: #name, #categories, #component_type, etc.
 */
export const selectors = {
    // ─── List Page ─────────────────────────────────────────
    list: {
        table: '.sw360-table',
        addComponentButton: 'button.btn-primary:has-text("Add Component"), a:has-text("Add Component")',
        importSBOMButton: 'button:has-text("Import SBOM"), a:has-text("Import SBOM")',
        exportDropdown: '#project-export, button:has-text("Export Spreadsheet")',
        exportComponentsOnly: 'text=Components only',
        exportWithReleases: 'text=Components with releases',
        pageContent: '.container.page-content',
    },

    // ─── Advanced Search ───────────────────────────────────
    search: {
        nameField: 'input[name="name"]',
        categoriesField: 'input[name="categories"]',
        typeField: 'select[name="type"]',
        languagesField: 'input[name="languages"]',
        softwarePlatformsField: 'input[name="softwarePlatforms"]',
        vendorsField: 'input[name="vendors"]',
        operatingSystemsField: 'input[name="operatingSystems"]',
        mainLicensesField: 'input[name="mainLicenses"]',
        createdByField: 'input[name="createdBy"]',
        searchButton: 'button:has-text("Search")',
    },

    // ─── Add/Edit Form — Summary Tab ──────────────────────
    form: {
        name: '#name',
        createdBy: '#createdBy',
        categories: '#categories',
        componentType: '#component_type',
        defaultVendor: '#default_vendor',
        homepage: '#tag',
        vcsUrl: '#vcs_url',
        blogUrl: '#blog_url',
        wikiUrl: '#wiki_url',
        mailingListUrl: '#mailing_list_url',
        description: '#description',
    },

    // ─── Roles Section ────────────────────────────────────
    roles: {
        componentOwner: '#component_owner',
        ownerAccountingUnit: '#owner_accounting_unit',
        ownerBillingGroup: '#owner_billing_group',
        moderators: '#moderators',
    },

    // ─── Form Action Buttons ──────────────────────────────
    actions: {
        createComponent: '.btn-toolbar button[type="submit"], button:has-text("Create Component")',
        updateComponent: 'button:has-text("Update Component")',
        deleteComponent: 'button:has-text("Delete Component")',
        cancelButton: 'button:has-text("Cancel")',
    },

    // ─── Detail Page Tabs ─────────────────────────────────
    detailTabs: {
        summary: 'text=Summary',
        releaseOverview: 'text=Release Overview',
        attachments: 'text=Attachments',
        vulnerabilities: 'text=Vulnerabilities',
        changeLog: 'text=Change Log',
    },

    // ─── Detail Page Buttons ──────────────────────────────
    detailActions: {
        editButton: 'button:has-text("Edit component"), a:has-text("Edit component")',
        mergeButton: 'button:has-text("Merge"), a:has-text("Merge")',
        splitButton: 'button:has-text("Split"), a:has-text("Split")',
        subscribeButton: 'button:has-text("Subscribe")',
        unsubscribeButton: 'button:has-text("Unsubscribe")',
    },

    // ─── Edit Page Tabs ───────────────────────────────────
    editTabs: {
        summary: 'text=Summary',
        releases: 'text=Release',
        attachments: 'text=Attachments',
    },

    // ─── Delete Dialog ────────────────────────────────────
    deleteDialog: {
        modal: '.modal.show',
        title: '.modal-title',
        commentInput: '.modal.show textarea',
        confirmButton: '.modal.show .login-btn.btn-danger, .modal.show button.btn-danger:has-text("Delete Component")',
        cancelButton: '.modal.show button:has-text("Close")',
    },

    // ─── Import SBOM Dialog ───────────────────────────────
    importSbom: {
        modal: '.modal.show',
        title: '.modal-title',
        fileInput: '.modal.show input[type="file"]',
        uploadButton: '.modal.show button:has-text("Upload")',
        closeButton: '.modal.show button:has-text("Close"), .modal.show button:has-text("Cancel")',
    },

    // ─── Pagination ──────────────────────────────────────
    pagination: {
        pageSizeSelector: '.page-size-selector select, select[aria-label*="entries"]',
        nextPageButton: 'button:has-text("Next"), a:has-text("Next")',
        previousPageButton: 'button:has-text("Previous"), a:has-text("Previous")',
    },

    // ─── Common ──────────────────────────────────────────
    common: {
        breadcrumb: 'nav[aria-label="breadcrumb"]',
        successAlert: '.alert-success, .Toastify__toast--success',
        errorAlert: '.alert-danger, .Toastify__toast--error',
        warningAlert: '.alert-warning, .Toastify__toast--warning',
        spinner: '.spinner-border',
        modalShow: '.modal.show',
    },
} as const
