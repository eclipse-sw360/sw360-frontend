// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { StatusCodes } from 'http-status-codes'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { PageButtonHeader, PageSizeSelector, QuickFilter, SW360Table, TableFooter } from 'next-sw360'
import React, { ReactNode, useEffect, useMemo, useState } from 'react'
import { Spinner } from 'react-bootstrap'
import { BsCheck2Circle, BsXCircle } from 'react-icons/bs'
import { AccessControl } from '@/components/AccessControl/AccessControl'
import {
    Embedded,
    ErrorDetails,
    LicenseDetail,
    PageableQueryParam,
    PaginationMeta,
    UserGroupType,
} from '@/object-types'
import DownloadService from '@/services/download.service'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'

function LicensePage(): ReactNode {
    const params = useSearchParams()
    const t = useTranslations('default')
    const [search, setSearch] = useState({})
    const [numberLicense, setNumberLicense] = useState(0)
    const { data: session, status } = useSession()
    const deleteLicense = params.get('delete')

    const doSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
        setSearch({
            keyword: event.currentTarget.value,
        })
    }

    useEffect(() => {
        if (status === 'unauthenticated') {
            void signOut()
        }
    }, [
        status,
    ])

    useEffect(() => {
        if (!CommonUtils.isNullEmptyOrUndefinedString(deleteLicense)) {
            MessageService.success(t('License removed successfully'))
        }
    }, [
        params,
    ])

    const handleExportLicense = () => {
        void DownloadService.download(`reports?module=licenses`, session, `Licenses.xlsx`)
    }

    const columns = useMemo<ColumnDef<LicenseDetail>[]>(
        () => [
            {
                id: 'shortName',
                header: t('License Shortname'),
                cell: ({ row }) => {
                    const { shortName } = row.original
                    return (
                        <Link
                            href={`/licenses/detail?id=${shortName}`}
                            className='link'
                        >
                            {shortName}
                        </Link>
                    )
                },
                meta: {
                    width: '20%',
                },
            },
            {
                id: 'fullName',
                accessorKey: 'fullName',
                header: t('License Fullname'),
                cell: (info) => info.getValue(),
                meta: {
                    width: '60%',
                },
            },
            {
                id: 'isChecked',
                header: t('Is Checked'),
                cell: ({ row }) => (
                    <div className='text-center'>
                        {row.original.checked === true ? (
                            <BsCheck2Circle
                                color='#287d3c'
                                size='16'
                            />
                        ) : (
                            <BsXCircle color='#da1414' />
                        )}
                    </div>
                ),
                meta: {
                    width: '10%',
                },
            },
            {
                id: 'licenseType',
                header: t('License Type'),
                cell: ({ row }) => <>{row.original.licenseType ?? '--'}</>,
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
    const [licenseData, setLicenseData] = useState<LicenseDetail[]>(() => [])
    const memoizedData = useMemo(
        () => licenseData,
        [
            licenseData,
        ],
    )
    const [showProcessing, setShowProcessing] = useState(false)

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal

        const timeLimit = licenseData.length !== 0 ? 700 : 0
        const timeout = setTimeout(() => {
            setShowProcessing(true)
        }, timeLimit)

        void (async () => {
            try {
                if (CommonUtils.isNullOrUndefined(session)) return signOut()

                const queryUrl = CommonUtils.createUrlWithParams(
                    `licenses`,
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
                const response = await ApiUtils.GET(queryUrl, session.user.access_token, signal)
                if (response.status !== StatusCodes.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new Error(err.message)
                }

                const data = (await response.json()) as Embedded<LicenseDetail, 'sw360:licenses'>
                setPaginationMeta(data.page)
                setNumberLicense(data.page?.totalElements ?? 0)
                setLicenseData(
                    CommonUtils.isNullOrUndefined(data['_embedded']['sw360:licenses'])
                        ? []
                        : data['_embedded']['sw360:licenses'],
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
    })

    const headerButtons = {
        'Add License': {
            link: '/licenses/add',
            type: 'primary',
            name: t('Add License'),
        },
        'Export Spreadsheet': {
            link: '/licenses',
            onClick: handleExportLicense,
            type: 'secondary',
            name: t('Export Spreadsheet'),
        },
    }

    return (
        <div className='container page-content'>
            <div className='row'>
                <div className='col-2 sidebar'>
                    <QuickFilter
                        id='licensefilter'
                        title={t('Quick Filter')}
                        searchFunction={doSearch}
                    />
                </div>
                <div className='col col-10'>
                    <PageButtonHeader
                        buttons={headerButtons}
                        title={`${t('Licenses')} (${numberLicense})`}
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
    )
}
// export default LicensePage
// Pass notAllowedUserGroups to AccessControl to restrict access
export default AccessControl(LicensePage, [
    UserGroupType.SECURITY_USER,
])
