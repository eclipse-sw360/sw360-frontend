// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import {
    ColumnDef,
    ExpandedState,
    ExpandedStateList,
    getCoreRowModel,
    getExpandedRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from '@tanstack/react-table'
import { StatusCodes } from 'http-status-codes'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { PaddedCell, SW360Table } from 'next-sw360'
import { ReactNode, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Button, Nav, Spinner, Tab } from 'react-bootstrap'
import { AccessControl } from '@/components/AccessControl/AccessControl'
import { useDocumentTitle } from '@/hooks'
import {
    Attachment,
    AttachmentUsages,
    Embedded,
    ErrorDetails,
    NestedRows,
    Project,
    Release,
    SaveUsagesPayload,
    TypedEntity,
    UserGroupType,
} from '@/object-types'
import { ApiError, CommonUtils } from '@/utils'
import ApiUtils from '@/utils/api/authenticatedApi.util'
import DownloadLicenseInfoModal from './DownloadLicenseInfoModal'
import LicenseInfoDownloadConfirmationModal from './LicenseInfoDownloadConfirmation'
import {
    applyAttachmentToggle,
    createEmptyStore,
    type License,
    LicenseDetailLoader,
    payloadFromStore,
    restoreLicenseUsages,
    type SelectionStore,
    storeFromPayload,
    toggleLicenseInStore,
} from './licenseInfo.utils'

type LinkedProjects = Embedded<Project, 'sw360:projects'>

type TypedProject = TypedEntity<Project, 'project'>

interface ReleaseWithAttachmentInfo extends Release {
    hasMultipleAttachments: boolean
}

type TypedRelease = TypedEntity<ReleaseWithAttachmentInfo, 'release'>

type TypedAttachment = TypedEntity<Attachment, 'attachment'>

interface ExtendedNestedRows<K> extends NestedRows<K> {
    projectPath?: string
    id?: string
    releaseId?: string
}

type TypedLicense = TypedEntity<License, 'license'>

const Capitalize = (text: string) =>
    text.split('_').reduce((s, c) => s + ' ' + (c.charAt(0) + c.substring(1).toLocaleLowerCase()), '')

const hasCliUsageSet = (release: Release, projectPath: string, selectedUsages: Set<string>): boolean => {
    const cliAttachments =
        release.attachments?.filter(
            (att) => att.attachmentType === 'CLI' || att.attachmentType === 'CLX' || att.attachmentType === 'ISR',
        ) ?? []

    if (cliAttachments.length === 0) return false

    const releaseId = release._links?.self.href.split('/').at(-1) ?? ''

    // Check if ANY CLI attachment has license info usage set
    return cliAttachments.some((att) => {
        const pathPrefix = projectPath ? `${projectPath}-` : ''
        return selectedUsages.has(`${pathPrefix}${releaseId}_licenseInfo_${att.attachmentContentId}`)
    })
}

// function to add attachments to a release
const formatReleaseAttachmentDataToTableData = (
    r: Release,
    licenses: {
        [id: string]: License[]
    },
    release: ExtendedNestedRows<TypedProject | TypedRelease | TypedAttachment | TypedLicense>,
    projectPath: string[],
) => {
    for (const att of r.attachments ?? []) {
        const relId = r._links?.self.href.split('/').at(-1) ?? ''
        const attachment: ExtendedNestedRows<TypedProject | TypedRelease | TypedAttachment | TypedLicense> = {
            id: `${projectPath.join(':')}-${relId}_${att.attachmentContentId}`,
            releaseId: relId,
            node: {
                entity: att,
                type: 'attachment',
            },
            children: (licenses[`${relId}_${att.attachmentContentId}`] ?? []).map(
                (lic) =>
                    ({
                        id: `${projectPath.join(':')}-${relId}_${att.attachmentContentId}_${lic.name}`,
                        node: {
                            entity: lic,
                            type: 'license',
                        },
                        children: [],
                        projectPath: projectPath.join(':'),
                    }) as ExtendedNestedRows<TypedProject | TypedRelease | TypedAttachment | TypedLicense>,
            ),
            projectPath: projectPath.join(':'),
        }
        if (!release.children) release.children = []
        release.children.push(attachment)
    }
}

const extractLinkedProjectsAndTheirLinkedReleases = (
    releasesById: Map<string, Release>,
    licenses: {
        [id: string]: License[]
    },
    project: Project,
    projectPath: string[],
): ExtendedNestedRows<TypedProject | TypedRelease | TypedAttachment | TypedLicense>[] => {
    const rows: ExtendedNestedRows<TypedProject | TypedRelease | TypedAttachment | TypedLicense>[] = []

    for (const p of project._embedded?.['sw360:linkedProjects'] ?? []) {
        projectPath.push(p._links.self.href.split('/').at(-1) ?? '')
        const nodeProject: ExtendedNestedRows<TypedProject | TypedRelease | TypedAttachment | TypedLicense> = {
            id: projectPath.join(':'),
            node: {
                type: 'project',
                entity: p,
            },
            children: extractLinkedProjectsAndTheirLinkedReleases(releasesById, licenses, p, projectPath),
        }
        projectPath.pop()
        if (nodeProject.children && nodeProject.children.length !== 0) {
            rows.push(nodeProject)
        }
    }

    for (const l of project['linkedReleases'] ?? []) {
        const r = releasesById.get(l.release.split('/').at(-1) ?? '')
        if (r) {
            const nodeRelease: ExtendedNestedRows<TypedProject | TypedRelease | TypedAttachment | TypedLicense> = {
                id: `${projectPath.join(':')}-${l.release.split('/').at(-1)}`,
                node: {
                    entity: {
                        ...r,
                        hasMultipleAttachments: (r.attachments?.length ?? 0) > 1,
                    },
                    type: 'release',
                },
                children: [],
            }
            formatReleaseAttachmentDataToTableData(r, licenses, nodeRelease, projectPath)
            if (nodeRelease.children && nodeRelease.children.length !== 0) {
                rows.push(nodeRelease)
            }
        }
    }

    return rows
}

