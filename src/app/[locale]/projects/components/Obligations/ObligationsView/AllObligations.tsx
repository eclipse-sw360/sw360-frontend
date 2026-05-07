// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ColumnDef, getCoreRowModel, getExpandedRowModel, useReactTable } from '@tanstack/react-table'
import { StatusCodes } from 'http-status-codes'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { PaddedCell, PageSizeSelector, SW360Table, TableFooter } from 'next-sw360'
import { JSX, useEffect, useMemo, useState } from 'react'
import { Spinner } from 'react-bootstrap'
import {
    Embedded,
    ErrorDetails,
    NestedRows,
    ObligationData,
    ObligationEntry,
    ObligationResponse,
    PageableQueryParam,
    PaginationMeta,
    Project,
} from '@/object-types'
import { ApiError, ApiUtils, CommonUtils } from '@/utils/index'
import { ExpandableList } from './ExpandableComponents'

const Capitalize = (text: string) =>
    text.split('_').reduce((s, c) => s + ' ' + (c.charAt(0) + c.substring(1).toLocaleLowerCase()), '')

type LinkedProjects = Embedded<Project, 'sw360:projects'>

interface ProjectInfo {
    id: string
    name: string
    version: string
}

interface ProjectObligationData extends ObligationData {
    projectHierarchy: ProjectInfo[]
}

