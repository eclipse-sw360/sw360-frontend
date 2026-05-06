// Copyright (C) Anushree Bondia, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ColumnDef, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table'
import { StatusCodes } from 'http-status-codes'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { type JSX, useEffect, useMemo, useState } from 'react'
import { Spinner } from 'react-bootstrap'

import { ClientSidePageSizeSelector, ClientSideTableFooter, SW360Table } from '@/components/sw360'
import { Embedded, ObligationData, ObligationResponse, Project } from '@/object-types'
import { ApiUtils } from '@/utils'

interface ProjectPathInfo {
    id: string
    projectPath: string
}

interface AggregatedObligation extends ObligationData {
    projectId: string
    obligationTitle: string
    projectPath: string
}

type LinkedProjects = Embedded<Project, 'sw360:projects'>

interface Props {
    projectId: string
}

const Capitalize = (text: string) =>
    text
        .split('_')
        .map((c) => c.charAt(0).toUpperCase() + c.substring(1).toLowerCase())
        .join(' ')

const extractAllProjects = (projects: Project[], parentPath: string[], allProjectsFlat: ProjectPathInfo[]) => {
    for (const p of projects) {
        const id = p.id || p._links?.self.href.split('/').at(-1) || ''
        const version = p.version ? ` (${p.version})` : ''
        const thisPath = [
            ...parentPath,
            p.name + version,
        ]
        allProjectsFlat.push({
            id,
            projectPath: thisPath.join(' -> '),
        })
        const linkedProjects = p._embedded?.['sw360:linkedProjects']
        if (linkedProjects && linkedProjects.length > 0) {
            extractAllProjects(linkedProjects, thisPath, allProjectsFlat)
        }
    }
}

