// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

const verifySuccessMessage = (testData) => {
    cy.get('.alert.alert-success').contains(`The release ${testData.release.name}(${testData.release.version}) has been successfully linked to project ${testData.linkedProject.name}`)
    cy.get('.alert.alert-success').contains('Click here to edit the release relation as well as the project mainline state in the project')
}

const openLinkModal = (release, isComponentPage) => {
    cy.get(`a:contains("${release.name}")`).click()
    cy.get('#tab-Releases').click()
    if (isComponentPage) {
        cy.get(`a:contains("${release.version}")`).closest('tr').find('td').last().find('svg').eq(1).click()
    } else {
        cy.get(`a:contains("${release.version}")`).click()
        cy.get('.btn-group > :nth-child(2) > .btn').click()
    }
}

const selectProjectToLink = (linkedProject) => {
    cy.get('.col-lg-3 > .btn').click()
    cy.get('table tr').contains('td:eq(1)', linkedProject.name).parent('tr').within(() => {
        cy.get('td:eq(2)').should('contain', linkedProject.version);
    }).find('td').first().find('div').find('.form-check-input').click()
    cy.get('.justify-content-end button').last().click()
}


const createComponent = (name, componentType, categories) => {
    return cy.createComponent(name, componentType, categories).then((component) => component.id)
}

const createRelease = (componentId, version) => {
    cy.createRelease(componentId, version)
}

const checkUsedByProjectTable = () => {
    // TODO after fix frontend bug
}

const execute = (testId) => {
    cy.fixture('releases/link-to-project').then((data) => {
        const testData = data[testId]
        openLinkModal(testData.release, testData.isComponentPage)
        selectProjectToLink(testData.linkedProject)
        verifySuccessMessage(testData)
        checkUsedByProjectTable()
    })
}

describe('Link a release to the project', () => {
    before(() => {
        cy.fixture('releases/link-to-project').then((data) => {
            Object.values(data).forEach(testData => {
                cy.createProject(testData.linkedProject.name, testData.linkedProject.version)
                createComponent(testData.release.name, testData.release.componentType, testData.release.categories).then((componentId) => {
                    cy.createRelease(componentId, testData.release.version)
                })
            })
        })
    })

    beforeEach(() => {
        cy.login('admin')
        cy.visit(`${Cypress.env('sw360_base_url')}/components`)
    })

    it('TC10: Link a release to the project in view component page and check used by projects', () => {
        execute('001_LINK_TO_PROJECT')
    })

    it('TC11: Link a release to a project in the view release page', () => {
        execute('002_LINK_TO_PROJECT')
    })

    after(() => {
        cy.deleteAllReleases()
        cy.deleteAllComponents()
        cy.deleteAllProjects()
    })
})
