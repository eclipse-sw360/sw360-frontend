// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ColumnDef, getCoreRowModel, getSortedRowModel, SortingState, useReactTable } from '@tanstack/react-table'
import { StatusCodes } from 'http-status-codes'
import { useTranslations } from 'next-intl'
import { PageSizeSelector, QuickFilter, SW360Table, TableFooter } from 'next-sw360'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import { Button, Spinner } from 'react-bootstrap'
import { BsPrinter } from 'react-icons/bs'
import { AccessControl } from '@/components/AccessControl/AccessControl'
import {
    ECCInterface,
    type Embedded,
    ErrorDetails,
    PageableQueryParam,
    PaginationMeta,
    UserGroupType,
} from '@/object-types'
import { ApiError, CommonUtils } from '@/utils'
import ApiUtils from '@/utils/api/authenticatedApi.util'

type EmbeddedECC = Embedded<ECCInterface, 'sw360:releases'>

const Capitalize = (text: string) =>
    text.split('_').reduce((s, c) => s + ' ' + (c.charAt(0) + c.substring(1).toLocaleLowerCase()), '')

function ECC(): ReactNode {
    const t = useTranslations('default')
    const [sorting, setSorting] = useState<SortingState>([])

    const escapeHtml = (value: string): string =>
        value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')

    const columns = useMemo<ColumnDef<ECCInterface>[]>(
        () => [
            {
                id: 'status',
                header: t('Status'),
                accessorFn: (row) => row.eccInformation?.eccStatus ?? '',
                cell: ({ row }) => <>{Capitalize(row.original.eccInformation.eccStatus)}</>,
                meta: {
                    width: '10%',
                },
            },
            {
                id: 'releaseName',
                header: t('Release name'),
                accessorFn: (row) => row.name ?? '',
                cell: ({ row }) => {
                    const { name, version } = row.original
                    return <div>{`${name} (${version})`}</div>
                },
                meta: {
                    width: '20%',
                },
            },
            {
                id: 'eccn',
                header: t('ECCN'),
                accessorFn: (row) => row.eccInformation?.eccn ?? '',
                cell: ({ row }) => <>{row.original.eccInformation?.eccn ?? ''}</>,
                meta: {
                    width: '10%',
                },
            },
            {
                id: 'version',
                header: t('Release version'),
                accessorKey: 'version',
                cell: (info) => info.getValue(),
                meta: {
                    width: '10%',
                },
            },
            {
                id: 'creatorGroup',
                header: t('Creator Group'),
                accessorFn: (row) => row.eccInformation?.creatorGroup ?? '',
                cell: ({ row }) => <>{row.original.eccInformation.creatorGroup}</>,
                meta: {
                    width: '10%',
                },
            },
            {
                id: 'eccAssessor',
                header: t('ECC Assessor'),
                accessorFn: (row) => row.eccInformation?.assessorContactPerson ?? '',
                cell: ({ row }) => <>{row.original.eccInformation.assessorContactPerson}</>,
                meta: {
                    width: '12%',
                },
            },
            {
                id: 'eccAssessorGroup',
                header: t('ECC Assessor Group'),
                accessorFn: (row) => row.eccInformation?.assessorDepartment ?? '',
                cell: ({ row }) => <>{row.original.eccInformation.assessorDepartment}</>,
                meta: {
                    width: '18%',
                },
            },
            {
                id: 'ecc.eccAssessmentDate',
                header: t('ECC Assessment Date'),
                accessorFn: (row) => row.eccInformation?.assessmentDate ?? '',
                cell: ({ row }) => <>{row.original.eccInformation.assessmentDate}</>,
                meta: {
                    width: '16%',
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
    const [eccData, setEccData] = useState<ECCInterface[]>(() => [])
    const memoizedData = useMemo(
        () => eccData,
        [
            eccData,
        ],
    )
    const [showProcessing, setShowProcessing] = useState(false)

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal

        const timeLimit = eccData.length !== 0 ? 700 : 0
        const timeout = setTimeout(() => {
            setShowProcessing(true)
        }, timeLimit)

        void (async () => {
            try {
                const queryUrl = CommonUtils.createUrlWithParams(
                    `ecc`,
                    Object.fromEntries(
                        Object.entries(pageableQueryParam).map(([key, value]) => [
                            key,
                            String(value),
                        ]),
                    ),
                )
                const response = await ApiUtils.GET(queryUrl, signal)
                if (response.status !== StatusCodes.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new ApiError(err.message, {
                        status: response.status,
                    })
                }

                const data = (await response.json()) as EmbeddedECC
                setPaginationMeta(data.page)
                setEccData(
                    CommonUtils.isNullOrUndefined(data['_embedded']['sw360:releases'])
                        ? []
                        : data['_embedded']['sw360:releases'],
                )
            } catch (error) {
                ApiUtils.reportError(error)
            } finally {
                clearTimeout(timeout)
                setShowProcessing(false)
            }
        })()

        return () => controller.abort()
    }, [
        pageableQueryParam,
    ])

    const table = useReactTable({
        data: memoizedData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),

        // table state config
        state: {
            sorting,
            pagination: {
                pageIndex: pageableQueryParam.page,
                pageSize: pageableQueryParam.page_entries,
            },
        },
        onSortingChange: setSorting,

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

    const openCurrentPageEccDetails = () => {
        const rows = table.getRowModel().rows

        const printWindow = window.open('', '_blank', 'width=1200,height=800')
        if (!printWindow) {
            return
        }

        const tableRows = rows
            .map((row) => {
                const record = row.original
                const status = Capitalize(record.eccInformation?.eccStatus ?? '')
                const releaseName = `${record.name ?? ''} (${record.version ?? ''})`
                const eccn = record.eccInformation?.eccn ?? ''
                const releaseVersion = record.version ?? ''
                const creatorGroup = record.eccInformation?.creatorGroup ?? ''
                const eccAssessor = record.eccInformation?.assessorContactPerson ?? ''
                const eccAssessorGroup = record.eccInformation?.assessorDepartment ?? ''
                const assessmentDate = record.eccInformation?.assessmentDate ?? ''

                return `<tr>
                    <td>${escapeHtml(status)}</td>
                    <td>${escapeHtml(releaseName)}</td>
                    <td>${escapeHtml(eccn)}</td>
                    <td>${escapeHtml(releaseVersion)}</td>
                    <td>${escapeHtml(creatorGroup)}</td>
                    <td>${escapeHtml(eccAssessor)}</td>
                    <td>${escapeHtml(eccAssessorGroup)}</td>
                    <td>${escapeHtml(assessmentDate)}</td>
                </tr>`
            })
            .join('')

        const bodyContent =
            tableRows.length > 0
                ? `<table>
        <thead>
            <tr>
                <th>${escapeHtml(t('Status'))}</th>
                <th>${escapeHtml(t('Release name'))}</th>
                <th>${escapeHtml(t('ECCN'))}</th>
                <th>${escapeHtml(t('Release version'))}</th>
                <th>${escapeHtml(t('Creator Group'))}</th>
                <th>${escapeHtml(t('ECC Assessor'))}</th>
                <th>${escapeHtml(t('ECC Assessor Group'))}</th>
                <th>${escapeHtml(t('ECC Assessment Date'))}</th>
            </tr>
        </thead>
        <tbody>${tableRows}</tbody>
    </table>`
                : `<p>No ECC rows available for the current page.</p>`

        printWindow.document.write(`<!doctype html>
<html>
<head>
    <meta charset="utf-8" />
    <title>${escapeHtml(t('ECC Overview'))}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 24px; }
        h1 { font-size: 18px; margin-bottom: 12px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; font-size: 12px; }
        th { background: #f3f4f6; }
    </style>
</head>
<body>
    <h1>${escapeHtml(t('ECC Overview'))}</h1>
    ${bodyContent}
</body>
</html>`)
        printWindow.document.close()
        printWindow.onload = () => {
            printWindow.focus()
            printWindow.print()
        }
    }

    return (
        <div className='container page-content'>
            <div className='row'>
                <div className='col-lg-2'>
                    <div className='row mb-3'>
                        <QuickFilter id='vunerabilities.quickSearch' />
                    </div>
                </div>
                <div className='col-lg-10'>
                    <div className='buttonheader-title ms-1'>{t('ECC Overview')}</div>
                    <div className='mb-3'>
                        {pageableQueryParam && table && paginationMeta ? (
                            <>
                                <div className='d-flex justify-content-between align-items-center mb-2'>
                                    <PageSizeSelector
                                        pageableQueryParam={pageableQueryParam}
                                        setPageableQueryParam={setPageableQueryParam}
                                    />
                                    <Button
                                        variant='outline-secondary'
                                        size='sm'
                                        className='py-1 px-2 ms-2'
                                        onClick={openCurrentPageEccDetails}
                                    >
                                        <BsPrinter className='me-1' />
                                        Print
                                    </Button>
                                </div>
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

// Pass notAllowedUserGroups to AccessControl to restrict access
export default AccessControl(ECC, [
    UserGroupType.SECURITY_USER,
])