const buildTable = (
    projectId: string,
    attachmentUsages: AttachmentUsages,
    linkedProjects: Project[],
    licenses: {
        [id: string]: License[]
    },
    sort: Sort,
) => {
    const releasesById = new Map(
        attachmentUsages._embedded['sw360:release'].map((release) => [
            release._links?.self.href.split('/').at(-1) ?? '',
            release,
        ]),
    )
    const projectsById = new Map(
        linkedProjects.map((project) => [
            project._links.self.href.split('/').at(-1) ?? '',
            project,
        ]),
    )
    const tableData: ExtendedNestedRows<TypedProject | TypedRelease | TypedAttachment | TypedLicense>[] = []
    const projectPath: string[] = [
        projectId,
    ]
    // adding releases and attachments of the base project
    for (const id in attachmentUsages.releaseIdToUsage) {
        const r = releasesById.get(id)
        if (r) {
            const nodeRelease: ExtendedNestedRows<TypedProject | TypedRelease | TypedAttachment | TypedLicense> = {
                id: `${projectPath.join(':')}-${id}`,
                node: {
                    entity: {
                        ...r,
                        hasMultipleAttachments: (r.attachments?.length ?? 0) > 1,
                    },
                    type: 'release',
                },
                children: [],
            }
            formatReleaseAttachmentDataToTableData(r, licenses, nodeRelease, projectPath)
            if (nodeRelease.children && nodeRelease.children.length !== 0) {
                tableData.push(nodeRelease)
            }
        }
    }

    // adding releases and attachments of the 1st level linked projects
    for (const pid in attachmentUsages['linkedProjects'] ?? {}) {
        const project = projectsById.get(pid)
        if (!project) continue
        projectPath.push(pid)
        const nodeProject: ExtendedNestedRows<TypedProject | TypedRelease | TypedAttachment | TypedLicense> = {
            id: projectPath.join(':'),
            node: {
                type: 'project',
                entity: project,
            },
            // adding releases and attachments of > 1st level linked projects
            children: extractLinkedProjectsAndTheirLinkedReleases(releasesById, licenses, project, projectPath),
        }
        projectPath.pop()
        if (nodeProject.children && nodeProject.children.length !== 0) {
            tableData.push(nodeProject)
        }
    }
    sortAllLevels(tableData, sort)
    return tableData
}

function filterApprovedReleases(
    tableData: ExtendedNestedRows<TypedProject | TypedRelease | TypedAttachment | TypedLicense>[],
): ExtendedNestedRows<TypedProject | TypedRelease | TypedAttachment | TypedLicense>[] {
    return tableData.reduce<ExtendedNestedRows<TypedProject | TypedRelease | TypedAttachment | TypedLicense>[]>(
        (rows, row) => {
            if (row.node.type === 'release' && row.node.entity.clearingState !== 'APPROVED') return rows

            if (row.node.type === 'project') {
                const children = filterApprovedReleases(row.children ?? [])
                if (children.length === 0) return rows
                rows.push({
                    ...row,
                    children,
                })
                return rows
            }

            rows.push(row)
            return rows
        },
        [],
    )
}

function filterReleasesWithUsage(
    tableData: ExtendedNestedRows<TypedProject | TypedRelease | TypedAttachment | TypedLicense>[],
    projectPath: string[],
    selectedUsages: Set<string>,
): ExtendedNestedRows<TypedProject | TypedRelease | TypedAttachment | TypedLicense>[] {
    return tableData.reduce<ExtendedNestedRows<TypedProject | TypedRelease | TypedAttachment | TypedLicense>[]>(
        (rows, row) => {
            if (row.node.type === 'release' && hasCliUsageSet(row.node.entity, projectPath.join(':'), selectedUsages)) {
                return rows
            }

            if (row.node.type === 'project') {
                const projectId = row.node.entity._links.self.href.split('/').at(-1) ?? ''
                const filteredChildren = filterReleasesWithUsage(
                    row.children ?? [],
                    [
                        ...projectPath,
                        projectId,
                    ],
                    selectedUsages,
                )
                if (filteredChildren.length === 0) return rows
                rows.push({
                    ...row,
                    children: filteredChildren,
                })
                return rows
            }

            rows.push(row)
            return rows
        },
        [],
    )
}

const fetchReleaseRelationsFromLinkedProjects = (linkedProjects: Project[], filters: Set<string>) => {
    for (const p of linkedProjects) {
        for (const l of p.linkedReleases ?? []) {
            filters.add(l.relation)
        }
        fetchReleaseRelationsFromLinkedProjects(p._embedded?.['sw360:linkedProjects'] ?? [], filters)
    }
}

