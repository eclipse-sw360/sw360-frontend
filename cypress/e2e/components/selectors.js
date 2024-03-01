// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

// elements of add/edit component page
export const addEditSelectors = {
    btnCreateComponent: '.btn-toolbar button[type="submit"]',
    btnUpdateComponent: '.btn-group > :nth-child(1) > .btn',
    selectorsAsFieldNames: (key) => `#${key}`,
    txtHomeUrl: '#tag',
    btnDeleteAllModerators: ':nth-child(2) > :nth-child(3) > :nth-child(2) > span',
    dialogVendor: {
        'openDialog': '#default_vendor',
        'dialog': '.modal.show > .modal-dialog > .modal-content',
        'addVendorBtn': '.justify-content-end > :nth-child(2)',
        'addVendorBtnInAddVendorDialog': '',
        'searchBtn': ':nth-child(2) > .modal-body > :nth-child(1) > .col-lg-4 > :nth-child(1)',
        'selectUser': '[data-column-id="vendorId"] > :nth-child(1) > div > .form-check-input',
        'selectVendorBtn': '.justify-content-end > :nth-child(3)',
    },

    dialogOwner: {
        'openDialog': '#component_owner',
        'dialog': '.modal.show > .modal-dialog > .modal-content',
        'searchBtn': '.modal.show > .modal-dialog > .modal-content > .modal-body > :nth-child(1) > .col-lg-4 > :nth-child(1)',
        'selectUser': '[data-column-id="user-selection"] .form-check-input',
        'selectUsersBtn': '.justify-content-end > .btn-primary',
    },

    dialogModerator: {
        'openDialog': '#moderators',
        'dialog': '.modal.show > .modal-dialog > .modal-content',
        'searchBtn': '.modal.show > .modal-dialog > .modal-content > .modal-body > :nth-child(1) > .col-lg-4 > :nth-child(1)',
        'selectUser': '[data-column-id="user-selection"] .form-check-input',
        'selectUsersBtn': '.justify-content-end > .btn-primary',
    },

    addRowExternalId: {
        'btnAddRow': ':nth-child(4) > .row > .col-lg-4 > .btn',
        'key': '.form-control[aria-describedby="external id key"]',
        'value': '.form-control[aria-describedby="external id value"]'
    },

    addRowAdditionalData: {
        'btnAddRow': ':nth-child(5) > .row > .col-lg-4 > .btn',
        'key': '.form-control[aria-describedby="additional data key"]',
        'value': '.form-control[aria-describedby="additional data value"]'
    }
}

//elements of view page
export const viewSelectors = {
    navComponents: '[href="/components"]',
    tblComponentList: '.gridjs',
    hyperlinkComponentNames: '[data-column-id="name"] > div > .link',
    tabReleaseOverview: '#tab-Releases',
    tblReleasesList: {
        table: ':nth-child(3) > .row > :nth-child(2) > .gridjs',
        releaseName: ':nth-child(3) > .row > :nth-child(2) .gridjs-table > tbody > tr > td:nth-child(1)',
        releaseVersion: ':nth-child(3) > .row > :nth-child(2) .gridjs-table > tbody > tr > td:nth-child(2)'
    },
    dialogDeleteComponent: {
        dialog: '.modal-content',
        btnDeleteComponent: '.login-btn',
        alertSuccess: '.alert-success',
        btnClose: '.delete-btn'
    },

    btnExportSpreadsheet: '#project-export',
    btnExportComponentsOnly: '.dropdown-menu > :nth-child(1)',
    btnExportComponentsWithReleases: '.dropdown-menu > :nth-child(2)',
    btnImportSBOM: 'a>.btn-secondary',
    uploadFiles: 'input[type="file"]',
    dialogUploadSBOM: {
        successMessage: '.modal-body > div > p',
        newComponentsInfo: '.modal-body > div > div:nth-child(2)',
        newReleasesInfo: '.modal-body > div > div:nth-child(3)',
        btnImportAndClose: '.modal-content .btn-primary',

    },

    componentName: '.text-truncate',

    // Release Overview tab
    actionsInReleaseListTbl: '[data-column-id="action"] > div > span',
    btnDeleteRelease: '.login-btn'
}