// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

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
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { FilterComponent, PaddedCell, SW360Table, TableSearch } from 'next-sw360'
import React, { useEffect, useMemo, useState } from 'react'
import { OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap'
import { BsPencil } from 'react-icons/bs'
import ExpandableTextList from '@/components/ExpandableList/ExpandableTextLink'
import { Attachment, ErrorDetails, FilterOption, NestedRows, TypedEntity } from '@/object-types'
import MessageService from '@/services/message.service'
import CommonUtils from '@/utils/common.utils'
import { ApiUtils } from '@/utils/index'

interface Props {
    projectId: string
}

interface ReleaseClearingState {
    id: string
    index: number
    vendor?: string
    name: string
    version?: string
    longName?: string
    releaseRelationship?: string
    mainlineState?: string
    hasSubreleases?: boolean
    clearingState?: string
    attachments?: null | Array<Attachment>
    componentType: string
    licenseIds?: null | Array<string>
    comment?: string
    otherLicenseIds?: null | Array<string>
    accessible?: boolean
    projectId?: string
    releaseMainLineState?: string
    linkedReleases?: Array<ReleaseClearingState>
    ref?: ReleaseClearingState
    isExpanded?: boolean
}

interface ProjectClearingState {
    id: string
    name: string
    relation?: string
    version?: string
    projectType: string
    state?: string
    clearingState?: string
    subprojects?: Array<ProjectClearingState>
    linkedReleases?: Array<ReleaseClearingState>
    ref?: ProjectClearingState
    isExpanded?: boolean
}

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

const Capitalize = (text: string) =>
    text.split('_').reduce((s, c) => s + ' ' + (c.charAt(0) + c.substring(1).toLocaleLowerCase()), '')

type TypedProject = TypedEntity<ProjectClearingState, 'project'>

type TypedRelease = TypedEntity<ReleaseClearingState, 'release'>

const DependencyNetworkTreeView = ({ projectId }: Props) => {
    const t = useTranslations('default')

    const session = useSession()
    const [expandLevel, setExpandLevel] = useState(-1)
    const [expandedState, setExpandedState] = useState<ExpandedState>({})
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

    const [showProcessing, setShowProcessing] = useState(false)
    const [showFilter, setShowFilter] = useState<undefined | string>()

    const [search, setSearch] = useState('')

    const [projectClearingState, setProjectClearingState] = useState<ProjectClearingState>()

    const [rowData, setRowData] = useState<NestedRows<TypedProject | TypedRelease>[]>([])
    const memoizedData = useMemo(
        () => rowData,
        [
            rowData,
        ],
    )

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
                                        (op) =>
                                            op.value ===
                                            (row.original.node.entity as ReleaseClearingState).componentType,
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
                        return <div className='text-center'>{row.original.node.entity.releaseRelationship}</div>
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
                                <ExpandableTextList list={row.original.node.entity.licenseIds ?? []} />
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
                        return <div className='text-center'>{row.original.node.entity.comment}</div>
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
        ],
    )

    const table = useReactTable({
        // table state config
        state: {
            expanded: expandedState,
            columnFilters,
        },

        data: memoizedData,
        columns,
        getCoreRowModel: getCoreRowModel(),

        // server side filtering config
        manualFiltering: true,
        onColumnFiltersChange: setColumnFilters,

        // expand config
        getExpandedRowModel: getExpandedRowModel(),
        getSubRows: (row) => row.children ?? [],
        getRowCanExpand: (row) => row.original.children !== undefined && row.original.children.length !== 0,
        onExpandedChange: setExpandedState,
    })

    useEffect(() => {
        if (session.status !== 'authenticated') return
        const controller = new AbortController()
        const signal = controller.signal

        setShowProcessing(true)

        void (async () => {
            try {
                const response = await ApiUtils.GET(
                    `projects/network/${projectId}/linkedResources?transitive=true`,
                    session.data.user.access_token,
                    signal,
                )

                if (response.status !== StatusCodes.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new Error(err.message)
                }

                const data = (await response.json()) as ProjectClearingState
                setProjectClearingState(data)
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return
                }
                const message = error instanceof Error ? error.message : String(error)
                MessageService.error(message)
            } finally {
                setShowProcessing(false)
            }
        })()
    }, [
        projectId,
    ])

    const fetchReleasesRecursive = (
        releaseClearingStates: ReleaseClearingState[],
    ): NestedRows<TypedProject | TypedRelease>[] => {
        const tableData: NestedRows<TypedProject | TypedRelease>[] = releaseClearingStates
            .filter((elem) => {
                for (const fil of columnFilters) {
                    const vals = fil.value as string[]
                    let elemVal: string | undefined
                    if (fil.id === 'type') {
                        elemVal = elem.componentType ?? ''
                    } else if (fil.id === 'relation') {
                        elemVal = elem.releaseRelationship ?? ''
                    } else {
                        elemVal = elem.clearingState ?? ''
                    }
                    if (vals.indexOf(elemVal) === -1) {
                        return false
                    }
                }
                if (search !== '') {
                    if (!elem.name.toLowerCase().includes(search.toLowerCase())) return false
                }
                return true
            })
            .map(
                (r) =>
                    ({
                        node: {
                            entity: r,
                            type: 'release',
                        },
                        children: fetchReleasesRecursive(r.linkedReleases ?? []),
                    }) as NestedRows<TypedProject | TypedRelease>,
            )
        return tableData
    }

    const fetchProjectsRecursive = (
        projectClearingStates: ProjectClearingState[],
    ): NestedRows<TypedProject | TypedRelease>[] => {
        const tableData: NestedRows<TypedProject | TypedRelease>[] = projectClearingStates.map(
            (p) =>
                ({
                    node: {
                        entity: p,
                        type: 'project',
                    },
                    children: [
                        ...fetchProjectsRecursive(p.subprojects ?? []),
                        ...fetchReleasesRecursive(p.linkedReleases ?? []),
                    ],
                }) as NestedRows<TypedProject | TypedRelease>,
        )
        return tableData
    }

    useEffect(() => {
        if (projectClearingState === undefined) return

        const tableData: NestedRows<TypedProject | TypedRelease>[] = []

        const root: NestedRows<TypedProject | TypedRelease> = {
            node: {
                entity: projectClearingState,
                type: 'project',
            },
            children: [
                ...fetchProjectsRecursive(projectClearingState.subprojects ?? []),
                ...fetchReleasesRecursive(projectClearingState.linkedReleases ?? []),
            ],
        }
        tableData.push(root)
        setRowData(tableData)
    }, [
        projectClearingState,
        search,
        columnFilters,
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

    const searchFunction = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.currentTarget.value === '') {
            setSearch('')
        } else {
            setSearch(event.currentTarget.value)
        }
    }

    return (
        <>
            <div className='mb-3'>
                {table ? (
                    <>
                        <div className='d-flex justify-content-end'>
                            <TableSearch searchFunction={searchFunction} />
                        </div>
                        <SW360Table
                            table={table}
                            showProcessing={showProcessing}
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

export default DependencyNetworkTreeView