const fetchProjectRelationsFromLinkedProjects = (linkedProjects: Project[], filters: Set<string>) => {
    for (const p of linkedProjects) {
        for (const l of p.linkedProjects ?? []) {
            filters.add(l.relation)
        }
        fetchProjectRelationsFromLinkedProjects(p._embedded?.['sw360:linkedProjects'] ?? [], filters)
    }
}

const collectAttachmentSelectionKeys = (
    rows: ExtendedNestedRows<TypedProject | TypedRelease | TypedAttachment | TypedLicense>[],
): string[] => {
    const keys = new Set<string>()

    const visit = (
        currentRows: ExtendedNestedRows<TypedProject | TypedRelease | TypedAttachment | TypedLicense>[],
        releaseId?: string,
    ) => {
        for (const row of currentRows) {
            if (row.node.type === 'release') {
                const currentReleaseId = row.node.entity._links?.self.href.split('/').at(-1) ?? ''
                visit(row.children ?? [], currentReleaseId)
                continue
            }

            if (row.node.type === 'attachment' && releaseId) {
                const key = `${
                    !CommonUtils.isNullEmptyOrUndefinedString(row.projectPath) ? `${row.projectPath}-` : ''
                }${releaseId}_licenseInfo_${row.node.entity.attachmentContentId}`
                keys.add(key)
            }

            visit(row.children ?? [], releaseId)
        }
    }

    visit(rows)

    return Array.from(keys)
}

interface Sort {
    columnName: string
    isAsc: boolean
}

// This function sorts only projects and releases. Child attachments and licenses are not sorted
const comparator = (
    firstRow: ExtendedNestedRows<TypedProject | TypedRelease | TypedAttachment | TypedLicense>,
    secondRow: ExtendedNestedRows<TypedProject | TypedRelease | TypedAttachment | TypedLicense>,
    sort?: Sort,
): number => {
    if (
        firstRow.node.type === 'attachment' ||
        secondRow.node.type === 'attachment' ||
        firstRow.node.type === 'license' ||
        secondRow.node.type === 'license'
    )
        return 0
    const typeOrder = {
        release: 0,
        project: 1,
    }
    const typeDifference = typeOrder[firstRow.node.type] - typeOrder[secondRow.node.type]
    if (typeDifference !== 0) return typeDifference

    const firstName = `${firstRow.node.entity.name ?? ''} (${firstRow.node.entity.version ?? ''})`
    const secondName = `${secondRow.node.entity.name ?? ''} (${secondRow.node.entity.version ?? ''})`
    const difference = firstName.localeCompare(secondName, undefined, {
        sensitivity: 'base',
    })
    return sort?.isAsc === false ? -difference : difference
}

const sortAllLevels = (
    rows: ExtendedNestedRows<TypedProject | TypedRelease | TypedAttachment | TypedLicense>[],
    sort?: Sort,
): void => {
    for (const row of rows) {
        if (row.children && row.children.length !== 0) sortAllLevels(row.children, sort)
    }
    rows.sort((firstRow, secondRow) => comparator(firstRow, secondRow, sort))
}

