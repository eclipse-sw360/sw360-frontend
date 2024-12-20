// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { useTranslations } from 'next-intl'
import { ReactNode, useState } from 'react'

import { Component, User } from '@/object-types'
import { CommonUtils } from '@/utils'

const SummaryRole = ({ component }: { component: Component }) : ReactNode => {
    const t = useTranslations('default')
    const [toggle, setToggle] = useState(false)

    return (
        <table className='table summary-table'>
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
                    <td>{
                        !CommonUtils.isNullOrUndefined(component._embedded?.componentOwner)
                        &&
                        <a href={`mailto:${component._embedded.componentOwner.email}`}>
                            {component._embedded.componentOwner.fullName}
                        </a>}
                    </td>
                </tr>
                <tr>
                    <td>{t('Owner Accounting Unit')}:</td>
                    <td>{!CommonUtils.isNullEmptyOrUndefinedString(component.ownerAccountingUnit) && <>{component.ownerAccountingUnit}</>}</td>
                </tr>
                <tr>
                    <td>{t('Owner Billing Group')}:</td>
                    <td>{!CommonUtils.isNullEmptyOrUndefinedString(component.ownerGroup) && component.ownerGroup}</td>
                </tr>
                <tr>
                    <td>{t('Owner Country')}:</td>
                    <td>{!CommonUtils.isNullEmptyOrUndefinedString(component.ownerCountry) && component.ownerCountry}</td>
                </tr>
                <tr>
                    <td>{t('Moderators')}:</td>
                    <td>
                        {component['_embedded'] && (
                            <>
                                {!CommonUtils.isNullEmptyOrUndefinedArray(component['_embedded']['sw360:moderators']) &&
                                    Object.values(component['_embedded']['sw360:moderators'])
                                        .map(
                                            (user: User): React.ReactNode => (
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
                                    <span className='fw-bold'>
                                        {key}:{' '}
                                    </span>
                                    <span>
                                        {component.roles && component.roles[key]
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
