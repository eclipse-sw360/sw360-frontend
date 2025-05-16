// Copyright (C) TOSHIBA CORPORATION, 2025. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useTranslations } from 'next-intl'
import { _, Table } from 'next-sw360'
import { useState, useEffect, useCallback, type JSX } from 'react'
import { ApiUtils, CommonUtils } from '@/utils'
import { getSession, signOut } from 'next-auth/react'
import { HttpStatus } from '@/object-types'
import MessageService from '@/services/message.service'
import { FaPencilAlt } from 'react-icons/fa'
import Link from 'next/link'
import { PageSpinner } from 'next-sw360'
import SecondaryDepartments from './SecondaryDepartments'

type TableRow = [string, string[], string]

const SecondaryDepartmentsTable = (): JSX.Element => {
    const t = useTranslations('default')
    const [tableData, setTableData] = useState<Array<TableRow> | undefined>(undefined)

    const columns = [
        {
            id: 'department',
            name: t('Department'),
            sort: true
        },
        {
            id: 'memberEmails',
            name: t('Member Emails'),
            formatter: (emails: string[]) => _(
                <ol>
                    {Object.values(emails).map((email) => (
                        <li key={email}>{email}</li>
                    ))}
                </ol>
            ),
            sort: false
        },
        {
            id: 'action',
            name: t('Action'),
            sort: false,
            width: '90px',
            formatter: (departmentName: string) => _(
                <div className='d-flex align-items-center justify-content-center'>
                    <Link href={`/admin/departments/edit?name=${departmentName}`}>
                        <FaPencilAlt className='btn-icon'/>
                    </Link>
                </div>
            ),
        },
    ]

    const fetchDepartmentsWithEmails = useCallback(async () => {
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) {
            return signOut()
        }
        const response = await ApiUtils.GET(`departments/members`, session.user.access_token)
        if (response.status === HttpStatus.UNAUTHORIZED) {
            return signOut()
        }
        if (response.status !== HttpStatus.OK) {
            MessageService.error(t('Failed to fetch secondary departments'))
            setTableData([])
            return
        }
        const departmentsWithEmails: SecondaryDepartments = await response.json()
        const tableData = Object.keys(departmentsWithEmails).map((department) => {
            return [
                department,
                departmentsWithEmails[department],
                department
            ] as TableRow
        })
        setTableData(tableData)
    }, [])

    useEffect(() => {
        fetchDepartmentsWithEmails().catch(err => console.error(err))
    }, [])

    return (
        (tableData === undefined)
        ?
            <PageSpinner />
        :
            <Table columns={columns} data={tableData} sort={false} selector={true}/>
    )
}

export default SecondaryDepartmentsTable