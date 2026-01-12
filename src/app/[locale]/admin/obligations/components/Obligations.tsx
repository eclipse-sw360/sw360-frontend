// Copyright (C) TOSHIBA CORPORATION, 2025. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2025. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { StatusCodes } from 'http-status-codes'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { PageButtonHeader, PageSizeSelector, QuickFilter, SW360Table, TableFooter } from 'next-sw360'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import { OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap'
import { BsCheck2Square, BsClipboard, BsFillTrashFill, BsPencil } from 'react-icons/bs'
import { Embedded, ErrorDetails, Obligation, PageableQueryParam, PaginationMeta } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'
import { ObligationLevelInfo, ObligationLevels } from '../../../../../object-types/Obligation'
import DeleteObligationDialog from './DeleteObligationDialog'

type EmbeddedObligations = Embedded<Obligation, 'sw360:obligations'>

function Obligations(): ReactNode {
    const t = useTranslations('default')
    const [search, setSearch] = useState({})
    const [obligationCount, setObligationCount] = useState(0)
    const session = useSession()
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [deletedObligationId, setDeletedObligationId] = useState('')
    const router = useRouter()

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            void signOut()
        }
    }, [
        session,
    ])

    const openDeleteDialog = (obligationId: string | undefined) => {
        if (obligationId !== undefined) {
            setDeletedObligationId(obligationId)
            setShowDeleteDialog(true)
        }
    }

    const extractObligationId = (obligation: Obligation): string | undefined => {
        if (!obligation._links) return undefined
        const href = obligation._links.self.href
        const match = href.match(/\/([^/]+)$/)
        return match ? match[1] : undefined
    }

    const headerButtons = {
        'Add Obligation': {
            type: 'primary',
            link: '/admin/obligations/add',
            name: t('Add Obligation'),
        },
    }

    const columns = useMemo<ColumnDef<Obligation>[]>(
        () => [
            {
                id: 'title',
                accessorKey: 'title',
                header: t('Title'),
                cell: (info) => info.getValue(),
                meta: {
                    width: '20%',
                },
            },
            {
                id: 'text',
                accessorKey: 'text',
                header: t('Text'),
                cell: (info) => info.getValue(),
                meta: {
                    width: '40%',
                },
            },
            {
                id: 'obligationLevel',
                header: t('Obligation Level'),
                cell: ({ row }) => {
                    const { obligationLevel } = row.original
                    return (
                        <OverlayTrigger
                            overlay={
                                <Tooltip id={`tooltip-${obligationLevel}`}>
                                    {ObligationLevelInfo[obligationLevel as keyof typeof ObligationLevelInfo]
                                        ? ObligationLevelInfo[obligationLevel as keyof typeof ObligationLevelInfo]
                                        : 'No description available.'}
                                </Tooltip>
                            }
                            placement='top'
                        >
                            <span>{ObligationLevels[obligationLevel as keyof typeof ObligationLevels]}</span>
                        </OverlayTrigger>
                    )
                },
                meta: {
                    width: '20%',
                },
            },
            {
                id: 'actions',
                header: t('Actions'),
                cell: ({ row }) => {
                    return (
                        <span className='d-flex justify-content-evenly'>
                            <OverlayTrigger overlay={<Tooltip>{t('Edit')}</Tooltip>}>
                                <span className='d-inline-block btn-overlay cursor-pointer'>
                                    <BsPencil
                                        onClick={() => {
                                            router.push(
                                                `obligations/edit/detail?id=${extractObligationId(row.original)}`,
                                            )
                                        }}
                                        className='btn-icon'
                                        size={20}
                                    />
                                </span>
                            </OverlayTrigger>
                            <OverlayTrigger overlay={<Tooltip>{t('Change Log')}</Tooltip>}>
                                <span
                                    className='d-inline-block btn-overlay cursor-pointer'
                                    onClick={() =>
                                        router.push(`obligations/changelog/${extractObligationId(row.original)}`)
                                    }
                                >
                                    <BsCheck2Square
                                        className='btn-icon overlay-trigger'
                                        size={20}
                                    />
                                </span>
                            </OverlayTrigger>

                            <OverlayTrigger overlay={<Tooltip>{t('Duplicate')}</Tooltip>}>
                                <span className='d-inline-block btn-overlay cursor-pointer'>
                                    <BsClipboard
                                        className='btn-icon'
                                        onClick={() => {
                                            router.push(
                                                `obligations/duplicate/detail?id=${extractObligationId(row.original)}`,
                                            )
                                        }}
                                        size={20}
                                    />
                                </span>
                            </OverlayTrigger>

                            <OverlayTrigger overlay={<Tooltip>{t('Delete')}</Tooltip>}>
                                <span className='d-inline-block btn-overlay cursor-pointer'>
                                    <BsFillTrashFill
                                        className='btn-icon'
                                        onClick={() => {
                                            openDeleteDialog(extractObligationId(row.original))
                                        }}
                                        style={{
                                            color: 'gray',
                                            fontSize: '18px',
                                        }}
                                        size={20}
                                    />
                                </span>
                            </OverlayTrigger>
                        </span>
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
    const [pageableQueryParam, setPageableQueryParam] = useState<PageableQueryParam>({
        page: 0,
        page_entries: 10,
        sort: '',
    })
    const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | undefined>({
        size: 0,
        totalElements: 0,
        totalPages: 0,
        number: 0,
    })
    const [obligationData, setObligationData] = useState<Obligation[]>(() => [])
    const memoizedData = useMemo(
        () => obligationData,
        [
            obligationData,
        ],
    )
    const [showProcessing, setShowProcessing] = useState(false)

    useEffect(() => {
        if (session.status === 'loading') return
        const controller = new AbortController()
        const signal = controller.signal

        const timeLimit = obligationData.length !== 0 ? 700 : 0
        const timeout = setTimeout(() => {
            setShowProcessing(true)
        }, timeLimit)

        void (async () => {
            try {
                if (CommonUtils.isNullOrUndefined(session.data)) return signOut()
                const queryUrl = CommonUtils.createUrlWithParams(
                    `obligations`,
                    Object.fromEntries(
                        Object.entries({
                            ...search,
                            ...pageableQueryParam,
                        }).map(([key, value]) => [
                            key,
                            String(value),
                        ]),
                    ),
                )
                const response = await ApiUtils.GET(queryUrl, session.data.user.access_token, signal)
                if (response.status !== StatusCodes.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new Error(err.message)
                }

                const data = (await response.json()) as EmbeddedObligations
                setPaginationMeta(data.page)
                setObligationCount(data.page?.totalElements ?? 0)
                setObligationData(
                    CommonUtils.isNullOrUndefined(data['_embedded']['sw360:obligations'])
                        ? []
                        : data['_embedded']['sw360:obligations'],
                )
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

        return () => controller.abort()
    }, [
        pageableQueryParam,
        session,
        search,
    ])

    const table = useReactTable({
        data: memoizedData,
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

    useEffect(() => {
        setPageableQueryParam({
            page: 0,
            page_entries: 10,
            sort: '',
        })
    }, [
        search,
    ])

    const doSearch = (value: string) => {
        setSearch({
            search: value,
        })
    }

    return (
        <div className='container page-content'>
            <DeleteObligationDialog
                obligationId={deletedObligationId}
                show={showDeleteDialog}
                setShow={setShowDeleteDialog}
            />
            <div className='row'>
                <div className='col-2 sidebar'>
                    <QuickFilter
                        id='obligationsFilter'
                        title={t('Quick Filter')}
                        searchFunction={doSearch}
                    />
                </div>
                <div className='col col-10'>
                    <div className='col'>
                        <div className='row'>
                            <PageButtonHeader
                                buttons={headerButtons}
                                title={`${t('Obligations')} (${obligationCount})`}
                            />
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
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Obligations
