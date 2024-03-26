// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

const dialogVendor = {
  "openDialog": "#default_vendor",
  "dialog": ".modal-content",
  "addVendorBtn": ".justify-content-end > :nth-child(2)",
  "addVendorBtnInAddVendorDialog": "",
  "searchBtn": ":nth-child(1) > .col-lg-4 > :nth-child(1)",
  "selectVendorBtn": ".justify-content-end > :nth-child(3)"
}

const dialogModerator = {
  "openDialog": "#moderators",
  "dialog": ".modal-content",
  "searchBtn": ":nth-child(1) > .col-lg-4 > :nth-child(1)",
  "selectUsersBtn": ".justify-content-end > :nth-child(3)"

}

const dialogContributor = {
  "openDialog": "#contributors",
  "dialog": ".modal-content",
  "searchBtn": ":nth-child(1) > .col-lg-4 > :nth-child(1)",
  "selectUsersBtn": ".justify-content-end > :nth-child(2)"
}

const dialogOtherLicense = {
  "openDialog": "#otherLicenseIds",
  "dialog": ".modal-content",
  "searchBtn": ":nth-child(1) > .col-lg-4 > :nth-child(1)",
  "selectLicenseBtn": ".justify-content-end > :nth-child(2)"
}

const dialogMainLicense = {
  "openDialog": "#mainLicenseIds",
  "dialog": ".modal-content",
  "searchBtn": ":nth-child(1) > .col-lg-4 > :nth-child(1)",
  "selectLicenseBtn": ".justify-content-end > :nth-child(2)"
}

function vendorSelectors(i) {
  return {
    "isChecked": ".gridjs-tbody > :nth-child(" + i + ") > [data-column-id=\"vendorId\"] > :nth-child(1) > div > .form-check-input",
    "givenName": ".gridjs-tbody > :nth-child(" + i + ") > [data-column-id=\"fullName\"]",
    "lastName": ".gridjs-tbody > :nth-child(" + i + ") > [data-column-id=\"shortName\"]",
  }
}

function moderatorSelectors(i) {
  return {
    "isChecked": ".gridjs-tbody > :nth-child(" + i + ") > [data-column-id=\"\"]",
    "givenName": ".gridjs-tbody > :nth-child(" + i + ") > [data-column-id=\"GivenName\"]",
    "lastName": ".gridjs-tbody > :nth-child(" + i + ") > [data-column-id=\"LastName\"]",
  }
}

function contributorSelectors(i) {
  return {
    "isChecked": ".gridjs-tbody > :nth-child(" + i + ") > [data-column-id=\"moderatorId\"] > :nth-child(1) > div > .form-check-input",
    "givenName": ".gridjs-tbody > :nth-child(" + i + ") > [data-column-id=\"givenName\"]",
    "lastName": ".gridjs-tbody > :nth-child(" + i + ") > [data-column-id=\"lastName\"]",
  }
}

function mainLicenseSelectors(i) {
  return {
    "isChecked": ".gridjs-tbody > :nth-child(" + i + ") > [data-column-id=\"licenseId\"] > :nth-child(1) > div > .form-check-input",
    "givenName": ".gridjs-tbody > :nth-child(" + i + ") > [data-column-id=\"license\"]"
  }
}

function otherLicenseSelectors(i) {
  return {
    "isChecked": ".gridjs-tbody > :nth-child(" + i + ") > [data-column-id=\"licenseId\"] > :nth-child(1) > div > .form-check-input",
    "givenName": ".gridjs-tbody > :nth-child(" + i + ") > [data-column-id=\"fullName\"]"
  }
}

export function selectVendor(vendorInputData) {
  cy.openDialog(dialogVendor.openDialog, dialogVendor.dialog)
  cy.selectOrAddVendor(dialogVendor, vendorSelectors, vendorInputData)
}

export function selectMainLicenses(licenseInputData) {
  cy.openDialog(dialogMainLicense.openDialog, dialogMainLicense.dialog)
  cy.get(dialogMainLicense.searchBtn)
    .contains('Search')
    .click()
  cy.selectItemFromTable(mainLicenseSelectors, true, licenseInputData.num_license)
  cy.get(dialogMainLicense.selectLicenseBtn)
    .click()
}

