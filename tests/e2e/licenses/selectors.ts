// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

/**
 * Centralized selectors for the Licenses module.
 *
 * Selector strategy:
 * 1. #id (reliable for form fields)
 * 2. aria-label / role (good for buttons/links)
 * 3. CSS class (fallback)
 *
 * Key difference: License detail/edit pages use query params (?id=<shortName>) not path segments.
 */
export const selectors = {
    // ─── List Page ─────────────────────────────────────────
    list: {
        table: '.sw360-table',
        addLicenseButton: 'a:has-text("Add License"), button:has-text("Add License")',
        exportButton: 'a:has-text("Export Spreadsheet"), button:has-text("Export Spreadsheet")',
        quickFilterInput: '#licensefilter',
        quickFilterCard: '#component-quickfilter',
        licenseLinks: 'a[href*="/licenses/detail?id="]',
        pageContent: '.container.page-content',
        titleArea: '.buttonheader-title',
    },

    // ─── Add/Edit Form Fields ──────────────────────────────
    form: {
        fullName: '#fullName',
        shortName: '#shortName',
        licenseType: '#licenseTypeDatabaseId',
        osiApproved: '#OSIApproved',
        fsfLibre: '#FSFLibre',
        isChecked: '#isChecked',
        note: '#note',
        licenseText: '#text',
    },

    // ─── Tabs ──────────────────────────────────────────────
    tabs: {
        details: '[data-rr-ui-event-key="tab-details"]',
        text: '[data-rr-ui-event-key="tab-text"]',
        obligations: '[data-rr-ui-event-key="tab-obligations"]',
        changeLogs: '[data-rr-ui-event-key="tab-changeLogs"]',
    },

    // ─── Action Buttons ────────────────────────────────────
    actions: {
        createLicense: 'button:has-text("Create License")',
        updateLicense: 'button:has-text("Update License")',
        deleteLicense: 'button:has-text("Delete License")',
        editLicense: 'button:has-text("Edit License"), a:has-text("Edit License")',
        editWhitelist: 'button:has-text("Edit Whitelist")',
        updateWhitelist: 'button:has-text("Update whitelist")',
        addObligation: 'button:has-text("Add Obligation")',
        cancelButton: 'button:has-text("Cancel"), a:has-text("Cancel")',
    },

    // ─── Delete Dialog ─────────────────────────────────────
    deleteDialog: {
        modal: '.modal.show',
        title: '.modal.show .modal-title',
        confirmButton: '.modal.show button.login-btn.btn-danger, .modal.show button.btn-danger:has-text("Delete License")',
        cancelButton: '.modal.show button:has-text("Cancel")',
        message: '.modal.show .modal-body',
    },

    // ─── Detail Page ───────────────────────────────────────
    detail: {
        summaryTable: 'table.summary-table',
        checkedBadge: '.badge.bg-success',
        uncheckedBadge: '.badge.bg-danger',
        uncheckedAlert: '.alert.alert-danger',
        licenseTextPre: 'pre',
        externalLinkInput: 'input[name="externalLicenseLink"]',
        externalLinkSaveButton: 'button:has-text("Save")',
    },

    // ─── Obligations ───────────────────────────────────────
    obligations: {
        table: 'table',
        linkedObligationsDialog: '.modal.show',
        deleteObligationDialog: '.modal.show',
    },

    // ─── Common ────────────────────────────────────────────
    common: {
        successAlert: '.alert-success, .Toastify__toast--success',
        errorAlert: '.alert-danger, .Toastify__toast--error',
        spinner: '.spinner-border',
        breadcrumb: 'nav[aria-label="breadcrumb"], .breadcrumb',
    },
}
