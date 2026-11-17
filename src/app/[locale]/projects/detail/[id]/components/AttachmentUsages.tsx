// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import {
    ColumnDef,
    ExpandedState,
    getCoreRowModel,
    getExpandedRowModel,
    getSortedRowModel,
    type Row,
    SortingState,
    type Table,
    useReactTable,
} from '@tanstack/react-table'
import { StatusCodes } from 'http-status-codes'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { PaddedCell, SW360Table } from 'next-sw360'
import { Dispatch, type JSX, SetStateAction, useEffect, useMemo, useRef, useState } from 'react'
import { OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap'
import { AccessControl } from '@/components/AccessControl/AccessControl'
import {
    Attachment,
    AttachmentUsage,
    AttachmentUsages,
    Embedded,
    ErrorDetails,
    Project,
    Release,
    TypedEntity,
    UserGroupType,
} from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiError, CommonUtils } from '@/utils'
import ApiUtils from '@/utils/api/authenticatedApi.util'
import { getAttachmentTypeShortForm } from '@/utils/attachments.utils'
import { indexUsages, setUsageSelected, type UsageSelection, type UsageType, usageKey } from './attachmentUsages.utils'

type LinkedProjects = Embedded<Project, 'sw360:projects'>

type TypedAttachment = TypedEntity<Attachment, 'attachment'>

type TypedRelease = TypedEntity<Release, 'release'>

type TypedProject = TypedEntity<Project, 'project'>

function isLicenseInfoEnabled(type: string): boolean {
    const types = [
        'CLI',
        'CLX',
        'ISR',
    ]
    return types.indexOf(type) !== -1
}

function isSourceCodeBundleEnabled(type: string): boolean {
    const types = [
        'SOURCE',
        'SRC',
    ]
    return types.indexOf(type) !== -1
}

interface ExtendedNestedRows<K> {
    node: K
    children?: ExtendedNestedRows<K>[]
    projectPath?: string
}

interface Sort {
    columnName: string
    isAsc: boolean
}

const comparatorName = (
    firstRow: ExtendedNestedRows<TypedProject | TypedRelease | TypedAttachment>,
    secondRow: ExtendedNestedRows<TypedProject | TypedRelease | TypedAttachment>,
    sort?: Sort,
): number => {
    const typeOrder = {
        attachment: 0,
        release: 1,
        project: 2,
    }
    const typeDifference = typeOrder[firstRow.node.type] - typeOrder[secondRow.node.type]
    if (typeDifference !== 0) return typeDifference

    const firstName =
        firstRow.node.type === 'attachment'
            ? firstRow.node.entity.filename
            : `${firstRow.node.entity.name ?? ''} (${firstRow.node.entity.version ?? ''})`
    const secondName =
        secondRow.node.type === 'attachment'
            ? secondRow.node.entity.filename
            : `${secondRow.node.entity.name ?? ''} (${secondRow.node.entity.version ?? ''})`
    const difference = firstName.localeCompare(secondName, undefined, {
        sensitivity: 'base',
    })
    return sort?.isAsc === false ? -difference : difference
}

const sortAllLevels = (
    rows: ExtendedNestedRows<TypedProject | TypedRelease | TypedAttachment>[],
    sort?: Sort,
): void => {
    for (const row of rows) {
        if (row.children && row.children.length !== 0) sortAllLevels(row.children, sort)
    }
    rows.sort((firstRow, secondRow) => comparatorName(firstRow, secondRow, sort))
}