export function selectOtherLicenses(licenseInputData) {
  cy.openDialog(dialogOtherLicense.openDialog, dialogOtherLicense.dialog)
  cy.get(dialogOtherLicense.searchBtn)
    .contains('Search')
    .click()
  cy.selectItemFromTable(otherLicenseSelectors, true, licenseInputData.num_license)
  cy.get(dialogOtherLicense.selectLicenseBtn)
    .click()
}

export function selectModerators(moderatorInputData) {
  cy.openDialog(dialogModerator.openDialog, dialogModerator.dialog)
  cy.get(dialogModerator.searchBtn)
    .contains('Search')
    .click()
  cy.selectItemFromTable(moderatorSelectors, true, moderatorInputData.num_user)
  cy.get(dialogModerator.selectUsersBtn)
    .click()
}

export function selectContributors(contributorInputData) {
  cy.openDialog(dialogContributor.openDialog, dialogContributor.dialog)
  cy.get(dialogContributor.searchBtn)
    .contains('Search')
    .click()
  cy.selectItemFromTable(contributorSelectors, true, contributorInputData.num_user)
  cy.get(dialogContributor.selectUsersBtn)
    .click()
}

export function gotoRegisterReleasePage() {
  cy.get('#tab-releases').click()
  cy.get(':nth-child(3) > :nth-child(2) > .fw-bold').click()
  cy.contains('Create Release')
}

export function fillDataRelease(dataTest) {
  cy.log('------Fill datatest------')
  const nStep = Object.keys(dataTest).length
  for (let i = 0; i < nStep; i++) {
    const keyFieldName = Object.keys(dataTest)[i]
    const fieldValue = dataTest[keyFieldName]
    switch (keyFieldName) {
      case 'default_vendor':
        selectVendor(fieldValue)
        break
      case 'version':
        cy.get(':nth-child(3) > #version')
          .clear()
          .type(fieldValue)
        break
      case 'programming_languages':
      case 'operating_systems':
        cy.get('#' + keyFieldName)
          .clear()
          .type(fieldValue)
        break
      case 'cpeid':
        cy.get('#tag')
          .clear()
          .type(fieldValue)
        break
      case 'software_platforms':
        cy.get('#blog_url')
          .clear()
          .type(fieldValue)
        break
      case 'release_date':
        // Skip
        break
      case 'main_license':
        selectMainLicenses(fieldValue)
        break
      case 'other_license':
        selectOtherLicenses(fieldValue)
        break
      case 'src_download_url':
        cy.get('#wiki_url')
          .clear()
          .type(fieldValue)
        break
      case 'binary_download_url':
        cy.get('#binaryDownloadurl')
          .clear()
          .type(fieldValue)
        break
      case 'releasemainlinestate':
        cy.get('#mainlineState')
          .select(fieldValue.name)
        break
      case 'contributors':
        selectContributors(fieldValue)
        break
      case 'moderators':
        selectModerators(fieldValue)
        break
      case 'additional_roles':
        cy.get(':nth-child(2) > .row > .col-lg-4 > .btn')
          .click()
        cy.get(':nth-child(2) > .row > :nth-child(1) > .form-select')
          .select(fieldValue.role.name)
        cy.get(':nth-child(2) > .row > :nth-child(2) > .form-control')
          .clear()
          .type(fieldValue.mail_address)
        break
      case 'external_id':
        cy.get(':nth-child(3) > .row > .col-lg-4 > .btn')
          .click()
        cy.get('.col-lg-6 > .form-control')
          .clear()
          .type(fieldValue.key)
        cy.get(':nth-child(3) > :nth-child(2) > .row > .col-lg-5 > .form-control')
          .clear()
          .type(fieldValue.value)
        break
      case 'additional_data':
        cy.get(':nth-child(4) > .row > .col-lg-4 > .btn')
          .click()
        cy.get(':nth-child(4) > :nth-child(2) > .row > .col-lg-6 > .form-control')
          .clear()
          .type(fieldValue.key)
        cy.get(':nth-child(4) > :nth-child(2) > .row > .col-lg-5 > .form-control')
          .clear()
          .type(fieldValue.value)
        break
      case 'release_repository':
        cy.get('#repository_type')
          .select(fieldValue.repository_type.name)
        cy.get(':nth-child(2) > #version')
          .clear()
          .type(fieldValue.repository_URL)
        break
      default:
        break
    }
  }
}

