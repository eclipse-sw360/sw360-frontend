// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ColumnDef, ExpandedState, getCoreRowModel, getExpandedRowModel, useReactTable } from '@tanstack/react-table'
import { StatusCodes } from 'http-status-codes'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { PaddedCell, SW360Table } from 'next-sw360'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import { Button, Nav, Spinner, Tab } from 'react-bootstrap'
import { AccessControl } from '@/components/AccessControl/AccessControl'
import {
    Attachment,
    AttachmentUsage,
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
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'
import DownloadLicenseInfoModal from './DownloadLicenseInfoModal'
import LicenseInfoDownloadConfirmationModal from './LicenseInfoDownloadConfirmation'

type LinkedProjects = Embedded<Project, 'sw360:projects'>

type TypedProject = TypedEntity<Project, 'project'>

type TypedRelease = TypedEntity<Release, 'release'>

type TypedAttachment = TypedEntity<Attachment, 'attachment'>

interface ExtendedNestedRows<K> extends NestedRows<K> {
    projectPath?: string
}

interface License {
    name: string
    text: string
}

type TypedLicense = TypedEntity<License, 'license'>

const Capitalize = (text: string) =>
    text.split('_').reduce((s, c) => s + ' ' + (c.charAt(0) + c.substring(1).toLocaleLowerCase()), '')

const hasCliUsageSet = (release: Release, projectPath: string, saveUsagesPayload: SaveUsagesPayload): boolean => {
    const cliAttachments =
        release.attachments?.filter(
            (att) => att.attachmentType === 'CLI' || att.attachmentType === 'CLX' || att.attachmentType === 'ISR',
        ) ?? []

    if (cliAttachments.length === 0) return false

    const releaseId = release._links?.self.href.split('/').at(-1) ?? ''

    // Check if ANY CLI attachment has license info usage set
    return cliAttachments.some((att) => {
        const pathPrefix = projectPath ? `${projectPath}-` : ''
        return saveUsagesPayload.selected.includes(`${pathPrefix}${releaseId}_licenseInfo_${att.attachmentContentId}`)
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
    approvedOnly: boolean,
    filterWithoutUsage: boolean,
    saveUsagesPayload: SaveUsagesPayload,
) => {
    if (filterWithoutUsage && hasCliUsageSet(r, projectPath.join(':'), saveUsagesPayload)) {
        return
    }

    for (const att of r.attachments ?? []) {
        if (approvedOnly) {
            if (att.checkStatus === undefined || att.checkStatus !== 'ACCEPTED') break
        }
        const relId = r._links?.self.href.split('/').at(-1) ?? ''
        const attachment: ExtendedNestedRows<TypedProject | TypedRelease | TypedAttachment | TypedLicense> = {
            node: {
                entity: att,
                type: 'attachment',
            },
            children: licenses[`${relId}_${att.attachmentContentId}`].map(
                (lic) =>
                    ({
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
    attachmentUsages: AttachmentUsages,
    licenses: {
        [id: string]: License[]
    },
    project: Project,
    projectPath: string[],
    approvedOnly: boolean,
    filterWithoutUsage: boolean,
    saveUsagesPayload: SaveUsagesPayload,
): ExtendedNestedRows<TypedProject | TypedRelease | TypedAttachment | TypedLicense>[] => {
    const rows: ExtendedNestedRows<TypedProject | TypedRelease | TypedAttachment | TypedLicense>[] = []

    for (const p of project._embedded?.['sw360:linkedProjects'] ?? []) {
        projectPath.push(p._links.self.href.split('/').at(-1) ?? '')
        const nodeProject: NestedRows<TypedProject | TypedRelease | TypedAttachment | TypedLicense> = {
            node: {
                type: 'project',
                entity: p,
            },
            children: extractLinkedProjectsAndTheirLinkedReleases(
                attachmentUsages,
                licenses,
                p,
                projectPath,
                approvedOnly,
                filterWithoutUsage,
                saveUsagesPayload,
            ),
        }
        projectPath.pop()
        if (nodeProject.children && nodeProject.children.length !== 0) {
            rows.push(nodeProject)
        }
    }

    for (const l of project['linkedReleases'] ?? []) {
        for (const r of attachmentUsages['_embedded']['sw360:release']) {
            if (approvedOnly) {
                if (r.clearingState === undefined || r.clearingState !== 'APPROVED') break
            }
            if (r._links?.self.href.split('/').at(-1) === l.release.split('/').at(-1)) {
                const nodeRelease: ExtendedNestedRows<TypedProject | TypedRelease | TypedAttachment | TypedLicense> = {
                    node: {
                        entity: r,
                        type: 'release',
                    },
                    children: [],
                }
                formatReleaseAttachmentDataToTableData(
                    r,
                    licenses,
                    nodeRelease,
                    projectPath,
                    approvedOnly,
                    filterWithoutUsage,
                    saveUsagesPayload,
                )
                if (nodeRelease.children && nodeRelease.children.length !== 0) {
                    rows.push(nodeRelease)
                }
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
    approvedOnly: boolean,
    filterWithoutUsage: boolean,
    saveUsagesPayload: SaveUsagesPayload,
) => {
    const tableData: ExtendedNestedRows<TypedProject | TypedRelease | TypedAttachment | TypedLicense>[] = []
    const projectPath: string[] = [
        projectId,
    ]
    // adding releases and attachments of the base project
    for (const id in attachmentUsages.releaseIdToUsage) {
        for (const r of attachmentUsages['_embedded']['sw360:release']) {
            if (approvedOnly) {
                if (r.clearingState === undefined || r.clearingState !== 'APPROVED') break
            }
            if (id === r._links?.self.href.split('/').at(-1)) {
                const nodeRelease: ExtendedNestedRows<TypedProject | TypedRelease | TypedAttachment | TypedLicense> = {
                    node: {
                        entity: r,
                        type: 'release',
                    },
                    children: [],
                }
                formatReleaseAttachmentDataToTableData(
                    r,
                    licenses,
                    nodeRelease,
                    projectPath,
                    approvedOnly,
                    filterWithoutUsage,
                    saveUsagesPayload,
                )
                if (nodeRelease.children && nodeRelease.children.length !== 0) {
                    tableData.push(nodeRelease)
                }
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
        const nodeProject: ExtendedNestedRows<TypedProject | TypedRelease | TypedAttachment | TypedLicense> = {
            node: {
                type: 'project',
                entity: project,
            },
            // adding releases and attachments of > 1st level linked projects
            children: extractLinkedProjectsAndTheirLinkedReleases(
                attachmentUsages,
                licenses,
                project,
                projectPath,
                approvedOnly,
                filterWithoutUsage,
                saveUsagesPayload,
            ),
        }
        projectPath.pop()
        if (nodeProject.children && nodeProject.children.length !== 0) {
            tableData.push(nodeProject)
        }
    }
    return tableData
}

const fetchReleaseRelationsFromLinkedProjects = (linkedProjects: Project[], filters: string[]) => {
    for (const p of linkedProjects) {
        for (const l of p.linkedReleases ?? []) {
            const ind = filters.indexOf(l.relation)

            if (ind === -1) {
                filters.push(l.relation)
            }
        }
        fetchReleaseRelationsFromLinkedProjects(p._embedded?.['sw360:linkedProjects'] ?? [], filters)
    }
}

function GenerateLicenseInfo({
    projectId,
}: Readonly<{
    projectId: string
}>): ReactNode {
    const t = useTranslations('default')
    const [project, setProject] = useState<Project>()
    const params = useSearchParams()
    const [saveUsagesPayload, setSaveUsagesPayload] = useState<SaveUsagesPayload>({
        selected: [],
        deselected: [],
        selectedConcludedUsages: [],
        deselectedConcludedUsages: [],
        ignoredLicenses: {},
    })
    const [show, setShow] = useState(false)
    const [hideWithUsage, setHideWithUsage] = useState(false)
    const [key, setKey] = useState<string>('show_all')
    const [showConfirmation, setShowConfirmation] = useState(false)
    const [isCalledFromProjectLicenseTab, setIsCalledFromProjectLicenseTab] = useState<boolean>(false)
    const [projectRelationships, setProjectRelationships] = useState<string[]>([])

    const session = useSession()
    useEffect(() => {
        if (session.status === 'unauthenticated') {
            void signOut()
        }
    }, [
        session,
    ])

    const [expandedState, setExpandedState] = useState<ExpandedState>({})
    const [showProcessing, setShowProcessing] = useState(false)

    const [data, setData] = useState<
        ExtendedNestedRows<TypedProject | TypedRelease | TypedAttachment | TypedLicense>[]
    >(() => [])

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

    const [licenses, setLicenses] = useState<
        | {
              [id: string]: License[]
          }
        | undefined
    >()
    const memoizedLicenses = useMemo(
        () => licenses,
        [
            licenses,
        ],
    )

    useEffect(() => {
        if (!project || !memoizedLinkedProjects) return

        const filters: string[] = []

        for (const l of project.linkedReleases ?? []) {
            const ind = filters.indexOf(l.relation)

            if (ind === -1) {
                filters.push(l.relation)
            }
        }
        fetchReleaseRelationsFromLinkedProjects(project._embedded?.['sw360:linkedProjects'] ?? [], filters)
        setProjectRelationships(filters)
    }, [
        project,
    ])

    const columns = useMemo<
        ColumnDef<ExtendedNestedRows<TypedAttachment | TypedRelease | TypedProject | TypedLicense>>[]
    >(
        () => [
            {
                id: 'licenseInfo',
                cell: ({ row }) => {
                    if (row.original.node.type === 'attachment') {
                        const { attachmentContentId } = row.original.node.entity
                        const r = row.getParentRow()?.original.node.entity as Release
                        const key = `${
                            !CommonUtils.isNullEmptyOrUndefinedString(row.original.projectPath)
                                ? `${row.original.projectPath}-`
                                : ''
                        }${r._links?.self.href.split('/').at(-1) ?? ''}_licenseInfo_${attachmentContentId}`
                        const ignoredLicenseKey = `${
                            !CommonUtils.isNullEmptyOrUndefinedString(row.original.projectPath)
                                ? `${row.original.projectPath}-`
                                : ''
                        }${r._links?.self.href.split('/').at(-1) ?? ''}_${attachmentContentId}`
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
                                    checked={saveUsagesPayload.selected.indexOf(key) !== -1}
                                    onChange={() => {
                                        if (saveUsagesPayload.selected.indexOf(key) === -1) {
                                            setSaveUsagesPayload({
                                                ...saveUsagesPayload,
                                                selected: [
                                                    ...saveUsagesPayload.selected,
                                                    key,
                                                ],
                                                deselected: saveUsagesPayload.deselected.filter((item) => item !== key),
                                                ignoredLicenses: {},
                                            })
                                        } else {
                                            const newIgnoredLicenses = {
                                                ...saveUsagesPayload.ignoredLicenses,
                                            }
                                            delete newIgnoredLicenses[ignoredLicenseKey]

                                            setSaveUsagesPayload({
                                                ...saveUsagesPayload,
                                                selected: saveUsagesPayload.selected.filter((item) => item !== key),
                                                deselected: [
                                                    ...saveUsagesPayload.deselected,
                                                    key,
                                                ],
                                                ignoredLicenses: newIgnoredLicenses,
                                            })
                                        }
                                    }}
                                />
                            </div>
                        )
                    } else if (row.original.node.type === 'release') {
                        return (
                            <div
                                className={(row.original?.children?.length ?? 0) > 1 ? 'orange-cell' : 'green-cell'}
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

                        const checked =
                            (saveUsagesPayload.ignoredLicenses?.[key] ?? []).indexOf(lic.name) === -1 &&
                            saveUsagesPayload.selected.indexOf(att_key) !== -1
                        return (
                            <input
                                type='checkbox'
                                className='form-check-input'
                                checked={checked}
                                onChange={() => {
                                    let ignoredList: string[] = saveUsagesPayload.ignoredLicenses[key] ?? []
                                    let selectedList = saveUsagesPayload.selected
                                    let deselectedList = saveUsagesPayload.deselected
                                    if (checked) {
                                        ignoredList.push(lic.name)
                                        if (
                                            ignoredList.length === (row.getParentRow()?.original.children ?? []).length
                                        ) {
                                            ignoredList = []
                                            selectedList = selectedList.filter((item) => item !== att_key)
                                            deselectedList.push(att_key)
                                        }
                                    } else {
                                        if (selectedList.indexOf(att_key) !== -1) {
                                            ignoredList = ignoredList.filter((item) => item !== lic.name)
                                        } else {
                                            selectedList.push(att_key)
                                            deselectedList = deselectedList.filter((item) => item !== att_key)
                                            for (const lic_it of (row.getParentRow()?.original.children ??
                                                []) as ExtendedNestedRows<
                                                TypedProject | TypedRelease | TypedAttachment | TypedLicense
                                            >[]) {
                                                const typedLicense = lic_it.node.entity as License
                                                const name = typedLicense.name
                                                if (name !== lic.name) {
                                                    ignoredList.push(name)
                                                }
                                            }
                                        }
                                    }
                                    setSaveUsagesPayload({
                                        ...saveUsagesPayload,
                                        selected: selectedList,
                                        deselected: deselectedList,
                                        ignoredLicenses: {
                                            ...(saveUsagesPayload.ignoredLicenses ?? {}),
                                            [key]: ignoredList,
                                        },
                                    })
                                }}
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
                            <div className={(row.original?.children?.length ?? 0) > 1 ? 'orange-cell' : 'green-cell'}>
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
                cell: ({ row }) => {
                    if (row.original.node.type === 'attachment') {
                        return (
                            <div
                                className={`text-center ${(row.getParentRow()?.original?.children?.length ?? 0) > 1 ? 'orange-cell' : 'green-cell'}`}
                            >
                                {row.original.node.entity.filename}
                            </div>
                        )
                    } else if (row.original.node.type === 'release') {
                        const { name, version } = row.original.node.entity
                        return (
                            <div className={(row.original?.children?.length ?? 0) > 1 ? 'orange-cell' : 'green-cell'}>
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
                                className={`text-center ${(row.original?.children?.length ?? 0) > 1 ? 'orange-cell' : 'green-cell'}`}
                            >
                                {Capitalize(row.original.node.entity.componentType ?? '')}
                            </div>
                        )
                    } else if (row.original.node.type === 'project') {
                        return (
                            <div className='text-center'>{Capitalize(row.original.node.entity.projectType ?? '')}</div>
                        )
                    } else if (row.original.node.type === 'attachment') {
                        const att = row.original.node.entity
                        return (
                            <p
                                className={
                                    (row.getParentRow()?.original?.children?.length ?? 0) > 1
                                        ? 'orange-cell'
                                        : 'green-cell'
                                }
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
                                className={`text-center ${(row.original?.children?.length ?? 0) > 1 ? 'orange-cell' : 'green-cell'}`}
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
                                className={`text-center ${(row.getParentRow()?.original?.children?.length ?? 0) > 1 ? 'orange-cell' : 'green-cell'}`}
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
                header: t('Uploaded By'),
                cell: ({ row }) => {
                    if (row.original.node.type === 'attachment') {
                        return (
                            <div
                                className={`text-center ${(row.getParentRow()?.original?.children?.length ?? 0) > 1 ? 'orange-cell' : 'green-cell'}`}
                            >
                                {row.original.node.entity.createdBy}
                            </div>
                        )
                    } else if (row.original.node.type === 'release') {
                        return (
                            <div
                                className={`text-center ${(row.original?.children?.length ?? 0) > 1 ? 'orange-cell' : 'green-cell'}`}
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
                                className={`text-center ${(row.getParentRow()?.original?.children?.length ?? 0) > 1 ? 'orange-cell' : 'green-cell'}`}
                            >
                                {row.original.node.entity.checkedTeam}
                            </div>
                        )
                    } else if (row.original.node.type === 'release') {
                        return (
                            <div
                                className={`text-center ${(row.original?.children?.length ?? 0) > 1 ? 'orange-cell' : 'green-cell'}`}
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
            saveUsagesPayload,
        ],
    )

    const table = useReactTable({
        // table state config
        state: {
            expanded: expandedState,
        },

        data: data,
        columns,
        getCoreRowModel: getCoreRowModel(),

        // expand config
        getExpandedRowModel: getExpandedRowModel(),
        getSubRows: (row) => row.children ?? [],
        getRowCanExpand: (row) => row.original.children !== undefined && row.original.children.length !== 0,
        onExpandedChange: setExpandedState,

        meta: {
            rowHeightConstant: true,
        },
    })

    useEffect(() => {
        table.toggleAllRowsExpanded(true)
    }, [
        table,
    ])

    useEffect(() => {
        const sessionStorageData = sessionStorage.getItem('isCalledFromProjectLicenseTab')
        if (sessionStorageData !== null) {
            setIsCalledFromProjectLicenseTab(JSON.parse(sessionStorageData))
        }
    }, [])

    useEffect(() => {
        if (session.status === 'loading') return
        const controller = new AbortController()
        const signal = controller.signal

        const timeLimit = data.length !== 0 ? 700 : 0
        const timeout = setTimeout(() => {
            setShowProcessing(true)
        }, timeLimit)

        void (async () => {
            try {
                if (CommonUtils.isNullOrUndefined(session.data)) return signOut()
                const searchParams = Object.fromEntries(params)
                if (Object.hasOwn(searchParams, 'withSubProjects') === false) {
                    return
                }
                const requests = [
                    ApiUtils.GET(`projects/${projectId}`, session.data.user.access_token, signal),
                ]
                if (searchParams.withSubProjects === 'true') {
                    requests.push(
                        ApiUtils.GET(
                            `projects/${projectId}/attachmentUsage?transitive=true&filter=withCliAttachment`,
                            session.data.user.access_token,
                            signal,
                        ),
                        ApiUtils.GET(
                            `projects/${projectId}/linkedProjects?transitive=true`,
                            session.data.user.access_token,
                            signal,
                        ),
                    )
                } else {
                    requests.push(
                        ApiUtils.GET(
                            `projects/${projectId}/attachmentUsage?transitive=false&filter=withCliAttachment`,
                            session.data.user.access_token,
                            signal,
                        ),
                    )
                }
                const responses = await Promise.all(requests)
                responses.map(async (r) => {
                    if (r.status !== StatusCodes.OK) {
                        const err = (await r.json()) as ErrorDetails
                        throw new Error(err.message)
                    }
                })

                const proj = (await responses[0].json()) as Project
                setProject(proj)

                const attachmentUsages = (await responses[1].json()) as AttachmentUsages
                setAttachmentUsages(attachmentUsages)

                const linkedProjects =
                    searchParams.withSubProjects === 'true'
                        ? ((await responses[2].json()) as LinkedProjects)['_embedded']['sw360:projects']
                        : ([] as Project[])
                setLinkedProjects(linkedProjects)

                const licenseRequests: Promise<Response>[] = []
                for (const r of attachmentUsages['_embedded']['sw360:release']) {
                    const relId = r._links?.self.href.split('/').at(-1) ?? ''
                    for (const att of r.attachments ?? []) {
                        licenseRequests.push(
                            ApiUtils.GET(
                                `releases/${relId}/licenseData/${att.attachmentContentId}`,
                                session.data.user.access_token,
                                signal,
                            ),
                        )
                    }
                }

                const licenseResponses = await Promise.all(licenseRequests)
                licenseResponses.map(async (r) => {
                    if (r.status !== StatusCodes.OK) {
                        const err = (await r.json()) as ErrorDetails
                        throw new Error(err.message)
                    }
                })
                const _licenses = licenseResponses.map(async (licRes) => (await licRes.json()) as License[])
                const licenses: License[][] = await Promise.all(_licenses)

                const m: {
                    [id: string]: License[]
                } = {}
                let i = 0
                for (const r of attachmentUsages['_embedded']['sw360:release']) {
                    const relId = r._links?.self.href.split('/').at(-1) ?? ''
                    for (const att of r.attachments ?? []) {
                        licenses[i].sort((a, b) => a.name.localeCompare(b.name))
                        const lics = licenses[i++].filter(function (item, pos, ary) {
                            return !pos || item.name != ary[pos - 1].name
                        })
                        m[`${relId}_${att.attachmentContentId}`] = lics
                    }
                }
                setLicenses(m)

                const saveUsages: SaveUsagesPayload = {
                    selected: [],
                    deselected: [],
                    selectedConcludedUsages: [],
                    deselectedConcludedUsages: [],
                    ignoredLicenses: {},
                }

                for (const r of attachmentUsages['_embedded']['sw360:release']) {
                    for (const att of r.attachments ?? []) {
                        const usages = attachmentUsages['_embedded']['sw360:attachmentUsages'][0].filter(
                            (elem: AttachmentUsage) => elem.attachmentContentId === att.attachmentContentId,
                        )
                        for (const u of usages) {
                            if (u.usageData && u.usageData.licenseInfo) {
                                saveUsages.selected = [
                                    ...new Set<string>([
                                        ...saveUsages.selected,
                                        `${
                                            !CommonUtils.isNullEmptyOrUndefinedString(
                                                u.usageData.licenseInfo.projectPath,
                                            )
                                                ? `${u.usageData.licenseInfo.projectPath}-`
                                                : ''
                                        }${
                                            r._links?.self.href.split('/').at(-1) ?? ''
                                        }_licenseInfo_${att.attachmentContentId}`,
                                    ]),
                                ]
                                saveUsages.ignoredLicenses[
                                    `${
                                        !CommonUtils.isNullEmptyOrUndefinedString(u.usageData.licenseInfo.projectPath)
                                            ? `${u.usageData.licenseInfo.projectPath}-`
                                            : ''
                                    }${r._links?.self.href.split('/').at(-1) ?? ''}_${att.attachmentContentId}`
                                ] = u.usageData.licenseInfo.excludedLicenseIds
                            }
                        }
                    }
                }
                setSaveUsagesPayload(saveUsages)
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
        projectId,
        params,
    ])

    useEffect(() => {
        if (
            memoizedAttachmentUsages === undefined ||
            memoizedLinkedProjects === undefined ||
            memoizedLicenses === undefined
        )
            return
        setData(
            buildTable(
                projectId,
                memoizedAttachmentUsages,
                memoizedLinkedProjects,
                memoizedLicenses,
                key === 'only_approved',
                hideWithUsage,
                saveUsagesPayload,
            ),
        )
    }, [
        key,
        memoizedLinkedProjects,
        memoizedAttachmentUsages,
        hideWithUsage,
        memoizedLicenses,
        saveUsagesPayload,
    ])

    return (
        <>
            <DownloadLicenseInfoModal
                show={show}
                setShow={setShow}
                saveUsagesPayload={saveUsagesPayload}
                setShowConfirmation={setShowConfirmation}
                projectId={projectId}
                isCalledFromProjectLicenseTab={isCalledFromProjectLicenseTab}
                projectRelationships={projectRelationships}
            />
            <LicenseInfoDownloadConfirmationModal
                show={showConfirmation}
                setShow={setShowConfirmation}
            />
            <div className='container page-content'>
                <div className='row'>
                    <div className='row d-flex justify-content-between'>
                        <div className='col-auto buttonheader-title'>{t('GENERATE LICENSE INFORMATION')}</div>
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
                                                onClick={() => setShow(true)}
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
                                <div
                                    className='subscriptionBox my-2'
                                    style={{
                                        maxWidth: '98vw',
                                        textAlign: 'left',
                                        fontSize: '15px',
                                    }}
                                >
                                    {t(
                                        'No previous selection found If you have writing permissions to this project your selection will be stored automatically when downloading',
                                    )}
                                </div>
                                <Tab.Content className='mt-3'>
                                    <Tab.Pane eventKey='show_all'>
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
                                    </Tab.Pane>
                                    <Tab.Pane eventKey='only_approved'>
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
                                    </Tab.Pane>
                                </Tab.Content>
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
