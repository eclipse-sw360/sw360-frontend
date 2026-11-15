// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { useTranslations } from 'next-intl'
import { type JSX, ReactNode } from 'react'
import { OverlayTrigger, Popover, Tooltip } from 'react-bootstrap'
import { BsInfoCircle } from 'react-icons/bs'
import { VerificationStateInfo } from '@/object-types'

interface Props {
    verificationStateInfos?: Array<VerificationStateInfo>
    children?: ReactNode
}

const VerificationStateFormater = ({ stateInfo }: { stateInfo: VerificationStateInfo }) => {
    return (
        <li>
            <span className='formatedMessageForVulHeader'>
                <b>{stateInfo.verificationState} </b>
                <span className='formatedMessageForVulDate'>({stateInfo.checkedOn})</span>
            </span>
            <span className='formatedMessageForVulItem'>
                <i>Checked By: </i>
                <span>{stateInfo.checkedBy}</span>
            </span>
            <span className='formatedMessageForVulItem'>
                <i>Action: </i>
                <span></span>
            </span>
            <span className='formatedMessageForVulItem'>
                <p>
                    <i>Comment: </i>
                    {stateInfo.comment}
                </p>
            </span>
        </li>
    )
}

const VerificationTooltip = ({ verificationStateInfos = [], children }: Props): JSX.Element => {
    const t = useTranslations('default')

    if (verificationStateInfos.length === 0) {
        return (
            <OverlayTrigger
                placement='top'
                overlay={<Tooltip id='verification-not-checked-tooltip'>{t('Not Checked yet')}</Tooltip>}
            >
                <span className='d-inline-flex align-items-center'>
                    <BsInfoCircle
                        style={{
                            marginRight: '5px',
                            color: 'gray',
                            width: '15px',
                            height: '15px',
                        }}
                        size={20}
                    />
                    {children ?? t('Not Checked')}
                </span>
            </OverlayTrigger>
        )
    }

    const popover = (
        <Popover
            id='verification-history-popover'
            className='verification-tooltip-content'
        >
            <Popover.Body className='p-1'>
                <ol
                    className='formatedMessageForVul mb-0 ps-3'
                    reversed
                >
                    {verificationStateInfos
                        .slice()
                        .reverse()
                        .map((info, index) => (
                            <VerificationStateFormater
                                key={index}
                                stateInfo={info}
                            />
                        ))}
                </ol>
            </Popover.Body>
        </Popover>
    )

    return (
        <OverlayTrigger
            placement='top'
            overlay={popover}
        >
            <span className='d-inline-flex align-items-center'>
                <BsInfoCircle
                    style={{
                        marginRight: '5px',
                        color: 'gray',
                        width: '15px',
                        height: '15px',
                    }}
                    size={20}
                />
                {children ?? verificationStateInfos.at(-1)?.verificationState}
            </span>
        </OverlayTrigger>
    )
}

export default VerificationTooltip
