// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { Table, _ } from "next-sw360"
import { useTranslations } from 'next-intl'
import { ApiUtils } from '@/utils/index'
import { Embedded, HttpStatus } from '@/object-types'
import { signOut, useSession } from 'next-auth/react'
import { notFound } from 'next/navigation'
import { ClearingRequest } from '@/object-types'
import { Spinner } from 'react-bootstrap'

type EmbeddedClearingRequest = Embedded<ClearingRequest, 'sw360:clearingRequests'>
interface ClearingRequestStatusMap {
    [key: string]: string;
}
interface ClearingRequestPriorityMap {
    [key: string]: string;
}

function OpenClearingRequest() {

    const t = useTranslations('default')
    const [loading, setLoading] = useState(true)
    const { data: session, status } = useSession()
    const [tableData, setTableData] = useState<Array<any>>([])
    const clearingRequestStatus : ClearingRequestStatusMap = {
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
    const clearingRequestPriority : ClearingRequestPriorityMap = {
        LOW: t('Low'),
        MEDIUM: t('Medium'),
        HIGH: t('High'),
        CRITICAL: t('Critical')
    };

    const fetchData = useCallback(
        async (url: string) => {
            const response = await ApiUtils.GET(url, session.user.access_token)
            if (response.status == HttpStatus.OK) {
                const data = await response.json() as EmbeddedClearingRequest
                return data
            } else if (response.status == HttpStatus.UNAUTHORIZED) {
                return signOut()
            } else {
                notFound()
            }
        },[session]
    )

    useEffect(() => {
        setLoading(true)
        void fetchData('clearingrequests').then((clearingRequests: EmbeddedClearingRequest) => {
            const filteredClearingRequests = clearingRequests['_embedded']['sw360:clearingRequests']
                                                                .filter((item: ClearingRequest) => {
                return item.clearingState != 'ACCEPTED' && item.clearingState != 'CLOSED';
            });
            setTableData(
                filteredClearingRequests.map((item: ClearingRequest) => [
                    item.id,
                    item.projectBU,
                    item.projectId,
                    '',
                    clearingRequestStatus[item.clearingState],
                    clearingRequestPriority[item.priority],
                    item.requestingUser,
                    '',
                    '',
                    item.requestedClearingDate,
                    '',
                    '',
                    ''
                ])
            )
            setLoading(false)
        })}, [fetchData, session])


    const columns = [
        {
            id: 'openClearingRequest.requestId',
            name: t('Request ID'),
            sort: true,
        },
        {
            id: 'openClearingRequest.baBlGroup',
            name: t('BA-BL/Group'),
            sort: true,
        },
        {
            id: 'openClearingRequest.project',
            name: t('Project'),
            sort: true,
        },
        {
            id: 'openClearingRequest.openReleases',
            name: t('Open Releases'),
            sort: true,
        },
        {
            id: 'openClearingRequest.status',
            name: t('Status'),
            sort: true,
        },
        {
            id: 'openClearingRequest.priority',
            name: t('Priority'),
            sort: true,
        },
        {
            id: 'openClearingRequest.reqestingUser',
            name: t('Requesting User'),
            formatter: (email: string) =>
            _(
                <>
                    <Link href={`mailto:${email}`} className='text-link'>
                        {email}
                    </Link>
                </>
            ),
            sort: true,
        },
        {
            id: 'openClearingRequest.clearingProcess ',
            name: t('Clearing Process'),
            sort: true,
        },
        {
            id: 'openClearingRequest.createdOn',
            name: t('Created On'),
            sort: true,
        },
        {
            id: 'openClearingRequest.preferredClearingDate',
            name: t('Preferred Clearing Date'),
            sort: true,
        },
        {
            id: 'openClearingRequest.agreedClearingDate',
            name: t('Agreed Clearing Date'),
            sort: true,
        },
        {
            id: 'openClearingRequest.clearingType ',
            name: t('Clearing Type'),
            sort: true,
        },
        {
            id: 'openClearingRequest.actions ',
            name: t('Actions'),
            sort: true,
        }
    ]

    if (status === 'unauthenticated') {
        signOut()
    } else {
    return (
        <>
            <div className='row mb-4'>
                <div className='col-12 d-flex justify-content-center align-items-center'>
                    {loading == false ? (
                        <div style={{ paddingLeft: '0px' }}>
                            <Table columns={columns} data={tableData} sort={false} selector={true} />
                        </div>
                        ) : (
                                <Spinner className='spinner' />
                        )
                    }
                </div>
            </div>
        </>
    )}
}

export default OpenClearingRequest
