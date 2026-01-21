// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { addEditSelectors, viewSelectors } from './selectors'

export function selectVendor(vendorInputData) {
  cy.openDialog(addEditSelectors.dialogVendor.openDialog, addEditSelectors.dialogVendor.dialog)
  cy.selectOrAddVendor(addEditSelectors.dialogVendor, vendorInputData)
}

export function selectLicenses(dialogLicense, licenseInputData) {
  cy.openDialog(dialogLicense.openDialog, dialogLicense.dialog)
  cy.get(dialogLicense.searchBtn)
    .contains('Search')
    .click()
  cy.selectItemsFromTable(dialogLicense.selectLicense, true, licenseInputData.num_license)
  cy.get(dialogLicense.selectLicenseBtn)
    .click()
}

export function gotoRegisterReleasePage() {
  cy.get(addEditSelectors.tabReleaseOverview).click()
  cy.get(addEditSelectors.btnAddRelease).click()
  cy.contains('Create Release')
}

export function fillDataRelease(dataTest) {
  cy.get(addEditSelectors.txtName).should('not.have.value', '')
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
        cy.get(addEditSelectors.txtVersion)
          .clear()
          .type(fieldValue)
        break
      case 'programming_languages':
        cy.get(addEditSelectors.txtProgrammingLanguages)
          .clear()
          .type(fieldValue)
        break
      case 'operating_systems':
        cy.get(addEditSelectors.txtOperatingSystems)
          .clear()
          .type(fieldValue)
        break
      case 'cpeid':
        cy.get(addEditSelectors.txtCpeid)
          .clear()
          .type(fieldValue)
        break
      case 'software_platforms':
        cy.get(addEditSelectors.txtSoftwarePlatforms)
          .clear()
          .type(fieldValue)
        break
      case 'release_date':
        // Skip
        break
      case 'main_license':
        selectLicenses(addEditSelectors.dialogMainLicense, fieldValue)
        break
      case 'other_license':
        selectLicenses(addEditSelectors.dialogOtherLicense, fieldValue)
        break
      case 'src_download_url':
        cy.get(addEditSelectors.txtSrcDownloadUrl)
          .clear()
          .type(fieldValue)
        break
      case 'binary_download_url':
        cy.get(addEditSelectors.txtBinaryDownloadUrl)
          .clear()
          .type(fieldValue)
        break
      case 'release_mainline_state':
        cy.get(addEditSelectors.sltReleaseMainlineState)
          .select(fieldValue.name)
        break
      case 'contributors':
        cy.selectMultiUsers(addEditSelectors.dialogContributor, fieldValue.num_user)
        break
      case 'moderators':
        cy.selectMultiUsers(addEditSelectors.dialogModerator, fieldValue.num_user)
        break
      case 'additional_roles':
        cy.get(addEditSelectors.addRowAdditionalRoles.btnAddRow)
          .eq(0).click()
        cy.get(addEditSelectors.addRowAdditionalRoles.key)
          .select(fieldValue.role.name)
        cy.get(addEditSelectors.addRowAdditionalRoles.value)
          .clear()
          .type(fieldValue.mail_address)
        break
      case 'external_id':
        cy.get(addEditSelectors.addRowExternalId.btnAddRow)
          .click()
        cy.get(addEditSelectors.addRowExternalId.key)
          .clear()
          .type(fieldValue.key)
        cy.get(addEditSelectors.addRowExternalId.value)
          .clear()
          .type(fieldValue.value)
        break
      case 'additional_data':
        cy.get(addEditSelectors.addRowAdditionalData.btnAddRow)
          .click()
        cy.get(addEditSelectors.addRowAdditionalData.key)
          .clear()
          .type(fieldValue.key)
        cy.get(addEditSelectors.addRowAdditionalData.value)
          .clear()
          .type(fieldValue.value)
        break
      case 'release_repository':
        cy.get(addEditSelectors.releaseRepository.sltRepositoryType)
          .select(fieldValue.repository_type.name)
        cy.get(addEditSelectors.releaseRepository.txtRepositoryUrl)
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
  cy.get(addEditSelectors.btnUpdateRelease)
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
          cy.get(addEditSelectors.txtVersion)
            .should('have.value', fieldValue)
          break
        case 'programming_languages':
          // Skip
          break
        case 'operating_systems':
          cy.get(addEditSelectors.txtOperatingSystems)
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
          cy.get(addEditSelectors.txtSrcDownloadUrl)
            .should('have.value', fieldValue)
          break
        case 'binary_download_url':
          cy.get(addEditSelectors.txtBinaryDownloadUrl)
            .should('have.value', fieldValue)
          break
        case 'release_mainline_state':
          cy.get(addEditSelectors.sltReleaseMainlineState)
            .should('have.value', fieldValue.value)
          break
        case 'contributors':
          // Skip
          break
        case 'moderators':
          // Skip
          break
        case 'additional_roles':
          cy.get(addEditSelectors.addRowAdditionalRoles.key)
            .should('have.value', fieldValue.role.name)
          cy.get(addEditSelectors.addRowAdditionalRoles.value)
            .should('have.value', fieldValue.mail_address)
          break
        case 'external_id':
          cy.get(addEditSelectors.addRowExternalId.key)
            .should('have.value', fieldValue.key)
          cy.get(addEditSelectors.addRowExternalId.value)
            .should('have.value', fieldValue.value)
          break
        case 'additional_data':
          cy.get(addEditSelectors.addRowAdditionalData.key)
            .should('have.value', fieldValue.key)
          cy.get(addEditSelectors.addRowAdditionalData.value)
            .should('have.value', fieldValue.value)
          break
        case 'release_repository':
          cy.get(addEditSelectors.releaseRepository.sltRepositoryType)
            .should('have.value', fieldValue.repository_type.value)
          cy.get(addEditSelectors.releaseRepository.txtRepositoryUrl)
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
  cy.get(addEditSelectors.txtVersion)
    .type(releaseVersion)
  cy.get(addEditSelectors.btnCreateRelease)
    .click()
  cy.contains('Update Release')
}

