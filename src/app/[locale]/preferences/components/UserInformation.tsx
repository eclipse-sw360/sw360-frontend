// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Gravatar } from 'next-sw360'
import { ReactNode } from 'react'
import { User } from '@/object-types'
import styles from '../preferences.module.css'

interface Props {
    user: User | undefined
}

const UserInformation = ({ user }: Props): ReactNode => {
    const t = useTranslations('default')

    return (
        <table className='table summary-table'>
            <thead>
                <tr>
                    <th colSpan={2}>{t('SW360 User')}</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td className={styles.tag}>{t('Name')}:</td>
                    <td id='user-name'>{user?.fullName}</td>
                </tr>
                <tr>
                    <td className={styles.tag}>{t('Email')}:</td>
                    <td id='user-email'>
                        <Link href={`mailto:${user?.email}`}>{user?.email}</Link>
                    </td>
                </tr>
                <tr>
                    <td className={styles.tag}>{t('Primary Department')}:</td>
                    <td id='user-department'>{user?.department}</td>
                </tr>
                <tr>
                    <td className={styles.tag}>{t('External Id')}:</td>
                    <td id='user-external-id'>{user?.externalid}</td>
                </tr>
                <tr>
                    <td className={styles.tag}>{t('Primary Department Role')}:</td>
                    <td id='user-role'>{user?.userGroup}</td>
                </tr>
                <tr>
                    <td className={styles.tag}>{t('Secondary Departments and Roles')}: </td>
                    <td id='user-secondary-departments-roles'>
                        <ul>
                            {user?.secondaryDepartmentsAndRoles &&
                                Object.keys(user.secondaryDepartmentsAndRoles).map((department) => (
                                    <li key={department}>
                                        <span className='bold-text'>{department}</span>
                                        <span>
                                            {' -> '}
                                            {user.secondaryDepartmentsAndRoles?.[department]}
                                        </span>
                                    </li>
                                ))}
                        </ul>
                    </td>
                </tr>
                {user && (
                    <tr>
                        <td colSpan={2}>
                            <Gravatar email={user.email ? user.email : 'admin@sw360.org'} />
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    )
}

export default UserInformation
