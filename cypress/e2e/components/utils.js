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

export function fillDataComponent(dataTest, isUpdate) {
  cy.log('[INFO] Filling the data test')

  const nStep = Object.keys(dataTest).length

  for (let i = 0; i < nStep; i++) {
    const keyFieldName = Object.keys(dataTest)[i]
    const fieldValue = dataTest[keyFieldName]
    switch (keyFieldName) {
      case 'name':
      case 'categories':
      case 'blog_url':
      case 'wiki_url':
      case 'mailing_list_url':
      case 'description':
      case 'owner_accounting_unit':
      case 'owner_billing_group':
        cy.get(addEditSelectors.selectorsAsFieldNames(keyFieldName))
          .clear()
          .type(fieldValue)
        break
      case 'component_type':
      case 'country':
        cy.get(addEditSelectors.selectorsAsFieldNames(keyFieldName))
          .select(fieldValue.name)
        break
      case 'default_vendor':
        selectVendor(fieldValue)
        break
      case 'homeurl':
        cy.get(addEditSelectors.txtHomeUrl)
          .clear()
          .type(dataTest.homeurl)
        break
      case 'component_owner':
        cy.selectOneUser(addEditSelectors.dialogOwner,fieldValue.user_no)
        break
      case 'moderators':
        if (isUpdate == true) {
          cy.get(addEditSelectors.btnDeleteAllModerators).click()
          cy.selectMultiUsers(addEditSelectors.dialogModerator,fieldValue.num_user)
          break
        } else {
          cy.selectMultiUsers(addEditSelectors.dialogModerator,fieldValue.num_user)
          break
        }
      case 'additional_roles':
        // additional_roles is skipped because bug in new front end
        break
      case 'external_id':
        cy.get(addEditSelectors.addRowExternalId.btnAddRow)
          .click()
        cy.get(addEditSelectors.addRowExternalId.key).last()
          .type(fieldValue.key)
        cy.get(addEditSelectors.addRowExternalId.value).last()
          .type(fieldValue.value)
        break
      case 'additional_data':
        cy.get(addEditSelectors.addRowAdditionalData.btnAddRow)
          .click()
        cy.get(addEditSelectors.addRowAdditionalData.key).last()
          .type(fieldValue.key)
        cy.get(addEditSelectors.addRowAdditionalData.value).last()
          .type(fieldValue.value)
        break
      default:
        break
    }
  }
}

export function registerSimpleComponent(componentName, categories, conponentType) {
  cy.get(viewSelectors.navComponents).click()
  cy.contains('Add Component').click()
  cy.url().should('include', '/components/add')
  cy.get(addEditSelectors.selectorsAsFieldNames('name')).type(componentName)
  cy.get(addEditSelectors.selectorsAsFieldNames('categories')).type(categories)
  cy.get(addEditSelectors.selectorsAsFieldNames('component_type')).select(conponentType)
  cy.get(addEditSelectors.btnCreateComponent).click()
  cy.contains('Update Component')
}

export function gotoRegisterComponentPage() {
  cy.get(viewSelectors.navComponents).click()
  cy.contains('Add Component').click()
  cy.url().should('include', '/components/add')
}

export function gotoViewComponentPage(componentName) {
  cy.visit(`${Cypress.env('sw360_base_url')}/components`)
  cy.contains('Add Component')
  cy.get(viewSelectors.tblComponentList).should('be.visible')
  cy.get(viewSelectors.hyperlinkComponentNames).contains(componentName).invoke('attr', 'href').then((href) => {
    let component_id = href.split('/')[3]
    let viewUrl = "/components/detail/" + component_id
    cy.get(`a[href="${viewUrl}"]`).click()
  })
  cy.contains('Edit component')
}

export function gotoUpdateComponentPage(componentName) {
  cy.get(viewSelectors.navComponents).click()
  cy.contains('Add Component')
  cy.get(viewSelectors.tblComponentList).should('be.visible')
  cy.get(viewSelectors.hyperlinkComponentNames).contains(componentName).invoke('attr', 'href').then((href) => {
    let component_id = href.split('/')[3]
    let viewUrl = "/components/detail/" + component_id
    let editUrl = "/components/edit/" + component_id
    cy.get(`a[href="${viewUrl}"]`).click()
    cy.get(`a[href="${editUrl}"]`).click()
    cy.contains('Update Component')
  })
}

export function registerComponent(testId) {
  gotoRegisterComponentPage()
  cy.fixture('components/register').then((component) => {
    const dataTest = component[testId]
    fillDataComponent(dataTest, false)
  })
  cy.get(addEditSelectors.btnCreateComponent).click()
}

export function gotoUpdateReleasePageFromViewComponentPage(releaseVersion) {
  cy.get(viewSelectors.tabReleaseOverview).click()
  cy.get(viewSelectors.tblReleasesList.table).should('be.visible')
  cy.contains(releaseVersion).closest('tr').find('td').last().find('svg').first().click()
}


export function gotoViewReleasePageFromViewComponentPage(releaseVersion) {
  cy.get(viewSelectors.tabReleaseOverview).click()
  cy.get(viewSelectors.tblReleasesList.table).should('be.visible')
  cy.get('a:contains(' + releaseVersion + ')').click()
}

export function createComponent (name, componentType, categories) {
  return cy.createComponent(name, componentType, categories).then((component) => component.id)
}

export function createRelease (componentId, version) {
  cy.createRelease(componentId, version)
}