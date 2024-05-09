// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { viewSelectors } from './selectors'
import { registerLicense, verifyDetailsLicense, deleteLicensesBeforeRegisterUpdate } from './utils'

function gotoLicenseDetailPage(licenseShortName) {
    cy.contains('a', licenseShortName).as('liceseName')
    cy.get('@liceseName').click()
}

function verifyAddedLicenseInLicenseList(licenseShortName) {
    cy.contains('a', licenseShortName).should('be.visible')
}

function updateExternalLink(testData) {
    cy.get(viewSelectors.externalLink).clear()
        .type(testData)
    cy.get(viewSelectors.btnSave).click()
    cy.get(viewSelectors.alertMessage).contains(' Success: Update External Link Success!')
    cy.get(viewSelectors.externalLink).should('have.value', testData)
}

function selectWhiteList(testData) {
    cy.get(viewSelectors.cbWhiteList).as('cbWhiteLists').then(($checkboxes) => {
        const checkUncheckPromises = $checkboxes.map(($checkbox, index) => {
            if (testData[index] === false) {
                return cy.wrap($checkbox).uncheck({ force: true }).then(() => $checkbox)
            } else if (testData[index] === true) {
                return cy.wrap($checkbox).check({ force: true }).then(() => $checkbox)
            }
        })
        return Cypress.Promise.all(checkUncheckPromises);
    })
}

function updateWhiteList(testData) {
    cy.get(viewSelectors.tabObligations).click()
    cy.get(viewSelectors.btnEditWhiteList).click()
    cy.get(viewSelectors.tblUpdateWhiteList).should('be.visible')
    selectWhiteList(testData)
    cy.get(viewSelectors.btnUpdateWhiteList).click()
    // todo verify ' Success: License updated successfully!')
    cy.contains('button', 'Edit License').should('exist')
}

function updateWhiteListAndVerify(testData) {
    cy.get(viewSelectors.tabObligations).click()
    cy.get(viewSelectors.btnEditWhiteList).click()
    cy.get(viewSelectors.tblUpdateWhiteList).as('tblWhiteList').should('be.visible')
    cy.wrap(selectWhiteList(testData)).then(() => {
        let obligationsOutput = 0
        cy.get('@cbWhiteLists').each(($checkbox) => {
            if ($checkbox.is(':checked')) {
                obligationsOutput++
            }
        }).then(() => {
            cy.get(viewSelectors.btnUpdateWhiteList).click()
            // todo verify ' Success: License updated successfully!')
            cy.contains('button', 'Edit License').should('exist')
            cy.get(viewSelectors.tabObligations).click()
            cy.get(viewSelectors.tblLinkedObligations).as('tblLinkedObligations')
            cy.get('@tblLinkedObligations').should('not.contain','No matching records found')
            cy.get('@tblLinkedObligations').find('tr').should('have.length', obligationsOutput)
        })
    })
}

describe('Register a license', () => {

    before(() => {
        deleteLicensesBeforeRegisterUpdate('licenses/register', false)
    })

    beforeEach(() => {
        cy.login('admin')
    })

    it('TC01: Create a license with mandatory fields then edit External link', () => {
        cy.fixture('licenses/register').then((license) => {
            const testData = license['TC01_REQUIRED_FIELDS']
            const licenseShortName = testData.license_tab.short_name
            const externalLink = testData.external_link
            registerLicense(testData)
            verifyAddedLicenseInLicenseList(licenseShortName)
            gotoLicenseDetailPage(licenseShortName)
            updateExternalLink(externalLink)
            verifyDetailsLicense(testData)
        })
    })

    it('TC02: Create a license with all fields', () => {
        cy.fixture('licenses/register').then((license) => {
            const testData = license['TC02_ALL_FIELDS']
            const licenseShortName = testData.license_tab.short_name
            registerLicense(testData)
            verifyAddedLicenseInLicenseList(licenseShortName)
            gotoLicenseDetailPage(licenseShortName)
            verifyDetailsLicense(testData)
        })
    })

    it('TC03: Create a license with linked obligations then edit whitelist', () => {
        cy.fixture('licenses/register').then((license) => {
            const testData = license['TC03_LINKED_OBLIGATION']
            const licenseShortName = testData.license_tab.short_name
            registerLicense(testData)
            // todo search a license by quick filter
            verifyAddedLicenseInLicenseList(licenseShortName)
            gotoLicenseDetailPage(licenseShortName)
            updateWhiteListAndVerify(testData.update_white_list)
        })
    })
})