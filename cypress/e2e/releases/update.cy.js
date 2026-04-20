// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { viewSelectors } from './selectors'
import { updateRelease } from './utils.js'
import { gotoUpdateReleasePageFromViewComponentPage, gotoViewComponentPage } from '../components/utils.js'

const createComponent = (name, componentType, categories) => {
    return cy.createComponent(name, componentType, categories).then((component) => component.id)
}

const createRelease = (componentId, version) => {
    cy.createRelease(componentId, version)
}

const verifyAfterUpdate = (testId) => {
    cy.get(viewSelectors.tabAttachments).click()
    cy.fixture('releases/update').then((release) => {
        const attachmentData = release[testId]?.attachment
        if (!attachmentData || !attachmentData.fileNames) return
        const fileNames = attachmentData.fileNames
            .map((filePath) => filePath.split('/').pop())
            .filter(Boolean)
        const expectedFiles = attachmentData.shouldUnAttachFile ? fileNames.slice(1) : fileNames
        const removedFile = attachmentData.shouldUnAttachFile ? fileNames[0] : undefined

        cy.get(viewSelectors.attachmentsTable).should('be.visible')
        expectedFiles.forEach((fileName) => {
            cy.get(viewSelectors.attachmentsTable).contains(fileName)
        })
        if (removedFile) {
            cy.get(viewSelectors.attachmentsTable).contains(removedFile).should('not.exist')
        }
    })
}

describe('Update a release', () => {
    before(() => {
        createComponent('Test Comp', 'OSS', ['libaries']).then((componentId) => {
            createRelease(componentId, 'v1')
        })
    })

    beforeEach(() => {
        cy.login('admin')
    })

    it('TC07: Add new attachments to an existing release and delete attachments', () => {
        gotoViewComponentPage('Test Comp')
        gotoUpdateReleasePageFromViewComponentPage('v1')
        updateRelease('TC07_ADD_ATTACH_FOR_RELEASE')
        verifyAfterUpdate('TC07_ADD_ATTACH_FOR_RELEASE')
    })

    after(() => {
        cy.deleteAllReleases()
        cy.deleteAllComponents()
    })
})
