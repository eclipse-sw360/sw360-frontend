// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { viewSelectors } from './selectors'

const verifyFileExported = () => {
    const downloadedFileName = 'Licenses.xlsx'
    cy.verifyDownloadedFile(downloadedFileName)
}

describe('Export License', () => {
    beforeEach(() => {
        cy.login('admin')
        cy.visit(`${Cypress.env('sw360_base_url')}/licenses`)
        cy.get(viewSelectors.tblLicenseList).should('be.visible')
        cy.removeDownloadsFolder()
    })

    it('TC06: Check Export Licenses', () => {
        cy.downloadFile(viewSelectors.btnExportSpreadsheet)
        verifyFileExported()
    })
})