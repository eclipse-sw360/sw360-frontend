// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

// elements of add/edit release page
export const addEditSelectors = {
    selectorsAsFieldNames: (key) => `#${key}`,
    tabReleaseOverview: '#tab-releases',
    btnAddRelease: '.container > :nth-child(1) > :nth-child(2) > :nth-child(3) > :nth-child(2) > .fw-bold',
    btnCreateRelease: '[href=""] > .btn',
    btnUpdateRelease: '.btn-group > :nth-child(1) > .btn',

    // Summary tab
    txtName: '#name',
    txtVersion: ':nth-child(3) > #version',
    txtProgrammingLanguages: '#programming_languages',
    txtOperatingSystems: '#operating_systems',
    txtCpeid: '#tag',
    txtSoftwarePlatforms: '#blog_url',
    txtSrcDownloadUrl: '#wiki_url',
    txtBinaryDownloadUrl: '#binaryDownloadurl',
    sltReleaseMainlineState: '#mainlineState',
    dialogVendor: {
        'openDialog': '#default_vendor',
        'dialog': '.modal-content',
        'addVendorBtn': '.justify-content-end > :nth-child(2)',
        'addVendorBtnInAddVendorDialog': '',
        'searchBtn': ':nth-child(1) > .col-lg-4 > :nth-child(1)',
        'selectUser': '[data-column-id="vendorId"] > :nth-child(1) > div > .form-check-input',
        'selectVendorBtn': '.justify-content-end > :nth-child(3)',
        'givenName': '[data-column-id="fullName"]',
        'lastName': '[data-column-id="shortName"]',
    },

    dialogModerator: {
        'openDialog': '#moderators',
        'dialog': '.modal-content',
        'searchBtn': ':nth-child(1) > .col-lg-4 > :nth-child(1)',
        'selectUser': '[data-column-id="user-selection"] > :nth-child(1) > div > .form-check-input',
        'selectUsersBtn': '.justify-content-end > .btn-primary',
        'givenName': '[data-column-id="GivenName"]',
        'lastName': '[data-column-id="LastName"]',

    },

    dialogContributor: {
        'openDialog': '#contributors',
        'dialog': '.modal-content',
        'searchBtn': ':nth-child(1) > .col-lg-4 > :nth-child(1)',
        'selectUser': '[data-column-id="user-selection"] > :nth-child(1) > div > .form-check-input',
        'selectUsersBtn': '.justify-content-end > :nth-child(2)',
        'givenName': '[data-column-id="givenName"]',
        'lastName': '[data-column-id="lastName"]',
    },

    dialogOtherLicense: {
        'openDialog': '#otherLicenseIds',
        'dialog': '.modal-content',
        'searchBtn': ':nth-child(1) > .col-lg-4 > :nth-child(1)',
        'selectLicense': '[data-column-id="licenseId"] > :nth-child(1) > div > .form-check-input',
        'selectLicenseBtn': '.justify-content-end > :nth-child(2)',
        'givenName': '[data-column-id="fullName"]',
    },

    dialogMainLicense: {
        'openDialog': '#mainLicenseIds',
        'dialog': '.modal-content',
        'searchBtn': ':nth-child(1) > .col-lg-4 > :nth-child(1)',
        'selectLicense': '[data-column-id="licenseId"] > :nth-child(1) > div > .form-check-input',
        'selectLicenseBtn': '.justify-content-end > :nth-child(2)',
        'givenName': '[data-column-id="license"]',
    },

    addRowAdditionalRoles: {
        'btnAddRow': '.row > .row > .col-lg-4 > .btn',
        'key': ':nth-child(2) > .row > :nth-child(1) > .form-select',
        'value': ':nth-child(2) > :nth-child(2) > .row > :nth-child(2) > .form-control'
    },

    addRowExternalId: {
        'btnAddRow': ':nth-child(3) > .row > .col-lg-4 > .btn',
        'key': '.col-lg-6 > .form-control',
        'value': ':nth-child(3) > :nth-child(2) > .row > .col-lg-5 > .form-control'
    },

    addRowAdditionalData: {
        'btnAddRow': ':nth-child(4) > .row > .col-lg-4 > .btn',
        'key': ':nth-child(4) > :nth-child(2) > .row > .col-lg-6 > .form-control',
        'value': ':nth-child(4) > :nth-child(2) > .row > .col-lg-5 > .form-control'
    },

    releaseRepository: {
        sltRepositoryType: '#repository_type',
        txtRepositoryUrl: ':nth-child(2) > #version'
    },

    // Attachments tab
    dialogAddAttachment: {
        tabAttachments: '#tab-Attachments',
        openDialog: '.page-content > :nth-child(1) > :nth-child(2) > :nth-child(6) > :nth-child(2) > .fw-bold',
        dialog: '.modal-content',
        removePreUploadFileInDialog: ':nth-child(1) > .SelectAttachment_button-delete__QEfUR > .btn',
        btnUpload: '.button-orange',
        tblAttachFileList: '.Attachment_attachment-table__T7Kx_'
    },

    // Clearing Details tab
    tabClearingDetails: '#tab-ClearingDetails',
    tblClearingDetails: '.page-content > :nth-child(1) > :nth-child(2) > :nth-child(4)',

    // ECC Details tab
    tabEccDetails: '#tab-EccDetails',
    sltEccStatus: '#ECC_Status',
    tblEccDetails: ':nth-child(5) > .container',

}

