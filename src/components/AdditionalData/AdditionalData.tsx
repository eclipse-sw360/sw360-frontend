// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import type { JSX } from 'react'

interface Props {
    additionalData:
        | {
              [k: string]: string
          }
        | undefined
}

const AdditionalData = ({ additionalData }: Props): JSX.Element => {
    const regexEmail = /^\w+([.-]\w+)*@\w+([.-]\w+)*(\.\w{2,3})+$/
    const regexUrl = /^(https?|chrome):\/\/[^\s$.?#].[^\s]*$/g
    return (
        <>
            {additionalData !== undefined &&
                Object.keys(additionalData).map((key) => {
                    if (additionalData[key].match(regexEmail)) {
                        return (
                            <li key={key}>
                                <span className='fw-bold'>{key}: </span>
                                <span>
                                    {' '}
                                    <a
                                        style={{
                                            textDecoration: 'none',
                                            color: '#F7941E',
                                        }}
                                        href={`mailto:${additionalData[key]}`}
                                    >
                                        {additionalData[key]}
                                    </a>
                                </span>
                            </li>
                        )
                    } else if (additionalData[key].match(regexUrl)) {
                        return (
                            <li key={key}>
                                <span className='fw-bold'>{key}: </span>
                                <span>
                                    {' '}
                                    <a
                                        style={{
                                            textDecoration: 'none',
                                            color: '#F7941E',
                                        }}
                                        href={additionalData[key]}
                                    >
                                        {additionalData[key]}
                                    </a>
                                </span>
                            </li>
                        )
                    } else {
                        return (
                            <li key={key}>
                                <span className='fw-bold'>{key}: </span>
                                <span>{additionalData[key]}</span>
                            </li>
                        )
                    }
                })}{' '}
        </>
    )
}
export default AdditionalData
