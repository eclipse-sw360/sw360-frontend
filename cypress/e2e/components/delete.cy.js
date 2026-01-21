// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { gotoViewComponentPage, createComponent, createRelease  } from './utils.js';
import { viewSelectors } from './selectors'

function deleteComponent(componentName) {
    // go to component page
    cy.visit(`${Cypress.env('sw360_base_url')}/components`)
    cy.contains('Add Component')
    cy.get('a:contains(' + componentName + ')').closest('tr').find('td').last().find('svg').last().click()
    cy.get(viewSelectors.dialogDeleteComponent.dialog).should('be.visible')
    cy.get(viewSelectors.dialogDeleteComponent.btnDeleteComponent).click()
    verifyDeleteSuccessfully()
}

function verifyDeleteSuccessfully() {
    cy.get(viewSelectors.dialogDeleteComponent.alertSuccess).should('be.visible')
    cy.get(viewSelectors.dialogDeleteComponent.btnClose).click()
}

function deleteAllReleaseOfComponent(numberOfReleases) {
    for (let i = 0; i < numberOfReleases; i++) {
        cy.get(viewSelectors.tabReleaseOverview).click()
        cy.get(viewSelectors.actionsInReleaseListTbl).should('have.length', numberOfReleases - i)
        cy.get(viewSelectors.actionsInReleaseListTbl).first().find('svg').last().click()
        cy.get(viewSelectors.btnDeleteRelease).click()
        verifyDeleteSuccessfully()
    }
}

describe('Delete components', () => {
    before(() => {
        cy.fixture("components/delete").then(data => {
            const componentData = data['TC06_DELETE_COMP'].component
            createComponent(componentData.name, componentData.type, [componentData.categories]).then((componentId) => {
                for (const release of data['TC06_DELETE_COMP'].releases) {
                    createRelease(componentId, release)
                }
            })
        })
    })

    beforeEach(() => {
        cy.login('admin')
    })

    it('TC06: Delete a component that is first linked to a project and then not, and a project', () => {
        cy.fixture("components/delete").then(data => {
            const componentData = data['TC06_DELETE_COMP'].component
            gotoViewComponentPage(componentData.name)
            deleteAllReleaseOfComponent(data['TC06_DELETE_COMP'].releases.length)
            deleteComponent(componentData.name)
        })
    })

    after(() => {
        cy.deleteAllReleases()
        cy.deleteAllComponents()
    })

})