function GenerateLicenseInfo({
    projectId,
}: Readonly<{
    projectId: string
}>): ReactNode {
    const t = useTranslations('default')
    const [project, setProject] = useState<Project>()
    const params = useSearchParams()
    const withSubProjects = params.get('withSubProjects')

    const storeRef = useRef<SelectionStore>(createEmptyStore())

    const attachmentInputRefs = useRef(new Map<string, HTMLInputElement>())
    const licenseInputRefs = useRef(new Map<string, Map<string, HTMLInputElement>>())
    const selectAllRef = useRef<HTMLInputElement | null>(null)
    const attachmentSelectionKeysRef = useRef<string[]>([])

    const [show, setShow] = useState(false)
    const [downloadPayload, setDownloadPayload] = useState<SaveUsagesPayload>({
        selected: [],
        deselected: [],
        selectedConcludedUsages: [],
        deselectedConcludedUsages: [],
        ignoredLicenses: {},
    })
    const [hideWithUsage, setHideWithUsage] = useState(false)
    const [key, setKey] = useState<string>('show_all')
    const [showConfirmation, setShowConfirmation] = useState(false)
    const [isCalledFromProjectLicenseTab, setIsCalledFromProjectLicenseTab] = useState<boolean>(false)
    const [projectReleaseRelationships, setProjectReleaseRelationships] = useState<string[]>([])
    const [projectProjectRelationships, setProjectProjectRelationships] = useState<string[]>([])
    const [sort, setSort] = useState<Sort>({
        columnName: 'name',
        isAsc: true,
    })
    const [expandedState, setExpandedState] = useState<ExpandedState>({})
    const hasExpandedInitialDataRef = useRef(false)
    const [showProcessing, setShowProcessing] = useState(true)
    const [metadataLoaded, setMetadataLoaded] = useState(false)
    const [attachmentUsages, setAttachmentUsages] = useState<AttachmentUsages | undefined>(undefined)
    const [linkedProjects, setLinkedProjects] = useState<Project[]>(() => [])

    const [licenses, setLicenses] = useState<Record<string, License[]>>({})
    const detailLoader = useRef<LicenseDetailLoader | null>(null)
    const detailStatuses = useRef(new Map<string, 'loading' | 'loaded' | 'error'>())
    const [detailErrors, setDetailErrors] = useState<Set<string>>(new Set())
    const loadLicenses = useCallback(async (releaseId: string, attachmentId: string, retry = false) => {
        const loader = detailLoader.current
        const key = `${releaseId}_${attachmentId}`
        if (
            !releaseId ||
            !attachmentId ||
            !loader ||
            loader.signal.aborted ||
            (!retry && detailStatuses.current.has(key))
        )
            return
        detailStatuses.current.set(key, 'loading')
        setDetailErrors((previous) => {
            const next = new Set(previous)
            next.delete(key)
            return next
        })
        try {
            const result = await loader.load(releaseId, attachmentId)
            if (loader.signal.aborted) return
            detailStatuses.current.set(key, 'loaded')
            setLicenses((previous) => ({
                ...previous,
                [key]: result,
            }))
        } catch (error) {
            if (loader.signal.aborted) return
            detailStatuses.current.set(key, 'error')
            setDetailErrors((previous) => new Set(previous).add(key))
            ApiUtils.reportError(error)
        }
    }, [])
    const tableData = useMemo(
        () => (attachmentUsages ? buildTable(projectId, attachmentUsages, linkedProjects, licenses, sort) : []),
        [
            projectId,
            attachmentUsages,
            linkedProjects,
            licenses,
            sort,
        ],
    )
    // `hideWithUsage` reads a snapshot of the ref store at the time the tab/filter changes rather
    // than reacting to every checkbox click (which would defeat the point of the ref-based store).
    const data = useMemo(() => {
        const approved = key === 'only_approved' ? filterApprovedReleases(tableData) : tableData
        return hideWithUsage
            ? filterReleasesWithUsage(
                  approved,
                  [
                      projectId,
                  ],
                  storeRef.current.selected,
              )
            : approved
    }, [
        tableData,
        key,
        hideWithUsage,
        projectId,
    ])

    useDocumentTitle(project?.name ? CommonUtils.formatDocumentTitle(project.name, project.version) : undefined)

    useEffect(() => {
        if (!project) return

        const releaseRelationFilters: Set<string> = new Set<string>()
        const projectRelationFilters: Set<string> = new Set<string>()

        for (const l of project.linkedReleases ?? []) {
            releaseRelationFilters.add(l.relation)
        }
        for (const l of project.linkedProjects ?? []) {
            projectRelationFilters.add(l.relation)
        }
        if (linkedProjects && linkedProjects.length > 0) {
            fetchReleaseRelationsFromLinkedProjects(linkedProjects, releaseRelationFilters)
            fetchProjectRelationsFromLinkedProjects(linkedProjects, projectRelationFilters)
        }
        setProjectReleaseRelationships([
            ...releaseRelationFilters,
        ])
        setProjectProjectRelationships([
            ...projectRelationFilters,
        ])
    }, [
        project,
        linkedProjects,
    ])

    const attachmentSelectionKeys = useMemo(
        () => collectAttachmentSelectionKeys(data),
        [
            data,
        ],
    )
    attachmentSelectionKeysRef.current = attachmentSelectionKeys

    // Recomputes and imperatively applies the header checkbox's checked/indeterminate state.
    const updateSelectAllHeader = useCallback(() => {
        const el = selectAllRef.current
        if (!el) return
        const keys = attachmentSelectionKeysRef.current
        if (keys.length === 0) {
            el.checked = false
            el.indeterminate = false
            return
        }
        const selectedCount = keys.reduce((acc, k) => acc + (storeRef.current.selected.has(k) ? 1 : 0), 0)
        el.checked = selectedCount === keys.length
        el.indeterminate = selectedCount > 0 && selectedCount < keys.length
    }, [])

    // Recompute the header checkbox whenever the visible dataset changes (tab/filter/sort),
    // since defaultChecked on the (uncontrolled) input only applies on first mount.
    useEffect(() => {
        updateSelectAllHeader()
    }, [
        data,
        updateSelectAllHeader,
    ])

    const handleToggleAllAttachments = useCallback(
        (checked: boolean) => {
            const store = storeRef.current
            for (const key of attachmentSelectionKeysRef.current) {
                const ignoredKey = key.replace('_licenseInfo_', '_')
                store.ignoredLicenses.delete(ignoredKey)
                if (checked) {
                    store.selected.add(key)
                    store.deselected.delete(key)
                } else {
                    store.selected.delete(key)
                    store.deselected.add(key)
                    store.selectedConcludedUsages.delete(key)
                    store.deselectedConcludedUsages.delete(key)
                }
                const attEl = attachmentInputRefs.current.get(key)
                if (attEl) attEl.checked = checked
                const licenseMap = licenseInputRefs.current.get(key)
                if (licenseMap) {
                    for (const el of licenseMap.values()) el.checked = checked
                }
            }
            updateSelectAllHeader()
        },
        [
            updateSelectAllHeader,
        ],
    )

    const handleToggleAttachment = useCallback(
        (key: string) => {
            const store = storeRef.current
            const nowSelected = applyAttachmentToggle(store, key)
            const licenseMap = licenseInputRefs.current.get(key)
            if (licenseMap) {
                const ignoredKey = key.replace('_licenseInfo_', '_')
                const ignoredSet = store.ignoredLicenses.get(ignoredKey)
                for (const [name, el] of licenseMap) {
                    el.checked = nowSelected && !(ignoredSet?.has(name) ?? false)
                }
            }
            updateSelectAllHeader()
        },
        [
            updateSelectAllHeader,
        ],
    )

    const handleToggleLicense = useCallback(
        (attKey: string, ignoredKey: string, licenseName: string, siblingLicenses: License[]) => {
            const store = storeRef.current
            const attachmentSelectedBefore = store.selected.has(attKey)
            const attachmentSelectedAfter = toggleLicenseInStore(
                store,
                attKey,
                ignoredKey,
                licenseName,
                siblingLicenses,
            )

            const attEl = attachmentInputRefs.current.get(attKey)
            if (attEl) attEl.checked = attachmentSelectedAfter

            if (attachmentSelectedAfter !== attachmentSelectedBefore) updateSelectAllHeader()
        },
        [
            updateSelectAllHeader,
        ],
    )

    const registerAttachmentInput = useCallback(
        (key: string) => (el: HTMLInputElement | null) => {
            if (el) attachmentInputRefs.current.set(key, el)
            else attachmentInputRefs.current.delete(key)
        },
        [],
    )

    const registerLicenseInput = useCallback(
        (attKey: string, licenseName: string) => (el: HTMLInputElement | null) => {
            let licenseMap = licenseInputRefs.current.get(attKey)
            if (el) {
                if (!licenseMap) {
                    licenseMap = new Map()
                    licenseInputRefs.current.set(attKey, licenseMap)
                }
                licenseMap.set(licenseName, el)
            } else if (licenseMap) {
                licenseMap.delete(licenseName)
                if (licenseMap.size === 0) licenseInputRefs.current.delete(attKey)
            }
        },
        [],
    )

    const columns = useMemo<
        ColumnDef<ExtendedNestedRows<TypedAttachment | TypedRelease | TypedProject | TypedLicense>>[]
    >(
        () => [
            {
                id: 'licenseInfo',
                header: () => (
                    <input
                        id='project_clearing_report_select_all_attachments'
                        ref={selectAllRef}
                        type='checkbox'
                        className='form-check-input'
                        defaultChecked={false}
                        onChange={(event) => handleToggleAllAttachments(event.target.checked)}
                        disabled={attachmentSelectionKeys.length === 0}
                        aria-label='Select all attachments'
                    />
                ),
                cell: ({ row }) => {
                    if (row.original.node.type === 'attachment') {
                        const { attachmentContentId } = row.original.node.entity
                        const r = row.getParentRow()?.original.node.entity as Release
                        const key = `${
                            !CommonUtils.isNullEmptyOrUndefinedString(row.original.projectPath)
                                ? `${row.original.projectPath}-`
                                : ''
                        }${r._links?.self.href.split('/').at(-1) ?? ''}_licenseInfo_${attachmentContentId}`
                        return (
                            <div
                                className={
                                    (row.getParentRow()?.original?.children?.length ?? 0) > 1
                                        ? 'orange-cell'
                                        : 'green-cell'
                                }
                            >
                                <input
                                    type='checkbox'
                                    className='form-check-input'
                                    ref={registerAttachmentInput(key)}
                                    defaultChecked={storeRef.current.selected.has(key)}
                                    onChange={() => handleToggleAttachment(key)}
                                />
                            </div>
                        )
                    } else if (row.original.node.type === 'release') {
                        return (
                            <div
                                className={`text-center ${
                                    (row.original.node.entity?.hasMultipleAttachments ?? false)
                                        ? 'orange-cell'
                                        : 'green-cell'
                                }`}
                            ></div>
                        )
                    } else if (row.original.node.type === 'license') {
                        const lic = row.original.node.entity as License
                        const r = row.getParentRow()?.getParentRow()?.original.node.entity as Release
                        const att = row.getParentRow()?.original.node.entity as Attachment

                        const key = `${
                            !CommonUtils.isNullEmptyOrUndefinedString(row.original.projectPath)
                                ? `${row.original.projectPath}-`
                                : ''
                        }${r._links?.self.href.split('/').at(-1) ?? ''}_${att.attachmentContentId ?? ''}`

                        const att_key = `${
                            !CommonUtils.isNullEmptyOrUndefinedString(row.original.projectPath)
                                ? `${row.original.projectPath}-`
                                : ''
                        }${r._links?.self.href.split('/').at(-1) ?? ''}_licenseInfo_${att.attachmentContentId ?? ''}`

                        const ignoredForKey = storeRef.current.ignoredLicenses.get(key)
                        const defaultChecked =
                            !(ignoredForKey?.has(lic.name) ?? false) && storeRef.current.selected.has(att_key)
                        return (
                            <input
                                type='checkbox'
                                className='form-check-input'
                                ref={registerLicenseInput(att_key, lic.name)}
                                defaultChecked={defaultChecked}
                                onChange={() =>
                                    handleToggleLicense(
                                        att_key,
                                        key,
                                        lic.name,
                                        (row.getParentRow()?.original.children ?? []).map(
                                            (child) => child.node.entity as License,
                                        ),
                                    )
                                }
                            />
                        )
                    }
                },
                meta: {
                    width: '2%',
                },
            },
            {
                id: 'lvl',
                header: t('Lvl'),
                cell: ({ row }) => {
                    if (row.original.node.type === 'attachment') {
                        return (
                            <div
                                className={
                                    (row.getParentRow()?.original?.children?.length ?? 0) > 1
                                        ? 'orange-cell'
                                        : 'green-cell'
                                }
                            >
                                <PaddedCell row={row}>
                                    <div className='text-center'>{(row.getParentRow()?.depth ?? 0) + 1}</div>
                                </PaddedCell>
                            </div>
                        )
                    } else if (row.original.node.type === 'release') {
                        return (
                            <div
                                className={`text-center ${
                                    (row.original?.children?.length ?? 0) > 1 ? 'orange-cell' : 'green-cell'
                                }`}
                            >
                                <PaddedCell row={row}>
                                    <div className='text-center'>{row.depth + 1}</div>
                                </PaddedCell>
                            </div>
                        )
                    } else if (row.original.node.type === 'license') {
                        return (
                            <PaddedCell row={row}>
                                <div className='text-center'>{row.getParentRow()?.depth ?? 0}</div>
                            </PaddedCell>
                        )
                    }
                    return (
                        <PaddedCell row={row}>
                            <div className='text-center'>{row.depth + 1}</div>
                        </PaddedCell>
                    )
                },
                meta: {
                    width: '10%',
                },
            },
            {
                id: 'name',
                header: t('Name'),
                enableSorting: true,
                accessorKey: 'name',
                cell: ({ row }) => {
                    if (row.original.node.type === 'attachment') {
                        const attachmentId = row.original.node.entity.attachmentContentId ?? ''
                        const releaseId = row.original.releaseId ?? ''
                        const detailKey = `${releaseId}_${attachmentId}`
                        return (
                            <div
                                className={`text-center ${
                                    ((row.getParentRow()?.original.node.entity as ReleaseWithAttachmentInfo | undefined)
                                        ?.hasMultipleAttachments ?? false)
                                        ? 'orange-cell'
                                        : 'green-cell'
                                }`}
                            >
                                {row.original.node.entity.filename}
                                {row.getIsExpanded() && detailErrors.has(detailKey) ? (
                                    <Button
                                        variant='link'
                                        onClick={() => void loadLicenses(releaseId, attachmentId, true)}
                                    >
                                        {t('Retry')}
                                    </Button>
                                ) : (
                                    row.getIsExpanded() &&
                                    licenses[detailKey] === undefined && (
                                        <Spinner
                                            size='sm'
                                            className='ms-2'
                                        />
                                    )
                                )}
                            </div>
                        )
                    } else if (row.original.node.type === 'release') {
                        const { name, version } = row.original.node.entity
                        return (
                            <div
                                className={`text-center ${
                                    (row.original.node.entity?.hasMultipleAttachments ?? false)
                                        ? 'orange-cell'
                                        : 'green-cell'
                                }`}
                            >
                                <Link
                                    className='text-link'
                                    href={`/components/releases/detail/${row.original.node.entity._links?.self.href.split('/').at(-1)}`}
                                >{`${name} ${version}`}</Link>
                            </div>
                        )
                    } else if (row.original.node.type === 'project') {
                        const { name, version, id } = row.original.node.entity
                        return (
                            <Link
                                className='text-link'
                                href={`/projects/detail/${id}`}
                            >
                                {name} {!CommonUtils.isNullEmptyOrUndefinedString(version) && `(${version})`}
                            </Link>
                        )
                    } else {
                        const { name } = row.original.node.entity
                        return <p>{name}</p>
                    }
                },
                meta: {
                    width: '30%',
                },
            },
            {
                id: 'type',
                header: t('Type'),
                cell: ({ row }) => {
                    if (row.original.node.type === 'release') {
                        return (
                            <div
                                className={`text-center ${
                                    (row.original.node.entity?.hasMultipleAttachments ?? false)
                                        ? 'orange-cell'
                                        : 'green-cell'
                                }`}
                            >
                                {row.original.node.entity.componentType ?? ''}
                            </div>
                        )
                    } else if (row.original.node.type === 'project') {
                        return <div className='text-center'>{row.original.node.entity.projectType ?? ''}</div>
                    } else if (row.original.node.type === 'attachment') {
                        const att = row.original.node.entity
                        return (
                            <p
                                className={`text-center ${
                                    ((row.getParentRow()?.original.node.entity as ReleaseWithAttachmentInfo | undefined)
                                        ?.hasMultipleAttachments ?? false)
                                        ? 'orange-cell'
                                        : 'green-cell'
                                }`}
                            >
                                {att.attachmentUsageCount === undefined || att.attachmentUsageCount === 0
                                    ? t('not used in any project yet')
                                    : t.rich('USED_BY ATTACHMENTS', {
                                          num: att.attachmentUsageCount,
                                          strong: (chunks) => <b>{chunks}</b>,
                                      })}
                            </p>
                        )
                    } else {
                        const { text } = row.original.node.entity as License
                        return <p>{text}</p>
                    }
                },
                meta: {
                    width: '10%',
                },
            },
            {
                id: 'clearingState',
                header: t('Clearing State'),
                cell: ({ row }) => {
                    if (row.original.node.type === 'release') {
                        return (
                            <div
                                className={`text-center ${
                                    (row.original.node.entity?.hasMultipleAttachments ?? false)
                                        ? 'orange-cell'
                                        : 'green-cell'
                                }`}
                            >
                                {Capitalize(row.original.node.entity.clearingState ?? '')}
                            </div>
                        )
                    } else if (row.original.node.type === 'project') {
                        return (
                            <div className='text-center'>
                                {Capitalize(row.original.node.entity.clearingState ?? '')}
                            </div>
                        )
                    } else if (row.original.node.type === 'attachment') {
                        return (
                            <div
                                className={`text-center ${
                                    ((row.getParentRow()?.original.node.entity as ReleaseWithAttachmentInfo | undefined)
                                        ?.hasMultipleAttachments ?? false)
                                        ? 'orange-cell'
                                        : 'green-cell'
                                }`}
                            >
                                {Capitalize(row.original.node.entity.checkStatus ?? '')}
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
                        return (
                            <div
                                className={`text-center ${
                                    ((row.getParentRow()?.original.node.entity as ReleaseWithAttachmentInfo | undefined)
                                        ?.hasMultipleAttachments ?? false)
                                        ? 'orange-cell'
                                        : 'green-cell'
                                }`}
                            >
                                {row.original.node.entity.createdBy}
                            </div>
                        )
                    } else if (row.original.node.type === 'release') {
                        return (
                            <div
                                className={`text-center ${
                                    (row.original.node.entity?.hasMultipleAttachments ?? false)
                                        ? 'orange-cell'
                                        : 'green-cell'
                                }`}
                            ></div>
                        )
                    }
                },
                meta: {
                    width: '15%',
                },
            },
            {
                id: 'clearingTeam',
                header: t('Clearing Team'),
                cell: ({ row }) => {
                    if (row.original.node.type === 'attachment') {
                        return (
                            <div
                                className={`text-center ${
                                    ((row.getParentRow()?.original.node.entity as ReleaseWithAttachmentInfo | undefined)
                                        ?.hasMultipleAttachments ?? false)
                                        ? 'orange-cell'
                                        : 'green-cell'
                                }`}
                            >
                                {row.original.node.entity.checkedTeam}
                            </div>
                        )
                    } else if (row.original.node.type === 'release') {
                        return (
                            <div
                                className={`text-center ${
                                    (row.original.node.entity?.hasMultipleAttachments ?? false)
                                        ? 'orange-cell'
                                        : 'green-cell'
                                }`}
                            ></div>
                        )
                    }
                },
                meta: {
                    width: '15%',
                },
            },
        ],
        [
            t,
            attachmentSelectionKeys,
            detailErrors,
            licenses,
            loadLicenses,
            handleToggleAllAttachments,
            handleToggleAttachment,
            handleToggleLicense,
            registerAttachmentInput,
            registerLicenseInput,
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

        data: data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getRowId: (row, index, parent) => row.id ?? `${parent?.id ?? ''}.${index}`,

        // expand config
        getExpandedRowModel: getExpandedRowModel(),
        getSubRows: (row) => row.children ?? [],
        getRowCanExpand: (row) =>
            row.original.node.type === 'attachment'
                ? Boolean(row.original.releaseId && row.original.node.entity.attachmentContentId)
                : (row.original.children?.length ?? 0) !== 0,
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

        meta: {
            rowHeightConstant: true,
        },
    })

    useLayoutEffect(() => {
        if (hasExpandedInitialDataRef.current || !metadataLoaded) return
        hasExpandedInitialDataRef.current = true
        const expandedIds: ExpandedStateList = {}
        for (const row of table.getCoreRowModel().flatRows) {
            if (row.original.node.type !== 'attachment' && row.original.node.type !== 'license') {
                expandedIds[row.id] = true
            }
            if (row.original.node.type === 'attachment' && row.getIsExpanded()) {
                expandedIds[row.id] = true
            }
        }
        table.setExpanded(expandedIds)
    }, [
        table,
        data,
        metadataLoaded,
    ])

    useEffect(() => {
        for (const row of table.getRowModel().rows) {
            if (row.original.node.type === 'attachment' && row.getIsExpanded()) {
                void loadLicenses(row.original.releaseId ?? '', row.original.node.entity.attachmentContentId ?? '')
            }
        }
    }, [
        expandedState,
        data,
        table,
        loadLicenses,
    ])

    useEffect(() => {
        const sessionStorageData = sessionStorage.getItem('isCalledFromProjectLicenseTab')
        if (sessionStorageData !== null) {
            setIsCalledFromProjectLicenseTab(JSON.parse(sessionStorageData))
        }
    }, [])

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal
        const loader = new LicenseDetailLoader(async (releaseId, attachmentId, signal) => {
            const response = await ApiUtils.GET(`releases/${releaseId}/licenseData/${attachmentId}`, signal)
            if (response.status !== StatusCodes.OK) {
                throw new ApiError(`Request failed with status ${response.status}`, {
                    status: response.status,
                })
            }
            return (await response.json()) as License[]
        })
        detailLoader.current = loader
        detailStatuses.current.clear()
        setDetailErrors(new Set())
        setLicenses({})
        setExpandedState({})
        hasExpandedInitialDataRef.current = false
        setShowProcessing(true)
        setMetadataLoaded(false)
        setAttachmentUsages(undefined)
        storeRef.current = createEmptyStore()
        attachmentInputRefs.current.clear()
        licenseInputRefs.current.clear()

        void (async () => {
            try {
                const requests = [
                    ApiUtils.GET(`projects/${projectId}`, signal),
                ]
                if (withSubProjects === 'true') {
                    requests.push(
                        ApiUtils.GET(
                            `projects/${projectId}/attachmentUsage?transitive=true&filter=withCliAttachment`,
                            signal,
                        ),
                        ApiUtils.GET(`projects/${projectId}/linkedProjects?transitive=true`, signal),
                    )
                } else {
                    requests.push(
                        ApiUtils.GET(
                            `projects/${projectId}/attachmentUsage?transitive=false&filter=withCliAttachment`,
                            signal,
                        ),
                    )
                }
                const responses = await Promise.all(requests)
                for (const r of responses) {
                    if (r.status !== StatusCodes.OK) {
                        let message = `Request failed with status ${r.status}`
                        try {
                            const err = (await r.json()) as ErrorDetails
                            message = err.message
                        } catch {
                            // Response body is not valid JSON
                        }
                        throw new ApiError(message, {
                            status: r.status,
                        })
                    }
                }

                const proj = (await responses[0].json()) as Project
                const attachmentUsages = (await responses[1].json()) as AttachmentUsages
                const linkedProjects =
                    withSubProjects === 'true'
                        ? ((await responses[2].json()) as LinkedProjects)['_embedded']['sw360:projects']
                        : ([] as Project[])
                if (signal.aborted) return
                storeRef.current = storeFromPayload(restoreLicenseUsages(attachmentUsages))
                setProject(proj)
                setAttachmentUsages(attachmentUsages)
                setLinkedProjects(linkedProjects)
                setMetadataLoaded(true)
            } catch (error) {
                if (!signal.aborted) ApiUtils.reportError(error)
            } finally {
                if (!signal.aborted) setShowProcessing(false)
            }
        })()
        return () => {
            controller.abort()
            loader.dispose()
        }
    }, [
        projectId,
        withSubProjects,
    ])

    return (
        <>
            <DownloadLicenseInfoModal
                show={show}
                setShow={setShow}
                saveUsagesPayload={downloadPayload}
                setShowConfirmation={setShowConfirmation}
                projectId={projectId}
                isCalledFromProjectLicenseTab={isCalledFromProjectLicenseTab}
                projectReleaseRelationships={projectReleaseRelationships}
                projectProjectRelationships={projectProjectRelationships}
            />
            <LicenseInfoDownloadConfirmationModal
                show={showConfirmation}
                setShow={setShowConfirmation}
            />
            <div className='container page-content'>
                <div className='row'>
                    <div className='row d-flex justify-content-between'>
                        <div className='col-auto buttonheader-title'>
                            {isCalledFromProjectLicenseTab
                                ? t('GENERATE LICENSE INFORMATION')
                                : t('CREATE PROJECT CLEARING REPORT')}
                        </div>
                        <div className='col-auto text-truncate buttonheader-title'>
                            {project && `${project.name} ${project.version !== undefined && `(${project.version})`}`}
                        </div>
                    </div>
                    <div className='col-lg-12'>
                        {data ? (
                            <Tab.Container
                                id='show_all'
                                activeKey={key}
                                onSelect={(k) => setKey(k === null ? 'show_all' : k)}
                            >
                                <div className='col ps-0'>
                                    <Nav
                                        variant='pills'
                                        className='d-inline-flex'
                                    >
                                        <Nav.Item>
                                            <Button
                                                variant='primary'
                                                className='me-2 py-2 col-auto'
                                                disabled={!metadataLoaded || showProcessing}
                                                onClick={() => {
                                                    setDownloadPayload(payloadFromStore(storeRef.current))
                                                    setShow(true)
                                                }}
                                            >
                                                {t('Download')}{' '}
                                            </Button>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Button
                                                variant={hideWithUsage ? 'secondary' : 'outline-secondary'}
                                                className='me-2 py-2 col-auto'
                                                onClick={() => setHideWithUsage(!hideWithUsage)}
                                            >
                                                {hideWithUsage
                                                    ? t('Show All Releases')
                                                    : t('Hide Releases With Usage Set')}
                                            </Button>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey='show_all'>
                                                <span className='fw-medium'>{t('Show All')}</span>
                                            </Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey='only_approved'>
                                                <span className='fw-medium'>{t('Only Approved')}</span>
                                            </Nav.Link>
                                        </Nav.Item>
                                    </Nav>
                                </div>
                                <div className='subscriptionBox subscriptionBox-wide my-2'>
                                    {t(
                                        'No previous selection found If you have writing permissions to this project your selection will be stored automatically when downloading',
                                    )}
                                </div>
                                <div className='mb-3 mt-3'>
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
                            </Tab.Container>
                        ) : (
                            <div className='col-12 text-center'>
                                <Spinner className='spinner' />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

// Pass notAllowedUserGroups to AccessControl to restrict access
export default AccessControl(GenerateLicenseInfo, [
    UserGroupType.SECURITY_USER,
])
