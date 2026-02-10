// Copyright (C) TOSHIBA CORPORATION, 2025. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2025. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { StatusCodes } from 'http-status-codes'
import { notFound, useParams } from 'next/navigation'
import { getSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { type JSX, useEffect, useState } from 'react'
import { PageButtonHeader, PageSpinner } from '@/components/sw360'
import { User } from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils'

const UserDetailPage = (): JSX.Element => {
    const params = useParams<{
        id: string
    }>()
    const t = useTranslations('default')
    const [user, setUser] = useState<User | undefined>(undefined)

    useEffect(() => {
        ;(async () => {
            const session = await getSession()
            if (CommonUtils.isNullOrUndefined(session)) return signOut()

            const response = await ApiUtils.GET(`users/byid/${params.id}`, session.user.access_token)
            if (response.status === StatusCodes.UNAUTHORIZED) {
                return signOut()
            } else if (response.status !== StatusCodes.OK) {
                return notFound()
            }
            const user = (await response.json()) as User
            setUser(user)
        })()
    }, [])
    const headerbuttons = {
        'Edit User': {
            link: `/admin/users/edit/${params.id}`,
            type: 'primary',
            name: t('Edit User'),
        },
    }

    return user === undefined ? (
        <PageSpinner />
    ) : (
        <div className='container page-content'>
            <PageButtonHeader
                title={user.email}
                buttons={headerbuttons}
            />
            <table className='table'>
                <thead>
                    <tr>
                        <th colSpan={2}>{t('User Information')}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td
                            style={{
                                width: '30%',
                            }}
                        >
                            {t('Given Name')}:
                        </td>
                        <td>{user.givenName}</td>
                    </tr>
                    <tr>
                        <td>{t('Last Name')}</td>
                        <td>{user.lastName}</td>
                    </tr>
                    <tr>
                        <td>{t('Email')}:</td>
                        <td>{user.email}</td>
                    </tr>
                    <tr>
                        <td>{t('Global Identifier')}:</td>
                        <td>{user.externalid}</td>
                    </tr>
                    <tr>
                        <td>{t('Active status')}:</td>
                        <td>{user.deactivated === true ? t('Inactive') : t('Active')}</td>
                    </tr>
                    <tr>
                        <td>{t('Department')}:</td>
                        <td>{user.department}</td>
                    </tr>
                    <tr>
                        <td>{t('Primary role')}:</td>
                        <td>{t((user.userGroup ?? 'USER') as never)}</td>
                    </tr>
                    <tr>
                        <td>{t('Secondary Departments and Roles')}:</td>
                        <td>
                            <ul className='text-break text-start'>
                                {user.secondaryDepartmentsAndRoles !== undefined &&
                                    Object.entries(user.secondaryDepartmentsAndRoles).map(
                                        ([department, roles], index) => (
                                            <li key={index}>
                                                <b>{department}</b> {'->'}{' '}
                                                {roles.map((role) => t(role as never)).join(', ')}
                                            </li>
                                        ),
                                    )}
                            </ul>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}

export default UserDetailPage