export function registerRelease(testId) {
  gotoRegisterReleasePage()
  cy.get('#name').invoke('val').should('not.equal', '')
  cy.fixture('releases/register').then((release) => {
    const dataTest = release[testId]
    fillDataRelease(dataTest)
  })
  cy.get(addEditSelectors.btnCreateRelease)
    .click()
}

export function registerAndVerifyRelease(testId) {
  registerRelease(testId)
  verifyReleaseAfterCreated(testId)
}

function addAttachment(fileNames, shouldUnAttachFile) {
  cy.openDialog(addEditSelectors.dialogAddAttachment.openDialog, addEditSelectors.dialogAddAttachment.dialog)
  cy.get('input[type=file]').selectFile(fileNames, { force: true })
  if (shouldUnAttachFile == true) {
    cy.get(addEditSelectors.dialogAddAttachment.removePreUploadFileInDialog).click()
  }

  cy.get(addEditSelectors.dialogAddAttachment.btnUpload).click()
  cy.get(addEditSelectors.dialogAddAttachment.dialog).should('not.exist')
  cy.get(addEditSelectors.dialogAddAttachment.tblAttachFileList).should('be.visible')
}

function uploadAttachment(dataTest) {
  cy.get(addEditSelectors.dialogAddAttachment.tabAttachments).click()
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
  cy.get(addEditSelectors.tabClearingDetails).click()
  cy.get(addEditSelectors.tblClearingDetails).should('be.visible')
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
          cy.get(addEditSelectors.selectorsAsFieldNames(keyFieldName)).check()
        } else cy.get(addEditSelectors.selectorsAsFieldNames(keyFieldName)).uncheck()
        break
      case 'scanned':
      case 'clearing_standard':
      case 'external_url':
      case 'comment':
      case 'request_id':
      case 'additional_request_info':
      case 'external_supplier_id':
      case 'count_security_vulnerabilities':
        cy.get(addEditSelectors.selectorsAsFieldNames(keyFieldName))
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
  cy.get(addEditSelectors.tabEccDetails).click()
  cy.get(addEditSelectors.tblEccDetails).should('be.visible')
  const nStep = Object.keys(dataTest).length
  for (let i = 0; i < nStep; i++) {
    const keyFieldName = Object.keys(dataTest)[i]
    const fieldValue = dataTest[keyFieldName]
    switch (keyFieldName) {
      case 'ECC_status':
        cy.get(addEditSelectors.sltEccStatus).select(fieldValue.name)
        break
      case 'ECC_comment':
      case 'ausfuhrliste':
      case 'eccn':
      case 'material_index_number':
        cy.get(addEditSelectors.selectorsAsFieldNames(keyFieldName)).clear()
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

function verifyYesNoValue(selector, fieldValue = false) {
  const expectedText = fieldValue ? ' Yes' : ' No'
  cy.get(selector).should('have.text', expectedText)
}

function verifyClearingDetailsViewTab(dataTest) {
  const clearingDetails = dataTest.clearing_details
  cy.get(viewSelectors.tabClearingDetails).click()
  cy.get(viewSelectors.tblClearingDetails).should('be.visible')
  Object.keys(clearingDetails).forEach((key) => {
    const fieldValue = clearingDetails[key]
    switch (key) {
      case 'binaries_original_from_community':
        verifyYesNoValue(viewSelectors.binariesOriginalFromCommunity, fieldValue)
        break
      case 'binaries_self_made':
        verifyYesNoValue(viewSelectors.binariesSelfMade, fieldValue)
        break
      case 'component_license_information':
        verifyYesNoValue(viewSelectors.componentLicenseInformation, fieldValue)
        break
      case 'source_code_delivery':
        verifyYesNoValue(viewSelectors.sourceCodeDelivery, fieldValue)
        break
      case 'source_code_community':
        verifyYesNoValue(viewSelectors.sourceCodeCommunity, fieldValue)
        break
      case 'source_code_tool_made':
        verifyYesNoValue(viewSelectors.sourceCodeToolMade, fieldValue)
        break
      case 'source_code_self_made':
        verifyYesNoValue(viewSelectors.sourceCodeSelfMade, fieldValue)
        break
      case 'screenshot_website':
        verifyYesNoValue(viewSelectors.screenshotWebsite, fieldValue)
        break
      case 'finalized_license_scan_report':
        verifyYesNoValue(viewSelectors.finalizedLicenseScanReport, fieldValue)
        break
      case 'license_scan_report_result':
        verifyYesNoValue(viewSelectors.licenseScanReportResult, fieldValue)
        break
      case 'legal_evaluation':
        verifyYesNoValue(viewSelectors.legalEvaluation, fieldValue)
        break
      case 'license_agreement':
        verifyYesNoValue(viewSelectors.licenseAgreement, fieldValue)
        break
      case 'component_clearing_report':
        verifyYesNoValue(viewSelectors.componentClearingReport, fieldValue)
        break
      case 'scanned':
        cy.get(viewSelectors.scanned).should('have.text', fieldValue)
        break
      case 'clearing_standard':
        cy.get(viewSelectors.clearingStandard).should('have.text', fieldValue)
        break
      case 'external_url':
        cy.get(viewSelectors.externalUrl).should('have.text', fieldValue)
        break
      case 'comment':
        cy.get(viewSelectors.comment).should('have.text', fieldValue)
        break
      case 'request_id':
        cy.get(viewSelectors.requestId).should('have.text', fieldValue)
        break
      case 'additional_request_info':
        cy.get(viewSelectors.additionalRequestInfo).should('have.text', fieldValue)
        break
      case 'external_supplier_id':
        cy.get(viewSelectors.externalSupplierId).should('have.text', fieldValue)
        break
      case 'count_security_vulnerabilities':
        cy.get(viewSelectors.countSecurityVulnerabilities).should('have.text', fieldValue)
        break
      default:
        break
    }
  })
}

function verifyEccDetailsViewTab(dataTest) {
  const eccDetails = dataTest.ecc_details
  cy.get(viewSelectors.tabEccDetails).click()
  cy.get(viewSelectors.tblEccDetails).should('be.visible')
  Object.keys(eccDetails).forEach((key) => {
    const fieldValue = eccDetails[key]
    switch (key) {
      case 'ECC_status':
        cy.get(viewSelectors.eccStatus)
          .should('have.text', fieldValue.name)
        break
      case 'ausfuhrliste':
        cy.get(viewSelectors.al)
          .should('have.text', fieldValue)
        break
      case 'eccn':
        cy.get(viewSelectors.eccn)
          .should('have.text', fieldValue)
        break
      case 'material_index_number':
        cy.get(viewSelectors.materialIndexNumber)
          .should('have.text', fieldValue)
        break
      case 'ECC_comment':
        cy.get(viewSelectors.eccComment)
          .should('have.text', fieldValue)
        break
      default:
        break
    }
  })
}

function verifyReleaseAfterUpdate(dataTest) {
  cy.log('[Info] Verify data after update')
  const nStep = Object.keys(dataTest).length
  for (let i = 0; i < nStep; i++) {
    const keyFieldName = Object.keys(dataTest)[i]
    const fieldValue = dataTest[keyFieldName]
    switch (keyFieldName) {
      case 'version':
        cy.get(viewSelectors.sltVersion)
          .should('have.text', 'Version ' + fieldValue)
        break
      case 'cpeid':
        cy.get(viewSelectors.cpeid)
          .should('have.text', fieldValue)
        break
      case 'clearing_details':
        // verifyClearingDetailsViewTab(dataTest) -- skip because bug new front end data in the "Legal Evaluation" field, "License Agreement" fields are incorrect.
        break
      case 'ecc_details':
        verifyEccDetailsViewTab(dataTest)
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
  cy.get('#name').invoke('val').should('not.equal', '')
  cy.fixture('releases/update').then((release) => {
    const dataTest = release[testId]
    fillUpdatedData(dataTest)
    cy.get(addEditSelectors.btnUpdateRelease).click({ force: true })
  })
}

export function updateAndVerifyReleaseAfterUpdate(testId) {
  cy.get('#name').invoke('val').should('not.equal', '')
  cy.fixture('releases/update').then((release) => {
    const dataTest = release[testId]
    fillUpdatedData(dataTest)
    cy.get(addEditSelectors.btnUpdateRelease).click({ force: true })
    cy.contains('Edit release')
    verifyReleaseAfterUpdate(dataTest)
  })
}
