// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import {
    ColumnDef,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from '@tanstack/react-table'
import { StatusCodes } from 'http-status-codes'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ClientSidePageSizeSelector, ClientSideTableFooter, SW360Table, TableSearch } from 'next-sw360'
import { type JSX, KeyboardEvent, useEffect, useMemo, useState } from 'react'
import { Button, Spinner } from 'react-bootstrap'
import { AccessControl } from '@/components/AccessControl/AccessControl'
import { ECCInterface, Embedded, ErrorDetails, UserGroupType } from '@/object-types'
import DownloadService from '@/services/download.service'
import { ApiError, CommonUtils } from '@/utils'
import ApiUtils from '@/utils/api/authenticatedApi.util'

type EmbeddedProjectReleaseEcc = Embedded<ECCInterface, 'sw360:releases'>

interface Props {
    projectId: string
    projectName?: string
    projectVersion?: string
}

const Capitalize = (text: string) =>
    text.split('_').reduce((s, c) => s + ' ' + (c.charAt(0) + c.substring(1).toLocaleLowerCase()), '')

function EccDetails({ projectId, projectName, projectVersion }: Props): JSX.Element {
    const t = useTranslations('default')
    const [sorting, setSorting] = useState<SortingState>([])
    const [globalFilter, setGlobalFilter] = useState('')
    const [eccData, setEccData] = useState<ECCInterface[]>(() => [])
    const [showProcessing, setShowProcessing] = useState(false)

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
                    const { name, version, id } = row.original
                    return (
                        <Link
                            href={`/components/releases/detail/${id}`}
                            className='text-link'
                        >
                            {`${name} (${version})`}
                        </Link>
                    )
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
                    width: '20%',
                },
            },
            {
                id: 'eccAssessorGroup',
                header: t('ECC Assessor Group'),
                accessorFn: (row) => row.eccInformation?.assessorDepartment ?? '',
                cell: ({ row }) => <>{row.original.eccInformation.assessorDepartment}</>,
                meta: {
                    width: '20%',
                },
            },
            {
                id: 'ecc.eccAssessmentDate',
                header: t('ECC Assessment Date'),
                accessorFn: (row) => row.eccInformation?.assessmentDate ?? '',
                cell: ({ row }) => <>{row.original.eccInformation.assessmentDate}</>,
                meta: {
                    width: '10%',
                },
            },
        ],
        [
            t,
        ],
    )
    const memoizedData = useMemo(
        () => eccData,
        [
            eccData,
        ],
    )

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal

        const timeLimit = memoizedData.length !== 0 ? 700 : 0
        const timeout = setTimeout(() => {
            setShowProcessing(true)
        }, timeLimit)

        void (async () => {
            try {
                const queryUrl = CommonUtils.createUrlWithParams(
                    `projects/${projectId}/releases/ecc`,
                    Object.fromEntries(
                        Object.entries({
                            transitive: true,
                        }).map(([key, value]) => [
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

                const data = (await response.json()) as EmbeddedProjectReleaseEcc
                const rows = CommonUtils.isNullOrUndefined(data['_embedded']['sw360:releases'])
                    ? []
                    : data['_embedded']['sw360:releases']
                setEccData(rows)
            } catch (error) {
                ApiUtils.reportError(error)
            } finally {
                clearTimeout(timeout)
                setShowProcessing(false)
            }
        })()

        return () => controller.abort()
    }, [
        memoizedData.length,
        projectId,
    ])

    const table = useReactTable({
        data: memoizedData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            globalFilter,
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: (row, _columnId, filterValue) => {
            const normalizedFilter = String(filterValue ?? '')
                .trim()
                .toLocaleLowerCase()
            if (normalizedFilter.length === 0) {
                return true
            }

            const searchFields = [
                row.original.name,
                row.original.version,
                row.original.eccInformation?.eccn,
                row.original.eccInformation?.eccStatus,
                row.original.eccInformation?.assessorContactPerson,
                row.original.eccInformation?.assessorDepartment,
                row.original.eccInformation?.creatorGroup,
                row.original.eccInformation?.assessmentDate,
            ]

            return searchFields.some((field) =>
                String(field ?? '')
                    .toLocaleLowerCase()
                    .includes(normalizedFilter),
            )
        },
        meta: {
            rowHeightConstant: true,
        },
    })

    const searchFunction = (event: KeyboardEvent<HTMLInputElement>) => {
        table.setPageIndex(0)
        setGlobalFilter(event.currentTarget.value)
    }

    const exportSpreadsheet = () => {
        const currentDate = new Date().toISOString().split('T')[0]
        const eccSpreadSheetName = `releases-${projectName}-${projectVersion}-${currentDate}.xlsx`
        const url = `reports?projectId=${projectId}&module=projectReleaseSpreadSheetWithEcc&mimetype=xlsx`
        void DownloadService.download(url, eccSpreadSheetName).catch(ApiUtils.reportError)
    }

    return (
        <>
            <div className='d-flex flex-wrap justify-content-between align-items-center gap-3'>
                <Button
                    variant='secondary'
                    className='col-auto'
                    onClick={() => void exportSpreadsheet()}
                >
                    {t('Export Spreadsheet')}
                </Button>
                <TableSearch searchFunction={searchFunction} />
            </div>
            <div className='mb-3'>
                {table ? (
                    <>
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
        </>
    )
}

// Pass notAllowedUserGroups to AccessControl to restrict access
export default AccessControl(EccDetails, [
    UserGroupType.SECURITY_USER,
])
