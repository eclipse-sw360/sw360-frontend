// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

/**
 * Centralized selectors for the Packages module E2E tests.
 */
export const selectors = {
    list: {
        addButton: 'button:has-text("Add Package")',
        headerTitle: '.buttonheader-title',
        table: '.sw360-table',
        editIcon: '.btn-icon[data-testid="edit-icon"], svg.btn-icon',
        deleteIcon: '.btn-icon[data-testid="delete-icon"], svg.btn-icon',
        pageSizeSelector: '.dataTables_length select.form-select',
    },
    form: {
        name: '#createOrEditPackage\\.name',
        version: '#createOrEditPackage\\.version',
        packageType: '#createOrEditPackage\\.packageType',
        purl: '#createOrEditPackage\\.purl',
        packageManager: '#createOrEditPackage\\.packageManager',
        vcs: '#createOrEditPackage\\.vcs',
        licenseIds: '#createOrEditPackage\\.licenseIds',
        release: '#createOrEditPackage\\.release',
        homepageUrl: '#createOrEditPackage\\.homepageUrl',
        createdOn: '#createOrEditPackage\\.createdOn',
        createdBy: '#createOrEditPackage\\.createdBy',
        modifiedBy: '#createOrEditPackage\\.modifiedBy',
        description: '#createOrEditPackage\\.description',
        formId: '#add_or_edit_package_form_submit',
    },
    actions: {
        createPackage: 'button:has-text("Create Package")',
        updatePackage: 'button:has-text("Update Package")',
        deletePackage: 'button:has-text("Delete Package")',
        cancelButton: 'button:has-text("Cancel")',
        editPackage: 'button:has-text("Edit Package")',
    },
    detail: {
        summaryTable: 'table.summary-table',
        editButton: 'button:has-text("Edit Package")',
        breadcrumb: '.breadcrumb',
    },
    tabs: {
        summary: '[data-rr-ui-event-key="summary"]',
        changeLog: '[data-rr-ui-event-key="changeLog"]',
    },
    deleteDialog: {
        modal: '.modal.show',
        message: '.modal.show .modal-body',
        confirmButton: '.modal.show .modal-footer button.btn-danger',
        cancelButton: '.modal.show .modal-footer button.btn-dark',
        closeButton: '.modal.show .modal-footer button.btn-dark:has-text("Close")',
        alertMessage: '#deletePackage\\.message\\.alert',
    },
    common: {
        successAlert: '.alert-success, .Toastify__toast--success',
        errorAlert: '.alert-danger, .Toastify__toast--error',
        spinner: '.spinner-border, .spinner',
    },
}
