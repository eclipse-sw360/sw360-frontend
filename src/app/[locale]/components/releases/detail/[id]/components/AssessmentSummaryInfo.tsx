// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { _ } from '@/components/sw360'
import { useTranslations } from 'next-intl'
import { COMMON_NAMESPACE } from '@/object-types/Constants'
import { useState } from 'react'
import EmbeddedAttachment from '@/object-types/EmbeddedAttachment'
import AttachmentType from '@/object-types/enums/AttachmentTypes'
import styles from '../detail.module.css'
import { Button } from 'react-bootstrap'
import ApiUtils from '@/utils/api/api.util'
import { signOut, useSession } from "next-auth/react";
import { Session } from '@/object-types/Session'
import HttpStatus from '@/object-types/enums/HttpStatus'

interface Props {
    releaseId: string
    embeddedAttachments: Array<EmbeddedAttachment>
}

const AssessmentSummaryInfo = ({ embeddedAttachments, releaseId }: Props) => {
    const t = useTranslations(COMMON_NAMESPACE)
    const { data: session } = useSession() as { data: Session }
    const [toggle, setToggle] = useState(false)
    const [assessmentSummaryInfo, setAssessmentSummaryInfo] = useState(undefined)

    const cliAttachmentNumber = embeddedAttachments.filter(
        attachment => attachment.attachmentType == AttachmentType.COMPONENT_LICENSE_INFO_XML).length

    const handleShowAssessmentInfo = async () => {
        const response = await ApiUtils.GET(`releases/${releaseId}/assessmentSummaryInfo`, session.user.access_token)
        if (response.status == HttpStatus.OK) {
            const data = await response.json()
            setAssessmentSummaryInfo(data)
        } else if (response.status == HttpStatus.NO_CONTENT) {
            setAssessmentSummaryInfo({})
        } else if (response.status == HttpStatus.UNAUTHORIZED) {
            signOut()
        }
    }

    const renderAssessmentSummaryInfo = (assessmentSummaryInfo: { [key: string]: string }) => {
        return Object.keys(assessmentSummaryInfo).map((key: string) => {
            if (key !== '#text') {
                return (
                    <tr key={key}>
                        <td>{t(key)}</td>
                        <td>{assessmentSummaryInfo[key]}</td>
                    </tr>
                )
            }
        })
    }
    return (
        <table className={`table label-value-table ${styles['summary-table']}`}>
            <thead onClick={() => { setToggle(!toggle) }}>
                <tr>
                    <th colSpan={2}>{t('Assessment Summary Info')}:</th>
                </tr>
            </thead>
            <tbody hidden={toggle}>
                {(cliAttachmentNumber == 1) &&
                    <>
                        {(assessmentSummaryInfo)
                            ?
                            <>
                                {(Object.keys(assessmentSummaryInfo).length === 0)
                                    ? <tr><td colSpan={2}>{t('Assessment Summary information is not present in CLI file')}</td></tr>
                                    : renderAssessmentSummaryInfo(assessmentSummaryInfo)
                                }
                            </>
                            :
                            <tr>
                                <td colSpan={2}>
                                    <Button variant='secondary' onClick={handleShowAssessmentInfo}>{t('Show Assessment Summary Info')}</Button>
                                </td>
                            </tr>
                        }
                    </>
                }
                {
                    (cliAttachmentNumber == 0) &&
                    <tr>
                        <td colSpan={2}>{t('CLI attachment not found in the release!')}</td>
                    </tr>
                }
                {
                    (cliAttachmentNumber) > 1 &&
                    <tr>
                        <td colSpan={2}>{t('Multiple CLI are found in release!')}</td>
                    </tr>
                }
            </tbody>
        </table>
    )
}

export default AssessmentSummaryInfo
