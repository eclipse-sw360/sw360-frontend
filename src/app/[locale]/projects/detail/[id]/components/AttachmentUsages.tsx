// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ColumnDef, ExpandedState, getCoreRowModel, getExpandedRowModel, useReactTable } from '@tanstack/react-table'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { PaddedCell, SW360Table } from 'next-sw360'
import { Dispatch, type JSX, SetStateAction, useEffect, useMemo, useState } from 'react'
import { Spinner } from 'react-bootstrap'
import { AccessControl } from '@/components/AccessControl/AccessControl'
import {
    Attachment,
    AttachmentUsage,
    AttachmentUsages,
    Embedded,
    ErrorDetails,
    HttpStatus,
    NestedRows,
    Project,
    Release,
    SaveUsagesPayload,
    TypedEntity,
    UserGroupType,
} from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'

type LinkedProjects = Embedded<Project, 'sw360:projects'>

type TypedAttachment = TypedEntity<Attachment, 'attachment'>

type TypedRelease = TypedEntity<Release, 'release'>

type TypedProject = TypedEntity<Project, 'project'>

const Capitalize = (text: string) =>
    text.split('_').reduce((s, c) => s + ' ' + (c.charAt(0) + c.substring(1).toLocaleLowerCase()), '')

function isLicenseInfoEnabled(type: string): boolean {
    const types = [
        'CLI',
        'CLX',
        'ISR',
    ]
    if (types.indexOf(type) !== -1) {
        return true
    }
    return false
}

function isSourceCodeBundleEnabled(type: string): boolean {
    const types = [
        'SOURCE',
        'SRS',
    ]
    if (types.indexOf(type) !== -1) {
        return true
    }
    return false
}

interface ExtendedNestedRows<K> extends NestedRows<K> {
    projectPath?: string
}

