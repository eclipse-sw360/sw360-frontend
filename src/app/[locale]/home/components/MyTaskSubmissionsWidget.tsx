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
import { OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap'
import { FaTrashAlt } from 'react-icons/fa'
import HomeTableHeader from './HomeTableHeader'

type EmbeddedTaskSubmissions = Embedded<ModerationRequest, 'sw360:moderationRequests'>

interface TaskSubmissionStatusMap {
    [key: string]: string
}

function MyTaskSubmissionsWidget(): ReactNode {
    const t = useTranslations('default')
    const language = { noRecordsFound: t('NoModerationRequests') }
    const title = t('My Task Submissions')

    const [taskSubmissionData, setTaskSubmissionData] = useState<Array<(string | JSX.Element)[]>>([])
    const [loading, setLoading] = useState(true)
    const [reload, setReload] = useState(false)
    const taskSubmissionStatus: TaskSubmissionStatusMap = {
        INPROGRESS: t('In Progress'),
        APPROVED: t('APPROVED'),
        PENDING: t('Pending'),
        REJECTED: t('REJECTED'),
    }

    const fetchData = useCallback(async (url: string) => {
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) return signOut()
        const response = await ApiUtils.GET(url, session.user.access_token)
        if (response.status === HttpStatus.OK) {
            const data = (await response.json()) as EmbeddedTaskSubmissions
            return data
        } else if (response.status === HttpStatus.UNAUTHORIZED) {
            return signOut()
        } else {
            return undefined
        }
    }, [])

    useEffect(() => {
        setLoading(true)
        void fetchData('moderationrequest/mySubmissions').then(
            (moderationRequests: EmbeddedTaskSubmissions | undefined) => {
                if (moderationRequests === undefined) {
                    setLoading(false)
                    return
                }

                if (!CommonUtils.isNullOrUndefined(moderationRequests['_embedded']['sw360:moderationRequests'])) {
                    setTaskSubmissionData(
                        moderationRequests['_embedded']['sw360:moderationRequests'].map((item: ModerationRequest) => [
                            `${item.documentName}|${item.id}`,
                            taskSubmissionStatus[item.moderationState ?? 'INPROGRESS'],
                            item.id,
                        ]),
                    )
                    setLoading(false)
                }
            },
        )
    }, [fetchData, reload])

    const handleDeleteProject = (id: string) => {
        console.log(id)
    }

    const columns = [
        {
            id: 'Document Name',
            name: t('Document Name'),
            formatter: (cell: string) => {
                const [documentName, id] = cell.split('|')
                return _(
                    <Link href={'moderationrequest/' + id}>{documentName}</Link>,
                )
            },
        },
        t('Status'),
        {
            id: 'myTaskSubmissions.actions',
            name: t('Actions'),
            width: '13%',
            formatter: (id: string) =>
                _(
                    <>
                        <OverlayTrigger overlay={<Tooltip>{t('Delete')}</Tooltip>}>
                            <span className='d-inline-block'>
                                <FaTrashAlt
                                    className='btn-icon'
                                    onClick={() => handleDeleteProject(id)}
                                    style={{ color: 'gray', fontSize: '18px' }}
                                />
                            </span>
                        </OverlayTrigger>
                    </>,
                ),
            sort: true,
        },
    ]

    return (
        <div>
            <HomeTableHeader title={title} setReload={setReload} />
            {loading === false ? (
                <Table
                    columns={columns}
                    data={taskSubmissionData}
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

export default MyTaskSubmissionsWidget
