// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import React, { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Table, _ } from 'next-sw360'
import HomeTableHeader from './HomeTableHeader'
import { signOut, useSession } from 'next-auth/react'
import { ApiUtils, CommonUtils } from '@/utils/index'
import { Embedded, HttpStatus, ModerationRequest } from '@/object-types'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Spinner } from 'react-bootstrap'

type EmbeddedTaskAssignment = Embedded<ModerationRequest, 'sw360:moderationRequests'>
interface TaskAssignmentStatusMap {
    [key: string]: string;
}

function MyTaskAssignmentsWidget() {
    const [taskAssignmentData, setTaskAssignmentData] = useState([])
    const t = useTranslations('default')
    const [loading, setLoading] = useState(true)
    const { data: session, status } = useSession()
    const taskAssignmentStatus : TaskAssignmentStatusMap = {
        INPROGRESS: t('In Progress'),
        APPROVED: t('APPROVED'),
        PENDING: t('Pending'),
        REJECTED: t('REJECTED'),
    };

    const fetchData = useCallback(
        async (url: string) => {
            const response = await ApiUtils.GET(url, session.user.access_token)
            if (response.status == HttpStatus.OK) {
                const data = await response.json() as EmbeddedTaskAssignment
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
        void fetchData('moderationrequest/byState?state=open&allDetails=false').then((moderationRequests: EmbeddedTaskAssignment) => {
            if (!CommonUtils.isNullOrUndefined(moderationRequests['_embedded']['sw360:moderationRequests'])) {
                setTaskAssignmentData(
                    moderationRequests['_embedded']['sw360:moderationRequests'].map((item: ModerationRequest) => [
                        _(<Link href={'moderationrequest/' + item.id}>{item.documentName}</Link>),
                        taskAssignmentStatus[item.moderationState],
                    ])
                )
                setLoading(false)
                }})
        }, [fetchData, session])

    const title = t('My Task Assignments')
    const columns = [t('Document Name'), t('Status')]
    const language = { noRecordsFound: t('NoTasksAssigned') }
    if (status === 'unauthenticated') {
        signOut()
    } else {
    return (
        <div>
            <HomeTableHeader title={title} />
            {loading == false ? (
                <Table columns={columns}
                       data={taskAssignmentData}
                       pagination={{ limit: 5 }}
                       selector={false}
                       language={language} />
            ) : (
                <div className='col-12'>
                    <Spinner className='spinner' />
                </div>
            )}
        </div>
        )
    }
}

// We need use this to override typescript issue
// Reference: https://github.com/vercel/next.js/issues/42292
export default MyTaskAssignmentsWidget as unknown as () => JSX.Element
