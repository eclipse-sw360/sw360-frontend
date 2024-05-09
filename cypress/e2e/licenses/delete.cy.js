// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { addEditSelectors, viewSelectors } from './selectors'
import { deleteLicensesBeforeRegisterUpdate, gotoUpdateLicensePage } from './utils'

function deleteLicense() {
    cy.get(addEditSelectors.btnDeleteLicense).click()
    cy.get(addEditSelectors.dlgDeleteLicense.dialog).should('be.visible')
        .then(() => {
            cy.get(addEditSelectors.dlgDeleteLicense.btnDeleteLicense).click()
        })
    cy.get(addEditSelectors.dlgDeleteLicense.dialog).should('not.exist')
    cy.get(viewSelectors.alertMessage).contains('Success: License removed successfully!')
}

function verifyDeletedLicense(licenseShortName) {
    cy.get(viewSelectors.tblLicenseList).then(() => {
        cy.contains('a', licenseShortName).should('not.exist')
    })
}

describe('Delete a license', () => {

    before(() => {
        deleteLicensesBeforeRegisterUpdate('licenses/update', true)
        cy.fixture('licenses/delete').then((license) => {
            const fullName = license['TC05_DELETE_LICENSE'].full_name
            const shortName = license['TC05_DELETE_LICENSE'].short_name
            cy.createLicenseByAPI(fullName, shortName)
        })
    })

    beforeEach(() => {
        cy.login('admin')
    })

    it('TC05: Delete an existing license', () => {
        cy.fixture('licenses/delete').then((license) => {
            const shortName = license['TC05_DELETE_LICENSE'].short_name
            // todo search a license by quick filter
            gotoUpdateLicensePage(shortName)
            deleteLicense()
            verifyDeletedLicense(shortName)
        })
    })
})