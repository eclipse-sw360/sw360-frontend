// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { StatusCodes } from 'http-status-codes'
import { useSearchParams } from 'next/navigation'
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { _ } from 'next-sw360'
import { ReactNode, useEffect, useState } from 'react'
import { Form } from 'react-bootstrap'
import TableLicense from '@/components/LinkedObligations/TableLicense'
import { ErrorDetails, LicenseDetail, Obligation } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils/index'
import styles from '../detail.module.css'

interface Props {
    licenseId?: string
    isEditWhitelist: boolean
    whitelist: Map<string, boolean> | undefined
    setWhitelist: React.Dispatch<React.SetStateAction<Map<string, boolean> | undefined>>
}

type RowData = Array<string | Obligation | string[]>

const Obligations = ({ licenseId, isEditWhitelist, whitelist, setWhitelist }: Props): ReactNode => {
    const t = useTranslations('default')
    const [data, setData] = useState<Array<RowData>>([])
    const [dataEditWhitelist, setDataEditWhitelist] = useState<Array<RowData>>([])
    const params = useSearchParams()
    const { status } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [
        status,
    ])

    const buildAttachmentDetail = (item: Obligation) => {
        return (event: React.MouseEvent<HTMLElement>) => {
            if ((event.target as HTMLElement).className == styles.expand) {
                ;(event.target as HTMLElement).className = styles.collapse
            } else {
                ;(event.target as HTMLElement).className = styles.expand
            }

            const obligationDetail = document.getElementById(item.title ?? '')
            if (!obligationDetail) {
                const parent = (event.target as HTMLElement).parentElement?.parentElement?.parentElement
                const html = `<td colspan="10">
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
                if (obligationDetail.hidden == true) {
                    obligationDetail.hidden = false
                } else {
                    obligationDetail.hidden = true
                }
            }
        }
    }

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal

        void (async () => {
            try {
                const session = await getSession()
                if (CommonUtils.isNullOrUndefined(session)) return signOut()
                const response = await ApiUtils.GET(`licenses/${licenseId}`, session.user.access_token, signal)
                if (response.status !== StatusCodes.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new Error(err.message)
                }

                const license = (await response.json()) as LicenseDetail
                if (CommonUtils.isNullEmptyOrUndefinedArray(license._embedded?.['sw360:obligations'])) {
                    setData([])
                } else {
                    const data = license._embedded['sw360:obligations']
                        .map((item: Obligation) => [
                            item,
                            item.title ?? '',
                            !CommonUtils.isNullEmptyOrUndefinedString(item.obligationType)
                                ? item.obligationType.charAt(0) + item.obligationType.slice(1).toLowerCase()
                                : '',
                            !CommonUtils.isNullOrUndefined(item.customPropertyToValue)
                                ? JSON.stringify(item.customPropertyToValue)
                                : '',
                            item.text ?? '',
                            item.whitelist ?? [],
                        ])
                        .filter((item: RowData) => (item[5] as string[]).length !== 0)
                    const whitelist = new Map<string, boolean>()
                    data.forEach((element: RowData) => {
                        whitelist.set(CommonUtils.getIdFromUrl((element[0] as Obligation)._links?.self.href), true)
                    })
                    setWhitelist(whitelist)
                    setData(data)
                    const dataEditWhitelist = license._embedded['sw360:obligations'].map((item: Obligation) => [
                        item,
                        item.text ?? '',
                        !CommonUtils.isNullOrUndefined(item.customPropertyToValue)
                            ? JSON.stringify(item.customPropertyToValue)
                            : '',
                    ])
                    setDataEditWhitelist(dataEditWhitelist)
                }
            } catch (error: unknown) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return
                }
                const message = error instanceof Error ? error.message : String(error)
                MessageService.error(message)
            }
        })()
        return () => controller.abort()
    }, [
        params,
        licenseId,
    ])

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
            width: '10%',
        },
        {
            id: 'obligation',
            name: t('Obligation'),
            sort: true,
            width: '30%',
        },
        {
            id: 'obligationType',
            name: t('Obligation Type'),
            sort: true,
            width: '30%',
        },
        {
            id: 'furtherProperties',
            name: t('Further properties'),
            sort: true,
            width: '30%',
        },
    ]

    const handlerRadioButton = (item: Obligation) => {
        if (whitelist === undefined) return
        const id: string = CommonUtils.getIdFromUrl(item._links?.self.href)
        if (whitelist.has(id)) {
            if (whitelist.get(id) !== true) {
                whitelist.set(id, true)
            } else {
                whitelist.set(id, false)
            }
        } else {
            whitelist.set(id, true)
        }
        setWhitelist(whitelist)
    }

    const columnEditWhitelists = [
        {
            id: 'obligationId',
            name: 'Whitelist',
            formatter: (item: Obligation) =>
                _(
                    <Form.Check
                        style={{
                            textAlign: 'center',
                        }}
                        name='obligationId'
                        type='checkbox'
                        defaultChecked={!CommonUtils.isNullEmptyOrUndefinedArray(item.whitelist)}
                        onClick={() => {
                            handlerRadioButton(item)
                        }}
                    ></Form.Check>,
                ),
        },
        {
            id: 'text',
            name: 'Obligation',
            sort: true,
            width: '30%',
        },
        {
            id: 'Further properties',
            name: 'Further properties',
            sort: true,
            width: '10%',
        },
    ]
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

    const styleEditWhiteList = {
        table: {
            fontSize: '14px',
        },
        th: {
            'text-align': 'left',
            'font-size': '14px',
        },
        td: {
            'text-align': 'left',
        },
    }

    return (
        <div className='row'>
            {isEditWhitelist ? (
                <TableLicense
                    data={dataEditWhitelist}
                    search={true}
                    columns={columnEditWhitelists}
                    style={styleEditWhiteList}
                    pagination={false}
                />
            ) : (
                <div>
                    <TableLicense
                        data={data}
                        columns={columns}
                        style={style}
                        pagination={false}
                    />
                </div>
            )}
        </div>
    )
}

export default Obligations
