import { gotoViewComponentPage, createComponent, createRelease  } from './utils.js';

function deleteComponent(componentName) {
    // go to component page
    cy.visit(`${Cypress.env('sw360_base_url')}/components`)
    cy.contains('Add Component')
    cy.get('a:contains(' + componentName + ')').closest('tr').find('td').last().find('svg').last().click()
    cy.get('.modal-content').should('be.visible')
    cy.get('.login-btn').click()
    verifyDeleteSuccessfully()
}

function verifyDeleteSuccessfully() {
    cy.get('.alert-success').should('be.visible')
    cy.get('.delete-btn').click()
}

function deleteAllReleaseOfComponent(numberOfReleases) {
    for (let i = 0; i < numberOfReleases; i++) {
        cy.get('#tab-Releases').click()
        cy.get('[data-column-id="action"] > div > span').should('have.length', numberOfReleases - i)
        cy.get('[data-column-id="action"] > div > span').first().find('svg').last().click()
        cy.get('.login-btn').click()
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