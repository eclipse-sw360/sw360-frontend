// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
    collectIdsFromValue,
    convertToJsonValue,
    escapeRegExp,
    findKeyToLinkMappings,
    resolveEntityHref,
    splitTextWithIdLinks,
} from './changelogLinkUtils'

describe('escapeRegExp', () => {
    it('escapes regex metacharacters in ids', () => {
        assert.equal(escapeRegExp('ABC.123'), 'ABC\\.123')
        assert.equal(escapeRegExp('id+test'), 'id\\+test')
    })
})

describe('resolveEntityHref', () => {
    it('maps release fields before component fields', () => {
        assert.equal(resolveEntityHref('linkedComponentReleases', 'rel-1'), '/components/releases/detail/rel-1')
    })

    it('resolves project, component, and package urls', () => {
        assert.equal(resolveEntityHref('linkedProjects', 'p-1'), '/projects/detail/p-1')
        assert.equal(resolveEntityHref('linkedComponents', 'c-1'), '/components/detail/c-1')
        assert.equal(resolveEntityHref('linkedPackages', 'pkg-1'), '/packages/detail/pkg-1')
    })
})

describe('findKeyToLinkMappings', () => {
    it('uses map keys as ids for linked project maps', () => {
        const mappings = findKeyToLinkMappings(
            {
                'ABC-123': {
                    name: 'Project Alpha',
                    version: '1.0',
                },
            },
            'linkedProjects',
        )

        assert.deepEqual(mappings, {
            'ABC-123': '/projects/detail/ABC-123',
        })
    })

    it('uses scalar id field values', () => {
        const mappings = findKeyToLinkMappings(
            {
                projectId: 'ABC-123',
            },
            'projectId',
        )

        assert.deepEqual(mappings, {
            'ABC-123': '/projects/detail/ABC-123',
        })
    })

    it('parses json string field values', () => {
        const mappings = findKeyToLinkMappings('{"DEF-456":{"name":"Beta"}}', 'linkedReleases')

        assert.deepEqual(mappings, {
            'DEF-456': '/components/releases/detail/DEF-456',
        })
    })

    it('does not treat metadata keys as ids', () => {
        const mappings = findKeyToLinkMappings(
            {
                name: 'Project Alpha',
                version: '1.0',
            },
            'linkedProjects',
        )

        assert.deepEqual(mappings, {})
    })
})

describe('splitTextWithIdLinks', () => {
    const mappings = {
        'ABC-123': '/projects/detail/ABC-123',
        'DEF-456': '/projects/detail/DEF-456',
    }

    it('links only exact quoted id tokens', () => {
        const segments = splitTextWithIdLinks('"name": "Project ABC-123",\n  "ABC-123": "Alpha"', mappings)

        assert.deepEqual(segments, [
            {
                type: 'text',
                value: '"name": "Project ABC-123",\n  ',
            },
            {
                type: 'link',
                value: 'ABC-123',
                href: '/projects/detail/ABC-123',
            },
            {
                type: 'text',
                value: ': "Alpha"',
            },
        ])
    })

    it('does not link substrings inside larger quoted values', () => {
        const segments = splitTextWithIdLinks('"description": "Project ABC-123 is active"', mappings)

        assert.deepEqual(segments, [
            {
                type: 'text',
                value: '"description": "Project ABC-123 is active"',
            },
        ])
    })

    it('links multiple ids in the same text block', () => {
        const segments = splitTextWithIdLinks('{\n  "ABC-123": "A",\n  "DEF-456": "B"\n}', mappings)

        assert.deepEqual(segments, [
            {
                type: 'text',
                value: '{\n  ',
            },
            {
                type: 'link',
                value: 'ABC-123',
                href: '/projects/detail/ABC-123',
            },
            {
                type: 'text',
                value: ': "A",\n  ',
            },
            {
                type: 'link',
                value: 'DEF-456',
                href: '/projects/detail/DEF-456',
            },
            {
                type: 'text',
                value: ': "B"\n}',
            },
        ])
    })

    it('prefers the longest id when one id is a prefix of another', () => {
        const longMappings = {
            ABC: '/projects/detail/ABC',
            'ABC-123': '/projects/detail/ABC-123',
        }
        const segments = splitTextWithIdLinks('"ABC-123": "value"', longMappings)

        assert.deepEqual(segments, [
            {
                type: 'link',
                value: 'ABC-123',
                href: '/projects/detail/ABC-123',
            },
            {
                type: 'text',
                value: ': "value"',
            },
        ])
    })

    it('handles ids with regex metacharacters without over-matching', () => {
        const dotMappings = {
            'ABC.123': '/projects/detail/ABC.123',
        }
        const segments = splitTextWithIdLinks('"ABC.123": "name",\n"text": "ABC-123"', dotMappings)

        assert.deepEqual(segments, [
            {
                type: 'link',
                value: 'ABC.123',
                href: '/projects/detail/ABC.123',
            },
            {
                type: 'text',
                value: ': "name",\n"text": "ABC-123"',
            },
        ])
    })

    it('handles punctuation and spaces around quoted ids', () => {
        const segments = splitTextWithIdLinks('[ "ABC-123", "DEF-456" ]', mappings)

        assert.deepEqual(segments, [
            {
                type: 'text',
                value: '[ ',
            },
            {
                type: 'link',
                value: 'ABC-123',
                href: '/projects/detail/ABC-123',
            },
            {
                type: 'text',
                value: ', ',
            },
            {
                type: 'link',
                value: 'DEF-456',
                href: '/projects/detail/DEF-456',
            },
            {
                type: 'text',
                value: ' ]',
            },
        ])
    })

    it('returns plain text when there are no mappings', () => {
        const segments = splitTextWithIdLinks('plain text only', {})

        assert.deepEqual(segments, [
            {
                type: 'text',
                value: 'plain text only',
            },
        ])
    })
})

describe('collectIdsFromValue', () => {
    it('collects release ids from relationship maps', () => {
        const ids = new Map<string, string>()
        collectIdsFromValue(
            {
                'REL-1': 'CONTAINED',
                'REL-2': 'REFERRED',
            },
            'releaseIdToRelationship',
            ids,
        )

        assert.deepEqual(Object.fromEntries(ids), {
            'REL-1': '/components/releases/detail/REL-1',
            'REL-2': '/components/releases/detail/REL-2',
        })
    })
})

describe('convertToJsonValue', () => {
    it('parses json strings and leaves plain strings unchanged', () => {
        assert.deepEqual(convertToJsonValue('{"a":1}'), {
            a: 1,
        })
        assert.equal(convertToJsonValue('not-json'), 'not-json')
    })
})
