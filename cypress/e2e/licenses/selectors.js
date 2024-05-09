// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

// elements of add/ edit page
const btnAddObligation = 'Add Obligation'
const btnCreateLicense = '[href=""] > .btn-primary'
const btnUpdateLicense = ':nth-child(1) > .btn'
const txtFullName = '#fullName'
const txtShortName = '#shortName'
const selectLicenseType = '#licenseTypeDatabaseId'
const selectOSIApproved = '#OSIApproved'
const selectFSFFreeLibre = '#FSFLibre'
const cbIsChecked = '#isChecked'
const txtNote = '#note'
const txtLicenseText = '#text'
const tabLicense = '#tab-details'
const tabLinkedObligations = '#tab-obligations'
const tblObligations = '.gridjs'
const dlgLicenseObligations = {
    'sltDialog': '.modal-content',
    'sltTable': '.modal-body > :nth-child(1) > .row > :nth-child(2) > .gridjs',
    'sltCheckbox': '[data-column-id="obligationId"] > div > .checkbox-control',
    'sltAddBtn': '.modal-footer [type="button"]:nth-child(2)'
}
const btnDeleteLicense = ':nth-child(2) > .btn'
const dlgDeleteLicense = {
    'dialog': '.modal-content',
    'btnDeleteLicense': '.login-btn',
    'txtNotification': '.modal-body > .fade'
}
const rowsLinkedObligation = '.gridjs-tbody > .gridjs-tr'
const dlgDeleteLinkedObligation = {
    'dialog': '.modal-content',
    'btnDeleteObligation': '.login-btn'
}

export const addEditSelectors = {
    btnAddObligation,
    btnCreateLicense,
    btnUpdateLicense,
    txtFullName,
    txtShortName,
    selectLicenseType,
    selectOSIApproved,
    selectFSFFreeLibre,
    cbIsChecked,
    txtNote,
    txtLicenseText,
    tabLicense,
    tabLinkedObligations,
    tblObligations,
    dlgLicenseObligations,
    btnDeleteLicense,
    dlgDeleteLicense,
    rowsLinkedObligation,
    dlgDeleteLinkedObligation
}

//elements of view page
const tblLicenseList = '.gridjs-tbody'
const btnAddLicense = '[href="/licenses/add"] > .btn'
const navLicense = '.navbar-nav [href="/licenses"]'
const externalLink = '[name="externalLicenseLink"]'
const btnSave = '[class^="detail_button-save"]'
const fullName = '.table > tbody > :nth-child(1) > :nth-child(2)'
const shortName = '.table > tbody > :nth-child(2) > :nth-child(2)'
const isChecked = '.badge'
const licenseType = '.table > tbody > :nth-child(4) > :nth-child(2)'
const OSIApproved = ':nth-child(5) > :nth-child(2) > span'
const FSFFreeLibre = ':nth-child(6) > :nth-child(2) > span'
const note = ':nth-child(8) > :nth-child(2)'
const tabText = '#tab-text'
const licenseText = '[class^=detail_pre-text]'
const tabObligations = '#tab-obligations'
const tblLinkedObligations = ':nth-child(4) > .row > :nth-child(1) > :nth-child(2) > .gridjs .gridjs-table .gridjs-tbody'
const btnEditWhiteList = '[href=""] > .btn'
const tblWhiteList = ':nth-child(4) > .row > :nth-child(1) > :nth-child(2) > .gridjs tbody'
const tblUpdateWhiteList = ':nth-child(4) > .row > :nth-child(2) > .gridjs .gridjs-tbody'
const cbWhiteList = '[data-column-id="obligationId"] > :nth-child(1) > div > .form-check-input'
const btnUpdateWhiteList = '.btn-group > :nth-child(1) > .btn'
const alertMessage = '.alert-success'
const btnExportSpreadsheet = '[href="/licenses"] > .btn'

export const viewSelectors = {
    tblLicenseList,
    btnAddLicense,
    navLicense,
    externalLink,
    btnSave,
    fullName,
    shortName,
    isChecked,
    licenseType,
    OSIApproved,
    FSFFreeLibre,
    note,
    tabText,
    licenseText,
    tabObligations,
    tblLinkedObligations,
    btnEditWhiteList,
    tblWhiteList,
    tblUpdateWhiteList,
    cbWhiteList,
    btnUpdateWhiteList,
    alertMessage,
    btnExportSpreadsheet
}