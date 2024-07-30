// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { Component, Vendor } from '@/object-types'
import { CommonUtils } from '@/utils'

const ReleaseAgrregate = ({ component }: { component: Component }) => {
    const [toggle, setToggle] = useState(false)
    const t = useTranslations('default')

    return (
        <table className='table summary-table'>
            <thead
                title='Click to expand or collapse'
                onClick={() => {
                    setToggle(!toggle)
                }}
            >
                <tr>
                    <th colSpan={2}>{t('Release Aggregate Data')}</th>
                </tr>
            </thead>
            <tbody hidden={toggle}>
                <tr>
                    <td>{t('Vendors')}:</td>
                    <td>
                        {component['_embedded'] && (
                            <>
                                {!CommonUtils.isNullEmptyOrUndefinedArray(component['_embedded']['sw360:vendors']) &&
                                    Object.values(component['_embedded']['sw360:vendors'])
                                        .map(
                                            (vendor: Vendor): React.ReactNode => (
                                                <span key={vendor.fullName}>{vendor.fullName}</span>
                                            )
                                        )
                                        .reduce((prev, curr): React.ReactNode[] => [prev, ', ', curr])}
                            </>
                        )}
                    </td>
                </tr>
                <tr>
                    <td>{t('Languages')}:</td>
                    <td>{component.languages && component.languages.join(', ')}</td>
                </tr>
                <tr>
                    <td>{t('Platforms')}:</td>
                    <td>{component.softwarePlatforms && component.softwarePlatforms.join(', ')}</td>
                </tr>
                <tr>
                    <td>{t('Operating Systems')}:</td>
                    <td>{component.operatingSystems && component.operatingSystems.join(', ')}</td>
                </tr>
                <tr>
                    <td>{t('Main Licenses')}:</td>
                    <td>{component.mainLicenseIds && component.mainLicenseIds.join(', ')}</td>
                </tr>
            </tbody>
        </table>
    )
}

export default ReleaseAgrregate
