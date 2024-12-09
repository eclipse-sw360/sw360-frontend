// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { viewSelectors } from './selectors'

const verifyModalData = (testData) => {
    cy.get(viewSelectors.dialogUploadSBOM.successMessage).contains('The new Component and new Release will be created, do you want to import?')
    cy.get(viewSelectors.dialogUploadSBOM.newComponentsInfo).contains(`New Components: ${testData.component}`)
    cy.get(viewSelectors.dialogUploadSBOM.newReleasesInfo).contains(`New Releases: ${testData.release.name}`)
}

const verifyImportSuccess = (testData) => {
    verifyComponent(testData.component)
    verifyRelease(testData.release)
}

const verifyComponent = (component) => {
    cy.get(viewSelectors.componentName).contains(component, { matchCase: false })
}

const verifyRelease = (release) => {
    cy.get(viewSelectors.tabReleaseOverview).click()
    cy.get(viewSelectors.tblReleasesList.releaseName).contains(release.name)
    cy.get(viewSelectors.tblReleasesList.releaseVersion).contains(release.version)
}

const selectFile = (filePath) => {
    cy.get(viewSelectors.uploadFiles).selectFile(filePath, {force: true})
}

const importSPDX = (testId) => {
    cy.fixture('components/import-spdx').then((data) => {
        const testData = data[testId]
        selectFile(testData.filePath)
        const importButton = cy.get(viewSelectors.dialogUploadSBOM.btnImportAndClose).contains('Import')
        verifyModalData(testData)
        importButton.click()
        verifyImportSuccess(testData)
    })
}

describe('TC12: Import a new component by .spdx/.xml/ .rdf file', () => {

    beforeEach(() => {
        cy.login('admin')
        cy.visit(`${Cypress.env('sw360_base_url')}/components`)
    })

    it.skip('Import SPDX in .rdf format', () => {
        cy.get(viewSelectors.btnImportSBOM).click()
        importSPDX('IMPORT_SPDX_001')
    })

    it('Import SPDX in .spdx format', () => {
        cy.get(viewSelectors.btnImportSBOM).click()
        importSPDX('IMPORT_SPDX_002')
    })

    after(() => {
        cy.deleteAllReleases()
        cy.deleteAllComponents()
    })
})
