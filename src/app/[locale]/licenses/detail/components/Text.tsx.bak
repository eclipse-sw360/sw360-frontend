// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import { LicenseDetail } from '@/object-types'
import { useTranslations } from 'next-intl'
import styles from '../detail.module.css'
import { ReactNode } from 'react'

interface Props {
    license: LicenseDetail
}

const Text = ({ license }: Props) : ReactNode => {
    const t = useTranslations('default')
    return (
        <div className='col'>
            <table className='table summary-table'>
                <thead>
                    <tr>
                        <th colSpan={2}>{t('License Text')}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <pre className={`${styles['pre-text']}`}>{license.text ?? ''}</pre>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}

export default Text
