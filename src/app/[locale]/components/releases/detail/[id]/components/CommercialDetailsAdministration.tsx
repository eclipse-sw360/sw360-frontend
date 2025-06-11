// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { ReactNode, useState } from 'react'
import { CiCircleRemove } from 'react-icons/ci'
import { FiCheckCircle } from 'react-icons/fi'

import { COTSDetails } from '@/object-types'

const CommercialDetailsAdministration = ({ costDetails }: { costDetails: COTSDetails | undefined }): ReactNode => {
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
                    <th colSpan={2}>{t('Commercial Details Administration')}</th>
                </tr>
            </thead>
            <tbody hidden={toggle}>
                <tr>
                    <td>{t('Usage Right Available')}:</td>
                    <td>
                        {costDetails && costDetails.usageRightAvailable == true ? (
                            <span style={{ color: '#287d3c' }}>
                                <FiCheckCircle /> {t('Yes')}
                            </span>
                        ) : (
                            <span style={{ color: 'red' }}>
                                <CiCircleRemove /> {t('No')}
                            </span>
                        )}
                    </td>
                </tr>
                <tr>
                    <td>{t('COTS Responsible')}:</td>
                    <td>
                        {costDetails && costDetails._embedded && (
                            <Link href={`mailto:${costDetails._embedded['sw360:cotsResponsible'].email}`}>
                                {costDetails._embedded['sw360:cotsResponsible'].fullName}
                            </Link>
                        )}
                    </td>
                </tr>
                <tr>
                    <td>{t('COTS Clearing Deadline')}:</td>
                    <td>
                        {costDetails !== undefined && costDetails.clearingDeadline !== undefined ? (
                            <span>{costDetails.clearingDeadline}</span>
                        ) : (
                            ''
                        )}
                    </td>
                </tr>
                <tr>
                    <td>{t('COTS Clearing Report URL')}:</td>
                    <td>
                        {costDetails !== undefined && costDetails.licenseClearingReportURL !== undefined ? (
                            <span>{costDetails.licenseClearingReportURL}</span>
                        ) : (
                            ''
                        )}
                    </td>
                </tr>
            </tbody>
        </table>
    )
}

export default CommercialDetailsAdministration
