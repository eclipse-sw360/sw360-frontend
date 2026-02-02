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
    ExpandedState,
    getCoreRowModel,
    getExpandedRowModel,
    useReactTable,
} from '@tanstack/react-table'
import { StatusCodes } from 'http-status-codes'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { FilterComponent, PaddedCell, SW360Table } from 'next-sw360'
import { Dispatch, type JSX, SetStateAction, useEffect, useMemo, useState } from 'react'
import { Button, OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap'
import { BsPencil } from 'react-icons/bs'
import ExpandableTextList from '@/components/ExpandableList/ExpandableTextLink'
import { useConfigValue } from '@/contexts'
import {
    Embedded,
    ErrorDetails,
    FilterOption,
    LicenseClearing,
    NestedRows,
    Project,
    Release,
    TypedEntity,
    UIConfigKeys,
    UserGroupType,
} from '@/object-types'
import { ApiError, ApiUtils, CommonUtils } from '@/utils'
import AddLicenseInfoToReleaseModal from './AddLicenseInfoToReleaseModal'

const Capitalize = (text: string) =>
    text.split('_').reduce((s, c) => s + ' ' + (c.charAt(0) + c.substring(1).toLocaleLowerCase()), '')

type LinkedProjects = Embedded<Project, 'sw360:projects'>

type TypedProject = TypedEntity<Project, 'project'>

type TypedRelease = TypedEntity<Release, 'release'>

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

const buildTable = (
    setRowData: Dispatch<SetStateAction<NestedRows<TypedProject | TypedRelease>[]>>,
    licenseClearing: LicenseClearing,
    linkedProjects: Project[],
) => {
    const linkedProjectRows = extractLinkedProjectsAndTheirLinkedReleases(
        licenseClearing['_embedded']['sw360:release'],
        linkedProjects,
    )
    const releaseRows: NestedRows<TypedProject | TypedRelease>[] = []
    for (const l of licenseClearing['linkedReleases']) {
        const release = licenseClearing['_embedded']['sw360:release'].filter(
            (r: Release) => r.id === l.release.split('/').at(-1),
        )?.[0]
        const nodeRelease: NestedRows<TypedProject | TypedRelease> = {
            node: {
                type: 'release',
                entity: release,
            },
            children: [],
        }
        releaseRows.push(nodeRelease)
    }

    setRowData([
        ...linkedProjectRows,
        ...releaseRows,
    ])
}

const extractLinkedProjectsAndTheirLinkedReleases = (
    licenseClearingData: Release[],
    linkedProjectsData: Project[] | undefined,
): NestedRows<TypedProject | TypedRelease>[] => {
    if (!linkedProjectsData) return []
    const rows: NestedRows<TypedProject | TypedRelease>[] = []

    for (const p of linkedProjectsData) {
        const nodeProject: NestedRows<TypedProject | TypedRelease> = {
            node: {
                type: 'project',
                entity: p,
            },
            children: extractLinkedProjectsAndTheirLinkedReleases(
                licenseClearingData,
                p['_embedded']?.['sw360:linkedProjects'],
            ),
        }

        for (const l of p['linkedReleases'] ?? []) {
            const release: Release | undefined = licenseClearingData.filter(
                (r: Release) => r.id === l.release.split('/').at(-1),
            )?.[0]
            if (release === undefined) continue
            const nodeRelease: NestedRows<TypedProject | TypedRelease> = {
                node: {
                    type: 'release',
                    entity: release,
                },
                children: [],
            }
            if (nodeProject.children === undefined) nodeProject.children = []
            nodeProject.children.push(nodeRelease)
        }
        rows.push(nodeProject)
    }
    return rows
}

const tableIdToUrlParamMapper: Record<string, string> = {
    type: 'componentType',
    relation: 'releaseRelation',
    state: 'clearingState',
}

export default function TreeView({ projectId }: { projectId: string }): JSX.Element {
    const t = useTranslations('default')
    const { data: session, status } = useSession()

    const [expandLevel, setExpandLevel] = useState(-1)
    const [expandedState, setExpandedState] = useState<ExpandedState>({})
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

    const [show, setShow] = useState<boolean>(false)
    // Track loading state for each API call separately
    const [isLoadingLicenseClearing, setIsLoadingLicenseClearing] = useState(true)
    const [isLoadingLinkedProjects, setIsLoadingLinkedProjects] = useState(true)
    const [isDataReady, setIsDataReady] = useState(false)

    // Show processing until both API calls complete AND data is ready to render
    const showProcessing = isLoadingLicenseClearing || isLoadingLinkedProjects || !isDataReady
    const [showFilter, setShowFilter] = useState<undefined | string>()

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

    const [rowData, setRowData] = useState<NestedRows<TypedProject | TypedRelease>[]>([])
    const [searchTerm, setSearchTerm] = useState('')

    // Configs from backend
    const showAddLicenseButton = useConfigValue(UIConfigKeys.UI_ENABLE_ADD_LICENSE_INFO_TO_RELEASE_BUTTON) as
        | boolean
        | null

    useEffect(() => {
        if (status === 'unauthenticated') {
            void signOut()
        }
    }, [
        status,
    ])

    const columns = useMemo<ColumnDef<NestedRows<TypedProject | TypedRelease>>[]>(
        () => [
            {
                id: 'name',
                enableColumnFilter: false,
                header: () => (
                    <>
                        {t('Name')}
                        {' ('}
                        <Link
                            href='#'
                            className='table-text-link'
                            onClick={() => setExpandLevel(expandLevel + 1)}
                        >
                            {t('Expand next level')}
                        </Link>
                        {' | '}
                        <Link
                            href='#'
                            className='table-text-link'
                            onClick={() => setExpandLevel(-1)}
                        >
                            {t('Collapse all')}
                        </Link>
                        {')'}
                    </>
                ),
                cell: ({ row }) => {
                    const { id, name, version } = row.original.node.entity
                    const url =
                        row.original.node.type === 'project'
                            ? `/projects/detail/${id}`
                            : `/components/releases/detail/${id}`
                    return (
                        <PaddedCell row={row}>
                            <Link
                                href={url}
                                className='text-link'
                            >
                                {name} {!CommonUtils.isNullEmptyOrUndefinedString(version) && `(${version})`}
                            </Link>
                        </PaddedCell>
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
                            />
                        </>
                    )
                },
                cell: ({ row }) => {
                    if (row.original.node.type === 'project') {
                        return (
                            <div className='text-center'>{Capitalize(row.original.node.entity.projectType ?? '')}</div>
                        )
                    } else {
                        return (
                            <div className='text-center'>
                                {
                                    typeFilterOptions.filter(
                                        (op) => op.value === (row.original.node.entity as Release).componentType,
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
                            />
                        </>
                    )
                },
                cell: ({ row }) => {
                    if (row.original.node.type === 'release') {
                        const { id: releaseId } = row.original.node.entity
                        const entity = row.getParentRow()?.original.node.entity as Project
                        if (!CommonUtils.isNullOrUndefined(entity)) {
                            const linkedRelease = entity.linkedReleases?.filter(
                                (lr) => lr.release.split('/').at(-1) === releaseId,
                            )
                            if (!CommonUtils.isNullOrUndefined(linkedRelease?.[0])) {
                                return (
                                    <div className='text-center'>
                                        {linkedRelease?.[0].relation &&
                                            relationFilterOptions.filter(
                                                (op) => op.value === linkedRelease?.[0].relation,
                                            )[0].tag}
                                    </div>
                                )
                            }
                        } else {
                            const index = (memoizedLicenseClearing?.linkedReleases ?? []).findIndex(
                                (rel) => rel.release.split('/').at(-1) === releaseId,
                            )
                            if (index !== -1) {
                                return (
                                    <div className='text-center'>
                                        {Capitalize(memoizedLicenseClearing?.linkedReleases[index].relation ?? '')}
                                    </div>
                                )
                            }
                        }
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
                    if (row.original.node.type === 'release') {
                        return (
                            <div className='text-center'>
                                <ExpandableTextList list={row.original.node.entity.mainLicenseIds ?? []} />
                            </div>
                        )
                    }
                },
                meta: {
                    width: '10%',
                },
            },
            {
                id: 'otherLicenses',
                header: t('Other licenses'),
                enableColumnFilter: false,
                cell: ({ row }) => {
                    if (row.original.node.type === 'release') {
                        return (
                            <div className='text-center'>
                                <ExpandableTextList list={row.original.node.entity.otherLicenseIds ?? []} />
                            </div>
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
                            />
                        </>
                    )
                },
                cell: ({ row }) => {
                    if (row.original.node.type === 'project') {
                        const { clearingState, state } = row.original.node.entity
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
                        const { clearingState } = row.original.node.entity
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
                    if (row.original.node.type === 'release') {
                        return (
                            <div className='text-center'>
                                {Capitalize(row.original.node.entity.mainlineState ?? '')}
                            </div>
                        )
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
                    if (row.original.node.type === 'release') {
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
                    if (row.original.node.type === 'release') {
                        const { id: releaseId } = row.original.node.entity
                        const entity = row.getParentRow()?.original.node.entity as Project
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
                    const { id } = row.original.node.entity
                    const url =
                        row.original.node.type === 'project' ? `/projects/edit/${id}` : `/components/editRelease/${id}`

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
            expandLevel,
            columnFilters,
            showFilter,
            memoizedLicenseClearing,
        ],
    )

    const table = useReactTable({
        // table state config
        state: {
            expanded: expandedState,
            columnFilters,
        },

        data: rowData,
        columns,
        getCoreRowModel: getCoreRowModel(),

        // expand config
        getExpandedRowModel: getExpandedRowModel(),
        getSubRows: (row) => row.children ?? [],
        getRowCanExpand: (row) => row.original.children !== undefined && row.original.children.length !== 0,
        onExpandedChange: setExpandedState,

        // server side filtering config
        manualFiltering: true,
        onColumnFiltersChange: setColumnFilters,
    })

    useEffect(() => {
        if (memoizedLicenseClearing === undefined) return
        buildTable(setRowData, memoizedLicenseClearing, memoizedLinkedProjects)
        // Mark data as ready only after setting row data
        setIsDataReady(true)
    }, [
        memoizedLicenseClearing,
        memoizedLinkedProjects,
    ])

    useEffect(() => {
        if (!searchTerm || !searchTerm.trim()) {
            if (memoizedLicenseClearing !== undefined && memoizedLinkedProjects !== undefined) {
                buildTable(setRowData, memoizedLicenseClearing, memoizedLinkedProjects)
            }
            return
        }

        const lower = searchTerm.trim().toLowerCase()

        type SearchNode = NestedRows<TypedProject | TypedRelease>

        const matches = (value: unknown): boolean => {
            if (value === undefined || value === null) return false
            return String(value).toLowerCase().includes(lower)
        }
        const extractFields = (entity: unknown): (string | number)[] => {
            if (!entity || typeof entity !== 'object') return []
            const anyEntity = entity as Record<string, unknown>

            const mainLicenseIds = Array.isArray(anyEntity.mainLicenseIds) ? anyEntity.mainLicenseIds : []
            const otherLicenseIds = Array.isArray(anyEntity.otherLicenseIds) ? anyEntity.otherLicenseIds : []
            const comment = anyEntity.comment
            const projectType = anyEntity.projectType
            const componentType = anyEntity.componentType
            const clearingState = anyEntity.clearingState
            const state = anyEntity.state
            const mainlineState = anyEntity.mainlineState
            const name = anyEntity.name
            const version = anyEntity.version

            return [
                name,
                version,
                projectType,
                componentType,
                clearingState,
                state,
                mainlineState,
                comment,
                ...mainLicenseIds,
                ...otherLicenseIds,
            ].filter(Boolean) as (string | number)[]
        }
        const buildFullTree = (): SearchNode[] => {
            if (memoizedLicenseClearing === undefined) return []

            const releaseEmbed = (memoizedLicenseClearing as LicenseClearing)['_embedded']?.['sw360:release'] ?? []
            const linked = extractLinkedProjectsAndTheirLinkedReleases(
                releaseEmbed as Release[],
                memoizedLinkedProjects,
            )

            const releaseRows: SearchNode[] = []
            for (const l of (memoizedLicenseClearing as LicenseClearing)['linkedReleases'] ?? []) {
                const release = (memoizedLicenseClearing as LicenseClearing)['_embedded']?.['sw360:release']?.filter(
                    (r: Release) => r.id === l.release.split('/').at(-1),
                )?.[0]
                if (!release) continue
                releaseRows.push({
                    node: {
                        type: 'release',
                        entity: release,
                    },
                    children: [],
                } as SearchNode)
            }

            return [
                ...linked,
                ...releaseRows,
            ]
        }

        const fullTree: SearchNode[] = buildFullTree()
        const filterRecursive = (nodes: SearchNode[]): SearchNode[] => {
            const result: SearchNode[] = []
            for (const node of nodes) {
                const fields = extractFields(node.node.entity)
                const selfMatches = fields.some((f) => matches(f))
                let filteredChildren: SearchNode[] = []
                if (Array.isArray(node.children) && node.children.length > 0) {
                    filteredChildren = filterRecursive(node.children)
                }
                if (selfMatches || filteredChildren.length > 0) {
                    result.push({
                        ...node,
                        children: filteredChildren,
                    })
                }
            }
            return result
        }
        const filtered = filterRecursive(fullTree)
        setRowData(filtered)
    }, [
        searchTerm,
        memoizedLicenseClearing,
        memoizedLinkedProjects,
    ])

    useEffect(() => {
        if (expandLevel === -1) {
            return setExpandedState({})
        }
        const _expandedState: ExpandedState = {
            ...(expandedState as Record<string, boolean>),
        }
        for (const row of table.getRowModel().rows) {
            if (row.depth <= expandLevel && row.getCanExpand()) {
                _expandedState[row.id] = true
            }
        }
        setExpandedState(_expandedState)
    }, [
        table,
        expandLevel,
    ])

    useEffect(() => {
        if (status !== 'authenticated') return
        const controller = new AbortController()
        const signal = controller.signal

        // Reset data ready state when starting new fetch
        setIsLoadingLicenseClearing(true)
        setIsDataReady(false)

        void (async () => {
            try {
                const url = `projects/${projectId}/licenseClearing?transitive=true&${columnFilters
                    .map((f) => (f.value as string[]).map((v) => `${tableIdToUrlParamMapper[f.id]}=${v}`).join('&'))
                    .join('&')}`
                const response = await ApiUtils.GET(url, session.user.access_token, signal)

                if (response.status !== StatusCodes.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new ApiError(err.message, {
                        status: response.status,
                    })
                }

                const licenseClearingData = (await response.json()) as LicenseClearing
                setLicenseClearing(licenseClearingData)
            } catch (error) {
                ApiUtils.reportError(error)
            } finally {
                setIsLoadingLicenseClearing(false)
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

        setIsLoadingLinkedProjects(true)

        void (async () => {
            try {
                const response = await ApiUtils.GET(
                    `projects/${projectId}/linkedProjects?transitive=true`,
                    session.user.access_token,
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
                setIsLoadingLinkedProjects(false)
            }
        })()

        return () => controller.abort()
    }, [
        status,
        projectId,
        session,
    ])

    return (
        <>
            {showAddLicenseButton === null || showAddLicenseButton ? (
                <>
                    <AddLicenseInfoToReleaseModal
                        projectId={projectId}
                        show={show}
                        setShow={setShow}
                    />
                    <div className='d-flex justify-content-between align-items-center mb-3'>
                        <Button
                            variant='secondary'
                            className='me-2 col-auto'
                            onClick={() => setShow(true)}
                            hidden={
                                !(
                                    session?.user.userGroup === UserGroupType.ADMIN ||
                                    session?.user.userGroup === UserGroupType.CLEARING_ADMIN ||
                                    session?.user.userGroup === UserGroupType.SW360_ADMIN
                                )
                            }
                        >
                            {t('Add License Info to Release')}
                        </Button>
                        <input
                            type='search'
                            placeholder={t('Search')}
                            className='form-control form-control-sm'
                            style={{
                                width: '250px',
                            }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </>
            ) : (
                <></>
            )}
            <div className='mb-3'>
                {table ? (
                    <SW360Table
                        table={table}
                        showProcessing={showProcessing}
                    />
                ) : (
                    <div className='col-12 mt-1 text-center'>
                        <Spinner className='spinner' />
                    </div>
                )}
            </div>
        </>
    )
}