function verifyReleaseAfterCreated(testId) {
  cy.log('[Info] Validate Release after created')
  cy.get('.btn-group> :nth-child(1) > .btn')
    .contains('Update Release')
  cy.fixture('releases/register').then((release) => {
    const dataTest = release[testId]
    const nStep = Object.keys(dataTest).length
    for (let i = 0; i < nStep; i++) {
      const keyFieldName = Object.keys(dataTest)[i]
      const fieldValue = dataTest[keyFieldName]
      switch (keyFieldName) {
        case 'default_vendor':
          // Skip
          break
        case 'version':
          cy.get(':nth-child(3) > #version')
            .should('have.value', fieldValue)
          break
        case 'programming_languages':
          // Skip
          break
        case 'operating_systems':
          cy.get('#' + keyFieldName)
            .should('have.value', fieldValue)
          break
        case 'cpeid':
          // Skip
          break
        case 'software_platforms':
          // Skip
          break
        case 'main_license':
          // Skip
          break
        case 'other_license':
          // Skip
          break
        case 'src_download_url':
          cy.get('#wiki_url')
            .should('have.value', fieldValue)
          break
        case 'binary_download_url':
          cy.get('#binaryDownloadurl')
            .should('have.value', fieldValue)
          break
        case 'releasemainlinestate':
          cy.get('#mainlineState')
            .should('have.value', fieldValue.value)
          break
        case 'contributors':
          // Skip
          break
        case 'moderators':
          // Skip
          break
        case 'additional_roles':
          cy.get(':nth-child(2) > .row > :nth-child(1) > .form-select')
            .should('have.value', fieldValue.role.name)
          cy.get(':nth-child(2) > .row > :nth-child(2) > .form-control')
            .should('have.value', fieldValue.mail_address)
          break
        case 'external_id':
          cy.get('.col-lg-6 > .form-control')
            .should('have.value', fieldValue.key)
          cy.get(':nth-child(3) > :nth-child(2) > .row > .col-lg-5 > .form-control')
            .should('have.value', fieldValue.value)
          break
        case 'additional_data':
          cy.get(':nth-child(4) > :nth-child(2) > .row > .col-lg-6 > .form-control')
            .should('have.value', fieldValue.key)
          cy.get(':nth-child(4) > :nth-child(2) > .row > .col-lg-5 > .form-control')
            .should('have.value', fieldValue.value)
          break
        case 'release_repository':
          cy.get('#repository_type')
            .should('have.value', fieldValue.repository_type.value)
          cy.get(':nth-child(2) > #version')
            .should('have.value', fieldValue.repository_URL)
          break
        default:
          break
      }
    }
  })
}

export function registerSimpleRelease(releaseVersion) {
  gotoRegisterReleasePage()
  cy.get(':nth-child(3) > #version')
    .type(releaseVersion)
  cy.get('[href=""] > .btn')
    .click()
  cy.contains('Update Release')
}

export function registerRelease(testId) {
  gotoRegisterReleasePage()
  cy.fixture('releases/register').then((release) => {
    const dataTest = release[testId]
    fillDataRelease(dataTest)
  })
  cy.get('[href=""] > .btn')
    .click()
}

export function registerAndVerifyRelease(testId) {
  registerRelease(testId)
  verifyReleaseAfterCreated(testId)
}

function addAttachment(fileNames, shouldUnAttachFile) {
  let openDialog = ':nth-child(7) > :nth-child(2) > .fw-bold'
  let dialog = '.modal-content'
  cy.openDialog(openDialog, dialog)

  cy.get('input[type=file]').selectFile(fileNames, { force: true })
  if (shouldUnAttachFile == true) {
    cy.get(':nth-child(1) > .SelectAttachment_button-delete__QEfUR > .btn').click()
  }

  cy.get('.button-orange').click()
  cy.get('.Attachment_attachment-table__T7Kx_').should('be.visible')
}

function uploadAttachment(dataTest) {
  cy.get('#tab-Attachments').click()
  cy.contains('Add Attachment')
  let attachmentLength = Object.keys(dataTest).length
  for (let i = 0; i < attachmentLength; i++) {
    const keyFieldName = Object.keys(dataTest)[i]
    const fieldValue = dataTest[keyFieldName]
    switch (keyFieldName) {
      case 'fileNames':
        const fileNames = fieldValue
        addAttachment(fileNames, dataTest.shouldUnAttachFile)
        break
      case 'type':
        // Skip
        break
      case 'uploadComment':
        // Skip
        break
      case 'status':
        // Skip
        break
      case 'approvalComment':
        // Skip
        break
      default:
        break
    }
  }
}

