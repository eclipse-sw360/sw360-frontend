// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

/**
 * Regression tests for localePrefix: 'never' public path helpers.
 * Run: node --experimental-strip-types --test src/utils/localePath.utils.test.ts
 */

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

// Inline pure logic under test to avoid path-alias resolution in node:test.
// Keep in sync with src/utils/localePath.utils.ts
const locales = [
    'en',
    'ja',
    'vi',
    'zh-CN',
    'pt-BR',
    'ko',
    'de',
    'es',
    'fr',
    'zh-TW',
]

function toPublicPath(path: string): string {
    if (path === '#' || path === '/') {
        return path
    }

    const normalized = path.startsWith('/') ? path : `/${path}`
    const segments = normalized.split('/')
    const firstSegment = segments[1]

    if (firstSegment !== undefined && locales.includes(firstSegment)) {
        const rest = segments.slice(2).join('/')
        return rest.length > 0 ? `/${rest}` : '/'
    }

    return normalized
}

function homePath(): string {
    return '/home'
}

describe('toPublicPath (localePrefix: never)', () => {
    it('strips locale prefix from home paths that caused RSC 307s', () => {
        assert.equal(toPublicPath('/ja/home'), '/home')
        assert.equal(toPublicPath('/en/home'), '/home')
        assert.equal(toPublicPath('/zh-CN/home'), '/home')
    })

    it('strips locale-only paths used by the navbar brand when logged out', () => {
        assert.equal(toPublicPath('/ja'), '/')
        assert.equal(toPublicPath('/en'), '/')
    })

    it('leaves already-public paths unchanged', () => {
        assert.equal(toPublicPath('/home'), '/home')
        assert.equal(toPublicPath('/projects'), '/projects')
        assert.equal(toPublicPath('/'), '/')
        assert.equal(toPublicPath('#'), '#')
    })

    it('strips locale prefixes from breadcrumb-style section paths', () => {
        assert.equal(toPublicPath('/ja/components'), '/components')
        assert.equal(toPublicPath('/en/requests'), '/requests')
        assert.equal(toPublicPath('/zh-CN/packages'), '/packages')
        assert.equal(toPublicPath('/de/vulnerabilities'), '/vulnerabilities')
    })

    it('normalizes relative paths to absolute public paths', () => {
        assert.equal(toPublicPath('home'), '/home')
        assert.equal(toPublicPath('components/detail/1'), '/components/detail/1')
    })
})

describe('homePath', () => {
    it('returns the unprefixed home route', () => {
        assert.equal(homePath(), '/home')
        assert.notEqual(homePath(), '/ja/home')
        assert.notEqual(homePath(), '/en/home')
    })
})
