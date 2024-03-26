// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { registerComponent } from './utils.js';
import { updateRelease, registerAndVerifyRelease, updateAndVerifyReleaseAfterUpdate, gotoUpdateReleasePageFromViewReleasePage } from '../releases/utils.js';

function verifyComponentAfterCreated(testId) {
  cy.log('[Info] Validate Testcase')
  cy.get('.btn-group > :nth-child(1) > .btn')
    .contains('Update Component')
  cy.fixture('components/register').then((component) => {
    const dataTest = component[testId]
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
            .should('have.value', fieldValue)
          break
        case 'component_type':
        case 'country':
          cy.get('#' + keyFieldName)
            .should('have.value', fieldValue.value)
          break
        case 'default_vendor':
          //
          break
        case 'homeurl':
          cy.get('#tag')
            .should('have.value', dataTest.homeurl)
          break
        case 'component_owner':
          // Skipped because bug in new front end
          break
        case 'moderators':
          // Skipped because bug in new front end
          break
        case 'additional_roles':
          break
        case 'external_id':
          cy.get(':nth-child(4) > :nth-child(2) > .row > .col-lg-6 > .form-control')
            .should('have.value', fieldValue.key)
          cy.get('.col-lg-5 > .form-control')
            .should('have.value', fieldValue.value)
          break
        case 'additional_data':
          cy.get(':nth-child(5) > :nth-child(2) > .row > .col-lg-6 > .form-control')
            .should('have.value', fieldValue.key)
          cy.get(':nth-child(5) > :nth-child(2) > .row > .col-lg-5 > .form-control')
            .should('have.value', fieldValue.value)
          break
        default:
          break
      }
    }
  })

}

export function registerAndVerifyComponent(testId) {
  registerComponent(testId)
  verifyComponentAfterCreated(testId)
}

describe('Register a component', () => {
  beforeEach(() => {
    cy.login('admin')
  })

  it('TC01 + TC02: Add a component and release with vendor present and verify', () => {
    registerAndVerifyComponent('TC01_REQUIRED_FIELDS')
    registerAndVerifyRelease('TC01_RELEASE_WITH_CPEID')
    updateAndVerifyReleaseAfterUpdate('TC01_ADD_NEW_VENDOR_AND_ATTACHMENT')
  })

  it('TC05: Add and modify a component and release with all fields filled in', () => {
    registerAndVerifyComponent('TC05_ALL_FIELDS')
    registerAndVerifyRelease('TC05_ALL_FIELDS')
    updateAndVerifyReleaseAfterUpdate('TC05_ALL_FIELDS')
    gotoUpdateReleasePageFromViewReleasePage()
    updateAndVerifyReleaseAfterUpdate('TC05_RE-UPDATED')
  })

})