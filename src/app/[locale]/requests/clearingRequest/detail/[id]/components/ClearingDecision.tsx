// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ClearingRequestDetails } from '@/object-types'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { ReactNode, useEffect } from 'react'

interface ClearingRequestDataMap {
    [key: string]: string
}

interface Props {
    data: ClearingRequestDetails | undefined
}

export default function ClearingDecision({ data }: Readonly<Props>): ReactNode | undefined {
    const t = useTranslations('default')
    const { status } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [status])

    const clearingRequestStatus: ClearingRequestDataMap = {
        NEW: t('New'),
        IN_PROGRESS: t('In Progress'),
        ACCEPTED: t('ACCEPTED'),
        PENDING_INPUT: t('Pending Input'),
        REJECTED: t('REJECTED'),
        IN_QUEUE: t('In Queue'),
        CLOSED: t('Closed'),
        AWAITING_RESPONSE: t('Awaiting Response'),
        ON_HOLD: t('On Hold'),
        SANITY_CHECK: t('Sanity Check'),
    }

    const clearingRequestPriority: ClearingRequestDataMap = {
        LOW: t('Low'),
        MEDIUM: t('Medium'),
        HIGH: t('High'),
        CRITICAL: t('Critical'),
    }

    return (
        <table className='table summary-table'>
            <thead>
                <tr>
                    <th colSpan={2}>{t('Clearing Decision')}</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>{t('Request Status')}:</td>
                    <td>{data?.clearingState !== undefined ? clearingRequestStatus[data.clearingState] : undefined}</td>
                </tr>
                <tr>
                    <td>{t('Priority')}:</td>
                    <td>{data?.priority !== undefined ? clearingRequestPriority[data.priority] : undefined}</td>
                </tr>
                <tr>
                    <td>{t('Clearing Team')}:</td>
                    <td>
                        {data?.clearingTeam !== undefined && data?._embedded?.clearingTeam?.fullName !== undefined ? (
                            <Link href={`mailto:${data._embedded.clearingTeam.email}`}>
                                {data._embedded.clearingTeam.fullName}
                            </Link>
                        ) : (
                            ''
                        )}
                    </td>
                </tr>
                <tr>
                    <td>{t('Agreed Clearing Date')}:</td>
                    <td>{data?.agreedClearingDate ?? ''}</td>
                </tr>
                <tr
                    hidden={
                        data?.clearingState !== undefined &&
                        !(data?.clearingState === 'CLOSED' || data?.clearingState === 'REJECTED')
                    }
                >
                    <td>{t('Request Closed on')}:</td>
                    <td>{data?._embedded?.requestClosedOn}</td>
                </tr>
                <tr>
                    <td>{t('Last Updated on')}:</td>
                    <td>{data?._embedded?.lastUpdatedOn ?? ''}</td>
                </tr>
                <tr
                    hidden={
                        data?.clearingState !== undefined &&
                        (data?.clearingState === 'CLOSED' || data?.clearingState === 'REJECTED')
                    }
                >
                    <td>{t('Clearing Progress')}:</td>
                    <td>
                        <>
                            {data?._embedded?.totalRelease !== undefined && data?._embedded?.openRelease !== undefined
                                ? (() => {
                                      const percentage =
                                          data._embedded.totalRelease > 0
                                              ? ((data._embedded.totalRelease - data._embedded.openRelease) /
                                                    data._embedded.totalRelease) *
                                                100
                                              : 0

                                      return (
                                          <div className='progress position-relative'>
                                              <div
                                                  className='progress-bar progress-bar-striped progress-bar-animated bg-warning'
                                                  role='progressbar'
                                                  aria-valuenow={percentage}
                                                  aria-valuemin={0}
                                                  aria-valuemax={100}
                                                  style={{ width: `${percentage}%` }}
                                              ></div>
                                              <span
                                                  className='position-absolute w-100 text-center'
                                                  style={{ color: 'black', fontWeight: 'bold', left: 0 }}
                                              >
                                                  {percentage.toFixed(2)}%
                                              </span>
                                          </div>
                                      )
                                  })()
                                : t('Not Available')}
                        </>
                    </td>
                </tr>
            </tbody>
        </table>
    )
}
