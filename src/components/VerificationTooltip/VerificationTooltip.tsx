// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { type JSX, ReactNode, useState } from 'react'
import { VerificationStateInfo } from '@/object-types'

interface Props {
    verificationStateInfos: Array<VerificationStateInfo>
    children: ReactNode
}

const VerificationStateFormater = ({ stateInfo }: { stateInfo: VerificationStateInfo }) => {
    return (
        <li>
            <span className='verification-tooltip-header'>
                <b>{stateInfo.verificationState} </b>
                <span className='formatedMessageForVulDate'>({stateInfo.checkedOn})</span>
            </span>
            <span className='verification-tooltip-item'>
                <i>Checked By: </i>
                <span>{stateInfo.checkedBy}</span>
            </span>
            <span className='verification-tooltip-item'>
                <i>Action: </i>
                <span></span>
            </span>
            <span className='verification-tooltip-item'>
                <p>
                    <i>Comment: </i>
                    {stateInfo.comment}
                </p>
            </span>
        </li>
    )
}

const VerificationTooltip = ({ verificationStateInfos, children }: Props): JSX.Element => {
    const [show, setShow] = useState(false)
    return (
        <div
            className='verification-tooltip'
            onMouseOver={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
        >
            {show && (
                <div className='verification-tooltip-content'>
                    <ol
                        className='verification-tooltip-list'
                        reversed
                    >
                        {Object.entries(verificationStateInfos.slice().reverse()).map(([index, info]) => (
                            <VerificationStateFormater
                                key={index}
                                stateInfo={info}
                            />
                        ))}
                    </ol>
                </div>
            )}
            {children}
        </div>
    )
}

export default VerificationTooltip
