// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { useTranslations } from 'next-intl'
import styles from '../detail.module.css'
import { useState } from 'react'
import { COMMON_NAMESPACE } from '@/object-types/Constants'
import CommonUtils from '@/utils/common.utils'
import Component from '@/object-types/Component'
import EmbeddedUser from '@/object-types/EmbeddedUser'

const SummaryRole = ({ component }: { component: Component }) => {
    const t = useTranslations(COMMON_NAMESPACE)
    const [toggle, setToggle] = useState(false)

    return (
        <table className={`table label-value-table ${styles['summary-table']}`}>
            <thead
                title='Click to expand or collapse'
                onClick={() => {
                    setToggle(!toggle)
                }}
            >
                <tr>
                    <th colSpan={2}>{t('Roles')}</th>
                </tr>
            </thead>
            <tbody hidden={toggle}>
                <tr>
                    <td>{t('Component Owner')}:</td>
                    <td>{component.componentOwner && <>{component.componentOwner}</>}</td>
                </tr>
                <tr>
                    <td>{t('Owner Accounting Unit')}:</td>
                    <td>{component.ownerAccountingUnit && <>{component.ownerAccountingUnit}</>}</td>
                </tr>
                <tr>
                    <td>{t('Owner Billing Group')}:</td>
                    <td>{component.ownerGroup && component.ownerGroup}</td>
                </tr>
                <tr>
                    <td>{t('Owner Country')}:</td>
                    <td>{component.ownerCountry && component.ownerCountry}</td>
                </tr>
                <tr>
                    <td>{t('Moderators')}:</td>
                    <td>
                        {component['_embedded'] && (
                            <>
                                {!CommonUtils.isNullEmptyOrUndefinedArray(component['_embedded']['sw360:moderators']) &&
                                    Object.values(component['_embedded']['sw360:moderators'])
                                        .map(
                                            (user: EmbeddedUser): React.ReactNode => (
                                                <a key={user.email} href={`mailto:${user.email}`}>
                                                    {user.fullName}
                                                </a>
                                            )
                                        )
                                        .reduce((prev, curr): React.ReactNode[] => [prev, ', ', curr])}
                            </>
                        )}
                    </td>
                </tr>
                <tr>
                    <td>{t('Subscribers')}:</td>
                    <td>{component.subscribers && component.subscribers.join(', ')}</td>
                </tr>
                <tr>
                    <td>{t('Additional Roles')}:</td>
                    <td>
                        {component.roles &&
                            Object.keys(component.roles).map((key) => (
                                <li key={key}>
                                    <span className='mapDisplayChildItemLeft' style={{ fontWeight: 'bold' }}>
                                        {key}:{' '}
                                    </span>
                                    <span className='mapDisplayChildItemRight'>
                                        {component.roles[key]
                                            .map(
                                                (email: string): React.ReactNode => (
                                                    <a key={email} href={`mailto:${email}`}>
                                                        {email}
                                                    </a>
                                                )
                                            )
                                            .reduce((prev, curr): React.ReactNode[] => [prev, ', ', curr])}
                                    </span>
                                </li>
                            ))}
                    </td>
                </tr>
            </tbody>
        </table>
    )
}

export default SummaryRole
