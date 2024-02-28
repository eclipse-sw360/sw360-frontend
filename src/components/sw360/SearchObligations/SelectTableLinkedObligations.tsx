// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import React, { useEffect, useState } from 'react'

import TableLicense from '@/components/LinkedObligations/TableLicense'
import { Obligation } from '@/object-types'
import { useTranslations } from 'next-intl'
import { _ } from 'next-sw360'
import styles from './LinkedObligations.module.css'

interface Props {
    obligations?: any[]
    setObligations?: (obligationsLink: Array<Obligation>) => void
}

const SelectTableLinkedObligations = ({ obligations, setObligations }: Props) => {
    const [data, setData] = useState([])
    const [isCheckAll, setIsCheckAll] = useState<boolean>(false)
    const t = useTranslations('default')

    useEffect(() => {
        const mapperData = Object.entries(obligations).map((item, index) => [
            item[1][0],
            {
                index: index,
                checked: false,
                obligation: item[1][0],
            },
            item[1][2],
            item[1][3],
            item[1][4],
        ])
        setData(mapperData)
    }, [obligations])

    const handlerRadioButton = (index: number, checked: boolean) => {
        const newData = Object.entries(data).map(([i, rowData]: any) => {
            if (i == index) {
                rowData[1] = {
                    ...rowData[1],
                    checked: !checked,
                }
            }
            return rowData
        })
        setData(newData)

        const linkObligation: Obligation[] = []
        Object.entries(data).forEach((item: any) => {
            if (item[1][1].checked === true) {
                linkObligation.push(item[1][0])
            }
        })
        setObligations(linkObligation)
    }

    const handleCheckAll = () => {
        const newData = Object.entries(data).map(([, rowData]: any) => {
            rowData[1] = {
                ...rowData[1],
                checked: !isCheckAll,
            }
            return rowData
        })
        setData(newData)
        setIsCheckAll((prev) => !prev)
        const linkObligation: Obligation[] = []
        Object.entries(data).forEach((item: any) => {
            if (item[1][1].checked === true) {
                linkObligation.push(item[1][0])
            }
        })
        setObligations(linkObligation)
    }

    const buildAttachmentDetail = (item: any) => {
        return (event: React.MouseEvent<HTMLElement>) => {
            if ((event.target as HTMLElement).className == styles.expand) {
                ;(event.target as HTMLElement).className = styles.collapse
            } else {
                ;(event.target as HTMLElement).className = styles.expand
            }

            const attachmentDetail = document.getElementById(item.title)
            if (!attachmentDetail) {
                const parent = (event.target as HTMLElement).parentElement.parentElement.parentElement
                const html = `<td colspan="10">
                    <table class="table table-borderless">
                        <tbody>
                            <tr>
                            <td>${item.text ?? ''}</td>
                            </tr>
                        </tbody>
                    </table>
                </td>`
                const tr = document.createElement('tr')
                tr.id = item.title
                tr.innerHTML = html

                parent.parentNode.insertBefore(tr, parent.nextSibling)
            } else if (attachmentDetail.hidden) {
                attachmentDetail.hidden = false
            } else {
                attachmentDetail.hidden = true
            }
        }
    }

    const columns = [
        {
            id: 'check',
            name: _(<i className={styles.collapse}></i>),
            formatter: (item: Obligation) =>
                _(<i className={styles.collapse} onClick={buildAttachmentDetail(item)}></i>),
            sort: false,
        },
        {
            id: 'obligationId',
            name: _(
                <input
                    className='checkbox-control'
                    defaultChecked={isCheckAll}
                    type='checkbox'
                    onClick={handleCheckAll}
                ></input>
            ),
            formatter: ({ checked, index }: any) =>
                _(
                    <input
                        className='checkbox-control'
                        type='checkbox'
                        defaultChecked={checked}
                        onClick={() => {
                            handlerRadioButton(index, checked)
                        }}
                    ></input>
                ),
        },
        {
            id: 'Obligation Title',
            name: t('Obligation Title'),
            sort: true,
        },
        {
            id: 'Obligation Type',
            name: t('Obligation Type'),
            sort: true,
        },
    ]

    const style = {
        th: {
            'text-align': 'center',
            'font-size': '14px',
        },
        td: {
            'text-align': 'center',
        },
    }

    const [search, setSearch] = useState({})
    const doSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
        setSearch({ keyword: event.currentTarget.value })
    }
    return (
        <div className='row' style={{ fontSize: '14px' }}>
            <TableLicense
                data={data}
                columns={columns}
                style={style}
                search={search}
                selector={true}
                title='search'
                searchFunction={doSearch}
            />
        </div>
    )
}

export default React.memo(SelectTableLinkedObligations)
