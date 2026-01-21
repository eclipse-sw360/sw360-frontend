// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { useTranslations } from 'next-intl'
import { type JSX, useEffect, useState } from 'react'
import PrettyFormatData from '@/components/PrettyFormatData/PrettyFormatData'
import { Changelogs } from '@/object-types'
import CommonUtils from '@/utils/common.utils'
import createChangesCards from '../CreateChangeCard'

interface Props {
    changeLogData: Changelogs | undefined
}

const ChangeLogDetail = ({ changeLogData }: Props): JSX.Element => {
    const t = useTranslations('default')
    const [toggle, setToggle] = useState(false)

    useEffect(() => {
        if (!CommonUtils.isNullEmptyOrUndefinedArray(changeLogData?.changes)) {
            const changes = changeLogData.changes
            createChangesCards(changes, t('Field Name'))
        } else {
            createChangesCards([], t('Field Name'))
        }
    }, [
        changeLogData,
        t,
    ])

    const handleReferenceDoc = () => {
        if (
            CommonUtils.isNullOrUndefined(changeLogData?.referenceDoc) &&
            CommonUtils.isNullOrUndefined(changeLogData?.info)
        ) {
            return (
                <>
                    <td className='text-justify col-2 p-3'></td>
                    <td className='text-justify col-4 p-3'></td>
                </>
            )
        } else if (CommonUtils.isNullOrUndefined(changeLogData.info)) {
            return (
                <>
                    <td className='text-justify col-2 p-3'>{t('Reference Doc')}: </td>
                    <td className='text-justify col-4 p-3'>
                        <PrettyFormatData data={changeLogData.referenceDoc} />
                    </td>
                </>
            )
        } else if (CommonUtils.isNullOrUndefined(changeLogData.referenceDoc)) {
            return (
                <>
                    <td className='text-justify col-2 p-3'>{t('Info')}: </td>
                    <td className='text-justify col-4 p-3'>
                        <PrettyFormatData data={changeLogData.info} />
                    </td>
                </>
            )
        } else {
            return (
                <>
                    <td className='text-justify col-2 p-3'>{t('Info')}: </td>
                    <td className='text-justify col-4 p-3'>
                        <PrettyFormatData data={changeLogData.info} />
                    </td>
                    <td className='text-justify col-2 p-3'>{t('Reference Doc')}: </td>
                    <td
                        className='text-justify col-4 p-3'
                        style={{
                            borderRight: '1px solid lightgrey',
                        }}
                    >
                        <PrettyFormatData data={changeLogData.referenceDoc} />
                    </td>
                </>
            )
        }
    }

    return (
        <>
            {changeLogData !== undefined && (
                <>
                    <table
                        className='table label-value-table'
                        style={{
                            marginBottom: '2rem',
                        }}
                    >
                        <thead
                            title='Click to expand or collapse'
                            onClick={() => {
                                setToggle(!toggle)
                            }}
                        >
                            <tr>
                                <th colSpan={4}>{t('Basic Info')}</th>
                            </tr>
                        </thead>

                        <tbody
                            hidden={toggle}
                            className='border'
                        >
                            <tr
                                className='row'
                                style={{
                                    margin: '0px',
                                }}
                            >
                                <td className='text-justify col-2 p-3'>{t('User')}:</td>
                                <td
                                    className='text-justify col-4 p-3'
                                    style={{
                                        borderRight: '1px solid lightgrey',
                                    }}
                                >
                                    {changeLogData.userEdited}
                                </td>
                                <td className='text-justify col-2 p-3'>{t('Document Id')}:</td>
                                <td className='text-justify col-4 p-3'>{changeLogData.documentId}</td>
                            </tr>
                            <tr
                                className='row'
                                style={{
                                    margin: '0px',
                                }}
                            >
                                <td className='text-justify col-2 p-3'>{t('Date')}:</td>
                                <td
                                    className='text-justify col-4 p-3'
                                    style={{
                                        borderRight: '1px solid lightgrey',
                                    }}
                                >
                                    {changeLogData.changeTimestamp}
                                </td>
                                <td className='text-justify col-2 p-3'>{t('Document Type')}:</td>
                                <td className='text-justify col-4 p-3'>{changeLogData.documentType}</td>
                            </tr>
                            <tr
                                className='row'
                                style={{
                                    margin: '0px',
                                }}
                            >
                                <td className='text-justify col-2 p-3'>{t('Operation')}:</td>
                                <td
                                    className='text-justify col-4 p-3'
                                    style={{
                                        borderRight: '1px solid lightgrey',
                                    }}
                                >
                                    {changeLogData.operation}
                                </td>
                                {handleReferenceDoc()}
                            </tr>
                        </tbody>
                    </table>
                </>
            )}
        </>
    )
}

export default ChangeLogDetail
