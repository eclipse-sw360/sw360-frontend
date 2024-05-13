// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Table, _ } from "next-sw360"
import { useTranslations } from 'next-intl'


function OpenClearingRequest() {

    const t = useTranslations('default')
    const [tableData] = useState<Array<any>>([])

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

    return (
        <>
            <div className='row mb-4'>
                <div className='col-12 d-flex justify-content-center align-items-center'>
                    <div style={{ paddingLeft: '0px' }}>
                        <Table columns={columns} data={tableData} sort={false} selector={true} />
                    </div>
                </div>
            </div>
        </>
    )
}

export default OpenClearingRequest
