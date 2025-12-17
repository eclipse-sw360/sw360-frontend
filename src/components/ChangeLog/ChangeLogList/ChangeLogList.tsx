// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'
import { PageSizeSelector, SW360Table, TableFooter } from 'next-sw360'
import { Dispatch, type JSX, SetStateAction, useMemo } from 'react'
import { OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap'
import { BsFileEarmarkFill } from 'react-icons/bs'
import { Changelogs, PageableQueryParam, PaginationMeta } from '@/object-types'

interface Props {
    documentId: string
    setChangeLogId: React.Dispatch<React.SetStateAction<string>>
    setChangesLogTab: React.Dispatch<React.SetStateAction<string>>
    changeLogList: Array<Changelogs>
    pageableQueryParam: PageableQueryParam
    setPageableQueryParam: Dispatch<SetStateAction<PageableQueryParam>>
    showProcessing: boolean
    paginationMeta: PaginationMeta | undefined
}

const ChangeLogList = ({
    documentId,
    setChangeLogId,
    setChangesLogTab,
    changeLogList,
    pageableQueryParam,
    setPageableQueryParam,
    showProcessing,
    paginationMeta,
}: Props): JSX.Element => {
    const t = useTranslations('default')

    const columns = useMemo<ColumnDef<Changelogs>[]>(
        () => [
            {
                id: 'date',
                header: t('Date'),
                accessorKey: 'changeTimestamp',
                cell: (info) => info.getValue(),
                meta: {
                    width: '20%',
                },
            },
            {
                id: 'id',
                header: t('Change Log Id'),
                accessorKey: 'id',
                cell: (info) => info.getValue(),
                meta: {
                    width: '20%',
                },
            },
            {
                id: 'type',
                header: t('Change Type'),
                cell: ({ row }) => {
                    return (
                        <>
                            {row.original.documentId === documentId
                                ? t('Attributes change')
                                : `${t('Reference Doc Changes')} : ${row.original.documentType}`}
                        </>
                    )
                },
                meta: {
                    width: '30%',
                },
            },
            {
                id: 'userEdited',
                header: t('User'),
                accessorKey: 'userEdited',
                cell: (info) => info.getValue(),
                meta: {
                    width: '20%',
                },
            },
            {
                id: 'actions',
                header: t('Actions'),
                cell: ({ row }) => {
                    const { id } = row.original
                    return (
                        <>
                            {id && (
                                <OverlayTrigger overlay={<Tooltip>{t('View Change Logs')}</Tooltip>}>
                                    <div className='cursor-pointer'>
                                        <BsFileEarmarkFill
                                            style={{
                                                color: '#F7941E',
                                                fontSize: '18px',
                                            }}
                                            onClick={() => {
                                                setChangeLogId(id)
                                                setChangesLogTab('view-log')
                                            }}
                                            size={20}
                                        />
                                    </div>
                                </OverlayTrigger>
                            )}
                        </>
                    )
                },
                meta: {
                    width: '10%',
                },
            },
        ],
        [
            t,
        ],
    )

    const table = useReactTable({
        data: changeLogList,
        columns,
        getCoreRowModel: getCoreRowModel(),

        // table state config
        state: {
            pagination: {
                pageIndex: pageableQueryParam.page,
                pageSize: pageableQueryParam.page_entries,
            },
        },

        // server side pagination config
        manualPagination: true,
        pageCount: paginationMeta?.totalPages ?? 1,
        onPaginationChange: (updater) => {
            const next =
                typeof updater === 'function'
                    ? updater({
                          pageIndex: pageableQueryParam.page,
                          pageSize: pageableQueryParam.page_entries,
                      })
                    : updater

            setPageableQueryParam((prev) => ({
                ...prev,
                page: next.pageIndex + 1,
                page_entries: next.pageSize,
            }))
        },

        meta: {
            rowHeightConstant: true,
        },
    })

    return (
        <div className='mb-3'>
            {pageableQueryParam && table && paginationMeta ? (
                <>
                    <PageSizeSelector
                        pageableQueryParam={pageableQueryParam}
                        setPageableQueryParam={setPageableQueryParam}
                    />
                    <SW360Table
                        table={table}
                        showProcessing={showProcessing}
                    />
                    <TableFooter
                        pageableQueryParam={pageableQueryParam}
                        setPageableQueryParam={setPageableQueryParam}
                        paginationMeta={paginationMeta}
                    />
                </>
            ) : (
                <div className='col-12 mt-1 text-center'>
                    <Spinner className='spinner' />
                </div>
            )}
        </div>
    )
}

export default ChangeLogList
