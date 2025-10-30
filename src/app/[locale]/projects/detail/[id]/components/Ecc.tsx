// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { StatusCodes } from 'http-status-codes'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { PageSizeSelector, SW360Table, TableFooter } from 'next-sw360'
import { type JSX, useEffect, useMemo, useState } from 'react'
import { Button, Spinner } from 'react-bootstrap'
import { AccessControl } from '@/components/AccessControl/AccessControl'
import { ECCInterface, Embedded, ErrorDetails, PageableQueryParam, PaginationMeta, UserGroupType } from '@/object-types'
import DownloadService from '@/services/download.service'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'

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
    const session = useSession()

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            void signOut()
        }
    }, [
        session,
    ])

    const columns = useMemo<ColumnDef<ECCInterface>[]>(
        () => [
            {
                id: 'status',
                header: t('Status'),
                cell: ({ row }) => <>{Capitalize(row.original.eccInformation.eccStatus)}</>,
                meta: {
                    width: '10%',
                },
            },
            {
                id: 'releaseName',
                header: t('Release name'),
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
                id: 'version',
                header: t('Release version'),
                accessorKey: 'version',
                cell: (info) => info.getValue(),
                enableSorting: false,
                meta: {
                    width: '10%',
                },
            },
            {
                id: 'creatorGroup',
                header: t('Creator Group'),
                cell: ({ row }) => <>{row.original.eccInformation.creatorGroup}</>,
                meta: {
                    width: '10%',
                },
            },
            {
                id: 'eccAssessor',
                header: t('ECC Assessor'),
                cell: ({ row }) => <>{row.original.eccInformation.assessorContactPerson}</>,
                meta: {
                    width: '20%',
                },
            },
            {
                id: 'eccAssessorGroup',
                header: t('ECC Assessor Group'),
                cell: ({ row }) => <>{row.original.eccInformation.assessorDepartment}</>,
                meta: {
                    width: '20%',
                },
            },
            {
                id: 'ecc.eccAssessmentDate',
                header: t('ECC Assessment Date'),
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
        if (session.status === 'loading') return
        const controller = new AbortController()
        const signal = controller.signal

        const timeLimit = eccData.length !== 0 ? 700 : 0
        const timeout = setTimeout(() => {
            setShowProcessing(true)
        }, timeLimit)

        void (async () => {
            try {
                if (CommonUtils.isNullOrUndefined(session.data)) return signOut()
                const queryUrl = CommonUtils.createUrlWithParams(
                    `projects/${projectId}/releases/ecc`,
                    Object.fromEntries(
                        Object.entries({
                            ...pageableQueryParam,
                            transitive: true,
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

                const data = (await response.json()) as EmbeddedProjectReleaseEcc
                setPaginationMeta(data.page)
                setEccData(
                    CommonUtils.isNullOrUndefined(data['_embedded']['sw360:releases'])
                        ? []
                        : data['_embedded']['sw360:releases'],
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

    const exportSpreadsheet = () => {
        try {
            if (CommonUtils.isNullOrUndefined(session)) return signOut()
            const currentDate = new Date().toISOString().split('T')[0]
            const eccSpreadSheetName = `releases-${projectName}-${projectVersion}-${currentDate}.xlsx`
            const url = `reports?projectId=${projectId}&module=projectReleaseSpreadSheetWithEcc&mimetype=xlsx`
            void DownloadService.download(url, session.data, eccSpreadSheetName)
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <>
            <Button
                variant='secondary'
                className='col-auto'
                onClick={() => void exportSpreadsheet()}
            >
                {t('Export Spreadsheet')}
            </Button>
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
        </>
    )
}

// Pass notAllowedUserGroups to AccessControl to restrict access
export default AccessControl(EccDetails, [
    UserGroupType.SECURITY_USER,
])