function updateClearingDetails(dataTest) {
  cy.log('[Info] Fill test data on clearing details page')
  cy.get('#tab-ClearingDetails').click()
  cy.contains('Clearing Details')
  const nStep = Object.keys(dataTest).length
  for (let i = 0; i < nStep; i++) {
    const keyFieldName = Object.keys(dataTest)[i]
    const fieldValue = dataTest[keyFieldName]
    switch (keyFieldName) {
      case 'binaries_original_from_community':
      case 'binaries_self_made':
      case 'component_license_information':
      case 'source_code_delivery':
      case 'source_code_community':
      case 'source_code_tool_made':
      case 'source_code_self_made':
      case 'screenshot_website':
      case 'finalized_license_scan_report':
      case 'license_scan_report_result':
      case 'legal_evaluation':
      case 'license_agreement':
      case 'component_clearing_report':
        if (fieldValue == true) {
          cy.get('#' + keyFieldName).check()
        } else cy.get('#' + keyFieldName).uncheck()
        break
      case 'scanned':
      case 'clearing_standard':
      case 'external_url':
      case 'comment':
      case 'request_id':
      case 'additional_request_info':
      case 'external_supplier_id':
      case 'count_security_vulnerabilities':
        cy.get('#' + keyFieldName)
          .clear()
          .type(fieldValue)
      case 'evaluation_start':
      case 'evaluation_end':
        // Bug so not implemented yet.
        break
      default:
        break
    }
  }
}

function updateECCDetails(dataTest) {
  cy.log('[Info] Fill test data on clearing details page')
  cy.get('#tab-EccDetails').click()
  cy.contains('ECC Information')
  const nStep = Object.keys(dataTest).length
  for (let i = 0; i < nStep; i++) {
    const keyFieldName = Object.keys(dataTest)[i]
    const fieldValue = dataTest[keyFieldName]
    switch (keyFieldName) {
      case 'ECC_status':
        cy.get('#ECC_Status').select(fieldValue.name)
        break
      case 'ECC_comment':
      case 'ausfuhrliste':
      case 'eccn':
      case 'material_index_number':
        cy.get('#' + keyFieldName).clear()
          .type(fieldValue)
        break
      default:
        break
    }
  }

}

export function fillUpdatedData(dataTest) {
  cy.log('[Info] Fill datatest')
  fillDataRelease(dataTest)
  const nStep = Object.keys(dataTest).length
  for (let i = 0; i < nStep; i++) {
    const keyFieldName = Object.keys(dataTest)[i]
    const fieldValue = dataTest[keyFieldName]
    switch (keyFieldName) {
      case 'clearing_details':
        updateClearingDetails(fieldValue)
        break
      case 'ecc_details':
        updateECCDetails(fieldValue)
      case 'attachment':
        uploadAttachment(fieldValue)
        break
      default:
        break
    }
  }
}

function verifyReleaseAfterUpdate(dataTest) {
  cy.log('[Info] Verify data after update')
  const nStep = Object.keys(dataTest).length
  for (let i = 0; i < nStep; i++) {
    const keyFieldName = Object.keys(dataTest)[i]
    const fieldValue = dataTest[keyFieldName]
    switch (keyFieldName) {
      case 'version':
        cy.get('#react-aria4178382462-\:r2\:')
          .should('have.text', 'Version ' + fieldValue)
        break
      case 'cpeid':
        cy.get(':nth-child(2) > :nth-child(1) > tbody > :nth-child(2) > :nth-child(2)')
          .should('have.text', fieldValue)
        break
      default:
        break
    }
  }
}

export function gotoUpdateReleasePageFromViewReleasePage() {
  cy.get('#documentId').invoke('text').then((releaseId) => {
    let editReleaseUrl = "/components/editRelease/" + releaseId
    cy.get(`a[href="${editReleaseUrl}"]`).click()
    cy.contains('Update Release')
  })
}

export function updateRelease(testId) {
  cy.fixture('releases/update').then((release) => {
    const dataTest = release[testId]
    fillUpdatedData(dataTest)
    cy.get('.btn-group > :nth-child(1) > .btn').click({ force: true })
  })
}

export function updateAndVerifyReleaseAfterUpdate(testId) {
  cy.fixture('releases/update').then((release) => {
    const dataTest = release[testId]
    fillUpdatedData(dataTest)
    cy.get('.btn-group > :nth-child(1) > .btn').click({ force: true })
    verifyReleaseAfterUpdate(dataTest)
  })
}
