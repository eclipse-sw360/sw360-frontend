// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { useState } from 'react'
import COTSDetails from '@/object-types/COTSDetails'
import { useTranslations } from 'next-intl'
import { COMMON_NAMESPACE } from '@/object-types/Constants'
import styles from '../detail.module.css'
import { CiCircleRemove } from 'react-icons/ci'
import { FiCheckCircle } from 'react-icons/fi'
import Link from 'next/link'

const CommercialDetailsAdministration = (
    { costDetails }: { costDetails: COTSDetails }
) => {
    const t = useTranslations(COMMON_NAMESPACE);
    const [toggle, setToggle] = useState(false);

    return (
        <table className={`table label-value-table ${styles['summary-table']}`}>
            <thead title='Click to expand or collapse' onClick={() => { setToggle(!toggle) }}>
                <tr>
                    <th colSpan={2}>{t('Commercial Details Administration')}</th>
                </tr>
            </thead>
            <tbody hidden={toggle}>
                <tr>
                    <td>{t('Usage Right Available')}:</td>
                    <td>
                        {(costDetails && costDetails.usageRightAvailable == true)
                            ? <span style={{ color: '#287d3c' }}><FiCheckCircle /> {t('Yes')}</span>
                            : <span style={{ color: 'red' }}><CiCircleRemove /> {t('No')}</span>
                        }
                    </td>
                </tr>
                <tr>
                    <td>{t('COTS Responsible')}:</td>
                    <td>
                        {(costDetails && costDetails._embedded) &&
                            <Link href={`mailto:${costDetails._embedded['sw360:cotsResponsible'].email}`}>
                                {costDetails._embedded['sw360:cotsResponsible'].fullName}
                            </Link>
                        }
                    </td>
                </tr>
                <tr>
                    <td>{t('COTS Clearing Deadline')}:</td>
                    <td>
                        {(costDetails && costDetails.clearingDeadline) &&
                            <span>
                                {costDetails.clearingDeadline}
                            </span>
                        }
                    </td>
                </tr>
                <tr>
                    <td>{t('COTS Clearing Report URL')}:</td>
                    <td>
                        {(costDetails && costDetails.licenseClearingReportURL) &&
                            <span>
                                {costDetails.licenseClearingReportURL}
                            </span>
                        }
                    </td>
                </tr>
            </tbody>
        </table>
    )
}

export default CommercialDetailsAdministration