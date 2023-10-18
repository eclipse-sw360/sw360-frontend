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

import { ReleaseDetail } from '@/object-types'
import styles from '../detail.module.css'

interface Props {
    release: ReleaseDetail
}

const ReleaseVendor = ({ release }: Props) => {
    const t = useTranslations('default')
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
                    <th colSpan={2}>{t('Release Vendor')}</th>
                </tr>
            </thead>
            <tbody hidden={toggle}>
                <tr>
                    <td>{t('Full Name')}:</td>
                    <td>
                        {release._embedded && release._embedded['sw360:vendors'] && (
                            <span>{release._embedded['sw360:vendors'][0].fullName}</span>
                        )}
                    </td>
                </tr>
                <tr>
                    <td>{t('Short Name')}:</td>
                    <td>
                        {release._embedded && release._embedded['sw360:vendors'] && (
                            <span>{release._embedded['sw360:vendors'][0].shortName}</span>
                        )}
                    </td>
                </tr>
                <tr>
                    <td>URL:</td>
                    <td>
                        {release._embedded && release._embedded['sw360:vendors'] && (
                            <span>{release['_embedded']['sw360:vendors'][0].url}</span>
                        )}
                    </td>
                </tr>
            </tbody>
        </table>
    )
}

export default ReleaseVendor
