// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

export type LinkSegment =
    | {
          type: 'text'
          value: string
      }
    | {
          type: 'link'
          value: string
          href: string
      }

const METADATA_KEYS = new Set([
    'name',
    'version',
    'enableSvm',
    'projectRelationship',
    'releaseRelationship',
    'relation',
    'comment',
    'type',
    'description',
    'text',
    'value',
    'title',
    'email',
    'url',
    'href',
])

export const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export const convertToJsonValue = (fieldValue: unknown): unknown => {
    if (fieldValue === null || fieldValue === undefined) {
        return null
    }
    if (typeof fieldValue === 'object') {
        return fieldValue
    }
    if (typeof fieldValue === 'string') {
        try {
            return JSON.parse(fieldValue) as unknown
        } catch {
            return fieldValue
        }
    }
    return fieldValue
}

const isIdFieldKey = (key: string): boolean => /Ids?$/i.test(key) || key === 'id' || key.endsWith('_id')

export const resolveEntityHref = (fieldName: string, id: string): string | null => {
    const lower = fieldName.toLowerCase()

    if (lower.includes('release')) {
        return `/components/releases/detail/${id}`
    }
    if (lower.includes('component')) {
        return `/components/detail/${id}`
    }
    if (lower.includes('project')) {
        return `/projects/detail/${id}`
    }
    if (lower.includes('package')) {
        return `/packages/detail/${id}`
    }

    return null
}

const addIdMapping = (ids: Map<string, string>, fieldName: string, id: string): void => {
    if (!id || METADATA_KEYS.has(id)) {
        return
    }

    const href = resolveEntityHref(fieldName, id)
    if (href !== null) {
        ids.set(id, href)
    }
}

export const collectIdsFromValue = (value: unknown, fieldName: string, ids: Map<string, string>): void => {
    if (value === null || value === undefined) {
        return
    }

    if (typeof value === 'string') {
        addIdMapping(ids, fieldName, value)
        return
    }

    if (Array.isArray(value)) {
        for (const item of value) {
            collectIdsFromValue(item, fieldName, ids)
        }
        return
    }

    if (typeof value !== 'object') {
        return
    }

    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
        if (isIdFieldKey(key) && typeof val === 'string') {
            addIdMapping(ids, fieldName, val)
            continue
        }

        if (typeof val === 'object' && val !== null) {
            if (!METADATA_KEYS.has(key) && !isIdFieldKey(key)) {
                addIdMapping(ids, fieldName, key)
            }
            collectIdsFromValue(val, fieldName, ids)
            continue
        }

        if (typeof val === 'string' && !METADATA_KEYS.has(key) && !isIdFieldKey(key)) {
            addIdMapping(ids, fieldName, key)
        }
    }
}

export const findKeyToLinkMappings = (fieldValue: unknown, fieldName: string): Record<string, string> => {
    const parsed = convertToJsonValue(fieldValue)
    const ids = new Map<string, string>()
    collectIdsFromValue(parsed, fieldName, ids)
    return Object.fromEntries(ids)
}

export const splitTextWithIdLinks = (text: string, mappings: Record<string, string>): LinkSegment[] => {
    const ids = Object.keys(mappings)

    if (ids.length === 0) {
        return [
            {
                type: 'text',
                value: text,
            },
        ]
    }

    const sortedIds = [
        ...ids,
    ].sort((a, b) => b.length - a.length)
    const pattern = sortedIds.map(escapeRegExp).join('|')
    const regex = new RegExp(`"(${pattern})"`, 'g')

    const segments: LinkSegment[] = []
    let lastIndex = 0
    let match: RegExpExecArray | null = regex.exec(text)

    while (match !== null) {
        const id = match[1]
        const href = mappings[id]

        if (href) {
            if (match.index > lastIndex) {
                segments.push({
                    type: 'text',
                    value: text.slice(lastIndex, match.index),
                })
            }
            segments.push({
                type: 'link',
                value: id,
                href,
            })
            lastIndex = match.index + match[0].length
        }

        match = regex.exec(text)
    }

    if (lastIndex < text.length) {
        segments.push({
            type: 'text',
            value: text.slice(lastIndex),
        })
    }

    return segments.length > 0
        ? segments
        : [
              {
                  type: 'text',
                  value: text,
              },
          ]
}
