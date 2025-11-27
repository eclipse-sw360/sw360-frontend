// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ColumnDef, getCoreRowModel, getSortedRowModel, SortingState, useReactTable } from '@tanstack/react-table'
import { StatusCodes } from 'http-status-codes'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { PageSizeSelector, SW360Table, TableFooter } from 'next-sw360'
import React, { ReactNode, useEffect, useMemo, useState } from 'react'
import { OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap'
import { FaPencilAlt } from 'react-icons/fa'
import { MdDeleteOutline } from 'react-icons/md'
import { Component, Embedded, ErrorDetails, PageableQueryParam, PaginationMeta, UserGroupType } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'
import DeleteComponentDialog from './DeleteComponentDialog'

interface Props {
    setNumberOfComponent: React.Dispatch<React.SetStateAction<number>>
}

type EmbeddedComponents = Embedded<Component, 'sw360:components'>

export default function ComponentsTable({ setNumberOfComponent }: Props) {
    const t = useTranslations('default')
    const params = useSearchParams()
    const [deletingComponent, setDeletingComponent] = useState<string>('')
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const session = useSession()
    const router = useRouter()

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            void signOut()
        }
    }, [
        session,
    ])

    const handleClickDelete = (componentId: string) => {
        setDeletingComponent(componentId)
        setDeleteDialogOpen(true)
    }

    const handleEditComponent = (componentId: string) => {
        router.push(`/components/edit/${componentId}`)
        MessageService.success(t('You are editing the original document'))
    }

    const columns = useMemo<ColumnDef<Component>[]>(
        () => [
            {
                id: 'vendor',
                header: t('Vendor'),
                accessorKey: 'vendor',
                cell: (info) => info.getValue(),
                enableSorting: true,
                meta: {
                    width: '20%',
                },
            },
            {
                id: 'name',
                accessorKey: 'name',
                header: t('Component Name'),
                enableSorting: true,
                cell: ({ row }) => {
                    const { name, id } = row.original
                    return (
                        <Link
                            href={`/components/detail/${id}`}
                            className='text-link'
                        >
                            {name}
                        </Link>
                    )
                },
                meta: {
                    width: '30%',
                },
            },
            {
                id: 'mainLicenses',
                header: t('Main licenses'),
                cell: ({ row }) => {
                    return (
                        <>
                            {row.original.mainLicenseIds?.map(
                                (lic, i): ReactNode => (
                                    <div key={lic}>
                                        <Link
                                            className='link'
                                            href={`/licenses/detail/?id=${lic}`}
                                        >
                                            {lic}
                                        </Link>
                                        {i !== (row.original.mainLicenseIds?.length ?? 0) - 1 && ', '}
                                    </div>
                                ),
                            )}
                        </>
                    )
                },
                meta: {
                    width: '20%',
                },
            },
            {
                id: 'type',
                header: t('Component Type'),
                accessorKey: 'componentType',
                cell: ({ row }) => <>{row.original.componentType}</>,
                enableSorting: true,
                meta: {
                    width: '20%',
                },
            },
            {
                id: 'actions',
                header: t('Actions'),
                enableSorting: false,
                cell: ({ row }) => {
                    const { id } = row.original
                    return (
                        <>
                            {id && (
                                <span className='d-flex justify-content-evenly'>
                                    <OverlayTrigger overlay={<Tooltip>{t('Edit')}</Tooltip>}>
                                        <span
                                            className='d-inline-block'
                                            onClick={() => handleEditComponent(id)}
                                        >
                                            <FaPencilAlt
                                                className='btn-icon'
                                                size={18}
                                            />
                                        </span>
                                    </OverlayTrigger>

                                    <OverlayTrigger overlay={<Tooltip>{t('Delete')}</Tooltip>}>
                                        <span className='d-inline-block'>
                                            <MdDeleteOutline
                                                className='btn-icon'
                                                size={25}
                                                onClick={() => handleClickDelete(id)}
                                            />
                                        </span>
                                    </OverlayTrigger>
                                </span>
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
    const [componentData, setComponentData] = useState<Component[]>(() => [])
    const memoizedData = useMemo(
        () => componentData,
        [
            componentData,
        ],
    )
    const [showProcessing, setShowProcessing] = useState(false)

    useEffect(() => {
        if (session.status === 'loading') return
        const controller = new AbortController()
        const signal = controller.signal

        const timeLimit = componentData.length !== 0 ? 700 : 0
        const timeout = setTimeout(() => {
            setShowProcessing(true)
        }, timeLimit)

        void (async () => {
            try {
                if (CommonUtils.isNullOrUndefined(session.data)) return signOut()
                const searchParams = Object.fromEntries(params.entries())
                const queryUrl = CommonUtils.createUrlWithParams(
                    `components`,
                    Object.fromEntries(
                        Object.entries({
                            ...searchParams,
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

                const data = (await response.json()) as EmbeddedComponents
                setPaginationMeta(data.page)
                setNumberOfComponent(data.page?.totalElements ?? 0)
                setComponentData(
                    CommonUtils.isNullOrUndefined(data['_embedded']['sw360:components'])
                        ? []
                        : data['_embedded']['sw360:components'],
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
        params.toString(),
        session,
    ])

    useEffect(() => {
        setPageableQueryParam({
            page: 0,
            page_entries: 10,
            sort: '',
        })
    }, [
        params.toString(),
    ])

    const table = useReactTable({
        data: memoizedData,
        columns,
        getCoreRowModel: getCoreRowModel(),

        // table state config
        state: {
            columnVisibility: {
                actions: !(session?.data?.user?.userGroup === UserGroupType.SECURITY_USER),
            },
            pagination: {
                pageIndex: pageableQueryParam.page,
                pageSize: pageableQueryParam.page_entries,
            },
            sorting: [
                {
                    id: pageableQueryParam.sort.split(',')[0],
                    desc: pageableQueryParam.sort.split(',')[1] === 'desc',
                },
            ],
        },

        // server side sorting config
        manualSorting: true,
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: (updater) => {
            setPageableQueryParam((prev) => {
                const prevSorting: SortingState = [
                    {
                        id: prev.sort.split(',')[0],
                        desc: prev.sort.split(',')[1] === 'desc',
                    },
                ]

                const nextSorting = typeof updater === 'function' ? updater(prevSorting) : updater

                if (nextSorting.length > 0) {
                    const { id, desc } = nextSorting[0]
                    return {
                        ...prev,
                        sort: `${id},${desc ? 'desc' : 'asc'}`,
                    }
                }

                return {
                    ...prev,
                    sort: '',
                }
            })
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
        <>
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
            <DeleteComponentDialog
                componentId={deletingComponent}
                show={deleteDialogOpen}
                setShow={setDeleteDialogOpen}
            />
        </>
    )
}
