// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ModerationRequestDetails, ModerationRequestPayload } from '@/object-types'
import styles from '../moderationRequestDetail.module.css'

interface ModerationRequestMap {
    [key: string]: string;
}

interface Props {
    data: ModerationRequestDetails,
    moderationRequestPayload : ModerationRequestPayload,
    setModerationRequestPayload : React.Dispatch<React.SetStateAction<ModerationRequestPayload>>
}


export default function ModerationDecision({ data,
                                             moderationRequestPayload,
                                             setModerationRequestPayload }: Props ) {

    const t = useTranslations('default')
    const moderationRequestStatus : ModerationRequestMap = {
        INPROGRESS: t('In Progress'),
        APPROVED: t('APPROVED'),
        PENDING: t('Pending'),
        REJECTED: t('REJECTED'),
    };

    const updateInputField = (event: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
        setModerationRequestPayload({
            ...moderationRequestPayload,
            [event.target.name]: event.target.value,
        })
    }

    return (
        <>
            <table className={`table label-value-table ${styles['summary-table']}`}>
                <thead>
                    <tr>
                        <th colSpan={2}>{t('Moderation Decision')}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{t('Status')}:</td>
                        <td>{moderationRequestStatus[data.moderationState] ?? ''}</td>
                    </tr>
                    <tr>
                        <td>{t('Moderator')}:</td>
                        <td>
                            {data.reviewer
                                ? <Link href={`mailto:${data.reviewer}`}>{data.reviewer}</Link>
                                : ''}
                        </td>
                    </tr>
                    <tr>
                        <td>{t('Comment on Moderation Decision')}

                            : <span style={{ color: 'red' }}>*</span>
                        </td>
                        <td>
                            <textarea
                                className='form-control'
                                id='moderationDecision.commentModerationRequestDecision'
                                name='comment'
                                aria-describedby={t('Comment on Moderation Decision')}
                                style={{ height: '120px' }}
                                value={moderationRequestPayload?.comment || ''}
                                onChange={updateInputField}
                                required
                            />
                        </td>
                    </tr>
                </tbody>
            </table>
        </>
    )
}
