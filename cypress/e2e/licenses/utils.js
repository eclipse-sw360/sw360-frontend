// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { addEditSelectors, viewSelectors } from './selectors'

export function goToRegisterLicensePage() {
    cy.get(viewSelectors.navLicense).click()
    cy.contains('Add License')
    cy.get(viewSelectors.btnAddLicense).click()
    cy.contains('Create License')
}

export function addObligations(testData) {
    cy.contains('button', addEditSelectors.btnAddObligation).click()
    cy.get(addEditSelectors.dlgLicenseObligations.sltDialog).should('be.visible')
    cy.contains('Select License Obligations to be added')
    cy.get(addEditSelectors.dlgLicenseObligations.sltDialog).within(() => {
        let addedObligations = testData.added_obligations
        for (let i = 0; i < addedObligations.length; i++) {
            cy.selectItemsFromTable(addEditSelectors.dlgLicenseObligations.sltCheckbox, false, addedObligations[i])
        }
        cy.get(addEditSelectors.dlgLicenseObligations.sltAddBtn).click()
    })
    cy.get(addEditSelectors.dlgLicenseObligations.sltDialog).should('not.exist')
    cy.get(addEditSelectors.tblObligations).should('be.visible')
}

export function fillDataLicense(testData, isUpdate) {
    const nStep = Object.keys(testData).length
    for (let i = 0; i < nStep; i++) {
        const keyFieldName = Object.keys(testData)[i]
        const fieldValue = testData[keyFieldName]
        switch (keyFieldName) {
            case 'full_name':
                if (isUpdate == true)
                    cy.get(addEditSelectors.txtFullName).clearAndType(fieldValue)
                else
                    cy.get(addEditSelectors.txtFullName).type(fieldValue)
                break
            case 'short_name':
                if (isUpdate == true)
                    cy.get(addEditSelectors.txtShortName).clearAndType(fieldValue)
                else
                    cy.get(addEditSelectors.txtShortName).type(fieldValue)
                break
            case 'is_checked':
                if (fieldValue == true)
                    cy.get(addEditSelectors.cbIsChecked).check()
                else cy.get(addEditSelectors.cbIsChecked).uncheck()
                break
            case 'license_type_index':
                cy.get(addEditSelectors.selectLicenseType).select(fieldValue)
                break
            case 'OSI_Approved':
                cy.get(addEditSelectors.selectOSIApproved).select(fieldValue.value)
                break
            case 'FSF_Free/Libre':
                cy.get(addEditSelectors.selectFSFFreeLibre).select(fieldValue.value)
                break
            case 'note':
                if (isUpdate == true)
                    cy.get(addEditSelectors.txtNote).clearAndType(fieldValue)
                else
                    cy.get(addEditSelectors.txtNote).type(fieldValue)
                break
            case 'license_text':
                if (isUpdate == true)
                    cy.get(addEditSelectors.txtLicenseText).clearAndType(fieldValue)
                else
                    cy.get(addEditSelectors.txtLicenseText).type(fieldValue)
                break
            default:
                break
        }
    }
}

function verifyDetailsTab(expectedOutput) {
    const nStep = Object.keys(expectedOutput).length
    for (let i = 0; i < nStep; i++) {
        const keyFieldName = Object.keys(expectedOutput)[i]
        const fieldValue = expectedOutput[keyFieldName]
        switch (keyFieldName) {
            case 'full_name':
                cy.get(viewSelectors.fullName).should('contain', fieldValue)
                break
            case 'short_name':
                cy.get(viewSelectors.shortName).should('contain', fieldValue)
                break
            case 'is_checked':
                if (fieldValue == true)
                    cy.get(viewSelectors.isChecked).should('contain', 'CHECKED')
                else
                    cy.get(viewSelectors.isChecked).should('contain', 'UNCHECKED')
                break
            case 'license_type_index':
                cy.get(viewSelectors.licenseType).should('not.be.empty')
                break
            case 'OSI_Approved':
                cy.get(viewSelectors.OSIApproved).invoke('text').should('contain', fieldValue.name)
                break
            case 'FSF_Free/Libre':
                cy.get(viewSelectors.FSFFreeLibre).should('contain', fieldValue.name)
                break
            case 'note':
                cy.get(viewSelectors.note).should('contain', fieldValue)
                break
            default:
                break
        }
    }
}

function verifyTextTab(expectedOutput) {
    if (expectedOutput) cy.get(viewSelectors.licenseText).should('contain', expectedOutput)
    else cy.get(viewSelectors.licenseText).should('contain', '')
}

function verifyObligationsTab(expectedOutput) {
    // todo fix bug display obligation in list
    // cy.get(viewSelectors.tblLinkedObligations).as('tableBody')
    // cy.get('@tableBody').find('tr').should('have.length', expectedOutput.added_obligation_quantity)
}

export function verifyDetailsLicense(expectedOutput) {
    const outputDetails = expectedOutput.license_tab
    const outputLicenseText = expectedOutput.license_tab.license_text
    const outputLinkedObligation = expectedOutput.linked_obligations_tab
    verifyDetailsTab(outputDetails)
    if (outputLicenseText) {
        cy.get(viewSelectors.tabText).click()
        verifyTextTab(outputLicenseText)
    }
    if (outputLinkedObligation) {
        cy.get(viewSelectors.tabObligations).click()
        verifyObligationsTab(outputLinkedObligation)
    }
}

export function registerLicense(testData) {
    goToRegisterLicensePage()
    if (testData.license_tab)
        fillDataLicense(testData.license_tab, false)
    if (testData.linked_obligations_tab) {
        cy.get(addEditSelectors.tabLinkedObligations).click()
        addObligations(testData.linked_obligations_tab)
    }
    cy.get(addEditSelectors.btnCreateLicense).click()
    cy.get(viewSelectors.alertMessage).contains('Success: License added successfully!')
    cy.contains('Add License')
}

export function deleteLicensesBeforeRegisterUpdate(filePath, isUpdate) {
    cy.fixture(filePath).then((testIds) => {
        const testIdsNum = Object.keys(testIds).length
        for (let i = 0; i < testIdsNum; i++) {
            let shortName
            const keyTestId = Object.keys(testIds)[i]
            const fieldValue = testIds[keyTestId]
            if (isUpdate) {
                shortName = fieldValue.initial_data.license_tab.short_name
            } else {
                shortName = fieldValue.license_tab.short_name
            }
            cy.deleteLicense(shortName)
        }
    })
}

export function gotoUpdateLicensePage(licenseShortName) {
    cy.get(viewSelectors.navLicense).click()
    cy.contains('Add License')
    cy.contains('a', licenseShortName).click()
    cy.get('a > .btn').click()
    cy.contains('Update License')
}
