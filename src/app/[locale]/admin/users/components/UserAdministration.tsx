// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { AdvancedSearch, Table, _ } from 'next-sw360'
import { FaPencilAlt } from 'react-icons/fa'
import { OverlayTrigger, Tooltip, Spinner } from 'react-bootstrap'
import { TfiFiles } from "react-icons/tfi"
import { SW360_API_URL } from '@/utils/env'
import { User, Embedded } from '@/object-types'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type EmbeddedUsers = Embedded<User, 'sw360:users'>

export default function UserAdminstration() {
    const t = useTranslations('default')
    const { data: session, status } = useSession()
    const [num, setNum]  = useState< null | number >(null)
    const router = useRouter()

    const handleAddUsers = () => {
        router.push('/admin/users/add')
    }

    const columns = [
        {
            id: 'users.givenName',
            name: t('Given Name'),
            sort: true,
        },
        {
            id: 'users.lastName',
            name: t('Last Name'),
            sort: true,
        },
        {
            id: 'users.email',
            name: t('Email'),
            width: '20%',
            formatter: (email: string) =>
                _(
                    <>
                        <Link
                            className={`text-link`}
                            href={`mailto:${email}`}
                        >
                            {email}
                        </Link>
                    </>
                ),
            sort: true,
        },
        {
            id: 'users.activeStatus',
            name: t('Active status'),
            sort: true,
        },
        {
            id: 'users.primaryDepartment',
            name: t('Primary Department'),
            sort: true,
        },
        {
            id: 'users.primaryDepartmentRole',
            name: t('Primary Department Role'),
            sort: true,
        },
        {
            id: 'users.secondaryDepartmentsAndRoles',
            name: t('Secondary Departments and Roles'),
            sort: true,
        },
        {
            id: 'users.actions',
            name: t('Actions'),
            width: '9%',
            formatter: (id: string) =>
            _(
                <>
                    <span className='d-flex justify-content-evenly'>
                        <OverlayTrigger overlay={<Tooltip>{t('Edit')}</Tooltip>}>
                            <Link href={`/admin/users/edit/${id}`} className='overlay-trigger'>
                                <FaPencilAlt className='btn-icon' />
                            </Link>
                        </OverlayTrigger>

                        <OverlayTrigger overlay={<Tooltip>{t('Edit User Secondary Departments And Role')}</Tooltip>}>
                            <span className='d-inline-block'>
                                <TfiFiles className='btn-icon overlay-trigger' />
                            </span>
                        </OverlayTrigger>
                    </span>
                </>
            ),
            sort: true,
        },
    ]

    const server = {
        url: `${SW360_API_URL}/resource/api/users`,
        then: (data: EmbeddedUsers) => {
            setNum(data.page.totalElements)
            return data._embedded['sw360:users'].map((elem: User) => [
                elem.givenName ?? '',
                elem.lastName ?? '',
                elem.email ?? '',
                elem.deactivated ? 'Inactive' : 'Active',
                elem.department ?? '',
                '',
                '',
                elem['_links']['self']['href'].substring(elem['_links']['self']['href'].lastIndexOf('/') + 1),
            ])
        },
        total: (data: EmbeddedUsers) => data.page.totalElements,
        headers: { Authorization: `${status === 'authenticated' ? session.user.access_token : ''}` },
    }

    const advancedSearch = [
        {
            fieldName: t('Given Name'),
            value: '',
            paramName: 'givenName',
        },
        {
            fieldName: t('Last Name'),
            value: '',
            paramName: 'lastName',
        },
        {
            fieldName: t('Email'),
            value: '',
            paramName: 'email',
        },
        {
            fieldName: t('Primary Department'),
            value: '',
            paramName: 'department',
        },
        {
            fieldName: t('Primary Department Role'),
            value: '',
            paramName: 'departmentRole',
        }
    ]

    return (
        <>
            <div className='container page-content'>
                <div className='row'>
                    <div className='col-lg-2'>
                        <AdvancedSearch title='Advanced Search' fields={advancedSearch} />
                    </div>
                    <div className='col-lg-10'>
                        <div className='row d-flex justify-content-between ms-1'>
                            <button className='btn btn-primary col-auto' onClick={handleAddUsers}>
                                {t('Add User')}
                            </button>
                            <div className='col-auto buttonheader-title'>{`${t('Users')} (${num ? num : ''})`}</div>
                        </div>
                        <h5 className="mt-3 mb-1 ms-1 header-underlined">
                            {t('Users')}
                        </h5>
                        {
                            status === 'authenticated' ?
                            <div className="ms-1">
                                <Table columns={columns} server={server} selector={true} sort={false}/>
                            </div> :
                            <div className='col-12 mt-1 text-center'>
                                <Spinner className='spinner' />
                            </div>
                        }
                    </div>
                </div>
            </div>
        </>
    )
}
