// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

export function getCurrentDate() {
  return new Date().toISOString().split("T")[0]
}

Cypress.Commands.add('login', (role) => {
  cy.fixture('sw360_users').then((user) => {
    let email = user[role].email
    let pass = user[role].password

    // go to URL SW360 Server and login with user account
    cy.visit(Cypress.env('sw360_base_url'))
    cy.get('.me-3.btn-primary.btn-lg').click()
    cy.get('[type="email"]').clear()
    cy.get('[type="email"]')
      .type(email).should('have.value', email)
    cy.get('input[type="password"]')
      .clear()
      .type(pass)
    cy.get('.login-btn').click()
    cy.url().should('include', '/home')
  })
})

Cypress.Commands.add('logout', () => {
  cy.get('#profileDropdown').click({ force: true })
  cy.get('.dropdown-menu > [href="#"]').click({ force: true })
})

Cypress.Commands.add('openDialog', (selectorOpen, selectorDialog) => {
  cy.get(selectorOpen).click()
  cy.get(selectorDialog).should('be.visible')
})

Cypress.Commands.add('shouldBeHyperLink', (selector, value, isEmail) => {
  if (isEmail) {
    // Verify email
    cy.get(selector).should('have.attr', 'href', 'mailto:' + value)
  } else {
    cy.get(selector).should('have.attr', 'href', value);
  }
})

Cypress.Commands.add('verifyCreatedUser', (role, selector) => {
  cy.fixture('sw360_users').then((user) => {
    let fullName = user[role].fullname
    cy.shouldBeHyperLink(selector, fullName, false)
  })
})

Cypress.Commands.add('selectItemFromTable', (selector, IsSelectMulti, num) => {
  if (IsSelectMulti == false) {
    cy.get(selector(num).isChecked)
      .click()
  } else {
    for (let i = 1; i <= num; i++) {
      cy.get(selector(i).isChecked)
        .click()
    }
  }
})

Cypress.Commands.add('selectOrAddVendor', (dialogButtonsSelector, vendorSelector, vendorInputData) => {
  cy.get(dialogButtonsSelector.searchBtn)
    .contains('Search')
    .click()
  cy.selectItemFromTable(vendorSelector, false, vendorInputData.user_no)
  cy.get(dialogButtonsSelector.selectVendorBtn)
    .click()
})

Cypress.Commands.add('removeDownloadedFiles', () => {
  cy.task('removeDownloadedFiles').then(() => {
    cy.log('[Info] File removed successfully')
  })
})

const createRequestHeader = (token) => {
  let myHeaders = new Headers()
  myHeaders.append("Accept", "application/*")
  myHeaders.append("Content-Type", "application/json")
  myHeaders.append("Authorization", `Bearer ${token}`)
  return myHeaders
}

Cypress.Commands.add('createProject', (name, version) => {
  cy.task('generateApiToken').then((token) => {
    const myHeaders = createRequestHeader(token)
    const raw = JSON.stringify({
      "name": name,
      "version": version
    })

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
    }

    fetch(`${Cypress.env('sw360_api_server')}/resource/api/projects`, requestOptions)
      .then(response => response.json())
      .then(data => data)
  })
})

Cypress.Commands.add('deleteProjectByNameAndVersion', (name, version) => {
  return cy.task('generateApiToken').then(async (token) => {
    const myHeaders = createRequestHeader(token)

    const getResponse = await fetch(`${Cypress.env('sw360_api_server')}/resource/api/projects`, { method: 'GET', headers: myHeaders })
    const projects = await getResponse.json()

    for (const project of projects._embedded['sw360:projects']) {
      if (project.name === name && project.version === version) {
        const projectId = project._links.self.href.split('/').slice(-1)
        fetch(`${Cypress.env('sw360_api_server')}/resource/api/projects/${projectId}`, { method: 'DELETE', headers: myHeaders })
        return
      }
    }
  })
})

Cypress.Commands.add('createComponent', (name, componentType, categories) => {
  return cy.task('generateApiToken').then(async (token) => {
    const myHeaders = createRequestHeader(token)
    const raw = JSON.stringify({
      "name": name,
      "componentType": componentType,
      "categories": categories
    })

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
    }

    const response = await fetch(`${Cypress.env('sw360_api_server')}/resource/api/components`, requestOptions)
    const data = await response.json()
    return data
  }).then(data => data)
})

Cypress.Commands.add('createRelease', (componentId, version) => {
  return cy.task('generateApiToken').then(async (token) => {
    const myHeaders = createRequestHeader(token)
    const raw = JSON.stringify({
      "componentId": componentId,
      "version": version
    })

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
    }

    const response = await fetch(`${Cypress.env('sw360_api_server')}/resource/api/releases`, requestOptions)
    const data = await response.json()
    return data
  })
})

Cypress.Commands.add('deleteReleases', (releaseIds) => {
  return cy.task('generateApiToken').then(async (token) => {
    await deleteReleases(releaseIds, token)
  })
})

const deleteReleases = async (releaseIds, token) => {
  for (const releaseId of releaseIds) {
    await deleteRelease(releaseId, token)
  }
}

const deleteRelease = (releaseId, token) => {
  const myHeaders = createRequestHeader(token)

  const requestOptions = {
    method: 'DELETE',
    headers: myHeaders,
  }
  return fetch(`${Cypress.env('sw360_api_server')}/resource/api/releases/${releaseId}`, requestOptions)
}

Cypress.Commands.add('deleteComponent', (componentId) => {
  return cy.task('generateApiToken').then((token) => {
    const myHeaders = createRequestHeader(token)

    const requestOptions = {
      method: 'DELETE',
      headers: myHeaders,
    }

    fetch(`${Cypress.env('sw360_api_server')}/resource/api/components/${componentId}`, requestOptions)
  })
})

Cypress.Commands.add('deleteAllReleases', () => {
  cy.exec('bash cypress/support/common.sh deleteAllReleases')
})

Cypress.Commands.add('deleteAllComponents', () => {
  cy.exec('bash cypress/support/common.sh deleteAllComponents')
})

Cypress.Commands.add('deleteAllProjects', () => {
  cy.exec('bash cypress/support/common.sh deleteAllProjects')
})

Cypress.Commands.add('deleteAllLicenses', () => {
  cy.exec('bash cypress/support/common.sh deleteAllLicenses')
})

Cypress.Commands.add('createVendor', (vendorName) => {
  cy.exec('bash cypress/support/common.sh createVendor ' + vendorName)
})

Cypress.Commands.add('deleteAllVendors', () => {
  cy.exec('bash cypress/support/common.sh deleteAllVendors')
})

Cypress.Commands.add('createLicense', (licenseShortName) => {
  cy.exec('bash cypress/support/common.sh createLicense ' + licenseShortName)
})

Cypress.Commands.add('deleteLicense', (licenseShortName) => {
  cy.exec('bash cypress/support/common.sh deleteLicenseByShortName ' + licenseShortName)
})

Cypress.Commands.overwrite('type', (originalFn, element, text, options) => {
  return originalFn(element, text, { ...options, delay: 0 } )
})
