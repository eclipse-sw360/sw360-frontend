// Copyright (C) SW360 Frontend Authors, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { expect, test } from '@playwright/test'
import CommonUtils from '../../src/utils/common.utils'

test.describe('CommonUtils.createUrlWithParams', () => {
    test('appends query parameters to a base URL', () => {
        const url = CommonUtils.createUrlWithParams('projects', { status: 'ACTIVE', page: '0' })
        expect(url).toBe('projects?status=ACTIVE&page=0')
    })

    test('ignores undefined, null, and empty string values for scalar parameters', () => {
        const url = CommonUtils.createUrlWithParams('projects', {
            valid: 'yes',
            undef: undefined,
            nil: null,
            empty: '',
        })
        expect(url).toBe('projects?valid=yes')
    })

    test('ignores undefined, null, and empty string elements in array parameters', () => {
        const url = CommonUtils.createUrlWithParams('releases', {
            tags: [
                'frontend',
                undefined,
                '',
                null,
                'backend',
            ],
        })
        expect(url).toBe('releases?tags=frontend&tags=backend')
    })

    test('returns original URL when all parameters are empty, null, or undefined', () => {
        const url = CommonUtils.createUrlWithParams('components', {
            search: undefined,
            filter: null,
            empty: '',
        })
        expect(url).toBe('components')
    })

    test('uses ampersand when base URL already has query parameters', () => {
        const url = CommonUtils.createUrlWithParams('projects/myprojects?status=ACTIVE', {
            page: '1',
        })
        expect(url).toBe('projects/myprojects?status=ACTIVE&page=1')
    })

    test('handles boolean and numeric parameter values properly', () => {
        const url = CommonUtils.createUrlWithParams('releases', {
            allDetails: true,
            page: 0,
        })
        expect(url).toBe('releases?allDetails=true&page=0')
    })
})

