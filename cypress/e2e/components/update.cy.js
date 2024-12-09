// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { gotoUpdateComponentPage, createComponent, createRelease  } from './utils.js';
import { registerAndVerifyRelease, updateAndVerifyReleaseAfterUpdate } from '../releases/utils.js';

describe('Update components', () => {
    before(() => {
        createComponent('TC03-04: Comp03', 'COTS', ['libaries']).then((componentId) => {
            createRelease(componentId, 'v1')
        })
    })

    beforeEach(() => {
        cy.login('admin')
    })

    it('TC03 + TC04: Modify a component and release with vendor present and verify', () => {
        gotoUpdateComponentPage('TC03-04: Comp03')
        registerAndVerifyRelease('TC03_RELEASE_WITH_CPEID')
        updateAndVerifyReleaseAfterUpdate('TC03_ADD_VENDOR_AND_ATTACHMENT')
    })

    after(() => {
        cy.deleteAllReleases()
        cy.deleteAllComponents()
    })
})