const releaseMatchesFilter = (
    release: ExtendedNestedRows<TypedProject | TypedRelease | TypedAttachment>,
    filter: string,
    usages: Set<string>,
    projectId: string,
): boolean => {
    const releaseId = release.node.entity._links?.self.href.split('/').at(-1) ?? ''

    if (!filter) return true
    const attachments = release.children ?? []
    switch (filter) {
        case 'withCli':
            return attachments.some((a) => {
                const att = a.node.entity as Attachment
                return att.attachmentType === 'CLI' || att.attachmentType === 'CLX'
            })
        case 'withAttachments':
            return attachments.length > 0
        case 'withoutSrc':
            return !attachments.some((a) => {
                const att = a.node.entity as Attachment
                return att.attachmentType === 'SOURCE' || att.attachmentType === 'SRC'
            })
        case 'withoutAttachments':
            return attachments.length === 0
        case 'withoutCliUsage': {
            if (!releaseId) return true
            const cliAttachments = attachments.filter((a) => {
                const att = a.node.entity as Attachment
                return att.attachmentType === 'CLI' || att.attachmentType === 'CLX' || att.attachmentType === 'ISR'
            })
            if (cliAttachments.length === 0) return false

            return cliAttachments.some((a) => {
                const att = a.node.entity as Attachment
                return !usages.has(
                    usageKey({
                        attachmentContentId: att.attachmentContentId ?? '',
                        releaseId,
                        projectId,
                        projectPath: a.projectPath ?? projectId,
                        type: 'licenseInfo',
                    }),
                )
            })
        }
        case 'withoutSourceUsage': {
            if (!releaseId) return true
            const sourceAttachments = attachments.filter((a) => {
                const att = a.node.entity as Attachment
                return att.attachmentType === 'SOURCE' || att.attachmentType === 'SRC'
            })
            if (sourceAttachments.length === 0) return false

            return sourceAttachments.some((a) => {
                const att = a.node.entity as Attachment
                return !usages.has(
                    usageKey({
                        attachmentContentId: att.attachmentContentId ?? '',
                        releaseId,
                        projectId,
                        projectPath: '',
                        type: 'sourcePackage',
                    }),
                )
            })
        }
        default:
            return true
    }
}
const rowMatchesSearch = (
    row: ExtendedNestedRows<TypedProject | TypedRelease | TypedAttachment>,
    term: string,
): boolean => {
    const trimmed = term.trim().toLocaleLowerCase()
    if (!trimmed) return true
    const tokens = trimmed.split(/\s+/).filter(Boolean)
    if (tokens.length === 0) return true

    const node = row.node
    let haystack = ''

    if (node.type === 'project') {
        haystack = (node.entity.name ?? '').toLocaleLowerCase()
    } else if (node.type === 'release') {
        const name = node.entity.name ?? ''
        const version = node.entity.version ?? ''
        haystack = `${name} ${version}`.toLocaleLowerCase()
    } else if (node.type === 'attachment') {
        haystack = (node.entity.filename ?? '').toLocaleLowerCase()
    }

    return tokens.every((token) => haystack.includes(token))
}

const filterRows = (
    rows: ExtendedNestedRows<TypedProject | TypedRelease | TypedAttachment>[],
    filter: string,
    term: string,
    usages: Set<string>,
    projectId: string,
): ExtendedNestedRows<TypedProject | TypedRelease | TypedAttachment>[] => {
    const result: ExtendedNestedRows<TypedProject | TypedRelease | TypedAttachment>[] = []
    for (const row of rows) {
        const node = row.node
        const filteredChildren =
            row.children && row.children.length > 0
                ? filterRows(
                      row.children as ExtendedNestedRows<TypedProject | TypedRelease | TypedAttachment>[],
                      filter,
                      term,
                      usages,
                      projectId,
                  )
                : []
        let matchesFilter = true
        if (node.type === 'release') {
            matchesFilter = releaseMatchesFilter(row, filter, usages, projectId)
        }
        const matchesSearch = rowMatchesSearch(row, term)
        let keepRow = false
        if (node.type === 'project') {
            keepRow = (matchesSearch && !CommonUtils.isNullEmptyOrUndefinedString(term)) || filteredChildren.length > 0
        } else {
            keepRow = matchesFilter && matchesSearch
        }
        if (keepRow) {
            result.push({
                ...row,
                children: filteredChildren,
            })
        }
    }
    return result
}

