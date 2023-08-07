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
import { CiCircleRemove } from 'react-icons/ci'
import { FiCheckCircle } from 'react-icons/fi'
import styles from '../detail.module.css'

const CotsOssInformation = (
    { costDetails }: { costDetails: COTSDetails }
) => {
    const t = useTranslations(COMMON_NAMESPACE);
    const [toggle, setToggle] = useState(false);

    return (
        <table className={`table label-value-table ${styles['summary-table']}`}>
            <thead title='Click to expand or collapse' onClick={() => { setToggle(!toggle) }}>
                <tr>
                    <th colSpan={2}>{t('COTS OSS Information')}</th>
                </tr>
            </thead>
            <tbody hidden={toggle}>
                <tr>
                    <td>{t('Used License')}:</td>
                    <td>
                        {(costDetails && costDetails.usedLicense) &&
                            <span>
                                {costDetails.usedLicense}
                            </span>
                        }
                    </td>
                </tr>
                <tr>
                    <td>{t('Contains Open Source Software')}:</td>
                    <td>
                        {(costDetails && costDetails.containsOSS == true)
                            ? <span style={{ color: '#287d3c' }}><FiCheckCircle /> {t('Yes')}</span>
                            : <span style={{ color: 'red' }}><CiCircleRemove /> {t('No')}</span>
                        }
                    </td>
                </tr>
                <tr>
                    <td>{t('OSS Contract Signed')}:</td>
                    <td>
                        {(costDetails && costDetails.ossContractSigned == true)
                            ? <span style={{ color: '#287d3c' }}><FiCheckCircle /> {t('Yes')}</span>
                            : <span style={{ color: 'red' }}><CiCircleRemove /> {t('No')}</span>
                        }
                    </td>
                </tr>
                <tr>
                    <td>{t('OSS Information URL')}:</td>
                    <td>
                        {(costDetails && costDetails.ossInformationURL) &&
                            <span>
                                {costDetails.ossInformationURL}
                            </span>
                        }
                    </td>
                </tr>
                <tr>
                    <td>{t('Source Code Available')}:</td>
                    <td>
                        {(costDetails && costDetails.sourceCodeAvailable == true)
                            ? <span style={{ color: '#287d3c' }}><FiCheckCircle /> {t('Yes')}</span>
                            : <span style={{ color: 'red' }}><CiCircleRemove /> {t('No')}</span>
                        }
                    </td>
                </tr>
            </tbody>
        </table>
    )
}

export default CotsOssInformation