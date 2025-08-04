// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import React, { useEffect, useState, type JSX } from 'react'
import { FaTrashAlt } from 'react-icons/fa'

import { Obligation } from '@/object-types'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { _ } from 'next-sw360'
import TableLicense from '../TableLicense'
import DeleteObligationDialog from './DeleteObligationDialog'
import styles from './TableLinkedObligations.module.css'

interface Props {
    data: Array<(string | Obligation)[]>
    setData: React.Dispatch<React.SetStateAction<Array<(string | Obligation)[]>>>
    setObligationIdToLicensePayLoad: (releaseIdToRelationships: Array<string>) => void
}

export default function TableLinkedObligations({ data, setData, setObligationIdToLicensePayLoad }: Props): JSX.Element {
    const t = useTranslations('default')
    const [obligation, setObligation] = useState<Obligation | undefined>(undefined)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const { status } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [status])
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

            const attachmentDetail = document.getElementById(item.title ?? '')
            if (!attachmentDetail) {
                const parent = (event.target as HTMLElement).parentElement?.parentElement?.parentElement
                const html = `<td colspan='4'>
                    <table class="table table-borderless">
                        <tbody>
                            <tr>
                            <td>${
                                item.text?.replace(/[\r\n]/g, '<br>').replace(/\t/g, '&ensp;&ensp;&ensp;&ensp;') ?? ''
                            }</td>
                            </tr>
                        </tbody>
                    </table>
                </td>`
                const tr = document.createElement('tr')
                tr.id = item.title ?? ''
                tr.innerHTML = html

                parent?.parentNode?.insertBefore(tr, parent.nextSibling)
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
                _(
                    <i
                        className={styles.collapse}
                        onClick={buildAttachmentDetail(item)}
                    ></i>,
                ),
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
                    <div style={{ textAlign: 'center' }}>
                        <span>
                            <FaTrashAlt
                                className={styles['delete-btn']}
                                onClick={() => deleteObligation(item)}
                            />
                        </span>
                    </div>,
                ),
            width: '7%',
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
                title={t('Search')}
                searchFunction={doSearch}
            />
        </div>
    )
}
