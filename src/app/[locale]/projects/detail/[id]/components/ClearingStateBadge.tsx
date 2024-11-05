// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { Tooltip, OverlayTrigger } from 'react-bootstrap'

interface Props {
    isRelease: boolean
    clearingState: string
    projectState?: string
    t?: any
}

const capitalize = (text: string) => {
    return text
        ? text.split('_').reduce((s, c) => s + ' ' + (c.charAt(0) + c.substring(1).toLocaleLowerCase()), '').trim()
        : ''
}

const ReleaseClearingStateMapping: {[k: string]: string} = {
    'NEW_CLEARING': 'NEW_CLEARING',
    'APPROVED': 'REPORT_APPROVED',
    'REPORT_AVAILABLE': 'REPORT_AVAILABLE',
    'SCAN_AVAILABLE': 'SCAN_AVAILABLE',
    'SENT_TO_CLEARING_TOOL': 'SENT_TO_CLEARING_TOOL',
    'UNDER_CLEARING': 'UNDER_CLEARING',
    'INTERNAL_USE_SCAN_AVAILABLE': 'INTERNAL_USE_SCAN_AVAILABLE',
    'NEW': 'NEW_CLEARING',
    'REPORT_APPROVED': 'REPORT_APPROVED',
}

const ClearingStateBadge = ({ isRelease, clearingState, projectState, t }: Props) : JSX.Element => {

    return (
        <div className='text-center'>
            {
                (isRelease === true)
                    ?
                    <OverlayTrigger
                        overlay={
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                            <Tooltip>{`${t('Release Clearing State')}: ${t(ReleaseClearingStateMapping[clearingState])}`}</Tooltip>
                        }
                    >
                        {(clearingState === 'NEW_CLEARING' || clearingState === 'NEW') ? (
                            <span className='state-box clearingStateOpen capsule-left capsule-right'>{'CS'}</span>
                        ) : (clearingState === 'REPORT_AVAILABLE') ? (
                            <span className='state-box clearingStateReportAvailable capsule-left capsule-right'>{'CS'}</span>
                        ) : (clearingState === 'UNDER_CLEARING') ? (
                            <span className='state-box clearingStateInProgress capsule-left capsule-right'>{'CS'}</span>
                        ) : (clearingState === 'INTERNAL_USE_SCAN_AVAILABLE') ? (
                            <span className='state-box clearingStateUnknown capsule-left capsule-right'>{'CS'}</span>
                        ) : (clearingState === 'SENT_TO_CLEARING_TOOL' || clearingState === 'SCAN_AVAILABLE') ? (
                            <span className='state-box clearingStateSentToClearingTool capsule-left capsule-right'>{'CS'}</span>
                        ): (
                            <span className='state-box clearingStateApproved capsule-left capsule-right'>{'CS'}</span>
                        )}
                    </OverlayTrigger>
                    :
                    <>
                        {(projectState !== undefined) && <OverlayTrigger
                            overlay={
                                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                                <Tooltip>{`${t('Project State')}: ${t(capitalize(projectState))}`}</Tooltip>
                            }
                        >
                            {projectState === 'ACTIVE' ? (
                                <span className='state-box projectStateActive capsule-left'>{'PS'}</span>
                            ) : (
                                <span className='state-box projectStateInactive capsule-left'>{'PS'}</span>
                            )}
                        </OverlayTrigger>
                        }
                        <OverlayTrigger
                            overlay={
                                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                                <Tooltip>{`${t('Project Clearing State')}: ${t(capitalize(clearingState))}`}</Tooltip>
                            }
                        >
                            {clearingState === 'OPEN' ? (
                                <span className='state-box clearingStateOpen capsule-right'>{'CS'}</span>
                            ) : clearingState === 'IN_PROGRESS' ? (
                                <span className='state-box clearingStateInProgress capsule-right'>{'CS'}</span>
                            ) : (
                                <span className='state-box clearingStateApproved capsule-right'>{'CS'}</span>
                            )}
                        </OverlayTrigger>
                    </>
            }
        </div>
    )
}

export default ClearingStateBadge