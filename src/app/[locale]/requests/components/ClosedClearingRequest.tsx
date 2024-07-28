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

interface ClearingRequestDataMap {
    [key: string]: string;
}

interface ProjectData {
    isProjectDeleted?: boolean,
    projectId?: string,
    projectName?: string
}

function ClosedClearingRequest() {

    const t = useTranslations('default')
    const { data: session, status } = useSession()
    const [loading, setLoading] = useState(true)
    const [tableData, setTableData] = useState<Array<any>>([])
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
    const clearingRequestType : ClearingRequestDataMap = {
        DEEP: t('Deep'),
        HIGH: t('High')
    };

    const columns = [
        {
            id: 'closedClearingRequest.requestId',
            name: t('Request ID'),
            sort: true,
            formatter: ({ requestId }: { requestId: string; }) =>
                _(
                    <>
                        <Link href={`/requests/clearingRequest/${requestId}`} className='text-link'>
                            {requestId}
                        </Link>
                    </>
                ),
        },
        {
            id: 'closedClearingRequest.baBlGroup',
            name: t('BA-BL/Group'),
            sort: true,
        },
        {
            id: 'closedClearingRequest.project',
            name: t('Project'),
            sort: true,
            formatter: (projectData: ProjectData) =>
                _(
                    projectData.isProjectDeleted ? t('Project Deleted') :
                    <>
                        <Link href={`/projects/detail/${projectData.projectId}`}
                              className='text-link'>
                            {projectData.projectName}
                        </Link>
                    </>
                ),
        },
        {
            id: 'closedClearingRequest.status',
            name: t('Status'),
            sort: true,
        },
        {
            id: 'closedClearingRequest.reqestingUser',
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
            id: 'closedClearingRequest.clearingTeam ',
            name: t('Clearing Team'),
            sort: true,
            formatter: (email: string) =>
                _(
                    <>
                        <Link href={`mailto:${email}`} className='text-link'>
                            {email}
                        </Link>
                    </>
                ),
        },
        {
            id: 'closedClearingRequest.createdOn',
            name: t('Created On'),
            sort: true,
        },
        {
            id: 'closedClearingRequest.preferredClearingDate',
            name: t('Preferred Clearing Date'),
            sort: true,
        },
        {
            id: 'closedClearingRequest.agreedClearingDate',
            name: t('Agreed Clearing Date'),
            sort: true,
        },
        {
            id: 'closedClearingRequest.requestClosedOn ',
            name: t('Request Closed On'),
            sort: true,
        },
        {
            id: 'openClearingRequest.clearingType',
            name: t('Clearing Type'),
            sort: true,
        },
        {
            id: 'closedClearingRequest.actions ',
            name: t('Actions'),
            sort: true,
        }
    ]

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
                return item.clearingState === 'REJECTED' || item.clearingState === 'CLOSED';
            });
            setTableData(
                filteredClearingRequests.map((item: ClearingRequest) => {
                    let isProjectDeleted : boolean = false
                    if (!Object.hasOwn(item, 'projectId')){
                        isProjectDeleted = true
                    }
                    return [
                                {
                                    requestId: item.id
                                },
                                item.projectBU ?? t('Not Available'),
                                isProjectDeleted ? {
                                    isProjectDeleted: true
                                    } : {
                                    isProjectDeleted: false,
                                    projectId: item.projectId ?? '',
                                    projectName: item.projectName ?? ''
                                },
                                clearingRequestStatus[item.clearingState] ?? '',
                                item.requestingUser ?? '',
                                item.clearingTeam ?? '',
                                item.createdOn ?? '',
                                item.requestedClearingDate ?? '',
                                item.agreedClearingDate ?? '',
                                item.requestClosedOn ?? '',
                                clearingRequestType[item.clearingType] ?? '',
                                ''
                            ]
                })
            )
            setLoading(false)
        })}, [fetchData, session])

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

export default ClosedClearingRequest
