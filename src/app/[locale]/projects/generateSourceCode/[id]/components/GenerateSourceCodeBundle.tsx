// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import Link from 'next/link'
import { notFound, useSearchParams } from 'next/navigation'
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { _, TreeTable } from 'next-sw360'
import { Dispatch, ReactNode, SetStateAction, useEffect, useState } from 'react'
import { Button, Form, Spinner } from 'react-bootstrap'
import { AccessControl } from '@/components/AccessControl/AccessControl'
import {
    AttachmentUsage,
    AttachmentUsages,
    Embedded,
    HttpStatus,
    NodeData,
    Project,
    ProjectLinkedRelease,
    Release,
    SaveUsagesPayload,
    UserGroupType,
} from '@/object-types'
import DownloadService from '@/services/download.service'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'

type LinkedProjects = Embedded<Project, 'sw360:projects'>

const Capitalize = (text: string) =>
    text.split('_').reduce((s, c) => s + ' ' + (c.charAt(0) + c.substring(1).toLocaleLowerCase()), '')

const fetchProjectAndReleaseDetails = (linkedProjects: Project[] | undefined, projectId: string, proj: Project[]) => {
    if (!linkedProjects || proj.length !== 0) {
        return
    }
    for (const p of linkedProjects) {
        if (p['_links']['self']['href'].split('/').at(-1) === projectId) {
            proj[0] = p
            return
        } else {
            fetchProjectAndReleaseDetails(p['_embedded']?.['sw360:linkedProjects'], projectId, proj)
        }
    }
}

const setExpandedFieldsOfNewData = (prevState: NodeData[], newState: NodeData[]) => {
    for (let i = 0; i < prevState.length; ++i) {
        if (prevState[i].isExpanded !== undefined) newState[i].isExpanded = prevState[i].isExpanded

        const prevChildren = prevState[i].children
        const newChildren = newState[i].children
        if (prevChildren && prevChildren.length > 0 && newChildren && newChildren.length > 0) {
            setExpandedFieldsOfNewData(prevChildren, newChildren)
        }
    }
}

