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
import { notFound, useSearchParams } from 'next/navigation'
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { PaddedCell, SW360Table } from 'next-sw360'
import { Dispatch, ReactNode, SetStateAction, useEffect, useMemo, useState } from 'react'
import { Button, Spinner } from 'react-bootstrap'
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
import DownloadService from '@/services/download.service'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'

type LinkedProjects = Embedded<Project, 'sw360:projects'>

type TypedProject = TypedEntity<Project, 'project'>

type TypedRelease = TypedEntity<Release, 'release'>

type TypedAttachment = TypedEntity<Attachment, 'attachment'>

const Capitalize = (text: string) =>
    text.split('_').reduce((s, c) => s + ' ' + (c.charAt(0) + c.substring(1).toLocaleLowerCase()), '')

function GenerateSourceCodeBundle({
    projectId,
}: Readonly<{
    projectId: string
}>): ReactNode {
    const t = useTranslations('default')
    const params = useSearchParams()
    const [saveUsagesPayload, setSaveUsagesPayload] = useState<SaveUsagesPayload>({
        selected: [],
        deselected: [],
        selectedConcludedUsages: [],
        deselectedConcludedUsages: [],
        ignoredLicenses: {},
    })
    const [loading, setLoading] = useState(false)
    const [hideWithUsage, setHideWithUsage] = useState(false)

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
    const [project, setProject] = useState<Project>()

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

    const [data, setData] = useState<NestedRows<TypedProject | TypedRelease | TypedAttachment>[]>(() => [])

    const hasSourceUsageSet = (release: Release): boolean => {
        const sourceAttachments =
            release.attachments?.filter((att) => att.attachmentType === 'SOURCE' || att.attachmentType === 'SRC') ?? []

        if (sourceAttachments.length === 0) return false

        const releaseId = release._links?.self.href.split('/').at(-1) ?? ''

        // Check if ANY source attachment has source package usage set
        return sourceAttachments.some((att) =>
            saveUsagesPayload.selected.includes(`${releaseId}_sourcePackage_${att.attachmentContentId}`),
        )
    }

    const handleDownloadSourceCodeBundle = async (projectId: string) => {
        try {
            setLoading(true)
            const searchParams = Object.fromEntries(params)
            if (Object.hasOwn(searchParams, 'withSubProjects') === false) {
                return
            }
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
            if (response.status !== StatusCodes.CREATED) {
                MessageService.error(t('Something went wrong'))
                return notFound()
            }
            const currentDate = new Date().toISOString().split('T')[0]
            DownloadService.download(
                `reports?withlinkedreleases=false&projectId=${projectId}&module=licenseResourceBundle&excludeReleaseVersion=false&withSubProject=${searchParams.withSubProjects}`,
                session,
                `SourceCodeBundle-${currentDate}.zip`,
            )
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

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
                            `projects/${projectId}/attachmentUsage?transitive=true&filter=withSourceAttachment`,
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
                            `projects/${projectId}/attachmentUsage?transitive=false&filter=withSourceAttachment`,
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
                            if (u.usageData && u.usageData.sourcePackage) {
                                saveUsages.selected = [
                                    ...new Set<string>([
                                        ...saveUsages.selected,
                                        `${r._links?.self.href.split('/').at(-1) ?? ''}_sourcePackage_${att.attachmentContentId}`,
                                    ]),
                                ]
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
        if (memoizedAttachmentUsages === undefined || memoizedLinkedProjects === undefined) return
        buildTable(setData, memoizedAttachmentUsages, memoizedLinkedProjects, hideWithUsage)
    }, [
        memoizedLinkedProjects,
        memoizedAttachmentUsages,
        hideWithUsage,
        saveUsagesPayload,
    ])

    // function to add attachments to a release
    const formatReleaseAttachmentDataToTableData = (
        r: Release,
        release: NestedRows<TypedProject | TypedRelease | TypedAttachment>,
        filterWithoutUsage: boolean,
    ) => {
        if (filterWithoutUsage && hasSourceUsageSet(r)) {
            return
        }

        for (const att of r.attachments ?? []) {
            const attachment: NestedRows<TypedProject | TypedRelease | TypedAttachment> = {
                node: {
                    entity: att,
                    type: 'attachment',
                },
                children: [],
            }
            if (!release.children) release.children = []
            release.children.push(attachment)
        }
    }

    const extractLinkedProjectsAndTheirLinkedReleases = (
        attachmentUsages: AttachmentUsages,
        project: Project,
        filterWithoutUsage: boolean,
    ): NestedRows<TypedProject | TypedRelease | TypedAttachment>[] => {
        const rows: NestedRows<TypedProject | TypedRelease | TypedAttachment>[] = []

        for (const p of project._embedded?.['sw360:linkedProjects'] ?? []) {
            const nodeProject: NestedRows<TypedProject | TypedRelease | TypedAttachment> = {
                node: {
                    type: 'project',
                    entity: p,
                },
                children: extractLinkedProjectsAndTheirLinkedReleases(attachmentUsages, p, filterWithoutUsage),
            }
            if (nodeProject.children && nodeProject.children.length !== 0) {
                rows.push(nodeProject)
            }
        }

        for (const l of project['linkedReleases'] ?? []) {
            for (const r of attachmentUsages['_embedded']['sw360:release']) {
                if (r._links?.self.href.split('/').at(-1) === l.release.split('/').at(-1)) {
                    const nodeRelease: NestedRows<TypedProject | TypedRelease | TypedAttachment> = {
                        node: {
                            entity: r,
                            type: 'release',
                        },
                        children: [],
                    }
                    formatReleaseAttachmentDataToTableData(r, nodeRelease, filterWithoutUsage)
                    if (nodeRelease.children && nodeRelease.children.length !== 0) {
                        rows.push(nodeRelease)
                    }
                }
            }
        }

        return rows
    }

    const buildTable = (
        setRowData: Dispatch<SetStateAction<NestedRows<TypedProject | TypedRelease | TypedAttachment>[]>>,
        attachmentUsages: AttachmentUsages,
        linkedProjects: Project[],
        filterWithoutUsage: boolean,
    ) => {
        const tableData: NestedRows<TypedProject | TypedRelease | TypedAttachment>[] = []
        // adding releases and attachments of the base project
        for (const id in attachmentUsages.releaseIdToUsage) {
            for (const r of attachmentUsages['_embedded']['sw360:release']) {
                if (id === r._links?.self.href.split('/').at(-1)) {
                    const nodeRelease: NestedRows<TypedProject | TypedRelease | TypedAttachment> = {
                        node: {
                            entity: r,
                            type: 'release',
                        },
                        children: [],
                    }
                    formatReleaseAttachmentDataToTableData(r, nodeRelease, filterWithoutUsage)
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
            const nodeProject: NestedRows<TypedProject | TypedRelease | TypedAttachment> = {
                node: {
                    type: 'project',
                    entity: project,
                },
                // adding releases and attachments of > 1st level linked projects
                children: extractLinkedProjectsAndTheirLinkedReleases(attachmentUsages, project, filterWithoutUsage),
            }
            if (nodeProject.children && nodeProject.children.length !== 0) {
                tableData.push(nodeProject)
            }
        }
        setRowData(tableData)
    }

    const columns = useMemo<ColumnDef<NestedRows<TypedAttachment | TypedRelease | TypedProject>>[]>(
        () => [
            {
                id: 'sourceCodeBundle',
                cell: ({ row }) => {
                    if (row.original.node.type === 'attachment') {
                        const { attachmentContentId } = row.original.node.entity
                        const r = row.getParentRow()?.original.node.entity as Release
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
                                                deselected: saveUsagesPayload.deselected.filter((item) => item !== val),
                                            })
                                        } else {
                                            setSaveUsagesPayload({
                                                ...saveUsagesPayload,
                                                selected: saveUsagesPayload.selected.filter((item) => item !== val),
                                                deselected: [
                                                    ...saveUsagesPayload.deselected,
                                                    val,
                                                ],
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
                    } else {
                        const { name, version, id } = row.original.node.entity
                        return (
                            <Link
                                className='text-link'
                                href={`/projects/detail/${id}`}
                            >
                                {name} {!CommonUtils.isNullEmptyOrUndefinedString(version) && `(${version})`}
                            </Link>
                        )
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
                    } else {
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
                    } else {
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
    })

    useEffect(() => {
        table.toggleAllRowsExpanded(true)
    }, [
        table,
    ])

    return (
        <>
            <div className='container page-content'>
                <div className='row'>
                    <div className='row d-flex justify-content-between'>
                        <div className='col-auto buttonheader-title'>{t('GENERATE SOURCE CODE BUNDLE')}</div>
                        {project && (
                            <div className='col-auto text-truncate buttonheader-title'>
                                {project.name} {project.version !== undefined && `(${project.version})`}
                            </div>
                        )}
                    </div>
                    <div className='col-lg-12'>
                        <Button
                            variant='primary'
                            className='me-2 py-2 col-auto'
                            onClick={() => handleDownloadSourceCodeBundle(projectId)}
                            disabled={loading}
                        >
                            {t('Download File')}{' '}
                        </Button>
                        <Button
                            variant={hideWithUsage ? 'secondary' : 'outline-secondary'}
                            className='me-2 py-2 col-auto'
                            onClick={() => setHideWithUsage(!hideWithUsage)}
                        >
                            {hideWithUsage ? t('Show All Releases') : t('Hide Releases With Usage Set')}
                        </Button>
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
                    </div>
                </div>
            </div>
        </>
    )
}

// Pass notAllowedUserGroups to AccessControl to restrict access
export default AccessControl(GenerateSourceCodeBundle, [
    UserGroupType.SECURITY_USER,
])
