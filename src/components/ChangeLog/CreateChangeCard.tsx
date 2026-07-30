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
import { findKeyToLinkMappings, splitTextWithIdLinks } from './changelogLinkUtils'

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

const replaceKeysWithLinks = (diffString: string, mappings: Record<string, string>): JSX.Element => {
    const segments = splitTextWithIdLinks(diffString, mappings)

    if (segments.length === 1 && segments[0].type === 'text') {
        return <span>{diffString}</span>
    }

    return (
        <>
            {segments.map((segment, index) => {
                if (segment.type === 'link') {
                    return (
                        <Link
                            className='text-link'
                            href={segment.href}
                            target='_blank'
                            key={index}
                        >
                            {segment.value}
                        </Link>
                    )
                }

                return <span key={index}>{segment.value}</span>
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
