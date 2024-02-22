// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import React, { useState } from 'react'
import { FaTrashAlt } from 'react-icons/fa'

import DeleteObligationDialog from '@/app/[locale]/licenses/components/DeleteObligationDialog'
import { useTranslations } from 'next-intl'
import { _ } from 'next-sw360'
import Obligation from '../../../object-types/Obligation'
import TableLicense from '../TableLicense'
import styles from './TableLinkedObligations.module.css'

interface Props {
    data: Array<any>
    setData: (data: Array<any>) => void
    setObligationIdToLicensePayLoad?: (releaseIdToRelationships: Array<string>) => void
}

export default function TableLinkedObligations({ data, setData, setObligationIdToLicensePayLoad }: Props) {
    const t = useTranslations('default')
    const [obligation, setObligation] = useState<Obligation>()
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const deleteObligation = (item: Obligation) => {
        setObligation(item)
        setDeleteDialogOpen(true)
    }

    const buildAttachmentDetail = (item: Obligation) => {
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
                            <td>${
                                item.text.replace(/[\r\n]/g, '<br>').replace(/\t/g, '&ensp;&ensp;&ensp;&ensp;') ?? ''
                            }</td>
                            </tr>
                        </tbody>
                    </table>
                </td>`
                const tr = document.createElement('tr')
                tr.id = item.title
                tr.innerHTML = html

                parent.parentNode.insertBefore(tr, parent.nextSibling)
            } else {
                if (attachmentDetail.hidden == true) {
                    attachmentDetail.hidden = false
                } else {
                    attachmentDetail.hidden = true
                }
            }
        }
    }

    const style = {
        table: {
            fontSize: '14px',
        },
        th: {
            'text-align': 'center',
            'font-size': '14px',
        },
        td: {
            'text-align': 'center',
        },
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
            id: 'obligation',
            name: t('Obligation Title'),
            sort: true,
        },
        {
            id: 'obligationType',
            name: t('Obligation Type'),
            sort: true,
        },
        {
            id: 'action',
            name: t('Action'),
            formatter: (item: Obligation) =>
                _(
                    <div style={{ textAlign: 'left' }}>
                        <span>
                            <FaTrashAlt className={styles['delete-btn']} onClick={() => deleteObligation(item)} />
                        </span>
                    </div>
                ),
        },
    ]
    const [search, setSearch] = useState({})
    const doSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
        setSearch({ keyword: event.currentTarget.value })
    }

    return (
        <div className='row'>
            <DeleteObligationDialog
                data={data}
                setData={setData}
                setObligationIdToLicensePayLoad={setObligationIdToLicensePayLoad}
                obligation={obligation}
                show={deleteDialogOpen}
                setShow={setDeleteDialogOpen}
            />
            <TableLicense
                data={data}
                search={search}
                columns={columns}
                selector={true}
                style={style}
                title={t('search')}
                searchFunction={doSearch}
            />
        </div>
    )
}
