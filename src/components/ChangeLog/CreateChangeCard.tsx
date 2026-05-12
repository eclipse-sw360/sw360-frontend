// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { diffWordsWithSpace } from 'diff'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { JSX, useMemo, useState } from 'react'
import { Changes } from '../../object-types/Changelogs'

function CreateChangesCards({ changes }: { changes: Changes[] | undefined | null }): JSX.Element {
    return (
        <>
            {(changes ?? []).map((c) => (
                <ChangeCard
                    c={c}
                    key={c.fieldName}
                />
            ))}
        </>
    )
}

const findKeyToLinkMappings = (fieldValue: unknown, fieldName: string): Record<string, string> => {
    if (!fieldValue || typeof fieldValue !== 'object') return {}
    const obj = fieldValue as Record<string, Record<string, string>>
    const keys = Object.keys(obj)
    const res: Record<string, string> = {}

    for (const key of keys) {
        let href: string | null = null

        if (fieldName.toLowerCase().includes('project')) {
            href = `/projects/detail/${key}`
        } else if (fieldName.toLowerCase().includes('component')) {
            href = `/components/detail/${key}`
        } else if (fieldName.toLowerCase().includes('release')) {
            href = `/components/releases/detail/${key}`
        } else if (fieldName.toLowerCase().includes('package')) {
            href = `/packages/detail/${key}`
        }

        if (href !== null) res[key] = href
    }
    return res
}

const replaceKeysWithLinks = (diffString: string, mappings: Record<string, string>): JSX.Element => {
    const delimiters = Object.keys(mappings)

    if (delimiters.length === 0) return <span>{diffString}</span>

    const regex = new RegExp(`(${delimiters.join('|')})`)

    const result = diffString.split(regex)

    return (
        <>
            {result.map((str: string, index: number) => {
                if (mappings[str]) {
                    return (
                        <Link
                            className='text-link'
                            href={mappings[str]}
                            target='_blank'
                            key={index}
                        >
                            {str}
                        </Link>
                    )
                } else {
                    return <span key={index}>{str}</span>
                }
            })}
        </>
    )
}

const ChangeCard = ({ c }: { c: Changes }): JSX.Element => {
    const t = useTranslations('default')
    const [isOpen, setIsOpen] = useState(true)
    const toggleCollapse = () => setIsOpen(!isOpen)
    const jsonStrOld = JSON.stringify(c.fieldValueOld, null, 2)
    const jsonStrNew = JSON.stringify(c.fieldValueNew, null, 2)
    const diffParts = useMemo(
        () => diffWordsWithSpace(jsonStrOld ?? '', jsonStrNew ?? ''),
        [
            jsonStrOld,
            jsonStrNew,
        ],
    )
    return (
        <table className='table fst-italic table-fixed'>
            <thead onClick={() => toggleCollapse()}>
                <tr>
                    <th colSpan={2}>{`${t('Field Name')}: ${c.fieldName ?? ''}`}</th>
                </tr>
            </thead>
            <tbody hidden={!isOpen}>
                <tr>
                    <td className='old-val-change text-justify align-top w-50 p-3 font-italic'>
                        <pre className='change-text'>
                            {diffParts.map((part, index) => {
                                const mappings = findKeyToLinkMappings(c.fieldValueOld, c.fieldName ?? '')
                                if (part.removed) {
                                    return (
                                        <span
                                            key={index}
                                            className='text-dark old-val-change-highlight'
                                        >
                                            {replaceKeysWithLinks(part.value, mappings)}
                                        </span>
                                    )
                                } else if (part.added) {
                                    return <span key={index}></span>
                                } else {
                                    return <span key={index}>{replaceKeysWithLinks(part.value, mappings)}</span>
                                }
                            })}
                        </pre>
                    </td>
                    <td className='new-val-change text-justify align-top w-50 p-3 font-italic'>
                        <pre className='change-text'>
                            {diffParts.map((part, index) => {
                                const mappings = findKeyToLinkMappings(c.fieldValueNew, c.fieldName ?? '')
                                if (part.removed) {
                                    return <span key={index}></span>
                                } else if (part.added) {
                                    return (
                                        <span
                                            key={index}
                                            className='text-dark new-val-change-highlight'
                                        >
                                            {replaceKeysWithLinks(part.value, mappings)}
                                        </span>
                                    )
                                } else {
                                    return <span key={index}>{replaceKeysWithLinks(part.value, mappings)}</span>
                                }
                            })}
                        </pre>
                    </td>
                </tr>
            </tbody>
        </table>
    )
}

export default CreateChangesCards
