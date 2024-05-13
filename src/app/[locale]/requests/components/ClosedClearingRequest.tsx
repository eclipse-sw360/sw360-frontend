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


function ClosedClearingRequest() {

    const t = useTranslations('default')
    const [tableData] = useState<Array<any>>([])

    const columns = [
        {
            id: 'closedClearingRequest.requestId',
            name: t('Request ID'),
            sort: true,
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
            id: 'closedClearingRequest.actions ',
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

export default ClosedClearingRequest
