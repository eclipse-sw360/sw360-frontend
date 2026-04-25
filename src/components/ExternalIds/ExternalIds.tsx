// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import type { JSX } from 'react'

interface Props {
    externalIds: {
        [k: string]: string
    }
}

/**
 * Expands external IDs for display, with special handling for 'package-url'.
 * If package-url value is a JSON array string, it expands into multiple entries.
 */
const expandExternalIds = (externalIds: {
    [k: string]: string
}): Array<
    [
        string,
        string,
    ]
> => {
    const result: Array<
        [
            string,
            string,
        ]
    > = []

    Object.entries(externalIds).forEach(([key, value]) => {
        if (key === 'package-url' && value.trimStart().startsWith('[')) {
            try {
                const urls = JSON.parse(value) as string[]
                if (Array.isArray(urls)) {
                    urls.forEach((url) => {
                        result.push([
                            'package-url',
                            url,
                        ])
                    })
                    return
                }
            } catch {
                // Not valid JSON, fall through to default handling
            }
        }
        result.push([
            key,
            value,
        ])
    })

    return result
}

const ExternalIds = ({ externalIds }: Props): JSX.Element => {
    const expandedIds = expandExternalIds(externalIds)

    return (
        <>
            {' '}
            {expandedIds.map(([key, value], index) => {
                return (
                    <li key={`${key}-${index}`}>
                        <span className='fw-bold'>{key}: </span>
                        <span> {value}</span>
                    </li>
                )
            })}
        </>
    )
}

export default ExternalIds
