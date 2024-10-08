// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ClearingRequestDetails } from '@/object-types'
import { signOut, useSession } from 'next-auth/react'

interface ClearingRequestDataMap {
    [key: string]: string;
}

interface Props {
    data: ClearingRequestDetails | undefined
}

export default function ClearingDecision({ data }: Props ) {

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
            <table className='table summary-table'>
                <thead>
                    <tr>
                        <th colSpan={2}>{t('Clearing Decision')}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{t('Request Status')}:</td>
                        <td>{data?.clearingState !== undefined ? 
                                clearingRequestStatus[data?.clearingState] :
                                undefined}</td>
                    </tr>
                    <tr>
                        <td>{t('Priority')}:</td>
                        <td>
                            {data?.priority !== undefined ?
                                clearingRequestPriority[data?.priority] :
                                undefined
                            }
                        </td>
                    </tr>
                    <tr>
                        <td>{t('Clearing Team')}:</td>
                        <td>
                            {data?.clearingTeam
                                ? <Link href={`mailto:${data?.clearingTeam}`}>{data?.clearingTeamName}</Link>
                                : ''}
                        </td>
                    </tr>
                    <tr>
                        <td>{t('Agreed Clearing Date')}:</td>
                        <td>
                            {data?.agreedClearingDate ?? ''}
                        </td>
                    </tr>
                    <tr>
                        <td>{t('Request Closed on')}:</td>
                        <td>
                            {data?._embedded?.requestClosedOn}
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
