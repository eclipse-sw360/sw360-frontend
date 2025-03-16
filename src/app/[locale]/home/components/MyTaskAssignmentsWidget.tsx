// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { Embedded, HttpStatus, ModerationRequest } from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils/index'
import { getSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Table, _ } from 'next-sw360'
import Link from 'next/link'
import React, { ReactNode, useCallback, useEffect, useState, type JSX } from 'react';
import { Spinner } from 'react-bootstrap'
import HomeTableHeader from './HomeTableHeader'

type EmbeddedTaskAssignments = Embedded<ModerationRequest, 'sw360:moderationRequests'>
interface TaskAssignmentStatusMap {
    [key: string]: string
}

function MyTaskAssignmentsWidget(): ReactNode {
    const [taskAssignmentData, setTaskAssignmentData] = useState<Array<(string | JSX.Element)[]>>([])
    const t = useTranslations('default')
    const [loading, setLoading] = useState(true)
    const taskAssignmentStatus: TaskAssignmentStatusMap = {
        INPROGRESS: t('In Progress'),
        APPROVED: t('APPROVED'),
        PENDING: t('Pending'),
        REJECTED: t('REJECTED'),
    }

    const fetchData = useCallback(async (url: string) => {
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) return signOut()
        const response = await ApiUtils.GET(url, session.user.access_token)
        if (response.status == HttpStatus.OK) {
            const data = (await response.json()) as EmbeddedTaskAssignments
            return data
        } else if (response.status == HttpStatus.UNAUTHORIZED) {
            return signOut()
        } else {
            return {
                _embedded: {
                    'sw360:moderationRequests': [],
                },
            }
        }
    }, [])

    useEffect(() => {
        setLoading(true)
        void fetchData('moderationrequest/byState?state=open&allDetails=false').then(
            (moderationRequests: EmbeddedTaskAssignments | undefined) => {
                if (moderationRequests === undefined) {
                    return
                }
                if (!CommonUtils.isNullOrUndefined(moderationRequests['_embedded']['sw360:moderationRequests'])) {
                    setTaskAssignmentData(
                        moderationRequests['_embedded']['sw360:moderationRequests'].map((item: ModerationRequest) => [
                            _(<Link href={'moderationrequest/' + item.id}>{item.documentName}</Link>),
                            taskAssignmentStatus[item.moderationState ?? 'INPROGRESS'],
                        ]),
                    )
                }
            },
        ).catch((err) => console.error("False to fetch components"))
        .finally(() => setLoading(false))
    }, [fetchData])

    const title = t('My Task Assignments')
    const columns = [t('Document Name'), t('Status')]
    const language = { noRecordsFound: t('NoTasksAssigned') }

    return (
        <div>
            <HomeTableHeader title={title} />
            {loading == false ? (
                <Table
                    columns={columns}
                    data={taskAssignmentData}
                    pagination={{ limit: 5 }}
                    selector={false}
                    language={language}
                />
            ) : (
                <div className='col-12'>
                    <Spinner className='spinner' />
                </div>
            )}
        </div>
    )
}

export default MyTaskAssignmentsWidget
