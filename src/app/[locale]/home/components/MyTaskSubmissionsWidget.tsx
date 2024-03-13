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
import { notFound } from 'next/navigation'
import {Embedded, HttpStatus, ModerationRequest} from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils/index'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap'
import { FaTrashAlt } from 'react-icons/fa'

type EmbeddedTaskSubmission = Embedded<ModerationRequest, 'sw360:moderationRequests'>
interface TaskSubmissionStatusMap {
    [key: string]: string;
}


function MyTaskSubmissionsWidget() {
    const [taskSubmissionData, setTaskSubmissionData] = useState([])
    const t = useTranslations('default')
    const [loading, setLoading] = useState(true)
    const { data: session, status } = useSession()
    const taskSubmissionStatus : TaskSubmissionStatusMap = {
        INPROGRESS: t('In Progress'),
        APPROVED: t('APPROVED'),
        PENDING: t('Pending'),
        REJECTED: t('REJECTED'),
    };
    const fetchData = useCallback(
        async (url: string) => {
            const response = await ApiUtils.GET(url, session.user.access_token)
            if (response.status == HttpStatus.OK) {
                const data = await response.json() as EmbeddedTaskSubmission
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
        void fetchData('moderationrequest/mySubmissions').then((moderationRequests: EmbeddedTaskSubmission) => {
            if (!CommonUtils.isNullOrUndefined(moderationRequests['_embedded']['sw360:moderationRequests'])) {
                setTaskSubmissionData(
                    moderationRequests['_embedded']['sw360:moderationRequests'].map((item: ModerationRequest) => [
                        _(<Link href={'moderationrequest/' + item.id}>{item.documentName}</Link>),
                        taskSubmissionStatus[item.moderationState],
                        item.id,
                    ])
                )
                setLoading(false)
                }})
        }, [fetchData, session])

    const handleDeleteProject = (id: string) => {
        console.log(id)
    }

    const title = t('My Task Submissions')
    const columns = [t('Document Name'), t('Status'), {
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
                </>
            ),
        sort: true,
    },]
    const language = { noRecordsFound: t('NoModerationRequests') }

    if (status === 'unauthenticated') {
        signOut()
    } else {
    return (
        <div>
            <HomeTableHeader title={title} />
            {loading == false ? (
            <Table columns={columns} data={taskSubmissionData} language={language} />
            ) : (
                <div className='col-12'>
                    <Spinner className='spinner' />
                </div>
            )}
        </div>
    )}
}

// We need use this to override typescript issue
// Reference: https://github.com/vercel/next.js/issues/42292
export default MyTaskSubmissionsWidget as unknown as () => JSX.Element
