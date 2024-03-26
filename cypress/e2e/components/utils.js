// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

const dialogVendor = {
  "openDialog": "#default_vendor",
  "dialog": ".modal.show > .modal-dialog > .modal-content",
  "addVendorBtn": ".justify-content-end > :nth-child(2)",
  "addVendorBtnInAddVendorDialog": "",
  "searchBtn": ":nth-child(2) > .modal-body > :nth-child(1) > .col-lg-4 > :nth-child(1)",
  "selectVendorBtn": ".justify-content-end > :nth-child(3)"
}

const dialogOwner = {
  "openDialog": "#component_owner",
  "dialog": ".modal.show > .modal-dialog > .modal-content",
  "searchBtn": ":nth-child(2) > .modal-body > :nth-child(1) > .col-lg-4 > :nth-child(1)",
  "selectUsersBtn": ".justify-content-end > :nth-child(3)"
}

const dialogModerator = {
  "openDialog": "#moderators",
  "dialog": ".modal.show > .modal-dialog > .modal-content",
  "searchBtn": ":nth-child(2) > .modal-body > :nth-child(1) > .col-lg-4 > :nth-child(1)",
  "selectUsersBtn": ".justify-content-end > :nth-child(3)"
}

function vendorSelectors(i) {
  return {
    "isChecked": ".gridjs-tbody > :nth-child(" + i + ") > [data-column-id=\"vendorId\"] > :nth-child(1) > div > .form-check-input"
  }
}

function ownerSelectors(i) {
  return {
    "isChecked": ".gridjs-tbody > :nth-child(" + i + ") > [data-column-id=\"userId\"] > :nth-child(1) > div > .form-check-input"
  }
}

function moderatorSelectors(i) {
  return {
    "isChecked": ".gridjs-tbody > :nth-child(" + i + ") > [data-column-id=\"\"] > :nth-child(1) > div > .form-check-input"
  }
}

export function selectVendor(vendorInputData) {
  cy.openDialog(dialogVendor.openDialog, dialogVendor.dialog)
  cy.selectOrAddVendor(dialogVendor, vendorSelectors, vendorInputData)
}

export function selectOwner(ownerInputData) {
  cy.openDialog(dialogOwner.openDialog, dialogOwner.dialog)

  cy.get(dialogOwner.searchBtn)
    .contains('Search')
    .click()

  cy.selectItemFromTable(ownerSelectors, false, ownerInputData.user_no)

  cy.get(dialogOwner.selectUsersBtn)
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
        cy.get('#' + keyFieldName)
          .clear()
          .type(fieldValue)
        break
      case 'component_type':
      case 'country':
        cy.get('#' + keyFieldName)
          .select(fieldValue.name)
        break
      case 'default_vendor':
        selectVendor(fieldValue)
        break
      case 'homeurl':
        cy.get('#tag')
          .clear()
          .type(dataTest.homeurl)
        break
      case 'component_owner':
        selectOwner(fieldValue)
        break
      case 'moderators':
        if (isUpdate == true) {
          cy.get(':nth-child(1) > :nth-child(1) > .col > .mb-4 > :nth-child(4) > :nth-child(2) > span').click()
          selectModerators(fieldValue)
          break
        } else {
          selectModerators(fieldValue)
          break
        }
      case 'additional_roles':
        // additional_roles is skipped because bug in new front end
        break
      case 'external_id':
        cy.get(':nth-child(4) > .row > .col-lg-4 > .btn')
          .click()
        cy.get('.form-control[aria-describedby="external id key"]').last()
          .type(fieldValue.key)
        cy.get('.form-control[aria-describedby="external id value"]').last()
          .type(fieldValue.value)
        break
      case 'additional_data':
        cy.get(':nth-child(5) > .row > .col-lg-4 > .btn')
          .click()
        cy.get('.form-control[aria-describedby="additional data key"]').last()
          .type(fieldValue.key)
        cy.get('.form-control[aria-describedby="additional data value"]').last()
          .type(fieldValue.value)
        break
      default:
        break
    }
  }
}

export function registerSimpleComponent(componentName, categories, conponentType) {
  cy.get('[href="/components"]').click()
  cy.contains('Add Component').click()
  cy.url().should('include', '/components/add')
  cy.get('#name').type(componentName)
  cy.get('#categories').type(categories)
  cy.get('#component_type').select(conponentType)
  cy.get('.btn-toolbar button[type="submit"]').click()
  cy.contains('Update Component')
}

export function gotoRegisterComponentPage() {
  cy.get('[href="/components"]').click()
  cy.contains('Add Component').click()
  cy.url().should('include', '/components/add')
}

export function gotoViewComponentPage(componentName) {
  cy.visit(`${Cypress.env('sw360_base_url')}/components`)
  cy.contains('Add Component')
  cy.get('[style="margin-bottom: 20px;"] > .row > :nth-child(2)').should('be.visible')
  cy.get('[data-column-id="name"] > div > .link').contains(componentName).invoke('attr', 'href').then((href) => {
    let component_id = href.split('/')[3]
    let viewUrl = "/components/detail/" + component_id
    cy.get(`a[href="${viewUrl}"]`).click()
  })
}

export function gotoUpdateComponentPage(componentName) {
  cy.get('[href="/components"]').click()
  cy.contains('Add Component')
  cy.get('[style="margin-bottom: 20px;"] > .row > :nth-child(2)').should('be.visible')
  cy.get('[data-column-id="name"] > div > .link').contains(componentName).invoke('attr', 'href').then((href) => {
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
  cy.get('.btn-toolbar button[type="submit"]').click()
}

export function gotoUpdateReleasePageFromViewComponentPage(releaseVersion) {
  cy.get('#tab-Releases').click()
  cy.get(':nth-child(3) > .row > :nth-child(2) > .gridjs').should('be.visible')
  cy.contains(releaseVersion).closest('tr').find('td').last().find('svg').first().click()
}


export function gotoViewReleasePageFromViewComponentPage(releaseVersion) {
  cy.get('#tab-Releases').click()
  cy.get(':nth-child(3) > .row > :nth-child(2) > .gridjs').should('be.visible')
  cy.get('a:contains(' + releaseVersion + ')').click()
}

export function createComponent (name, componentType, categories) {
  return cy.createComponent(name, componentType, categories).then((component) => component.id)
}

export function createRelease (componentId, version) {
  cy.createRelease(componentId, version)
}