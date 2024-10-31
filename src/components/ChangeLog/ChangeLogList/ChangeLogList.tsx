// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { FaFileAlt } from 'react-icons/fa'

import { Changelogs } from '@/object-types'
import { Table, _ } from 'next-sw360'

interface Props {
    documentId: string
    setChangeLogIndex: React.Dispatch<React.SetStateAction<number>>
    setChangesLogTab: React.Dispatch<React.SetStateAction<string>>
    changeLogList: Array<Changelogs>
}

const ChangeLogList = ({ documentId, setChangeLogIndex, setChangesLogTab, changeLogList }: Props) : JSX.Element => {
    const t = useTranslations('default')
    const [changeLogData, setChangeLogData] = useState<string[][]>([])

    useEffect(() => {
        const data = Object.entries(changeLogList).map(([index, item]: [index: string, item: Changelogs]) => [
            item.changeTimestamp,
            item.id,
            item.documentId === documentId
                ? t('Attributes change')
                : `${t('Reference Doc Changes')} : ${item.documentType}`,
            item.userEdited,
            index,
        ])
        setChangeLogData(data)
    }, [changeLogList, documentId, t])

    const columns = [
        {
            name: t('Date'),
            sort: true,
        },
        {
            name: t('Change Log Id'),
            sort: true,
        },
        {
            name: t('Change Type'),
            sort: true,
        },
        {
            name: t('User'),
            sort: true,
        },
        {
            name: t('Actions'),
            formatter: (index: string) =>
                _(
                    <div className='cursor-pointer'>
                        <FaFileAlt
                            style={{ color: '#F7941E', fontSize: '18px' }}
                            onClick={() => {
                                setChangeLogIndex(parseInt(index))
                                setChangesLogTab('view-log')
                            }}
                        />
                    </div>
                ),
        },
    ]

    return (
        <>
            <div className='row'>
                <Table data={changeLogData} search={true} columns={columns} selector={true} />
            </div>
        </>
    )
}

export default ChangeLogList