//elements of view page
export const viewSelectors = {
    tabLinkedReleases: '#tab-Releases',
    tabClearingDetails: '#tab-ClearingDetails',
    tabEccDetails: '#tab-EccDetails',
    hyperlinkComponentNames: '[data-column-id="name"] > div > .link',
    sltVersion: '[id^="react-aria"]',
    btnLinkToProject: '.btn-group > :nth-child(2) > .btn',
    dialogLinkReleaseToProject: {
        btnSearch: '.col-lg-3 > .btn',
        btnsCloseAndLinkToProject: '.justify-content-end button'
    },

    // Summary tab
    cpeid: ':nth-child(2) > :nth-child(1) > tbody > :nth-child(2) > :nth-child(2)',
    releaseDate: '.col > :nth-child(2) > :nth-child(1) > tbody > :nth-child(3) > :nth-child(2)',
    contributors: ':nth-child(2) > :nth-child(1) > tbody > :nth-child(8) > :nth-child(2)',
    moderators: ':nth-child(2) > :nth-child(1) > tbody > :nth-child(9) > :nth-child(2)',
    subscribers: ':nth-child(2) > :nth-child(1) > tbody > :nth-child(10) > :nth-child(2)',
    additionalRoles: ':nth-child(2) > :nth-child(1) > tbody > :nth-child(11) > :nth-child(2)',
    srcDownloadURL: ':nth-child(1) > tbody > :nth-child(12) > :nth-child(2)',
    binaryDownloadURL: ':nth-child(1) > tbody > :nth-child(13) > :nth-child(2)',
    clearingState: ':nth-child(1) > tbody > :nth-child(14) > :nth-child(2)',
    releaseMainlineState: ':nth-child(1) > tbody > :nth-child(15) > :nth-child(2)',
    mainLicenses: ':nth-child(1) > tbody > :nth-child(16) > :nth-child(2)',
    otherLicenses: ':nth-child(1) > tbody > :nth-child(17) > :nth-child(2)',
    programmingLanguages: ':nth-child(1) > tbody > :nth-child(18) > :nth-child(2)',
    operatingSystems: ':nth-child(1) > tbody > :nth-child(19) > :nth-child(2)',
    externalIds: ':nth-child(1) > tbody > :nth-child(20) > :nth-child(2)',
    additionalData: ':nth-child(1) > tbody > :nth-child(21) > :nth-child(2)',

    // Clearing Details tab
    tblClearingDetails: ':nth-child(5) > .col > :nth-child(3)',
    binariesOriginalFromCommunity: ':nth-child(3) > tbody > :nth-child(2) > :nth-child(2) > span',
    binariesSelfMade: ':nth-child(3) > tbody > :nth-child(3) > :nth-child(2) > span',
    componentLicenseInformation: ':nth-child(4) > :nth-child(2) > span',
    sourceCodeDelivery: ':nth-child(3) > tbody > :nth-child(5) > :nth-child(2) > span',
    sourceCodeCommunity: ':nth-child(6) > :nth-child(2) > span',
    sourceCodeToolMade: ':nth-child(7) > :nth-child(2) > span',
    sourceCodeSelfMade: ':nth-child(8) > :nth-child(2) > span',
    screenshotWebsite: ':nth-child(9) > :nth-child(2) > span',
    finalizedLicenseScanReport: ':nth-child(10) > :nth-child(2) > span',
    licenseScanReportResult: ':nth-child(11) > :nth-child(2) > span',
    legalEvaluation: ':nth-child(12) > :nth-child(2) > span',
    licenseAgreement: ':nth-child(13) > :nth-child(2) > span',
    scanned: ':nth-child(3) > tbody > :nth-child(14) > :nth-child(2)',
    componentClearingReport: ':nth-child(15) > :nth-child(2) > span',
    clearingStandard: ':nth-child(3) > tbody > :nth-child(16) > :nth-child(2)',
    externalUrl: ':nth-child(3) > tbody > :nth-child(17) > :nth-child(2)',
    comment: ':nth-child(3) > tbody > :nth-child(18) > :nth-child(2)',
    requestId: ':nth-child(5) > .col > :nth-child(4) > tbody > :nth-child(1) > :nth-child(2)',
    additionalRequestInfo: ':nth-child(4) > tbody > :nth-child(2) > :nth-child(2)',
    externalSupplierId: ':nth-child(5) > .col > :nth-child(5) > tbody > :nth-child(1) > :nth-child(2)',
    countSecurityVulnerabilities: ':nth-child(5) > .col > :nth-child(5) > tbody > :nth-child(2) > :nth-child(2)',

    // ECC Details tab
    tblEccDetails: ':nth-child(6) > .col > .table',
    eccStatus: ':nth-child(6) > .col > .table > tbody > :nth-child(1) > :nth-child(2)',
    al: ':nth-child(6) > .col > .table > tbody > :nth-child(2) > :nth-child(2)',
    eccn: ':nth-child(6) > .col > .table > tbody > :nth-child(3) > :nth-child(2)',
    materialIndexNumber: ':nth-child(6) > .col > .table > tbody > :nth-child(4) > :nth-child(2)',
    eccComment: ':nth-child(6) > .col > .table > tbody > :nth-child(5) > :nth-child(2)',

    // SuccessMessage when link release to project
    linkToPJSuccessMessage: '.alert.alert-success'
}
