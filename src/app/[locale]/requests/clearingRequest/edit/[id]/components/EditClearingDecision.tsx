// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ClearingRequestDetails, ClearingRequestPayload } from '@/object-types'
import styles from '@/app/[locale]/requests/requestDetail.module.css'
import { signOut, useSession } from 'next-auth/react'

interface Props {
    clearingRequestData: ClearingRequestDetails,
    clearingRequestPayload?: ClearingRequestPayload
    setClearingRequestPayload?: React.Dispatch<React.SetStateAction<ClearingRequestPayload>>
}

interface ClearingRequestDataMap {
    [key: string]: string;
}

export default function EditClearingDecision({ clearingRequestData }: Props) {

    const t = useTranslations('default')
    const { status } = useSession()
    const clearingRequestStatus : ClearingRequestDataMap = {
        NEW: t('New'),
        IN_PROGRESS: t('In Progress'),
        ACCEPTED: t('ACCEPTED'),
        PENDING_INPUT: t('Pending Input'),
        REJECTED: t('REJECTED'),
        IN_QUEUE: t('In Queue'),
        CLOSED: t('Closed'),
        AWAITING_RESPONSE: t('Awaiting Response'),
        ON_HOLD: t('On Hold'),
        SANITY_CHECK: t('Sanity Check')
    };

    const clearingRequestPriority : ClearingRequestDataMap = {
        LOW: t('Low'),
        MEDIUM: t('Medium'),
        HIGH: t('High'),
        CRITICAL: t('Critical')
    };


    if (status === 'unauthenticated') {
        signOut()
    } else {
    return (
        <>
            <table className={`table label-value-table ${styles['summary-table']}`}>
                <thead>
                    <tr>
                        <th colSpan={2}>{t('Clearing Decision')}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{t('Request Status')}:</td>
                        <td>{clearingRequestStatus[clearingRequestData.clearingState]}</td>
                    </tr>
                    <tr>
                        <td>{t('Priority')}:</td>
                        <td>
                            {clearingRequestPriority[clearingRequestData.priority]}
                        </td>
                    </tr>
                    <tr>
                        <td>{t('Clearing Team')}:</td>
                        <td>
                            {clearingRequestData.clearingTeam
                                ? <Link href={`mailto:${clearingRequestData.clearingTeam}`}>
                                    {clearingRequestData.clearingTeamName}
                                  </Link>
                                : ''}
                        </td>
                    </tr>
                    <tr>
                        <td>{t('Agreed Clearing Date')}:</td>
                        <td>
                            {clearingRequestData.agreedClearingDate ?? ''}
                        </td>
                    </tr>
                    <tr>
                        <td>{t('Last Updated on')}:</td>
                        <td>
                            {''}
                        </td>
                    </tr>
                </tbody>
            </table>
        </>
    )}
}
