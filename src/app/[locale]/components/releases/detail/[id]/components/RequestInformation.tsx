// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { useTranslations } from 'next-intl'
import { ReactNode, useState } from 'react'

import { ClearingInformation } from '@/object-types'

interface Props {
    clearingInformation: ClearingInformation | undefined
}

const RequestInformation = ({ clearingInformation }: Props): ReactNode => {
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
                    <th colSpan={2}>{t('Request Information')}</th>
                </tr>
            </thead>
            <tbody hidden={toggle}>
                <tr>
                    <td>{t('Request ID')}:</td>
                    <td>{clearingInformation && clearingInformation.requestID}</td>
                </tr>
                <tr>
                    <td>{t('Additional Request Information')}:</td>
                    <td>{clearingInformation && clearingInformation.additionalRequestInfo}</td>
                </tr>
                <tr>
                    <td>{t('Evaluation Start')}:</td>
                    <td>{clearingInformation && clearingInformation.procStart}</td>
                </tr>
                <tr>
                    <td>{t('Evaluation End')}:</td>
                    <td>{clearingInformation && clearingInformation.evaluated}</td>
                </tr>
            </tbody>
        </table>
    )
}

export default RequestInformation
