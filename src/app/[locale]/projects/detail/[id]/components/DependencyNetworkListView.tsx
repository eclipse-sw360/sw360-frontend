// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import {
    ColumnDef,
    ColumnFiltersState,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
} from '@tanstack/react-table'
import { StatusCodes } from 'http-status-codes'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { ClientSidePageSizeSelector, ClientSideTableFooter, FilterComponent, SW360Table, TableSearch } from 'next-sw360'
import React, { useEffect, useMemo, useState } from 'react'
import { OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap'
import { FaPencilAlt } from 'react-icons/fa'
import { ErrorDetails, FilterOption } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'
import ClearingStateBadge from './ClearingStateBadge'

interface ListViewData {
    isAccessible: boolean
    clearingState: string
    mainLicenses: string
    type: string
    projectMainlineState: string
    relation: string
    isRelease: boolean | string
    releaseMainlineState: string
    projectOrigin: string
    name: string
    releaseOrigin: string
    comment: string
    id: string
    projectState?: string
    version: string
}

const Capitalize = (text: string) =>
    text.split('_').reduce((s, c) => s + ' ' + (c.charAt(0) + c.substring(1).toLocaleLowerCase()), '')

const typeFilterOptions: FilterOption[] = [
    {
        tag: 'OSS',
        value: 'OSS',
    },
    {
        tag: 'Internal',
        value: 'INTERNAL',
    },
    {
        tag: 'COTS',
        value: 'COTS',
    },
    {
        tag: 'Freeware',
        value: 'FREESOFTWARE',
    },
    {
        tag: 'Inner Source',
        value: 'INNER_SOURCE',
    },
    {
        tag: 'Service',
        value: 'SERVICE',
    },
    {
        tag: 'Code Snippet',
        value: 'CODE_SNIPPET',
    },
    {
        tag: 'COTS Trusted Supplier',
        value: 'COTS_TRUESTED_SUPPLIER',
    },
]

const relationFilterOptions: FilterOption[] = [
    {
        tag: 'Contained',
        value: 'CONTAINED',
    },
    {
        tag: 'Related',
        value: 'REFERRED',
    },
    {
        tag: 'Unknown',
        value: 'UNKNOWN',
    },
    {
        tag: 'Dynamically Linked',
        value: 'DYNAMICALLY_LINKED',
    },
    {
        tag: 'Statically Linked',
        value: 'STATICALLY_LINKED',
    },
    {
        tag: 'Side By Side',
        value: 'SIDE_BY_SIDE',
    },
    {
        tag: 'Standalone',
        value: 'STANDALONE',
    },
    {
        tag: 'Internal Use',
        value: 'INTERNAL_USE',
    },
    {
        tag: 'Optional',
        value: 'OPTIONAL',
    },
    {
        tag: 'To Be Replaced',
        value: 'TO_BE_REPLACED',
    },
    {
        tag: 'Code Snippet',
        value: 'CODE_SNIPPET',
    },
]

const stateFilterOptions: FilterOption[] = [
    {
        tag: 'New',
        value: 'NEW_CLEARING',
    },
    {
        tag: 'Sent To Clearing Tool',
        value: 'SENT_TO_CLEARING_TOOL',
    },
    {
        tag: 'Under Clearing',
        value: 'UNDER_CLEARING',
    },
    {
        tag: 'Report Available',
        value: 'REPORT_AVAILABLE',
    },
    {
        tag: 'Report Approved',
        value: 'APPROVED',
    },
    {
        tag: 'Scan Available',
        value: 'SCAN_AVAILABLE',
    },
    {
        tag: 'Internal Use Scan Available',
        value: 'INTERNAL_USE_SCAN_AVAILABLE',
    },
]

const upperCaseWithUnderscore = (text: string | undefined) => {
    return text !== undefined ? text.trim().toUpperCase().replace(/ /g, '_') : undefined
}

const DependencyNetworkListView = ({ projectId }: { projectId: string }) => {
    const t = useTranslations('default')
    const session = useSession()

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            void signOut()
        }
    }, [
        session,
    ])

    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [showFilter, setShowFilter] = useState<undefined | string>()

    const [showProcessing, setShowProcessing] = useState(false)

    const [listViewData, setListViewData] = useState<ListViewData[]>([])
    const [rowData, setRowData] = useState<ListViewData[]>([])
    const memoizedRowData = useMemo(
        () => rowData,
        [
            rowData,
        ],
    )
    const [search, setSearch] = useState<{
        search: string
    }>({
        search: '',
    })

    const columns = useMemo<ColumnDef<ListViewData>[]>(
        () => [
            {
                id: 'name',
                header: t('Name'),
                cell: ({ row }) => {
                    const { id, name, version } = row.original
                    const url = row.original.isRelease ? `/components/releases/detail/${id}` : `/projects/detail/${id}`
                    return (
                        <Link
                            href={url}
                            className='text-link'
                        >
                            {name} {!CommonUtils.isNullEmptyOrUndefinedString(version) && `(${version})`}
                        </Link>
                    )
                },
                meta: {
                    width: '20%',
                },
            },
            {
                id: 'type',
                header: () => {
                    return (
                        <>
                            {t('Type')}{' '}
                            <FilterComponent
                                renderFilterOptions={typeFilterOptions}
                                setColumnFilters={setColumnFilters}
                                columnFilters={columnFilters}
                                id={'type'}
                                show={showFilter}
                                setShow={setShowFilter}
                                header={t('Component Type')}
                                resetPaginationParams={() => table.resetPagination()}
                            />
                        </>
                    )
                },
                cell: ({ row }) => <div className='text-center'>{Capitalize(row.original.type ?? '')}</div>,
                meta: {
                    width: '6%',
                },
            },
            {
                id: 'projectPath',
                header: t('Project Path'),
                cell: ({ row }) => <div className='text-center'>{row.original.projectOrigin}</div>,
                meta: {
                    width: '10%',
                },
            },
            {
                id: 'releasePath',
                header: t('Release Path'),
                cell: ({ row }) => <div className='text-center'>{row.original.releaseOrigin}</div>,
                meta: {
                    width: '10%',
                },
            },
            {
                id: 'relation',
                header: () => {
                    return (
                        <>
                            {t('Relation')}{' '}
                            <FilterComponent
                                renderFilterOptions={relationFilterOptions}
                                setColumnFilters={setColumnFilters}
                                columnFilters={columnFilters}
                                id={'relation'}
                                show={showFilter}
                                setShow={setShowFilter}
                                header={t('Release Relation')}
                                resetPaginationParams={() => table.resetPagination()}
                            />
                        </>
                    )
                },
                cell: ({ row }) => <div className='text-center'>{Capitalize(row.original.relation ?? '')}</div>,
                meta: {
                    width: '8%',
                },
            },
            {
                id: 'mainLicenses',
                header: t('Main Licenses'),
                enableColumnFilter: false,
                cell: ({ row }) => <div className='text-center'>{row.original.mainLicenses}</div>,
                meta: {
                    width: '10%',
                },
            },
            {
                id: 'state',
                header: () => {
                    return (
                        <>
                            {t('State')}{' '}
                            <FilterComponent
                                renderFilterOptions={stateFilterOptions}
                                setColumnFilters={setColumnFilters}
                                columnFilters={columnFilters}
                                id={'state'}
                                show={showFilter}
                                setShow={setShowFilter}
                                header={t('Release Clearing State')}
                                resetPaginationParams={() => table.resetPagination()}
                            />
                        </>
                    )
                },
                cell: ({ row }) => (
                    <div className='text-center'>
                        <ClearingStateBadge
                            key={row.original.id}
                            isRelease={row.original.isRelease == 'true'}
                            clearingState={upperCaseWithUnderscore(row.original.clearingState) as string}
                            projectState={upperCaseWithUnderscore(row.original.projectState)}
                            t={t}
                        />
                    </div>
                ),
                meta: {
                    width: '6%',
                },
            },
            {
                id: 'releaseMainlineState',
                header: t('Release Mainline State'),
                enableColumnFilter: false,
                cell: ({ row }) => (
                    <div className='text-center'>{Capitalize(row.original.releaseMainlineState ?? '')}</div>
                ),
                meta: {
                    width: '8%',
                },
            },
            {
                id: 'projectMainlineState',
                header: t('Project Mainline State'),
                enableColumnFilter: false,
                cell: ({ row }) => (
                    <div className='text-center'>{Capitalize(row.original.projectMainlineState ?? '')}</div>
                ),
                meta: {
                    width: '8%',
                },
            },
            {
                id: 'comment',
                header: t('Comment'),
                enableColumnFilter: false,
                cell: ({ row }) => <div className='text-center'>{Capitalize(row.original.comment ?? '')}</div>,
                meta: {
                    width: '8%',
                },
            },
            {
                id: 'actions',
                header: t('Actions'),
                enableColumnFilter: false,
                cell: ({ row }) => {
                    const { id } = row.original
                    const url = !row.original.isRelease ? `/projects/edit/${id}` : `/components/editRelease/${id}`

                    return (
                        <div className='text-center'>
                            <OverlayTrigger overlay={<Tooltip>{t('Edit')}</Tooltip>}>
                                <Link
                                    href={url}
                                    className='overlay-trigger'
                                >
                                    <FaPencilAlt className='btn-icon' />
                                </Link>
                            </OverlayTrigger>
                        </div>
                    )
                },
                meta: {
                    width: '6%',
                },
            },
        ],
        [
            t,
            columnFilters,
            showFilter,
        ],
    )

    useEffect(() => {
        const data = listViewData.filter((elem) => {
            for (const fil of columnFilters) {
                const vals = fil.value as string[]
                let elemVal: string | undefined
                if (fil.id === 'type') {
                    elemVal = elem.type
                } else if (fil.id === 'relation') {
                    elemVal = elem.relation
                } else {
                    elemVal = elem.clearingState
                }
                if (vals.indexOf(elemVal) === -1) {
                    return false
                }
            }
            if (search.search !== '') {
                if (!elem.name.toLowerCase().includes(search.search.toLowerCase())) return false
            }
            return true
        })
        setRowData(data)
    }, [
        search,
        columnFilters,
        listViewData,
    ])

    const table = useReactTable({
        // table state config
        state: {
            columnFilters,
        },

        data: rowData,
        columns,
        getCoreRowModel: getCoreRowModel(),

        // server side filtering config
        manualFiltering: true,
        onColumnFiltersChange: setColumnFilters,

        // client side pagination
        getPaginationRowModel: getPaginationRowModel(),

        meta: {
            rowHeightConstant: true,
        },
    })

    useEffect(() => {
        if (session.status !== 'authenticated') return
        const controller = new AbortController()
        const signal = controller.signal

        const timeLimit = memoizedRowData.length === 0 ? 700 : 0
        const timeout = setTimeout(() => {
            setShowProcessing(true)
        }, timeLimit)

        void (async () => {
            try {
                const listViewResponse = await ApiUtils.GET(
                    `projects/network/${projectId}/listView`,
                    session.data.user.access_token,
                    signal,
                )

                if (listViewResponse.status !== StatusCodes.OK) {
                    const err = (await listViewResponse.json()) as ErrorDetails
                    throw new Error(err.message)
                }

                const listViewData = (await listViewResponse.json()) as Array<ListViewData>
                setListViewData(listViewData)
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return
                }
                const message = error instanceof Error ? error.message : String(error)
                MessageService.error(message)
            } finally {
                clearTimeout(timeout)
                setShowProcessing(false)
            }
        })()
    }, [
        projectId,
    ])

    const searchFunction = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.currentTarget.value === '') {
            setSearch({
                search: '',
            })
        } else {
            setSearch({
                search: event.currentTarget.value,
            })
        }
    }

    return (
        <div className='mb-3'>
            {table ? (
                <>
                    <div className='d-flex justify-content-end'>
                        <TableSearch searchFunction={searchFunction} />
                    </div>
                    <ClientSidePageSizeSelector table={table} />
                    <SW360Table
                        table={table}
                        showProcessing={showProcessing}
                    />
                    <ClientSideTableFooter table={table} />
                </>
            ) : (
                <div className='col-12 mt-1 text-center'>
                    <Spinner className='spinner' />
                </div>
            )}
        </div>
    )
}

export default DependencyNetworkListView
