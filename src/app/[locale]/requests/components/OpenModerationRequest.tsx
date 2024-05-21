// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ApiUtils } from '@/utils/index'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Table, _ } from "next-sw360"
import Link from 'next/link'
import { useEffect, useState, useCallback } from 'react'
import { Embedded, HttpStatus, ModerationRequest } from '@/object-types'
import { notFound } from 'next/navigation'
import ExpandingModeratorCell from './ExpandingModeratorCell'
import { Spinner } from 'react-bootstrap'

type EmbeddedModerationRequest = Embedded<ModerationRequest, 'sw360:moderationRequests'>
interface ModerationRequestMap {
    [key: string]: string;
}


function OpenModerationRequest() {

    const t = useTranslations('default')
    const [loading, setLoading] = useState(true)
    const { data: session, status } = useSession()
    const [tableData, setTableData] = useState<Array<any>>([])
    const moderationRequestStatus : ModerationRequestMap = {
        INPROGRESS: t('In Progress'),
        APPROVED: t('APPROVED'),
        PENDING: t('Pending'),
        REJECTED: t('REJECTED'),
    };

    const formatDate = (timestamp: number): string => {
        if(!timestamp){
            return null
        }
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    const fetchData = useCallback(
        async (url: string) => {
            const response = await ApiUtils.GET(url, session.user.access_token)
            if (response.status == HttpStatus.OK) {
                const data = await response.json() as EmbeddedModerationRequest
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
        void fetchData('moderationrequest').then((moderationRequests: EmbeddedModerationRequest) => {
            const filteredModerationRequests = moderationRequests['_embedded']['sw360:moderationRequests']
                                                                .filter((item: ModerationRequest) => {
                return item.moderationState === 'PENDING' || item.moderationState === 'INPROGRESS';
            });

            setTableData(
                filteredModerationRequests.map((item: ModerationRequest) => [
                    formatDate(item.timestamp),
                    item.documentType,
                    _(<Link href={`/requests/moderationRequest/${item.id}`}>{item.documentName}</Link>),
                    item.requestingUser,
                    item.requestingUserDepartment,
                    item.moderators,
                    moderationRequestStatus[item.moderationState],
                    '',
                ])
            )
            setLoading(false)
        })}, [fetchData, session])

    const columns = [
        {
            id: 'openModerationRequest.date',
            name: t('Date'),
            width: '10%',
            sort: true,
        },
        {
            id: 'openModerationRequest.type',
            name: t('Type'),
            width: '10%',
            sort: true,
        },
        {
            id: 'openModerationRequest.documentName',
            name: t('Document Name'),
            width: 'auto',
            sort: true,
        },
        {
            id: 'openModerationRequest.requestingUser',
            name: t('Requesting User'),
            width: '15%',
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
            id: 'openModerationRequest.department',
            name: t('Department'),
            width: '10%',
            sort: true,
        },
        {
            id: 'openModerationRequest.moderators',
            name: t('Moderators'),
            width: '25%',
            formatter: (moderators: string[]) =>
                _(
                    <ExpandingModeratorCell moderators={moderators} />
                ),
            sort: true,
        },
        {
            id: 'openModerationRequest.state',
            name: t('State'),
            sort: true,
        },
        {
            id: 'openModerationRequest.actions',
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

export default OpenModerationRequest
