// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import {
    ColumnDef,
    getCoreRowModel,
    getExpandedRowModel,
    getFilteredRowModel,
    useReactTable,
} from '@tanstack/react-table'
import { StatusCodes } from 'http-status-codes'
import { useSearchParams } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { PaddedCell, SW360Table } from 'next-sw360'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import { Form, Spinner } from 'react-bootstrap'
import { ErrorDetails, LicenseDetail, NestedRows, Obligation } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils/index'

interface Props {
    licenseId?: string
    isEditWhitelist: boolean
    whitelist: Map<string, boolean> | undefined
    setWhitelist: React.Dispatch<React.SetStateAction<Map<string, boolean> | undefined>>
}

const Obligations = ({ licenseId, isEditWhitelist, whitelist, setWhitelist }: Props): ReactNode => {
    const t = useTranslations('default')
    const params = useSearchParams()
    const session = useSession()

    const [globalFilter, setGlobalFilter] = useState('')

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            void signOut()
        }
    }, [
        session,
    ])

    const [obligationData, setObligationData] = useState<Obligation[]>(() => [])
    const memoizedData = useMemo(
        () =>
            obligationData.map(
                (ob) =>
                    ({
                        node: ob,
                        children: [
                            {
                                node: ob,
                            },
                        ],
                    }) as NestedRows<Obligation>,
            ),
        [
            obligationData,
        ],
    )

    const memoizedWhitelistData = useMemo(
        () => obligationData,
        [
            obligationData,
        ],
    )
    const [showProcessing, setShowProcessing] = useState(false)

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal

        void (async () => {
            try {
                if (CommonUtils.isNullOrUndefined(session.data)) return signOut()
                setShowProcessing(true)
                const response = await ApiUtils.GET(`licenses/${licenseId}`, session.data.user.access_token, signal)
                if (response.status !== StatusCodes.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new Error(err.message)
                }

                const data = (await response.json()) as LicenseDetail
                setObligationData(
                    data['_embedded']?.['sw360:obligations'] ? data['_embedded']['sw360:obligations'] : [],
                )
                const whitelist = new Map<string, boolean>()
                memoizedWhitelistData.forEach((element: Obligation) => {
                    whitelist.set(CommonUtils.getIdFromUrl(element._links?.self.href), true)
                })
                setWhitelist(whitelist)
            } catch (error: unknown) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return
                }
                const message = error instanceof Error ? error.message : String(error)
                MessageService.error(message)
            } finally {
                setShowProcessing(false)
            }
        })()
        return () => controller.abort()
    }, [
        params,
        licenseId,
    ])

    const columns = useMemo<ColumnDef<NestedRows<Obligation>>[]>(
        () => [
            {
                id: 'expand',
                cell: ({ row }) => {
                    if (row.depth > 0) {
                        return <p>{row.original.node.text ?? ''}</p>
                    } else {
                        return <PaddedCell row={row}></PaddedCell>
                    }
                },
                meta: {
                    width: '3%',
                },
            },
            {
                id: 'obligation',
                header: t('Obligation'),
                cell: ({ row }) => <>{row.original.node.title}</>,
            },
            {
                id: 'obligationType',
                header: t('Obligation Type'),
                cell: ({ row }) => <>{row.original.node.obligationType}</>,
            },
            {
                id: 'furtherProperties',
                header: t('Further properties'),
                cell: ({ row }) => (
                    <>
                        {!CommonUtils.isNullOrUndefined(row.original.node.customPropertyToValue)
                            ? JSON.stringify(row.original.node.customPropertyToValue)
                            : ''}
                    </>
                ),
            },
        ],
        [
            t,
        ],
    )

    const columnEditWhitelists = useMemo<ColumnDef<Obligation>[]>(
        () => [
            {
                id: 'check',
                header: t('Whitelist'),
                cell: ({ row }) => (
                    <Form.Check
                        className='text-center'
                        name='obligationId'
                        type='checkbox'
                        defaultChecked={!CommonUtils.isNullEmptyOrUndefinedArray(row.original.whitelist)}
                        onClick={() => {
                            handlerRadioButton(row.original)
                        }}
                    ></Form.Check>
                ),
            },
            {
                id: 'text',
                header: t('Obligation'),
                cell: ({ row }) => <>{row.original.text}</>,
            },
            {
                id: 'furtherProperties',
                header: t('Further properties'),
                cell: ({ row }) => (
                    <>
                        {!CommonUtils.isNullOrUndefined(row.original.customPropertyToValue)
                            ? JSON.stringify(row.original.customPropertyToValue)
                            : ''}
                    </>
                ),
            },
        ],
        [
            t,
        ],
    )

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

    const table = useReactTable({
        data: memoizedData,
        columns,
        state: {
            globalFilter,
        },
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        getSubRows: (row) => row.children ?? [],
        getRowCanExpand: (row) => {
            if (row.depth === 1) {
                row.meta = {
                    isFullSpanRow: true,
                }
            }
            return row.depth === 0
        },
    })

    table.getRowModel().rows.forEach((row) => {
        if (row.depth === 1) {
            row.meta = {
                isFullSpanRow: true,
            }
        }
    })

    const whiteListTable = useReactTable({
        data: memoizedWhitelistData,
        columns: columnEditWhitelists,
        state: {
            globalFilter,
        },
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    })

    return (
        <div className='mb-3'>
            <div className='row mb-3'>
                <div className='col-lg-4'>
                    <input
                        type='text'
                        className='form-control'
                        placeholder={t('Search obligations...')}
                        value={globalFilter ?? ''}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                    />
                </div>
            </div>

            {isEditWhitelist ? (
                whiteListTable ? (
                    <SW360Table
                        table={whiteListTable}
                        showProcessing={showProcessing}
                    />
                ) : (
                    <div className='col-12 mt-1 text-center'>
                        <Spinner className='spinner' />
                    </div>
                )
            ) : table ? (
                <SW360Table
                    table={table}
                    showProcessing={showProcessing}
                />
            ) : (
                <div className='col-12 mt-1 text-center'>
                    <Spinner className='spinner' />
                </div>
            )}
        </div>
    )
}

export default Obligations
