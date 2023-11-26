// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Button } from 'react-bootstrap'

import { Attachment, AttachmentType, HttpStatus } from '@/object-types'
import { ApiUtils } from '@/utils'
import styles from '../detail.module.css'

interface Props {
    releaseId: string
    embeddedAttachments: Array<Attachment>
}

interface AssessmentSummaryInfo {
    [key: string]: string
}

const AssessmentSummaryInfo = ({ embeddedAttachments, releaseId }: Props) => {
    const t = useTranslations('default')
    const { data: session } = useSession()
    const [toggle, setToggle] = useState(false)
    const [assessmentSummaryInfo, setAssessmentSummaryInfo] = useState<AssessmentSummaryInfo>(undefined)

    const cliAttachmentNumber = embeddedAttachments.filter(
        (attachment) => attachment.attachmentType == AttachmentType.COMPONENT_LICENSE_INFO_XML
    ).length

    const handleShowAssessmentInfo = async () => {
        const response = await ApiUtils.GET(`releases/${releaseId}/assessmentSummaryInfo`, session.user.access_token)
        if (response.status == HttpStatus.OK) {
            const data = (await response.json()) as AssessmentSummaryInfo
            setAssessmentSummaryInfo(data)
        } else if (response.status == HttpStatus.NO_CONTENT) {
            setAssessmentSummaryInfo({})
        } else if (response.status == HttpStatus.UNAUTHORIZED) {
            await signOut()
        }
    }

    const renderAssessmentSummaryInfo = (assessmentSummaryInfo: AssessmentSummaryInfo) => {
        return Object.keys(assessmentSummaryInfo).map((key: string) => {
            if (key !== '#text') {
                return (
                    <tr key={key}>
                        <td>
                            {
                                // @ts-expect-error: TS2345 invalidate translation even if is valid under
                                t(key)
                            }
                        </td>
                        <td>{assessmentSummaryInfo[key]}</td>
                    </tr>
                )
            }
        })
    }
    return (
        <table className={`table label-value-table ${styles['summary-table']}`}>
            <thead
                onClick={() => {
                    setToggle(!toggle)
                }}
            >
                <tr>
                    <th colSpan={2}>{t('Assessment Summary Info')}:</th>
                </tr>
            </thead>
            <tbody hidden={toggle}>
                {cliAttachmentNumber == 1 && (
                    <>
                        {assessmentSummaryInfo ? (
                            <>
                                {Object.keys(assessmentSummaryInfo).length === 0 ? (
                                    <tr>
                                        <td colSpan={2}>
                                            {t('Assessment Summary information is not present in CLI file')}
                                        </td>
                                    </tr>
                                ) : (
                                    renderAssessmentSummaryInfo(assessmentSummaryInfo)
                                )}
                            </>
                        ) : (
                            <tr>
                                <td colSpan={2}>
                                    <Button variant='secondary' onClick={() => void handleShowAssessmentInfo()}>
                                        {t('Show Assessment Summary Info')}
                                    </Button>
                                </td>
                            </tr>
                        )}
                    </>
                )}
                {cliAttachmentNumber == 0 && (
                    <tr>
                        <td colSpan={2}>{t('CLI attachment not found in the release!')}</td>
                    </tr>
                )}
                {cliAttachmentNumber > 1 && (
                    <tr>
                        <td colSpan={2}>{t('Multiple CLI are found in release!')}</td>
                    </tr>
                )}
            </tbody>
        </table>
    )
}

export default AssessmentSummaryInfo
