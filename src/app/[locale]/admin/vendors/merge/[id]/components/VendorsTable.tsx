// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { StatusCodes } from 'http-status-codes'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { PageSizeSelector, SW360Table, TableFooter } from 'next-sw360'
import { Dispatch, ReactNode, SetStateAction, useEffect, useMemo, useState } from 'react'
import { Form, Spinner } from 'react-bootstrap'
import { Embedded, ErrorDetails, PageableQueryParam, PaginationMeta, Vendor } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'

type EmbeddedVendors = Embedded<Vendor, 'sw360:vendors'>

export default function VendorTable({
    vendor,
    setVendor,
}: Readonly<{
    vendor: Vendor | null
    setVendor: Dispatch<SetStateAction<null | Vendor>>
}>): ReactNode {
    const t = useTranslations('default')
    const session = useSession()

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            void signOut()
        }
    }, [
        session,
    ])

    const columns = useMemo<ColumnDef<Vendor>[]>(
        () => [
            {
                id: 'select',
                cell: ({ row }) => (
                    <Form.Check
                        type='radio'
                        checked={
                            vendor !== null &&
                            row.original._links?.self.href.split('/').at(-1) ===
                                vendor._links?.self.href.split('/').at(-1)
                        }
                        onChange={() => setVendor(row.original)}
                    ></Form.Check>
                ),
                meta: {
                    width: '5%',
                },
            },
            {
                id: 'fullName',
                accessorKey: 'fullName',
                header: t('Full Name'),
                cell: (info) => info.getValue(),
                meta: {
                    width: '45%',
                },
            },
            {
                id: 'shortName',
                accessorKey: 'shortName',
                header: t('Short Name'),
                cell: (info) => info.getValue(),
                meta: {
                    width: '25%',
                },
            },
            {
                id: 'url',
                header: t('URL'),
                accessorKey: 'url',
                cell: (info) => info.getValue(),
                meta: {
                    width: '25%',
                },
            },
        ],
        [
            t,
            vendor,
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
    const [vendorData, setVendorData] = useState<Vendor[]>(() => [])
    const memoizedData = useMemo(
        () => vendorData,
        [
            vendorData,
        ],
    )
    const [showProcessing, setShowProcessing] = useState(false)

    useEffect(() => {
        if (session.status === 'loading') return
        const controller = new AbortController()
        const signal = controller.signal

        const timeLimit = vendorData.length !== 0 ? 700 : 0
        const timeout = setTimeout(() => {
            setShowProcessing(true)
        }, timeLimit)

        void (async () => {
            try {
                if (CommonUtils.isNullOrUndefined(session.data)) return signOut()
                const queryUrl = CommonUtils.createUrlWithParams(
                    `vendors`,
                    Object.fromEntries(
                        Object.entries(pageableQueryParam).map(([key, value]) => [
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

                const data = (await response.json()) as EmbeddedVendors
                setPaginationMeta(data.page)
                setVendorData(
                    CommonUtils.isNullOrUndefined(data['_embedded']['sw360:vendors'])
                        ? []
                        : data['_embedded']['sw360:vendors'],
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
