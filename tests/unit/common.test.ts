// Copyright (C) SW360 Frontend Authors (see <https://github.com/eclipse-sw360/sw360-frontend/blob/main/NOTICE>)

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { expect, test } from '@playwright/test'
import CommonUtils from '../../src/utils/common.utils'

test.describe('CommonUtils.createUrlWithParams', () => {
    test('handles standard key-value parameters', () => {
        const result = CommonUtils.createUrlWithParams('/api/items', { page: '1', sort: 'asc' })
        expect(result).toBe('/api/items?page=1&sort=asc')
    })

    test('ignores null, undefined, and empty string values', () => {
        const result = CommonUtils.createUrlWithParams('/api/items', {
            valid: 'true',
            empty: '',
            missing: undefined as unknown as string,
            nil: null as unknown as string,
        })
        expect(result).toBe('/api/items?valid=true')
    })

    test('correctly appends to a URL that already contains query parameters', () => {
        const result = CommonUtils.createUrlWithParams('/api/items?category=tech', { page: '2' })
        expect(result).toBe('/api/items?category=tech&page=2')
    })

    test('handles URL ending with ? or & without duplicate separators', () => {
        const resultQuestion = CommonUtils.createUrlWithParams('/api/items?', { page: '1' })
        expect(resultQuestion).toBe('/api/items?page=1')

        const resultAmpersand = CommonUtils.createUrlWithParams('/api/items?sort=asc&', { page: '1' })
        expect(resultAmpersand).toBe('/api/items?sort=asc&page=1')
    })

    test('handles array query parameters properly and filters empty/null/undefined items', () => {
        const result = CommonUtils.createUrlWithParams('/api/items', {
            tag: ['foss', 'web', '', undefined as unknown as string, null as unknown as string],
        })
        expect(result).toBe('/api/items?tag=foss&tag=web')
    })

    test('returns original URL if params object has no valid entries', () => {
        const result = CommonUtils.createUrlWithParams('/api/items', {
            empty: '',
            missing: undefined as unknown as string,
            nil: null as unknown as string,
        })
        expect(result).toBe('/api/items')
    })

    test('returns original URL if params is empty', () => {
        const result = CommonUtils.createUrlWithParams('/api/items', {})
        expect(result).toBe('/api/items')
    })
})