export default function LicenseObligation({ projectId }: { projectId: string }): JSX.Element {
    const t = useTranslations('default')
    const session = useSession()

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            void signOut()
        }
    }, [
        session,
    ])

    const columns = useMemo<
        ColumnDef<
            NestedRows<
                [
                    string,
                    ProjectObligationData,
                ]
            >
        >[]
    >(
        () => [
            {
                id: 'expand',
                cell: ({ row }) => {
                    if (row.depth > 0) {
                        return <p>{row.original.node[1].text ?? ''}</p>
                    } else {
                        return <PaddedCell row={row}></PaddedCell>
                    }
                },
                meta: {
                    width: '3%',
                },
            },
            {
                id: 'title',
                header: t('License Obligation'),
                cell: ({ row }) => (
                    <div className='text-center'>
                        <span>{row.original.node[0]}</span>
                    </div>
                ),
                meta: {
                    width: '20%',
                },
            },
            {
                id: 'licenses',
                header: t('Licenses'),
                cell: ({ row }) => {
                    const licenseIds = row.original.node[1].licenseIds ?? []
                    return (
                        <div className='text-center'>
                            {
                                <ul className='px-0'>
                                    {licenseIds.map((licenseId: string, index: number) => {
                                        return (
                                            <li
                                                key={licenseId}
                                                style={{
                                                    display: 'inline',
                                                }}
                                            >
                                                <Link
                                                    href={`/licenses/${licenseId}`}
                                                    className='text-link'
                                                >
                                                    {licenseId}
                                                </Link>
                                                {index >= licenseIds.length - 1 ? '' : ', '}{' '}
                                            </li>
                                        )
                                    })}
                                </ul>
                            }
                        </div>
                    )
                },
                meta: {
                    width: '13%',
                },
            },
            {
                id: 'releases',
                header: t('Releases'),
                cell: ({ row }) => {
                    const releases = row.original.node[1].releases ?? []
                    return (
                        <>
                            {Array.isArray(releases) && releases.length > 0 ? (
                                <ExpandableList
                                    releases={releases}
                                    previewString={releases
                                        .map((r) => `${r.name} ${r.version}`)
                                        .join(', ')
                                        .substring(0, 10)}
                                    commonReleases={[]}
                                />
                            ) : null}
                        </>
                    )
                },
                meta: {
                    width: '13%',
                },
            },
            {
                id: 'status',
                header: t('Status'),
                cell: ({ row }) => <>{Capitalize(row.original.node[1].status ?? '')}</>,
                meta: {
                    width: '10%',
                },
            },
            {
                id: 'type',
                header: t('Type'),
                cell: ({ row }) => <>{Capitalize(row.original.node[1].obligationType ?? '')}</>,
                meta: {
                    width: '10%',
                },
            },
            {
                id: 'projectName',
                header: t('Project Path'),
                cell: ({ row }) => (
                    <>
                        {row.original.node[1].projectHierarchy
                            .map((p) => `${p.name}${p.version ? ` (${p.version})` : ''}`)
                            .join('->')}
                    </>
                ),
                meta: {
                    width: '15%',
                },
            },
            {
                id: 'id',
                header: t('Id'),
                cell: ({ row }) => <></>,
                meta: {
                    width: '5%',
                },
            },
            {
                id: 'comment',
                header: t('Comment'),
                cell: ({ row }) => <>{row.original.node[1].comment ?? ''}</>,
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
    const [obligationData, setObligationData] = useState<ObligationEntry | undefined>()
    const memoizedObligationData = useMemo(
        () => obligationData,
        [
            obligationData,
        ],
    )
    const [isLoadingObligations, setIsLoadingObligations] = useState(false)

    useEffect(() => {
        if (session.status === 'loading') return
        const controller = new AbortController()
        const signal = controller.signal

        const timeLimit = !CommonUtils.isNullOrUndefined(obligationData) ? 700 : 0
        const timeout = setTimeout(() => {
            setIsLoadingObligations(true)
        }, timeLimit)

        void (async () => {
            try {
                if (CommonUtils.isNullOrUndefined(session.data)) return signOut()
                const queryUrl = CommonUtils.createUrlWithParams(
                    `projects/${projectId}/licenseObligations`,
                    Object.fromEntries(
                        Object.entries({
                            ...pageableQueryParam,
                            includeSubprojectObligations: true,
                        }).map(([key, value]) => [
                            key,
                            String(value),
                        ]),
                    ),
                )
                const response = await ApiUtils.GET(queryUrl, session.data.user.access_token, signal)
                if (response.status !== StatusCodes.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new ApiError(err.message, {
                        status: response.status,
                    })
                }

                const data = (await response.json()) as ObligationResponse
                setPaginationMeta(data.page)
                setObligationData(data.obligations)
            } catch (error) {
                ApiUtils.reportError(error)
            } finally {
                clearTimeout(timeout)
                setIsLoadingObligations(false)
            }
        })()

        return () => controller.abort()
    }, [
        pageableQueryParam,
        session,
    ])

    const [linkedProjects, setLinkedProjects] = useState<Project[] | undefined>(() => undefined)
    const memoizedLinkedProjects = useMemo(
        () => linkedProjects,
        [
            linkedProjects,
        ],
    )
    const [isLoadingLinkedProjects, setIsLoadingLinkedProjects] = useState(false)

    useEffect(() => {
        if (session.status !== 'authenticated') return
        const controller = new AbortController()
        const signal = controller.signal

        const timeLimit =
            (!CommonUtils.isNullEmptyOrUndefinedArray(linkedProjects) && linkedProjects.length) !== 0 ? 700 : 0
        const timeout = setTimeout(() => {
            setIsLoadingLinkedProjects(true)
        }, timeLimit)

        void (async () => {
            try {
                const response = await ApiUtils.GET(
                    `projects/${projectId}/linkedProjects?transitive=true`,
                    session.data.user.access_token,
                    signal,
                )

                if (response.status !== StatusCodes.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new ApiError(err.message, {
                        status: response.status,
                    })
                }

                const linkedProjectsData = (await response.json()) as LinkedProjects
                setLinkedProjects(linkedProjectsData['_embedded']['sw360:projects'])
            } catch (error) {
                ApiUtils.reportError(error)
            } finally {
                clearTimeout(timeout)
                setIsLoadingLinkedProjects(false)
            }
        })()

        return () => controller.abort()
    }, [
        session,
        projectId,
        session,
    ])

    const getLinkedProject = (pid: string, p: ProjectInfo[], projects: Project[]) => {
        if (p.length !== 0) return
        for (const proj of projects) {
            if (proj.id === pid) {
                p.push(proj as ProjectInfo)
                break
            }
            getLinkedProject(pid, p, proj['_embedded']?.['sw360:linkedProjects'] ?? [])
        }
    }

    const [tableData, setTableData] = useState<
        NestedRows<
            [
                string,
                ProjectObligationData,
            ]
        >[]
    >(() => [])
    const memoizedTableData = useMemo(
        () => tableData,
        [
            tableData,
        ],
    )
    const [isLoadingTableData, setIsLoadingTableData] = useState(false)

    useEffect(() => {
        if (
            CommonUtils.isNullEmptyOrUndefinedArray(memoizedLinkedProjects) ||
            CommonUtils.isNullOrUndefined(memoizedObligationData)
        )
            return
        setIsLoadingTableData(true)
        const tableData: NestedRows<
            [
                string,
                ProjectObligationData,
            ]
        >[] = []
        for (const o in memoizedObligationData) {
            const projectHierarchyIds = o.split(':')
            const topic = projectHierarchyIds.pop() as string

            const projectHierarchy: ProjectInfo[] = []
            for (const pid of projectHierarchyIds) {
                const p: ProjectInfo[] = []
                getLinkedProject(pid, p, memoizedLinkedProjects ?? [])
                if (p) projectHierarchy.push(p[0])
            }
            tableData.push({
                node: [
                    topic,
                    {
                        ...memoizedObligationData[o],
                        projectHierarchy,
                    },
                ],
                children: [
                    {
                        node: [
                            topic,
                            {
                                ...memoizedObligationData[o],
                                projectHierarchy,
                            },
                        ],
                    },
                ],
            } as NestedRows<
                [
                    string,
                    ProjectObligationData,
                ]
            >)
        }
        setTableData(tableData)
        setIsLoadingTableData(false)
    }, [
        memoizedLinkedProjects,
        memoizedObligationData,
    ])

    const table = useReactTable({
        data: memoizedTableData,
        columns: columns,
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

        // expand config
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

        meta: {
            rowHeightConstant: true,
        },
    })

    table.getRowModel().rows.forEach((row) => {
        if (row.depth === 1) {
            row.meta = {
                isFullSpanRow: true,
            }
        }
    })

    return (
        <div className='mb-3'>
            {pageableQueryParam && paginationMeta && table ? (
                <>
                    <PageSizeSelector
                        pageableQueryParam={pageableQueryParam}
                        setPageableQueryParam={setPageableQueryParam}
                    />
                    <SW360Table
                        table={table}
                        showProcessing={isLoadingTableData || isLoadingLinkedProjects || isLoadingObligations}
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
