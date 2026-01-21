// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { type JSX } from 'react'

export function DisplayMap({
    mapElement,
}: {
    mapElement: [
        string,
        string,
    ][]
}): JSX.Element {
    return (
        <>
            <ul className='px-3 mapDisplayRootItem'>
                {mapElement &&
                    mapElement.map(([key, val]) => (
                        <li key={key}>
                            <span className='mapDisplayChildItemLeft fw-bold'>{key}:&ensp;</span>
                            <span className='mapDisplayChildItemRight'>{val}</span>
                        </li>
                    ))}
            </ul>
        </>
    )
}

export function DisplayMapOfMap({ mapElement }: { mapElement: Map<string, Map<string, string>> }): JSX.Element {
    return (
        <>
            <ul className='px-3'>
                {Array.from(mapElement).map(([key, value]) => {
                    return (
                        <li key={key}>
                            <b>{key}</b>:
                            <div className='pr-1'>
                                <DisplayMap mapElement={Array.from(value)} />
                            </div>
                        </li>
                    )
                })}
            </ul>
        </>
    )
}
