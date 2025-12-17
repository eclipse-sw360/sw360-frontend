// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import {
    ColumnDef,
    ColumnFiltersState,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
} from '@tanstack/react-table'
import { StatusCodes } from 'http-status-codes'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { ClientSidePageSizeSelector, ClientSideTableFooter, FilterComponent, SW360Table } from 'next-sw360'
import { type JSX, useEffect, useMemo, useState } from 'react'
import { OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap'
import { BsPencil } from 'react-icons/bs'
import { Embedded, ErrorDetails, FilterOption, LicenseClearing, Project, Release, TypedEntity } from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils'

const Capitalize = (text: string) =>
    text.split('_').reduce((s, c) => s + ' ' + (c.charAt(0) + c.substring(1).toLocaleLowerCase()), '')

type LinkedProjects = Embedded<Project, 'sw360:projects'>

interface ListViewProject extends Project {
    path?: string
}

interface ListViewRelease extends Release {
    releaseRelation?: string
    path?: string
}

type TypedProject = TypedEntity<ListViewProject, 'project'>

type TypedRelease = TypedEntity<ListViewRelease, 'release'>

const typeFilterOptions: FilterOption[] = [
    {
        tag: 'OSS',
        value: 'OSS',
    },
    {
        tag: 'Internal',
        value: 'INTERNAL',
    },
    {
        tag: 'COTS',
        value: 'COTS',
    },
    {
        tag: 'Freeware',
        value: 'FREESOFTWARE',
    },
    {
        tag: 'Inner Source',
        value: 'INNER_SOURCE',
    },
    {
        tag: 'Service',
        value: 'SERVICE',
    },
    {
        tag: 'Code Snippet',
        value: 'CODE_SNIPPET',
    },
    {
        tag: 'COTS Trusted Supplier',
        value: 'COTS_TRUESTED_SUPPLIER',
    },
]

const relationFilterOptions: FilterOption[] = [
    {
        tag: 'Contained',
        value: 'CONTAINED',
    },
    {
        tag: 'Related',
        value: 'REFERRED',
    },
    {
        tag: 'Unknown',
        value: 'UNKNOWN',
    },
    {
        tag: 'Dynamically Linked',
        value: 'DYNAMICALLY_LINKED',
    },
    {
        tag: 'Statically Linked',
        value: 'STATICALLY_LINKED',
    },
    {
        tag: 'Side By Side',
        value: 'SIDE_BY_SIDE',
    },
    {
        tag: 'Standalone',
        value: 'STANDALONE',
    },
    {
        tag: 'Internal Use',
        value: 'INTERNAL_USE',
    },
    {
        tag: 'Optional',
        value: 'OPTIONAL',
    },
    {
        tag: 'To Be Replaced',
        value: 'TO_BE_REPLACED',
    },
    {
        tag: 'Code Snippet',
        value: 'CODE_SNIPPET',
    },
]

const stateFilterOptions: FilterOption[] = [
    {
        tag: 'New',
        value: 'NEW_CLEARING',
    },
    {
        tag: 'Sent To Clearing Tool',
        value: 'SENT_TO_CLEARING_TOOL',
    },
    {
        tag: 'Under Clearing',
        value: 'UNDER_CLEARING',
    },
    {
        tag: 'Report Available',
        value: 'REPORT_AVAILABLE',
    },
    {
        tag: 'Report Approved',
        value: 'APPROVED',
    },
    {
        tag: 'Scan Available',
        value: 'SCAN_AVAILABLE',
    },
    {
        tag: 'Internal Use Scan Available',
        value: 'INTERNAL_USE_SCAN_AVAILABLE',
    },
]

const extractLinkedProjectsAndTheirLinkedReleases = (
    licenseClearing: Release[],
    linkedProjects: Project[] | undefined,
    finalData: (TypedProject | TypedRelease)[],
    path: string[],
    projectName: string,
    projectVersion: string,
) => {
    path.push(`${projectName} (${projectVersion})`)
    for (const p of linkedProjects ?? []) {
        path.push(`${p.name} (${p.version})`)
        finalData.push({
            type: 'project',
            entity: {
                ...p,
                path: path.join(' -> '),
            },
        })

        for (const l of p['linkedReleases'] ?? []) {
            const release: Release | undefined = licenseClearing.filter(
                (r: Release) => r.id === l.release.split('/').at(-1),
            )?.[0]
            if (release === undefined) continue
            finalData.push({
                type: 'release',
                entity: {
                    ...release,
                    path: path.join(' -> '),
                    releaseRelation: l.relation,
                },
            })
        }
        extractLinkedProjectsAndTheirLinkedReleases(
            licenseClearing,
            p['_embedded']?.['sw360:linkedProjects'],
            finalData,
            path,
            projectName,
            projectVersion,
        )
        path.pop()
    }
}

const extractLinkedReleases = (
    projectName: string,
    projectVersion: string,
    licenseClearing: LicenseClearing,
    finalData: (TypedProject | TypedRelease)[],
    path: string[],
) => {
    path.push(`${projectName} (${projectVersion})`)
    for (const l of licenseClearing['linkedReleases']) {
        const release = licenseClearing['_embedded']['sw360:release'].filter(
            (r: Release) => r.id === l.release.split('/').at(-1),
        )?.[0]
        finalData.push({
            type: 'release',
            entity: {
                ...release,
                path: path.join('->'),
                releaseRelation: l.relation,
            },
        })
    }
}

const tableIdToUrlParamMapper: Record<string, string> = {
    type: 'componentType',
    relation: 'releaseRelation',
    state: 'clearingState',
}

const buildTable = (
    licenseClearing: LicenseClearing,
    linkedProjects: Project[],
    projectName: string,
    projectVersion: string,
): (TypedProject | TypedRelease)[] => {
    const finalData: (TypedProject | TypedRelease)[] = []
    const path: string[] = []
    extractLinkedProjectsAndTheirLinkedReleases(
        licenseClearing['_embedded']['sw360:release'],
        linkedProjects,
        finalData,
        path,
        projectName,
        projectVersion,
    )

    path.splice(0, path.length)
    extractLinkedReleases(projectName, projectVersion, licenseClearing, finalData, path)

    return finalData
}

export default function ListView({
    projectId,
    projectName,
    projectVersion,
}: {
    projectId: string
    projectName: string
    projectVersion: string
}): JSX.Element {
    const t = useTranslations('default')
    const { status, data: session } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            void signOut()
        }
    }, [
        status,
    ])

    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [showFilter, setShowFilter] = useState<undefined | string>()

    const [showProcessing, setShowProcessing] = useState(false)

    const [linkedProjects, setLinkedProjects] = useState<Project[]>(() => [])
    const memoizedLinkedProjects = useMemo(
        () => linkedProjects,
        [
            linkedProjects,
        ],
    )

    const [licenseClearing, setLicenseClearing] = useState<LicenseClearing | undefined>()
    const memoizedLicenseClearing = useMemo(
        () => licenseClearing,
        [
            licenseClearing,
        ],
    )

    const [rowData, setRowData] = useState<(TypedProject | TypedRelease)[]>([])

    const columns = useMemo<ColumnDef<TypedProject | TypedRelease>[]>(
        () => [
            {
                id: 'name',
                header: t('Name'),
                cell: ({ row }) => {
                    const { id, name, version } = row.original.entity
                    const url =
                        row.original.type === 'project' ? `/projects/detail/${id}` : `/components/releases/detail/${id}`
                    return (
                        <Link
                            href={url}
                            className='text-link'
                        >
                            {name} {!CommonUtils.isNullEmptyOrUndefinedString(version) && `(${version})`}
                        </Link>
                    )
                },
                meta: {
                    width: '30%',
                },
            },
            {
                id: 'type',
                header: () => {
                    return (
                        <>
                            {t('Type')}{' '}
                            <FilterComponent
                                renderFilterOptions={typeFilterOptions}
                                setColumnFilters={setColumnFilters}
                                columnFilters={columnFilters}
                                id={'type'}
                                show={showFilter}
                                setShow={setShowFilter}
                                header={t('Component Type')}
                                resetPaginationParams={() => table.resetPagination()}
                            />
                        </>
                    )
                },
                cell: ({ row }) => {
                    if (row.original.type === 'project') {
                        return <div className='text-center'>{Capitalize(row.original.entity.projectType ?? '')}</div>
                    } else {
                        return (
                            <div className='text-center'>
                                {
                                    typeFilterOptions.filter(
                                        (op) => op.value === (row.original.entity as Release).componentType,
                                    )[0].tag
                                }
                            </div>
                        )
                    }
                },
                meta: {
                    width: '6%',
                },
            },
            {
                id: 'path',
                header: t('Project Path'),
                cell: ({ row }) => <div className='text-center'>{row.original.entity.path}</div>,
                meta: {
                    width: '12%',
                },
            },
            {
                id: 'relation',
                header: () => {
                    return (
                        <>
                            {t('Relation')}{' '}
                            <FilterComponent
                                renderFilterOptions={relationFilterOptions}
                                setColumnFilters={setColumnFilters}
                                columnFilters={columnFilters}
                                id={'relation'}
                                show={showFilter}
                                setShow={setShowFilter}
                                header={t('Release Relation')}
                                resetPaginationParams={() => table.resetPagination()}
                            />
                        </>
                    )
                },
                cell: ({ row }) => {
                    if (row.original.type === 'release') {
                        return (
                            <div className='text-center'>{Capitalize(row.original.entity.releaseRelation ?? '')}</div>
                        )
                    }
                },
                meta: {
                    width: '8%',
                },
            },
            {
                id: 'mainLicenses',
                header: t('Main Licenses'),
                enableColumnFilter: false,
                cell: ({ row }) => {
                    if (row.original.type === 'release') {
                        return (
                            <div className='text-center'>{(row.original.entity.mainLicenseIds ?? []).join(', ')}</div>
                        )
                    }
                },
                meta: {
                    width: '10%',
                },
            },
            {
                id: 'state',
                header: () => {
                    return (
                        <>
                            {t('State')}{' '}
                            <FilterComponent
                                renderFilterOptions={stateFilterOptions}
                                setColumnFilters={setColumnFilters}
                                columnFilters={columnFilters}
                                id={'state'}
                                show={showFilter}
                                setShow={setShowFilter}
                                header={t('Release Clearing State')}
                                resetPaginationParams={() => table.resetPagination()}
                            />
                        </>
                    )
                },
                cell: ({ row }) => {
                    if (row.original.type === 'project') {
                        const { clearingState, state } = row.original.entity
                        return (
                            <div className='text-center'>
                                <OverlayTrigger
                                    overlay={<Tooltip>{`${t('Project State')}: ${Capitalize(state ?? '')}`}</Tooltip>}
                                >
                                    {state === 'ACTIVE' ? (
                                        <span className='badge bg-success capsule-left overlay-badge'>{'PS'}</span>
                                    ) : (
                                        <span className='badge bg-secondary capsule-left overlay-badge'>{'PS'}</span>
                                    )}
                                </OverlayTrigger>
                                <OverlayTrigger
                                    overlay={
                                        <Tooltip>{`${t('Project Clearing State')}: ${Capitalize(
                                            clearingState ?? '',
                                        )}`}</Tooltip>
                                    }
                                >
                                    {clearingState === 'OPEN' ? (
                                        <span className='badge bg-danger capsule-right overlay-badge'>{'CS'}</span>
                                    ) : clearingState === 'IN_PROGRESS' ? (
                                        <span className='badge bg-warning capsule-right overlay-badge'>{'CS'}</span>
                                    ) : (
                                        <span className='badge bg-success capsule-right overlay-badge'>{'CS'}</span>
                                    )}
                                </OverlayTrigger>
                            </div>
                        )
                    } else {
                        const { clearingState } = row.original.entity
                        return (
                            <div className='text-center'>
                                <OverlayTrigger
                                    overlay={
                                        <Tooltip>{`${t('Release Clearing State')}: ${Capitalize(
                                            clearingState ?? '',
                                        )}`}</Tooltip>
                                    }
                                >
                                    {clearingState === 'NEW_CLEARING' ? (
                                        <span className='badge bg-danger overlay-badge'>{'CS'}</span>
                                    ) : clearingState === 'REPORT_AVAILABLE' ? (
                                        <span className='badge bg-primary overlay-badge'>{'CS'}</span>
                                    ) : (
                                        <span className='badge bg-success overlay-badge'>{'CS'}</span>
                                    )}
                                </OverlayTrigger>
                            </div>
                        )
                    }
                },
                meta: {
                    width: '6%',
                },
            },
            {
                id: 'releaseMainlineState',
                header: t('Release Mainline State'),
                enableColumnFilter: false,
                cell: ({ row }) => {
                    if (row.original.type === 'release') {
                        return <div className='text-center'>{Capitalize(row.original.entity.mainlineState ?? '')}</div>
                    }
                },
                meta: {
                    width: '8%',
                },
            },
            {
                id: 'projectMainlineState',
                header: t('Project Mainline State'),
                enableColumnFilter: false,
                cell: ({ row }) => {
                    if (row.original.type === 'release') {
                        return <div className='text-center'></div>
                    }
                },
                meta: {
                    width: '8%',
                },
            },
            {
                id: 'comment',
                header: t('Comment'),
                enableColumnFilter: false,
                cell: ({ row }) => {
                    if (row.original.type === 'release') {
                        const { id: releaseId } = row.original.entity
                        const entity = row.getParentRow()?.original.entity as Project
                        if (!CommonUtils.isNullOrUndefined(entity?.linkedReleases)) {
                            const linkedRelease = entity.linkedReleases.filter(
                                (lr) => lr.release.split('/').at(-1) === releaseId,
                            )
                            if (!CommonUtils.isNullOrUndefined(linkedRelease?.[0])) {
                                return <div className='text-center'>{linkedRelease?.[0].comment}</div>
                            }
                        }
                    }
                },
                meta: {
                    width: '8%',
                },
            },
            {
                id: 'actions',
                header: t('Actions'),
                enableColumnFilter: false,
                cell: ({ row }) => {
                    const { id } = row.original.entity
                    const url =
                        row.original.type === 'project' ? `/projects/edit/${id}` : `/components/editRelease/${id}`

                    return (
                        <div className='text-center'>
                            <OverlayTrigger overlay={<Tooltip>{t('Edit')}</Tooltip>}>
                                <Link
                                    href={url}
                                    className='overlay-trigger'
                                >
                                    <BsPencil
                                        className='btn-icon'
                                        size={20}
                                    />
                                </Link>
                            </OverlayTrigger>
                        </div>
                    )
                },
                meta: {
                    width: '6%',
                },
            },
        ],
        [
            t,
            columnFilters,
            showFilter,
        ],
    )

    const table = useReactTable({
        // table state config
        state: {
            columnFilters,
        },

        data: rowData,
        columns,
        getCoreRowModel: getCoreRowModel(),

        // server side filtering config
        manualFiltering: true,
        onColumnFiltersChange: setColumnFilters,

        // client side pagination
        getPaginationRowModel: getPaginationRowModel(),

        meta: {
            rowHeightConstant: true,
        },
    })

    useEffect(() => {
        if (status !== 'authenticated') return
        const controller = new AbortController()
        const signal = controller.signal

        const timeLimit = memoizedLicenseClearing === undefined ? 700 : 0
        const timeout = setTimeout(() => {
            setShowProcessing(true)
        }, timeLimit)

        void (async () => {
            try {
                const url = `projects/${projectId}/licenseClearing?transitive=true&${columnFilters
                    .map((f) => (f.value as string[]).map((v) => `${tableIdToUrlParamMapper[f.id]}=${v}`).join('&'))
                    .join('&')}`
                const response = await ApiUtils.GET(url, session.user.access_token, signal)

                if (response.status !== StatusCodes.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new Error(err.message)
                }

                const licenseClearingData = (await response.json()) as LicenseClearing
                setLicenseClearing(licenseClearingData)
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return
                }
                const message = error instanceof Error ? error.message : String(error)
                throw new Error(message)
            } finally {
                clearTimeout(timeout)
                setShowProcessing(false)
            }
        })()

        return () => controller.abort()
    }, [
        status,
        projectId,
        session,
        columnFilters,
    ])

    useEffect(() => {
        if (status !== 'authenticated') return
        const controller = new AbortController()
        const signal = controller.signal

        const timeLimit = memoizedLinkedProjects.length !== 0 ? 700 : 0
        const timeout = setTimeout(() => {
            setShowProcessing(true)
        }, timeLimit)

        void (async () => {
            try {
                const response = await ApiUtils.GET(
                    `projects/${projectId}/linkedProjects?transitive=true`,
                    session.user.access_token,
                    signal,
                )

                if (response.status !== StatusCodes.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new Error(err.message)
                }

                const linkedProjectsData = (await response.json()) as LinkedProjects
                setLinkedProjects(linkedProjectsData['_embedded']['sw360:projects'])
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return
                }
                const message = error instanceof Error ? error.message : String(error)
                throw new Error(message)
            } finally {
                clearTimeout(timeout)
                setShowProcessing(false)
            }
        })()

        return () => controller.abort()
    }, [
        status,
        projectId,
        session,
    ])

    useEffect(() => {
        if (memoizedLicenseClearing === undefined) return
        const data = buildTable(memoizedLicenseClearing, memoizedLinkedProjects, projectName, projectVersion)
        setRowData(data)
    }, [
        memoizedLicenseClearing,
        memoizedLinkedProjects,
        projectName,
        projectVersion,
    ])

    return (
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
    )
}