export default function AllObligationsView({ projectId }: Props): JSX.Element {
    const t = useTranslations('default')
    const session = useSession()
    const [showProcessing, setShowProcessing] = useState(false)
    const [aggregatedObligations, setAggregatedObligations] = useState<AggregatedObligation[]>([])

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            void signOut()
        }
    }, [
        session,
    ])

    const columns = useMemo<ColumnDef<AggregatedObligation>[]>(
        () => [
            {
                id: 'project',
                header: t('Project'),
                cell: ({ row }) => <span>{row.original.projectPath}</span>,
                meta: {
                    width: '20%',
                },
            },
            {
                id: 'title',
                header: t('Obligation'),
                accessorKey: 'obligationTitle',
                meta: {
                    width: '25%',
                },
            },
            {
                id: 'status',
                header: t('Status'),
                cell: ({ row }) => <>{Capitalize(row.original.status ?? '')}</>,
                meta: {
                    width: '15%',
                },
            },
            {
                id: 'type',
                header: t('Type'),
                cell: ({ row }) => <>{Capitalize(row.original.obligationType ?? '')}</>,
                meta: {
                    width: '10%',
                },
            },
            {
                id: 'level',
                header: t('Level'), // translation key: Level
                cell: ({ row }) => <>{Capitalize(row.original.obligationLevel ?? '')}</>,
                meta: {
                    width: '10%',
                },
            },
            {
                id: 'id',
                header: t('Id'), // translation key: Id
                accessorKey: 'id',
                meta: {
                    width: '10%',
                },
            },
            {
                id: 'licenses',
                header: t('Licenses'),
                cell: ({ row }) => (
                    <span>
                        {row.original.licenseIds && row.original.licenseIds.length > 0
                            ? row.original.licenseIds.join(', ')
                            : '-'}
                    </span>
                ),
                meta: {
                    width: '15%',
                },
            },
            {
                id: 'releases',
                header: t('Releases'),
                cell: ({ row }) => (
                    <span>
                        {row.original.releases && row.original.releases.length > 0
                            ? row.original.releases.map((r) => `${r.name} ${r.version}`).join(', ')
                            : '-'}
                    </span>
                ),
                meta: {
                    width: '15%',
                },
            },
            {
                id: 'comment',
                header: t('Comment'),
                accessorKey: 'comment',
                meta: {
                    width: '20%',
                },
            },
        ],
        [
            t,
        ],
    )

    const table = useReactTable({
        data: aggregatedObligations,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        meta: {
            rowHeightConstant: true,
        },
    })

    useEffect(() => {
        if (session.status !== 'authenticated') return
        const controller = new AbortController()
        const signal = controller.signal

        void (async () => {
            setShowProcessing(true)
            try {
                // 1. Fetch current project to get its name/version
                const rootProjectResponse = await ApiUtils.GET(
                    `projects/${projectId}`,
                    session.data.user.access_token,
                    signal,
                )
                if (rootProjectResponse.status !== StatusCodes.OK) {
                    throw await rootProjectResponse.json()
                }
                const rootProject = (await rootProjectResponse.json()) as Project

                // 2. Fetch all linked projects (transitive) to get the full tree structure
                const linkedProjectsResponse = await ApiUtils.GET(
                    `projects/${projectId}/linkedProjects?transitive=true`,
                    session.data.user.access_token,
                    signal,
                )
                if (linkedProjectsResponse.status !== StatusCodes.OK) {
                    throw await linkedProjectsResponse.json()
                }
                const linkedProjectsData = (await linkedProjectsResponse.json()) as LinkedProjects

                // Extract all projects recursively from the tree structure, building projectPath as we go
                const allProjectsFlat: ProjectPathInfo[] = []
                const rootVersion = rootProject.version ? ` (${rootProject.version})` : ''
                extractAllProjects(
                    [
                        rootProject,
                    ],
                    [],
                    allProjectsFlat,
                )
                const linkedProjects = linkedProjectsData._embedded?.['sw360:projects'] ?? []
                extractAllProjects(
                    linkedProjects,
                    [
                        rootProject.name + rootVersion,
                    ],
                    allProjectsFlat,
                )

                // 3. Fetch obligations for each project
                const allAggregated: AggregatedObligation[] = []

                // Map to store project obligations for "parent check" if needed
                const projectObligationsMap: Record<string, Record<string, ObligationData>> = {}

                await Promise.all(
                    allProjectsFlat.map(async ({ id }) => {
                        if (!id) return
                        const endpoint = `projects/${id}/licenseObligations`
                        projectObligationsMap[id] = {}
                        try {
                            const res = await ApiUtils.GET(endpoint, session.data.user.access_token, signal)
                            if (res.status === StatusCodes.OK) {
                                const data = (await res.json()) as ObligationResponse
                                if (data.obligations) {
                                    Object.entries(data.obligations).forEach(([title, detail]) => {
                                        projectObligationsMap[id][title] = {
                                            ...detail,
                                        }
                                    })
                                }
                            } else {
                                throw new Error(`Failed to fetch obligations for project ${id}`)
                            }
                        } catch (e) {
                            ApiUtils.reportError(e)
                        }
                    }),
                )

                // 4. Filter and build final list
                const fulfilledStatuses = [
                    'ACKNOWLEDGED_OR_FULFILLED',
                    'FULFILLED_AND_PARENT_MUST_ALSO_FULFILL',
                ]

                for (const { id, projectPath } of allProjectsFlat) {
                    const obs = projectObligationsMap[id] || {}
                    Object.entries(obs).forEach(([title, detail]) => {
                        if (detail.status && fulfilledStatuses.includes(detail.status)) {
                            let parentFulfillmentOk = true
                            if (detail.status === 'FULFILLED_AND_PARENT_MUST_ALSO_FULFILL') {
                                const rootObs = projectObligationsMap[projectId] || {}
                                const rootOb = rootObs[title]
                                if (!rootOb || !fulfilledStatuses.includes(rootOb.status || '')) {
                                    parentFulfillmentOk = false
                                }
                            }
                            if (parentFulfillmentOk) {
                                allAggregated.push({
                                    ...detail,
                                    projectId: id,
                                    obligationTitle: title,
                                    projectPath,
                                })
                            }
                        }
                    })
                }

                setAggregatedObligations(allAggregated)
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') return
                ApiUtils.reportError(error)
            } finally {
                setShowProcessing(false)
            }
        })()

        return () => controller.abort()
    }, [
        projectId,
        session,
    ])

    return (
        <div className='mb-3'>
            {showProcessing ? (
                <div className='col-12 mt-1 text-center'>
                    <Spinner className='spinner' />
                </div>
            ) : (
                <>
                    <ClientSidePageSizeSelector table={table} />
                    <SW360Table
                        table={table}
                        showProcessing={showProcessing}
                    />
                    <ClientSideTableFooter table={table} />
                </>
            )}
        </div>
    )
}
