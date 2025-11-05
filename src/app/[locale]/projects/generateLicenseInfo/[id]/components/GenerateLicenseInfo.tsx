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
import { Dispatch, ReactNode, SetStateAction, useEffect, useMemo, useState } from 'react'
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

const Capitalize = (text: string) =>
    text.split('_').reduce((s, c) => s + ' ' + (c.charAt(0) + c.substring(1).toLocaleLowerCase()), '')

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
    })
    const [show, setShow] = useState(false)
    const [key, setKey] = useState<string>('show_all')
    const [showConfirmation, setShowConfirmation] = useState(false)
    const [isCalledFromProjectLicenseTab, setIsCalledFromProjectLicenseTab] = useState<boolean>(false)

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

    const [data, setData] = useState<ExtendedNestedRows<TypedProject | TypedRelease | TypedAttachment>[]>(() => [])

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

    const columns = useMemo<ColumnDef<ExtendedNestedRows<TypedAttachment | TypedRelease | TypedProject>>[]>(
        () => [
            {
                id: 'licenseInfo',
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
                                            `${
                                                row.original.projectPath && row.original.projectPath !== ''
                                                    ? `${row.original.projectPath}-`
                                                    : ''
                                            }${r._links?.self.href.split('/').at(-1) ?? ''}_licenseInfo_${attachmentContentId}`,
                                        ) !== -1
                                    }
                                    onChange={() => {
                                        const val = `${
                                            row.original.projectPath && row.original.projectPath !== ''
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

    useEffect(() => {
        const sessionStorageData = sessionStorage.getItem('isCalledFromProjectLicenseTab')
        if (sessionStorageData !== null) {
            setIsCalledFromProjectLicenseTab(JSON.parse(sessionStorageData))
        }
    }, [])

    // function to add attachments to a release
    const formatReleaseAttachmentDataToTableData = (
        r: Release,
        release: ExtendedNestedRows<TypedProject | TypedRelease | TypedAttachment>,
        projectPath: string[],
        approvedOnly: boolean,
    ) => {
        for (const att of r.attachments ?? []) {
            if (approvedOnly) {
                if (att.checkStatus === undefined || att.checkStatus !== 'ACCEPTED') break
            }
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

    const extractLinkedProjectsAndTheirLinkedReleases = (
        attachmentUsages: AttachmentUsages,
        project: Project,
        projectPath: string[],
        approvedOnly: boolean,
    ): ExtendedNestedRows<TypedProject | TypedRelease | TypedAttachment>[] => {
        const rows: ExtendedNestedRows<TypedProject | TypedRelease | TypedAttachment>[] = []

        for (const p of project._embedded?.['sw360:linkedProjects'] ?? []) {
            projectPath.push(p._links.self.href.split('/').at(-1) ?? '')
            const nodeProject: NestedRows<TypedProject | TypedRelease | TypedAttachment> = {
                node: {
                    type: 'project',
                    entity: p,
                },
                children: extractLinkedProjectsAndTheirLinkedReleases(attachmentUsages, p, projectPath, approvedOnly),
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
                    const nodeRelease: ExtendedNestedRows<TypedProject | TypedRelease | TypedAttachment> = {
                        node: {
                            entity: r,
                            type: 'release',
                        },
                        children: [],
                    }
                    formatReleaseAttachmentDataToTableData(r, nodeRelease, projectPath, approvedOnly)
                    if (nodeRelease.children && nodeRelease.children.length !== 0) {
                        rows.push(nodeRelease)
                    }
                }
            }
        }

        return rows
    }

    const buildTable = (
        setRowData: Dispatch<SetStateAction<ExtendedNestedRows<TypedProject | TypedRelease | TypedAttachment>[]>>,
        attachmentUsages: AttachmentUsages,
        linkedProjects: Project[],
        approvedOnly: boolean,
    ) => {
        const tableData: ExtendedNestedRows<TypedProject | TypedRelease | TypedAttachment>[] = []
        const projectPath: string[] = []
        // adding releases and attachments of the base project
        for (const id in attachmentUsages.releaseIdToUsage) {
            for (const r of attachmentUsages['_embedded']['sw360:release']) {
                if (approvedOnly) {
                    if (r.clearingState === undefined || r.clearingState !== 'APPROVED') break
                }
                if (id === r._links?.self.href.split('/').at(-1)) {
                    const nodeRelease: ExtendedNestedRows<TypedProject | TypedRelease | TypedAttachment> = {
                        node: {
                            entity: r,
                            type: 'release',
                        },
                        children: [],
                    }
                    formatReleaseAttachmentDataToTableData(r, nodeRelease, projectPath, approvedOnly)
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
            const nodeProject: ExtendedNestedRows<TypedProject | TypedRelease | TypedAttachment> = {
                node: {
                    type: 'project',
                    entity: project,
                },
                // adding releases and attachments of > 1st level linked projects
                children: extractLinkedProjectsAndTheirLinkedReleases(
                    attachmentUsages,
                    project,
                    projectPath,
                    approvedOnly,
                ),
            }
            projectPath.pop()
            if (nodeProject.children && nodeProject.children.length !== 0) {
                tableData.push(nodeProject)
            }
        }
        setRowData(tableData)
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

                const saveUsages: SaveUsagesPayload = {
                    selected: [],
                    deselected: [],
                    selectedConcludedUsages: [],
                    deselectedConcludedUsages: [],
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
                                        `${u.usageData.licenseInfo.projectPath}-
                                ${r._links?.self.href.split('/').at(-1) ?? ''}
                                _licenseInfo_${att.attachmentContentId}`,
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
                throw new Error(message)
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
        buildTable(setData, memoizedAttachmentUsages, memoizedLinkedProjects, key === 'only_approved')
    }, [
        key,
        memoizedLinkedProjects,
        memoizedAttachmentUsages,
    ])

    if (project === undefined) {
        return (
            <div className='col-12 mt-3 text-center'>
                <Spinner className='spinner' />
            </div>
        )
    } else {
        return (
            <>
                <DownloadLicenseInfoModal
                    show={show}
                    setShow={setShow}
                    saveUsagesPayload={saveUsagesPayload}
                    setShowConfirmation={setShowConfirmation}
                    projectId={projectId}
                    isCalledFromProjectLicenseTab={isCalledFromProjectLicenseTab}
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
                                {project.name} {project.version !== undefined && `(${project.version})`}
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
}

// Pass notAllowedUserGroups to AccessControl to restrict access
export default AccessControl(GenerateLicenseInfo, [
    UserGroupType.SECURITY_USER,
])
