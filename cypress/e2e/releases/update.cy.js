// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { updateRelease } from './utils.js';
import { gotoUpdateReleasePageFromViewComponentPage, gotoViewComponentPage } from '../components/utils.js';

const createComponent = (name, componentType, categories) => {
    return cy.createComponent(name, componentType, categories).then((component) => component.id)
}

const createRelease = (componentId, version) => {
    cy.createRelease(componentId, version)
}

const verifyAfterUpdate = () => {
    // TODO: Add assertion after fix frontend bug: add attachment
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
        verifyAfterUpdate()
    })

    after(() => {
        cy.deleteAllReleases()
        cy.deleteAllComponents()
    })
})
