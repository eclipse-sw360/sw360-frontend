// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { getSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { ReactNode, useState } from 'react'
import { Button } from 'react-bootstrap'

import { Attachment, AttachmentTypes, HttpStatus } from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils'

interface Props {
    releaseId: string
    embeddedAttachments: Array<Attachment>
}

interface AssessmentSummaryInfo {
    [key: string]: string
}

const AssessmentSummaryInfo = ({ embeddedAttachments, releaseId }: Props): ReactNode => {
    const t = useTranslations('default')
    const [toggle, setToggle] = useState(false)
    const [assessmentSummaryInfo, setAssessmentSummaryInfo] = useState<AssessmentSummaryInfo | undefined>(undefined)

    const cliAttachmentNumber = embeddedAttachments.filter(
        (attachment) => attachment.attachmentType == AttachmentTypes.COMPONENT_LICENSE_INFO_XML,
    ).length

    const handleShowAssessmentInfo = async () => {
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) return signOut()

        const response = await ApiUtils.GET(`releases/${releaseId}/assessmentSummaryInfo`, session.user.access_token)
        if (response.status === HttpStatus.OK) {
            const data = (await response.json()) as AssessmentSummaryInfo
            setAssessmentSummaryInfo(data)
        } else if (response.status === HttpStatus.NO_CONTENT) {
            setAssessmentSummaryInfo({})
        } else if (response.status === HttpStatus.UNAUTHORIZED) {
            await signOut()
        }
    }

    const renderAssessmentSummaryInfo = (assessmentSummaryInfo: AssessmentSummaryInfo) => {
        return Object.keys(assessmentSummaryInfo).map((key: string) => {
            if (key !== '#text') {
                return (
                    <tr key={key}>
                        <td>{t(key as never)}</td>
                        <td>{assessmentSummaryInfo[key]}</td>
                    </tr>
                )
            }
        })
    }
    return (
        <table className='table summary-table'>
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
                                    <Button
                                        variant='secondary'
                                        onClick={() => void handleShowAssessmentInfo()}
                                    >
                                        {t('Show Assessment Summary Info')}
                                    </Button>
                                </td>
                            </tr>
                        )}
                    </>
                )}
                {cliAttachmentNumber == 0 && (
                    <tr>
                        <td colSpan={2}>{t('CLI attachment not found in the release')}!</td>
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