function AttachmentUsagesComponent({ projectId }: { projectId: string }): JSX.Element {
    const t = useTranslations('default')
    const [saveUsagesPayload, setSaveUsagesPayload] = useState<SaveUsagesPayload>({
        selected: [],
        deselected: [],
        selectedConcludedUsages: [],
        deselectedConcludedUsages: [],
    })
    const [saveUsagesLoading, setSaveUsagesLoading] = useState(false)

    const [showProcessingLinkedProjects, setShowProcessingLinkedProjects] = useState(false)
    const [showProcessingAttachmentUsages, setShowProcessingAttachmentUsages] = useState(false)

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

    const session = useSession()

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            void signOut()
        }
    }, [
        session,
    ])

    const handleSaveUsages = async () => {
        try {
            setSaveUsagesLoading(true)
            const session = await getSession()
            if (CommonUtils.isNullOrUndefined(session)) {
                MessageService.error(t('Something went wrong'))
                return signOut()
            }
            const response = await ApiUtils.POST(
                `projects/${projectId}/saveAttachmentUsages`,
                saveUsagesPayload,
                session.user.access_token,
            )
            if (response.status !== HttpStatus.CREATED) {
                MessageService.error(t('Something went wrong'))
                return notFound()
            }
            MessageService.success(t('AttachmentUsages saved successfully'))
        } catch (e) {
            console.error(e)
        } finally {
            setSaveUsagesLoading(false)
        }
    }

    useEffect(() => {
        if (session.status !== 'authenticated') return
        const controller = new AbortController()
        const signal = controller.signal

        const timeLimit = memoizedLinkedProjects.length !== 0 ? 700 : 0
        const timeout = setTimeout(() => {
            setShowProcessingLinkedProjects(true)
        }, timeLimit)

        void (async () => {
            try {
                const response = await ApiUtils.GET(
                    `projects/${projectId}/linkedProjects?transitive=true`,
                    session.data.user.access_token,
                    signal,
                )

                if (response.status !== HttpStatus.OK) {
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
                setShowProcessingLinkedProjects(false)
            }
        })()

        return () => controller.abort()
    }, [
        projectId,
        session,
    ])

    useEffect(() => {
        if (session.status !== 'authenticated') return
        const controller = new AbortController()
        const signal = controller.signal

        const timeLimit = memoizedAttachmentUsages === undefined ? 700 : 0
        const timeout = setTimeout(() => {
            setShowProcessingAttachmentUsages(true)
        }, timeLimit)

        void (async () => {
            try {
                const response = await ApiUtils.GET(
                    `projects/${projectId}/attachmentUsage?transitive=true`,
                    session.data.user.access_token,
                    signal,
                )

                if (response.status !== HttpStatus.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new Error(err.message)
                }

                const usages = (await response.json()) as AttachmentUsages
                setAttachmentUsages(usages)

                const saveUsages: SaveUsagesPayload = {
                    selected: [],
                    deselected: [],
                    selectedConcludedUsages: [],
                    deselectedConcludedUsages: [],
                }

                for (const r of usages['_embedded']['sw360:release']) {
                    for (const att of r.attachments ?? []) {
                        const usage = usages['_embedded']['sw360:attachmentUsages'][0].filter(
                            (elem: AttachmentUsage) => elem.attachmentContentId === att.attachmentContentId,
                        )
                        for (const u of usage) {
                            if (u.usageData) {
                                if (u.usageData.sourcePackage) {
                                    saveUsages.selected = [
                                        ...new Set<string>([
                                            ...saveUsages.selected,
                                            `${r._links?.self.href.split('/').at(-1) ?? ''}_sourcePackage_${att.attachmentContentId}`,
                                        ]),
                                    ]
                                }
                                if (u.usageData.manuallySet) {
                                    saveUsages.selected = [
                                        ...new Set<string>([
                                            ...saveUsages.selected,
                                            `${r._links?.self.href.split('/').at(-1) ?? ''}_manuallySet_${att.attachmentContentId}`,
                                        ]),
                                    ]
                                }
                                if (u.usageData.licenseInfo) {
                                    saveUsages.selected = [
                                        ...new Set<string>([
                                            ...saveUsages.selected,
                                            `${u.usageData.licenseInfo.projectPath}-${r._links?.self.href.split('/').at(-1) ?? ''}_licenseInfo_${att.attachmentContentId}`,
                                        ]),
                                    ]
                                }
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
                throw new Error(message)
            } finally {
                clearTimeout(timeout)
                setShowProcessingAttachmentUsages(false)
            }
        })()

        return () => controller.abort()
    }, [
        projectId,
        session,
    ])

    const columns = useMemo<ColumnDef<ExtendedNestedRows<TypedAttachment | TypedRelease | TypedProject>>[]>(
        () => [
            {
                id: 'linkedReleasesAndProjects',
                header: () => (
                    <>
                        {t('Linked Releases And Projects')}
                        {' ('}
                        <Link
                            href='#'
                            className='table-text-link'
                        >
                            {t('Expand next level')}
                        </Link>
                        {' | '}
                        <Link
                            href='#'
                            className='table-text-link'
                        >
                            {t('Collapse all')}
                        </Link>
                        {')'}
                    </>
                ),
                columns: [
                    {
                        id: 'name',
                        header: t('Name'),
                        cell: ({ row }) => {
                            if (row.original.node.type === 'attachment') {
                                return <div className='text-center'>{row.original.node.entity.filename}</div>
                            } else if (row.original.node.type === 'release') {
                                const { name, version } = row.original.node.entity
                                return (
                                    <PaddedCell row={row}>
                                        <Link
                                            className='text-link'
                                            href={`/components/releases/detail/${row.original.node.entity._links?.self.href.split('/').at(-1)}`}
                                        >{`${name} ${version}`}</Link>
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
                                            Capitalize(
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
                                            Capitalize(
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
                        header: t('Uploaded By'),
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
                                return <div className='text-center'>{row.original.node.entity.attachmentType}</div>
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
                                        cell: ({ row }) => {
                                            if (row.original.node.type === 'attachment') {
                                                const { attachmentType, attachmentContentId } = row.original.node.entity
                                                const r = row.getParentRow()?.original.node.entity as Release
                                                return (
                                                    <input
                                                        type='checkbox'
                                                        className='form-check-input'
                                                        disabled={!isLicenseInfoEnabled(attachmentType)}
                                                        checked={
                                                            saveUsagesPayload.selected.indexOf(
                                                                `${
                                                                    row.original.projectPath &&
                                                                    row.original.projectPath !== ''
                                                                        ? `${row.original.projectPath}-`
                                                                        : ''
                                                                }${r._links?.self.href.split('/').at(-1) ?? ''}_licenseInfo_${attachmentContentId}`,
                                                            ) !== -1
                                                        }
                                                        onChange={() => {
                                                            const val = `${
                                                                row.original.projectPath &&
                                                                row.original.projectPath !== ''
                                                                    ? `${row.original.projectPath}-`
                                                                    : ''
                                                            }${r._links?.self.href.split('/').at(-1) ?? ''}_licenseInfo_${attachmentContentId}`
                                                            if (saveUsagesPayload.selected.indexOf(val) === -1) {
                                                                setSaveUsagesPayload({
                                                                    ...saveUsagesPayload,
                                                                    selected: [
                                                                        ...saveUsagesPayload.selected,
                                                                        val,
                                                                    ],
                                                                    deselected: saveUsagesPayload.deselected.filter(
                                                                        (item) => item !== val,
                                                                    ),
                                                                })
                                                            } else {
                                                                setSaveUsagesPayload({
                                                                    ...saveUsagesPayload,
                                                                    selected: saveUsagesPayload.selected.filter(
                                                                        (item) => item !== val,
                                                                    ),
                                                                    deselected: [
                                                                        ...saveUsagesPayload.deselected,
                                                                        val,
                                                                    ],
                                                                })
                                                            }
                                                        }}
                                                    />
                                                )
                                            }
                                        },
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
                                cell: ({ row }) => {
                                    if (row.original.node.type === 'attachment') {
                                        const { attachmentType, attachmentContentId } = row.original.node.entity
                                        const r = row.getParentRow()?.original.node.entity as Release
                                        return (
                                            <input
                                                type='checkbox'
                                                className='form-check-input'
                                                disabled={!isSourceCodeBundleEnabled(attachmentType)}
                                                checked={
                                                    saveUsagesPayload.selected.indexOf(
                                                        `${r._links?.self.href.split('/').at(-1) ?? ''}_sourcePackage_${attachmentContentId}`,
                                                    ) !== -1
                                                }
                                                onChange={() => {
                                                    const val = `${r._links?.self.href.split('/').at(-1) ?? ''}_sourcePackage_${attachmentContentId}`
                                                    if (saveUsagesPayload.selected.indexOf(val) === -1) {
                                                        setSaveUsagesPayload({
                                                            ...saveUsagesPayload,
                                                            selected: [
                                                                ...saveUsagesPayload.selected,
                                                                val,
                                                            ],
                                                            deselected: saveUsagesPayload.deselected.filter(
                                                                (item) => item !== val,
                                                            ),
                                                        })
                                                    } else {
                                                        setSaveUsagesPayload({
                                                            ...saveUsagesPayload,
                                                            selected: saveUsagesPayload.selected.filter(
                                                                (item) => item !== val,
                                                            ),
                                                            deselected: [
                                                                ...saveUsagesPayload.deselected,
                                                                val,
                                                            ],
                                                        })
                                                    }
                                                }}
                                            />
                                        )
                                    }
                                },
                                meta: {
                                    width: '10%',
                                },
                            },
                            {
                                id: 'other',
                                header: t('Other'),
                                cell: ({ row }) => {
                                    if (row.original.node.type === 'attachment') {
                                        const { attachmentType, attachmentContentId } = row.original.node.entity
                                        const r = row.getParentRow()?.original.node.entity as Release
                                        return (
                                            <input
                                                type='checkbox'
                                                className='form-check-input'
                                                disabled={!isSourceCodeBundleEnabled(attachmentType)}
                                                checked={
                                                    saveUsagesPayload.selected.indexOf(
                                                        `${r._links?.self.href.split('/').at(-1) ?? ''}_manuallySet_${attachmentContentId}`,
                                                    ) !== -1
                                                }
                                                onChange={() => {
                                                    const val = `${r._links?.self.href.split('/').at(-1) ?? ''}_manuallySet_${attachmentContentId}`
                                                    if (saveUsagesPayload.selected.indexOf(val) === -1) {
                                                        setSaveUsagesPayload({
                                                            ...saveUsagesPayload,
                                                            selected: [
                                                                ...saveUsagesPayload.selected,
                                                                val,
                                                            ],
                                                            deselected: saveUsagesPayload.deselected.filter(
                                                                (item) => item !== val,
                                                            ),
                                                        })
                                                    } else {
                                                        setSaveUsagesPayload({
                                                            ...saveUsagesPayload,
                                                            selected: saveUsagesPayload.selected.filter(
                                                                (item) => item !== val,
                                                            ),
                                                            deselected: [
                                                                ...saveUsagesPayload.deselected,
                                                                val,
                                                            ],
                                                        })
                                                    }
                                                }}
                                            />
                                        )
                                    }
                                },
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
    })

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

        buildTable(setData, memoizedAttachmentUsages, memoizedLinkedProjects)
    }, [
        memoizedAttachmentUsages,
        memoizedLinkedProjects,
        saveUsagesPayload,
    ])

    return (
        <>
            <button
                type='button'
                className='btn btn-secondary mb-2'
                onClick={() => void handleSaveUsages()}
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
                        showProcessing={showProcessingLinkedProjects || showProcessingAttachmentUsages}
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