function GenerateSourceCodeBundle({
    projectId,
}: Readonly<{
    projectId: string
}>): ReactNode {
    const t = useTranslations('default')
    const { status } = useSession()
    const [project, setProject] = useState<Project>()
    const params = useSearchParams()
    const [attachmentUsagesAndLinkedProjects, setAttachmentUsagesAndLinkedProjects] = useState<{
        attachmentUsages: AttachmentUsages
        linkedProjects: LinkedProjects | null
    }>()
    const [data, setData] = useState<NodeData[]>()
    const [saveUsagesPayload, setSaveUsagesPayload] = useState<SaveUsagesPayload>({
        selected: [],
        deselected: [],
        selectedConcludedUsages: [],
        deselectedConcludedUsages: [],
    })
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [
        status,
    ])

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
            if (response.status !== HttpStatus.CREATED) {
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

    const formatReleaseAndAttachments = (
        attachmentUsage: AttachmentUsage[],
        r: Release,
        level: number,
    ): NodeData | undefined => {
        if (!r.attachments) {
            r.attachments = []
        }
        const release_id = r._links?.self.href.split('/').at(-1) ?? ''
        const attNodes: NodeData[] = []
        let row_color_class = 'green-cell'
        if (r.attachments.length > 1) {
            row_color_class = 'orange-cell'
        }
        for (const att of r.attachments) {
            const attNode: NodeData = {
                rowData: [
                    <div
                        className={`form-check text-center ${row_color_class} border-0-cell`}
                        key={`${att.attachmentContentId ?? ''}_select`}
                    >
                        <input
                            className='form-check-input'
                            type='checkbox'
                            value={att.attachmentContentId ?? ''}
                        />
                        <input
                            type='checkbox'
                            className='form-check-input'
                            checked={
                                saveUsagesPayload.selected.indexOf(
                                    `${r._links?.self.href.split('/').at(-1) ?? ''}_sourcePackage_${att.attachmentContentId}`,
                                ) !== -1
                            }
                            onChange={() => {
                                const val = `${r._links?.self.href.split('/').at(-1) ?? ''}_sourcePackage_${att.attachmentContentId}`
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
                    </div>,
                    <div
                        className={`text-center ${row_color_class} border-0-cell`}
                        key={`${att.attachmentContentId ?? ''}_level`}
                    >
                        {level}
                    </div>,
                    <div
                        className={`${row_color_class} border-0-cell`}
                        key={`${att.attachmentContentId ?? ''}_name`}
                    >
                        {att.filename}
                    </div>,
                    <p
                        key={`${att.attachmentContentId ?? ''}_used_by`}
                        className={`${row_color_class} border-0-cell`}
                    >
                        {att.attachmentUsageCount === undefined || att.attachmentUsageCount === 0
                            ? t('not used in any project yet')
                            : t.rich('USED_BY ATTACHMENTS', {
                                  num: att.attachmentUsageCount,
                                  strong: (chunks) => <b>{chunks}</b>,
                              })}
                    </p>,
                    <div
                        className={`text-center ${row_color_class} border-0-cell`}
                        key={`${att.attachmentContentId ?? ''}_name`}
                    >
                        {Capitalize(r.clearingState ?? '')}
                    </div>,
                    <div
                        className='text-center'
                        key={`${att.attachmentContentId}_uploaded_by`}
                    >
                        <Link
                            className={`text-link ${row_color_class} border-0-cell`}
                            href={`mailto:${att.createdBy}`}
                        >
                            {att.createdBy}
                        </Link>
                    </div>,
                    <div
                        className={`text-center ${row_color_class} border-0-cell`}
                        key={`${att.attachmentContentId ?? ''}_clearing_team`}
                    >
                        {att.checkedTeam ?? ''}
                    </div>,
                ],
            }
            attNodes.push(attNode)
        }
        if (attNodes.length === 0) {
            return
        }
        const relNode: NodeData = {
            rowData: [
                <div
                    className={`text-center ${row_color_class} border-0-cell`}
                    key={`${release_id}_select`}
                ></div>,
                <div
                    className={`text-center ${row_color_class} border-0-cell`}
                    key={`${release_id}_level`}
                >
                    1
                </div>,
                <Link
                    href={`/components/releases/detail/${release_id}`}
                    className={`text-center text-link ${row_color_class} border-0-cell`}
                    key={`${release_id}_release_name`}
                >
                    {r.name ?? ''}
                    {r.version ?? ` ${r.version}`}
                </Link>,
                <div
                    className={`text-center ${row_color_class} border-0-cell`}
                    key={`${release_id}_component_type`}
                >
                    {r.componentType ?? ''}
                </div>,
                <div
                    className={`text-center ${row_color_class} border-0-cell`}
                    key={`${release_id}_clearing_state`}
                >
                    {Capitalize(r.clearingState ?? '')}
                </div>,
                <div
                    className={`text-center ${row_color_class} border-0-cell`}
                    key={`${release_id}_uploaded_by`}
                ></div>,
                <div
                    className={`text-center ${row_color_class} border-0-cell`}
                    key={`${release_id}_clearing_team`}
                ></div>,
            ],
            children: attNodes,
            isExpanded: true,
        }
        return relNode
    }

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal
        ;(async () => {
            try {
                const searchParams = Object.fromEntries(params)
                if (Object.hasOwn(searchParams, 'withSubProjects') === false) {
                    return
                }
                const session = await getSession()
                if (CommonUtils.isNullOrUndefined(session)) return signOut()
                const requests = [
                    ApiUtils.GET(`projects/${projectId}`, session.user.access_token, signal),
                ]
                if (searchParams.withSubProjects === 'true') {
                    requests.push(
                        ApiUtils.GET(
                            `projects/${projectId}/attachmentUsage?transitive=true&filter=withSourceAttachment`,
                            session.user.access_token,
                            signal,
                        ),
                        ApiUtils.GET(
                            `projects/${projectId}/linkedProjects?transitive=true`,
                            session.user.access_token,
                            signal,
                        ),
                    )
                } else {
                    requests.push(
                        ApiUtils.GET(
                            `projects/${projectId}/attachmentUsage?transitive=false&filter=withSourceAttachment`,
                            session.user.access_token,
                            signal,
                        ),
                    )
                }
                const responses = await Promise.all(requests)
                if (responses.filter((response) => response.status === HttpStatus.UNAUTHORIZED).length !== 0) {
                    return signOut()
                } else if (responses.filter((response) => response.status !== HttpStatus.OK).length !== 0) {
                    return notFound()
                }

                const proj = (await responses[0].json()) as Project
                setProject(proj)

                const attachmentUsages = (await responses[1].json()) as AttachmentUsages
                const linkedProjects =
                    searchParams.withSubProjects === 'true' ? ((await responses[2].json()) as LinkedProjects) : null
                setAttachmentUsagesAndLinkedProjects({
                    attachmentUsages: attachmentUsages,
                    linkedProjects: linkedProjects,
                })

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
            } catch (e) {
                console.error(e)
            }
        })()
        return () => controller.abort()
    }, [
        projectId,
        params,
    ])

    useEffect(() => {
        if (attachmentUsagesAndLinkedProjects === undefined) return

        const attachmentUsages = structuredClone(attachmentUsagesAndLinkedProjects.attachmentUsages)

        const tableData: NodeData[] = []

        if (attachmentUsagesAndLinkedProjects.linkedProjects !== null) {
            const linkedProjects = structuredClone(attachmentUsagesAndLinkedProjects.linkedProjects)
            for (const p in attachmentUsages['linkedProjects'] ?? {}) {
                const proj: Project[] = []
                fetchProjectAndReleaseDetails(linkedProjects['_embedded']['sw360:projects'], p, proj)
                if (proj.length === 0) {
                    continue
                }
                const releases = new Set<string>()
                proj[0].linkedReleases?.map((r: ProjectLinkedRelease) => {
                    releases.add(r.release.split('/').at(-1) as string)
                })
                const projectNode: NodeData = {
                    rowData: [
                        <div
                            className='text-center border-0-cell'
                            key={`${p}_select`}
                        ></div>,
                        <div
                            className='text-center border-0-cell'
                            key={`${p}_level`}
                        >
                            1
                        </div>,
                        <Link
                            href={`/projects/detail/${p}`}
                            className='text-center text-link border-0-cell'
                            key={`${p}_release_name`}
                        >
                            {proj[0].name}
                            {proj[0].version !== undefined && ` ${proj[0].version}`}
                        </Link>,
                        <div
                            className='text-center border-0-cell'
                            key={`${p}_component_type`}
                        >
                            {Capitalize(proj[0].projectType ?? '')}
                        </div>,
                        <div
                            className='text-center border-0-cell'
                            key={`${p}_clearing_state`}
                        >
                            {Capitalize(proj[0].clearingState ?? '')}
                        </div>,
                        <div
                            className='text-center border-0-cell'
                            key={`${p}_uploaded_by`}
                        ></div>,
                        <div
                            className='text-center border-0-cell'
                            key={`${p}_clearing_team`}
                        ></div>,
                    ],
                    children: [],
                    isExpanded: true,
                }
                for (const r of attachmentUsages['_embedded']['sw360:release']) {
                    if (!r.attachments) continue
                    const release_id = r._links?.self.href.split('/').at(-1)
                    if (release_id !== undefined && releases.has(release_id)) {
                        const relNode = formatReleaseAndAttachments(
                            attachmentUsages._embedded['sw360:attachmentUsages'][0],
                            r,
                            2,
                        )
                        if (!relNode) continue
                        projectNode.children?.push(relNode)
                    }
                }
                attachmentUsages['_embedded']['sw360:release'] = attachmentUsages['_embedded']['sw360:release'].filter(
                    (r: Release) => !releases.has(r['_links']?.['self']['href'].split('/').at(-1) ?? ''),
                )
                if (projectNode.children && projectNode.children.length !== 0) {
                    tableData.push(projectNode)
                }
            }
        }

        for (const r of attachmentUsages._embedded['sw360:release']) {
            const relNode = formatReleaseAndAttachments(attachmentUsages._embedded['sw360:attachmentUsages'][0], r, 1)
            if (!relNode) continue
            tableData.push(relNode)
        }
        setData((prevState) => {
            if (prevState !== undefined) setExpandedFieldsOfNewData(prevState, tableData)
            return tableData
        })
    }, [
        attachmentUsagesAndLinkedProjects,
        saveUsagesPayload,
    ])

    const columns = [
        {
            id: 'genereateSourceCodeBundle.checkbox',
            name: _(<Form.Check type='checkbox'></Form.Check>),
            width: '5%',
            sort: false,
        },
        {
            id: 'genereateSourceCodeBundle.Lvl',
            name: t('Lvl'),
            width: '5%',
            sort: true,
        },
        {
            id: 'genereateSourceCodeBundle.name',
            name: t('Name'),
            width: '30%',
            sort: true,
        },
        {
            id: 'genereateSourceCodeBundle.type',
            name: t('Type'),
            width: '10%',
            sort: true,
        },
        {
            id: 'genereateSourceCodeBundle.clearingState',
            name: t('Clearing State'),
            width: '10%',
            sort: true,
        },
        {
            id: 'genereateSourceCodeBundle.uploadedBy',
            name: t('Uploaded By'),
            width: '15%',
            sort: true,
        },
        {
            id: 'genereateSourceCodeBundle.clearingTeam',
            name: t('Clearing Team'),
            width: '8%',
            sort: true,
        },
    ]

    if (status === 'unauthenticated') {
        return signOut()
    } else if (project === undefined) {
        return (
            <div className='col-12 mt-3 text-center'>
                <Spinner className='spinner' />
            </div>
        )
    } else {
        return (
            <>
                <div className='container page-content'>
                    <div className='row'>
                        <div className='row d-flex justify-content-between'>
                            <div className='col-auto buttonheader-title'>{t('GENERATE SOURCE CODE BUNDLE')}</div>
                            <div className='col-auto text-truncate buttonheader-title'>
                                {project.name} {project.version !== undefined && `(${project.version})`}
                            </div>
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
                            {data ? (
                                <TreeTable
                                    columns={columns}
                                    data={data}
                                    setData={setData as Dispatch<SetStateAction<NodeData[]>>}
                                    selector={true}
                                    sort={false}
                                />
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
export default AccessControl(GenerateSourceCodeBundle, [
    UserGroupType.SECURITY_USER,
])
