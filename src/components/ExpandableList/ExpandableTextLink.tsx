// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useState } from 'react'
import { BsCaretDownFill, BsCaretRightFill } from 'react-icons/bs'

export default function ExpandableTextList({ list }: { list: string[] }): JSX.Element {
    const [ isExpanded, setExpanded ] = useState(false)
    const fullString = list.join(', ')
    const previewString = fullString.slice(0, 10).concat('...')
    return (
        <>
            {
                isExpanded ?
                <div><BsCaretDownFill onClick={() => setExpanded(false)}/>{' '}{fullString}</div>:
                <div>
                    {
                        list.length !== 0 &&
                        <div><BsCaretRightFill onClick={() => setExpanded(true)} />{' '}{previewString}</div>
                    }
                </div>
            }
        </>
    )
}