function AttachmentUsagesComponent({ projectId }: { projectId: string }): JSX.Element {
    const t = useTranslations('default')
    const tableRef = useRef<Table<ExtendedNestedRows<TypedAttachment | TypedRelease | TypedProject>> | null>(null)
    const usageStoreRef = useRef<AttachmentUsage[]>([])
    const usageIndexRef = useRef<Set<string>>(new Set())
    const initialUsagesRef = useRef<AttachmentUsage[]>([])
    const inputRefs = useRef(new Map<string, Set<HTMLInputElement>>())
    const [filterRevision, setFilterRevision] = useState(false)
    const [loadedProjectId, setLoadedProjectId] = useState<string | undefined>()
    const [saveUsagesLoading, setSaveUsagesLoading] = useState(false)

    const [showProcessingLinkedProjects, setShowProcessingLinkedProjects] = useState(false)
    const [showProcessingAttachmentUsages, setShowProcessingAttachmentUsages] = useState(false)
    const [isTableBuilding, setIsTableBuilding] = useState(false)

    const [linkedProjects, setLinkedProjects] = useState<Project[]>(() => [])
    const memoizedLinkedProjects = useMemo(
        () => linkedProjects,
        [
            linkedProjects,
        ],
    )

    const [attachmentUsages, setAttachmentUsages] = useState<AttachmentUsages | undefined>(undefined)
    const memoizedAttachmentUsages = useMemo(
        () => attachmentUsages,
        [
            attachmentUsages,
        ],
    )
    const [data, setData] = useState<ExtendedNestedRows<TypedProject | TypedRelease | TypedAttachment>[]>(() => [])

    const [expandedState, setExpandedState] = useState<ExpandedState>({})
    const [sort, setSort] = useState<Sort>({
        columnName: 'name',
        isAsc: true,
    })
    const [releaseFilter, setReleaseFilter] = useState<string>('')
    const [searchTerm, setSearchTerm] = useState<string>('')
    const filteredData = useMemo(
        () =>
            releaseFilter || searchTerm
                ? filterRows(data, releaseFilter, searchTerm, usageIndexRef.current, projectId)
                : data,
        [
            data,
            releaseFilter,
            searchTerm,
            projectId,
            filterRevision,
        ],
    )

    const handleSaveUsages = async () => {
        try {
            setSaveUsagesLoading(true)
            const savedUsages = usageStoreRef.current
            const response = await ApiUtils.PUT(`projects/${projectId}/attachmentUsage`, savedUsages)
            if (response.status !== StatusCodes.OK && response.status !== StatusCodes.NO_CONTENT) {
                MessageService.error(t('Something went wrong'))
                return
            }
            initialUsagesRef.current = savedUsages

            // Check for warnings in response (e.g. stale sub-project or release references)
            try {
                const responseBody = await response.json()
                if (responseBody.warnings && responseBody.warnings.length > 0) {
                    responseBody.warnings.forEach((warning: string) => {
                        MessageService.warn(warning, {
                            autoClose: false,
                        })
                    })
                    MessageService.success(t('AttachmentUsages saved successfully (with warnings)'))
                } else {
                    MessageService.success(t('AttachmentUsages saved successfully'))
                }
            } catch {
                // Response was plain text (no warnings)
                MessageService.success(t('AttachmentUsages saved successfully'))
            }
        } catch (e) {
            ApiUtils.reportError(e)
        } finally {
            setSaveUsagesLoading(false)
        }
    }

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal

        const timeLimit = memoizedLinkedProjects.length !== 0 ? 700 : 0
        const timeout = setTimeout(() => {
            setShowProcessingLinkedProjects(true)
        }, timeLimit)

        void (async () => {
            try {
                const response = await ApiUtils.GET(`projects/${projectId}/linkedProjects?transitive=true`, signal)

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
                if (!signal.aborted) {
                    setShowProcessingLinkedProjects(false)
                }
            }
        })()

        return () => {
            controller.abort()
            clearTimeout(timeout)
        }
    }, [
        projectId,
    ])

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal

        const timeLimit = memoizedAttachmentUsages === undefined ? 700 : 0
        setLoadedProjectId(undefined)
        setAttachmentUsages(undefined)
        setData([])
        const timeout = setTimeout(() => {
            setShowProcessingAttachmentUsages(true)
        }, timeLimit)

        void (async () => {
            try {
                const response = await ApiUtils.GET(`projects/${projectId}/attachmentUsage?transitive=true`, signal)

                if (response.status !== StatusCodes.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new ApiError(err.message, {
                        status: response.status,
                    })
                }

                const usages = (await response.json()) as AttachmentUsages
                usageStoreRef.current = [
                    ...usages._embedded['sw360:attachmentUsages'],
                ]
                usageIndexRef.current = indexUsages(usageStoreRef.current)
                initialUsagesRef.current = [
                    ...usageStoreRef.current,
                ]
                setAttachmentUsages(usages)
                setLoadedProjectId(projectId)
            } catch (error) {
                ApiUtils.reportError(error)
            } finally {
                clearTimeout(timeout)
                if (!signal.aborted) {
                    setShowProcessingAttachmentUsages(false)
                }
            }
        })()

        return () => {
            controller.abort()
            clearTimeout(timeout)
        }
    }, [
        projectId,
    ])

    const renderUsageCheckbox = (
        row: Row<ExtendedNestedRows<TypedAttachment | TypedRelease | TypedProject>>,
        type: UsageType,
    ): JSX.Element | null => {
        if (row.original.node.type !== 'attachment') return null
        const { attachmentType, attachmentContentId } = row.original.node.entity
        const release = row.getParentRow()?.original.node.entity as Release | undefined
        const selection: UsageSelection = {
            attachmentContentId: attachmentContentId ?? '',
            releaseId: release?._links?.self.href.split('/').at(-1) ?? '',
            projectId,
            projectPath: row.original.projectPath ?? projectId,
            type,
        }
        const key = usageKey(selection)
        return (
            <input
                key={key}
                type='checkbox'
                className='form-check-input'
                disabled={
                    !selection.releaseId ||
                    !selection.attachmentContentId ||
                    !(type === 'licenseInfo'
                        ? isLicenseInfoEnabled(attachmentType ?? '')
                        : isSourceCodeBundleEnabled(attachmentType ?? ''))
                }
                defaultChecked={usageIndexRef.current.has(key)}
                ref={(input) => {
                    if (!input) return
                    const inputs = inputRefs.current.get(key) ?? new Set<HTMLInputElement>()
                    inputs.add(input)
                    inputRefs.current.set(key, inputs)
                    return () => {
                        inputs.delete(input)
                        if (inputs.size === 0) inputRefs.current.delete(key)
                    }
                }}
                onChange={(event) => {
                    const checked = event.currentTarget.checked
                    usageStoreRef.current = setUsageSelected(
                        usageStoreRef.current,
                        initialUsagesRef.current,
                        selection,
                        checked,
                    )
                    if (checked) usageIndexRef.current.add(key)
                    else usageIndexRef.current.delete(key)
                    for (const input of inputRefs.current.get(key) ?? []) input.checked = checked
                    setFilterRevision((revision) => !revision)
                }}
            />
        )
    }

    const columns = useMemo<ColumnDef<ExtendedNestedRows<TypedAttachment | TypedRelease | TypedProject>>[]>(
        () => [
            {
                id: 'linkedReleasesAndProjects',
                header: () => (
                    <div className='d-flex justify-content-between align-items-center w-100'>
                        <div
                            className='d-flex align-items-center me-3'
                            style={{
                                gap: '6px',
                            }}
                        >
                            <span className='fw-bold'>
                                {t('Linked Releases and Projects')}
                                {' ('}
                                <button
                                    type='button'
                                    className='btn-reset table-text-link'
                                    onClick={() => {
                                        setExpandedState((prev) => {
                                            const next =
                                                typeof prev === 'object'
                                                    ? {
                                                          ...prev,
                                                      }
                                                    : {}
                                            if (!tableRef.current) return next

                                            const expandNextLevel = (
                                                rows: Row<
                                                    ExtendedNestedRows<TypedAttachment | TypedRelease | TypedProject>
                                                >[],
                                            ) => {
                                                for (const row of rows) {
                                                    if (!row.getCanExpand()) continue

                                                    if (!next[row.id]) {
                                                        next[row.id] = true
                                                    } else {
                                                        expandNextLevel(row.subRows ?? [])
                                                    }
                                                }
                                            }

                                            expandNextLevel(tableRef.current.getRowModel().rows)
                                            return next
                                        })
                                    }}
                                >
                                    {t('Expand next level')}
                                </button>
                                {' | '}
                                <button
                                    type='button'
                                    className='btn-reset table-text-link'
                                    onClick={() => setExpandedState({})}
                                >
                                    {t('Collapse all')}
                                </button>
                                {')'}
                            </span>
                        </div>

                        <div
                            className='d-flex align-items-center'
                            style={{
                                gap: '12px',
                                marginLeft: 'auto',
                                width: '1060px',
                                justifyContent: 'space-between',
                            }}
                        >
                            <select
                                className='form-select form-select-sm'
                                style={{
                                    width: '200px',
                                    height: '40px',
                                }}
                                value={releaseFilter}
                                onChange={(e) => setReleaseFilter(e.target.value)}
                            >
                                <option value=''>-- Release Filter --</option>

                                <option value='withCli'>With CLI Attachments</option>
                                <option value='withAttachments'>With Attachments</option>
                                <option value='withoutSrc'>Without Source Attachments</option>
                                <option value='withoutAttachments'>Without Attachments</option>
                                <option value='withoutCliUsage'>Without CLI Usage Set</option>
                                <option value='withoutSourceUsage'>Without Source Usage Set</option>
                            </select>

                            <input
                                type='text'
                                className='form-control form-control-sm'
                                style={{
                                    width: '230px',
                                }}
                                placeholder={t('Search')}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                ),
                columns: [
                    {
                        id: 'name',
                        enableSorting: true,
                        accessorKey: 'name',
                        header: t('Name'),
                        cell: ({ row }) => {
                            if (row.original.node.type === 'attachment') {
                                return <div className='text-center'>{row.original.node.entity.filename}</div>
                            }
                            if (row.original.node.type === 'release') {
                                const release = row.original.node.entity
                                const { name, version } = release

                                const cliCount = (release.attachments ?? []).filter(
                                    (att) => att.attachmentType === 'CLI' || att.attachmentType === 'CLX',
                                ).length
                                const badgeClass =
                                    cliCount === 0
                                        ? 'cli-badge cli-badge--red'
                                        : cliCount === 1
                                          ? 'cli-badge cli-badge--green'
                                          : 'cli-badge cli-badge--orange'

                                return (
                                    <PaddedCell row={row}>
                                        <Link
                                            className='text-link'
                                            href={`/components/releases/detail/${row.original.node.entity._links?.self.href.split('/').at(-1)}`}
                                        >{`${name} ${version}`}</Link>
                                        <span
                                            className='cli-badge-container'
                                            style={{
                                                marginLeft: 8,
                                            }}
                                        >
                                            <span
                                                className={badgeClass}
                                                aria-label={`CLI count ${cliCount}`}
                                            >
                                                {cliCount}
                                            </span>
                                            <span className='cli-tooltip'>CLI count</span>
                                        </span>
                                    </PaddedCell>
                                )
                            } else {
                                const { name, version, id } = row.original.node.entity
                                return (
                                    <PaddedCell row={row}>
                                        <Link
                                            className='text-link'
                                            href={`/projects/detail/${id}`}
                                        >
                                            {name}{' '}
                                            {!CommonUtils.isNullEmptyOrUndefinedString(version) && `(${version})`}
                                        </Link>
                                    </PaddedCell>
                                )
                            }
                        },
                        meta: {
                            width: '35%',
                        },
                    },
                    {
                        id: 'relation',
                        header: t('Relation'),
                        cell: ({ row }) => {
                            if (row.original.node.type === 'release') {
                                const { id } = row.original.node.entity
                                return (
                                    <div className='text-center'>
                                        {id &&
                                            CommonUtils.Capitalize(
                                                memoizedAttachmentUsages?.['releaseIdToUsage']?.[id]?.releaseRelation ??
                                                    '',
                                            )}
                                    </div>
                                )
                            } else if (row.original.node.type === 'project') {
                                const { id } = row.original.node.entity
                                return (
                                    <div className='text-center'>
                                        {id &&
                                            CommonUtils.Capitalize(
                                                memoizedAttachmentUsages?.['linkedProjects']?.[id]
                                                    ?.projectRelationship ?? '',
                                            )}
                                    </div>
                                )
                            }
                        },
                        meta: {
                            width: '10%',
                        },
                    },
                    {
                        id: 'uploadedBy',
                        header: t('Uploaded by'),
                        cell: ({ row }) => {
                            if (row.original.node.type === 'attachment') {
                                return <div className='text-center'>{row.original.node.entity.createdBy}</div>
                            }
                        },
                        meta: {
                            width: '15%',
                        },
                    },
                    {
                        id: 'type',
                        header: t('Type'),
                        cell: ({ row }) => {
                            if (row.original.node.type === 'attachment') {
                                return (
                                    <div className='text-center'>
                                        {getAttachmentTypeShortForm(row.original.node.entity.attachmentType)}
                                    </div>
                                )
                            }
                        },
                        meta: {
                            width: '10%',
                        },
                    },
                    {
                        id: 'usedIn',
                        header: t('Used In'),
                        columns: [
                            {
                                id: 'licenseInfo',
                                header: t('License Info'),
                                columns: [
                                    {
                                        id: 'licenseInfo.checked',
                                        cell: ({ row }) => renderUsageCheckbox(row, 'licenseInfo'),
                                        meta: {
                                            width: '5%',
                                        },
                                    },
                                    {
                                        id: 'licenseInfo.conclusions',
                                        header: t('Conclusions'),
                                        meta: {
                                            width: '5%',
                                        },
                                    },
                                ],
                            },
                            {
                                id: 'sourceCodeBundle',
                                header: t('Source Code Bundle'),
                                cell: ({ row }) => renderUsageCheckbox(row, 'sourcePackage'),
                                meta: {
                                    width: '10%',
                                },
                            },
                            {
                                id: 'other',
                                header: t('Other'),
                                cell: ({ row }) => renderUsageCheckbox(row, 'manuallySet'),
                                meta: {
                                    width: '10%',
                                },
                            },
                        ],
                    },
                ],
            },
        ],
        [
            t,
            memoizedAttachmentUsages,
            releaseFilter,
            projectId,
        ],
    )

    const table = useReactTable({
        // table state config
        state: {
            expanded: expandedState,
            sorting: [
                {
                    id: sort.columnName,
                    desc: !sort.isAsc,
                },
            ],
        },

        data: filteredData,
        columns,
        getRowId: (row, index, parent) => {
            const entityId =
                row.node.type === 'attachment'
                    ? (row.node.entity.attachmentContentId ?? row.node.entity._links?.self.href ?? String(index))
                    : (row.node.entity._links?.self.href ?? row.node.entity.id ?? String(index))
            return `${parent?.id ?? 'root'}:${row.node.type}:${entityId}`
        },
        getCoreRowModel: getCoreRowModel(),

        // expand config
        getExpandedRowModel: getExpandedRowModel(),
        getSubRows: (row) => row.children ?? [],
        getRowCanExpand: (row) => row.original.children !== undefined && row.original.children.length !== 0,
        onExpandedChange: setExpandedState,

        manualSorting: true,
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: (updater) => {
            setSort((previousSort) => {
                const previousSorting: SortingState = [
                    {
                        id: previousSort.columnName,
                        desc: !previousSort.isAsc,
                    },
                ]
                const nextSorting = typeof updater === 'function' ? updater(previousSorting) : updater

                if (nextSorting.length > 0) {
                    const { id, desc } = nextSorting[0]
                    return {
                        columnName: id,
                        isAsc: !desc,
                    }
                }

                return {
                    columnName: '',
                    isAsc: true,
                }
            })
        },
    })

    tableRef.current = table

    // function to add attachments to a release
    const formatReleaseAttachmentDataToTableData = (
        r: Release,
        release: ExtendedNestedRows<TypedProject | TypedRelease | TypedAttachment>,
        projectPath: string[],
    ) => {
        for (const att of r.attachments ?? []) {
            const attachment: ExtendedNestedRows<TypedProject | TypedRelease | TypedAttachment> = {
                node: {
                    entity: att,
                    type: 'attachment',
                },
                children: [],
                projectPath: projectPath.join(':'),
            }
            if (!release.children) release.children = []
            release.children.push(attachment)
        }
    }

    const buildTable = (
        setRowData: Dispatch<SetStateAction<ExtendedNestedRows<TypedProject | TypedRelease | TypedAttachment>[]>>,
        attachmentUsages: AttachmentUsages,
        linkedProjects: Project[],
        sort: Sort,
    ) => {
        const tableData: ExtendedNestedRows<TypedProject | TypedRelease | TypedAttachment>[] = []
        const projectPath: string[] = []
        projectPath.push(projectId)
        // adding releases and attachments of the base project
        for (const id in attachmentUsages.releaseIdToUsage) {
            for (const r of attachmentUsages['_embedded']['sw360:release']) {
                if (id === r._links?.self.href.split('/').at(-1)) {
                    const nodeRelease: ExtendedNestedRows<TypedProject | TypedRelease | TypedAttachment> = {
                        node: {
                            entity: r,
                            type: 'release',
                        },
                        children: [],
                    }
                    formatReleaseAttachmentDataToTableData(r, nodeRelease, projectPath)
                    tableData.push(nodeRelease)
                }
            }
        }

        // adding releases and attachments of the 1st level linked projects
        for (const pid in attachmentUsages['linkedProjects'] ?? {}) {
            let project: Project | undefined
            for (const p of linkedProjects) {
                if (p['_links']['self']['href'].split('/').at(-1) === pid) {
                    project = p
                    break
                }
            }
            if (!project) continue
            projectPath.push(pid)
            const nodeProject: ExtendedNestedRows<TypedProject | TypedRelease | TypedAttachment> = {
                node: {
                    type: 'project',
                    entity: project,
                },
                // adding releases and attachments of > 1st level linked projects
                children: extractLinkedProjectsAndTheirLinkedReleases(attachmentUsages, project, projectPath),
            }
            projectPath.pop()
            tableData.push(nodeProject)
        }
        projectPath.pop()
        sortAllLevels(tableData, sort)
        setRowData(tableData)
    }

    const extractLinkedProjectsAndTheirLinkedReleases = (
        attachmentUsages: AttachmentUsages,
        project: Project,
        projectPath: string[],
    ): ExtendedNestedRows<TypedProject | TypedRelease | TypedAttachment>[] => {
        const rows: ExtendedNestedRows<TypedProject | TypedRelease | TypedAttachment>[] = []

        for (const p of project._embedded?.['sw360:linkedProjects'] ?? []) {
            projectPath.push(p.id ?? '')
            const nodeProject: ExtendedNestedRows<TypedProject | TypedRelease | TypedAttachment> = {
                node: {
                    type: 'project',
                    entity: p,
                },
                children: extractLinkedProjectsAndTheirLinkedReleases(attachmentUsages, p, projectPath),
            }
            projectPath.pop()
            rows.push(nodeProject)
        }

        for (const l of project['linkedReleases'] ?? []) {
            for (const r of attachmentUsages['_embedded']['sw360:release']) {
                if (r._links?.self.href.split('/').at(-1) === l.release.split('/').at(-1)) {
                    const nodeRelease: ExtendedNestedRows<TypedProject | TypedRelease | TypedAttachment> = {
                        node: {
                            entity: r,
                            type: 'release',
                        },
                        children: [],
                    }
                    formatReleaseAttachmentDataToTableData(r, nodeRelease, projectPath)
                    rows.push(nodeRelease)
                }
            }
        }

        return rows
    }

    useEffect(() => {
        if (memoizedAttachmentUsages === undefined) return

        setIsTableBuilding(true)
        // Use requestAnimationFrame to allow the browser to paint the loading indicator
        // before starting the expensive table build
        requestAnimationFrame(() => {
            buildTable(setData, memoizedAttachmentUsages, memoizedLinkedProjects, sort)
            setIsTableBuilding(false)
        })
    }, [
        memoizedAttachmentUsages,
        memoizedLinkedProjects,
        projectId,
        sort,
    ])

    return (
        <>
            <button
                type='button'
                className='btn btn-secondary mb-2'
                onClick={() => void handleSaveUsages()}
                disabled={loadedProjectId !== projectId || saveUsagesLoading}
            >
                {t('Save Usages')}{' '}
                {saveUsagesLoading === true && (
                    <Spinner
                        className='spinner'
                        size='sm'
                    />
                )}
            </button>
            <div className='mb-3'>
                {table ? (
                    <SW360Table
                        table={table}
                        showProcessing={
                            showProcessingLinkedProjects || showProcessingAttachmentUsages || isTableBuilding
                        }
                        renderRow={(row, defaultRow) => {
                            if (row.original.node.type !== 'attachment') return defaultRow

                            const attachment = row.original.node.entity
                            const tooltipContent = [
                                `Created On: ${attachment.createdOn ?? ''}`,
                                `Status: ${attachment.checkStatus ?? ''}`,
                                ...(attachment.checkedBy
                                    ? [
                                          `Checked By: ${attachment.checkedBy}`,
                                      ]
                                    : []),
                                ...(attachment.checkedOn
                                    ? [
                                          `Checked On: ${attachment.checkedOn}`,
                                      ]
                                    : []),
                            ].join('\n')

                            return (
                                <OverlayTrigger
                                    key={row.id}
                                    placement='top'
                                    overlay={(tooltipProps) => (
                                        <Tooltip {...tooltipProps}>
                                            <span
                                                className='text-start d-inline-block'
                                                style={{
                                                    whiteSpace: 'pre-line',
                                                }}
                                            >
                                                {tooltipContent}
                                            </span>
                                        </Tooltip>
                                    )}
                                >
                                    {defaultRow}
                                </OverlayTrigger>
                            )
                        }}
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

// Pass notAllowedUserGroups to AccessControl to restrict access
export default AccessControl(AttachmentUsagesComponent, [
    UserGroupType.SECURITY_USER,
])
