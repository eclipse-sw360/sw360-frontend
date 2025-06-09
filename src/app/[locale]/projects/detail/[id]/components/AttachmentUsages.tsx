// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

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
} from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { TreeTable } from 'next-sw360'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Dispatch, SetStateAction, useEffect, useState, type JSX } from 'react'
import { Spinner } from 'react-bootstrap'

type LinkedProjects = Embedded<Project, 'sw360:projects'>

const Capitalize = (text: string) =>
    text.split('_').reduce((s, c) => s + ' ' + (c.charAt(0) + c.substring(1).toLocaleLowerCase()), '')

function isLicenseInfoDisabled(type: string): boolean {
    const types = [
        'CLX',
        'CRT',
        'SRC',
        'CLI',
        'DOC',
        'DSN',
        'RDT',
        'SRR',
        'SRX',
        'SRS',
        'BIN',
        'BIS',
        'DRT',
        'LRT',
        'LAT',
        'SCR',
        'OTH',
        'RDM',
        'SECA',
        'ISR',
        'SBOM',
        'IUS',
    ]
    if (types.indexOf(type) !== -1) {
        return true
    }
    return false
}

function isSourceCodeBundleDisabled(type: string): boolean {
    const types = [
        'CLX',
        'CRT',
        'CLI',
        'DOC',
        'DSN',
        'RDT',
        'SRR',
        'SRX',
        'BIN',
        'BIS',
        'DRT',
        'LRT',
        'LAT',
        'SCR',
        'OTH',
        'RDM',
        'SECA',
        'ISR',
        'SBOM',
        'IUS',
    ]
    if (types.indexOf(type) !== -1) {
        return true
    }
    return false
}

export default function AttachmentUsagesComponent({ projectId }: { projectId: string }): JSX.Element {
    const t = useTranslations('default')
    const { data: session, status } = useSession()
    const [data, setData] = useState<Array<NodeData>>()
    const [saveUsagesPayload, setSaveUsagesPayload] = useState<SaveUsagesPayload>({
        selected: [],
        deselected: [],
        selectedConcludedUsages: [],
        deselectedConcludedUsages: [],
    })
    const [saveUsagesLoading, setSaveUsagesLoading] = useState(false)
    const [attachmentUsagesAndLinkedProjects, setAttachmentUsagesAndLinkedProjects] = useState<{
        attachmentUsages: AttachmentUsages
        linkedProjects: LinkedProjects
    }>()

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

    const columns = [
        {
            id: 'attachmentUsages.name',
            name: t('Name'),
            width: '36%',
            sort: true,
        },
        {
            id: 'attachmentUsages.relation',
            name: t('Relation'),
            width: '8%',
            sort: true,
        },
        {
            id: 'attachmentUsages.uploadedBy',
            name: t('Uploaded By'),
            width: '18%',
            sort: true,
        },
        {
            id: 'attachmentUsages.type',
            name: t('Type'),
            width: '8%',
            sort: true,
        },
        {
            id: 'attachmentUsages.usedIn',
            name: t('Used In'),
            width: '20%',
            sort: true,
            columns: [
                {
                    id: 'attachmentUsages.usedIn.licenseInfo',
                    name: t('License Info'),
                    sort: true,
                    columns: [
                        {
                            id: 'attachmentUsages.usedIn.licenseInfo.checked',
                            sort: true,
                        },
                        {
                            id: 'attachmentUsages.usedIn.licenseInfo.conclusions',
                            name: t('Conclusions'),
                            sort: true,
                        },
                    ],
                },
                {
                    id: 'attachmentUsages.usedIn.sourceCodeBundle',
                    name: t('Source Code Bundle'),
                    sort: true,
                },
                {
                    id: 'attachmentUsages.usedIn.other',
                    name: t('Other'),
                    sort: true,
                },
            ],
        },
    ]

    const fetchProjectAndReleaseDetails = (
        linkedProjects: Project[] | undefined,
        projectId: string,
        proj: Project[],
    ) => {
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

    const formatReleaseAttachmentDataToTableData = (r: Release, release: NodeData) => {
        for (const att of r.attachments ?? []) {
            const attachment: NodeData = {
                rowData: [
                    <div key={`${att.filename}_name_attachment`}>{att.filename}</div>,
                    <div key={`${att.filename}_relation_attachment`}>{''}</div>,
                    <div key={`${att.filename}_uploadedBy_attachment`}>{att.createdBy}</div>,
                    <div key={`${att.filename}_type_attachment`}>{att.attachmentType}</div>,
                    <input
                        key={`${att.filename}_used_in_license_info_attachment`}
                        type='checkbox'
                        className='form-check-input'
                        disabled={isLicenseInfoDisabled(att.attachmentType)}
                        checked={
                            saveUsagesPayload.selected.indexOf(
                                `${r._links?.self.href.split('/').at(-1) ?? ''}_licenseInfo_${att.attachmentContentId}`,
                            ) !== -1
                        }
                        onChange={() => {
                            const val = `${r._links?.self.href.split('/').at(-1) ?? ''}_licenseInfo_${att.attachmentContentId}`
                            if (saveUsagesPayload.selected.indexOf(val) === -1) {
                                setSaveUsagesPayload({
                                    ...saveUsagesPayload,
                                    selected: [...saveUsagesPayload.selected, val],
                                    deselected: saveUsagesPayload.deselected.filter((item) => item !== val),
                                })
                            } else {
                                setSaveUsagesPayload({
                                    ...saveUsagesPayload,
                                    selected: saveUsagesPayload.selected.filter((item) => item !== val),
                                    deselected: [...saveUsagesPayload.deselected, val],
                                })
                            }
                        }}
                    />,
                    <div key={`${att.filename}_used_in_license_info_conclusions_attachment`}>{''}</div>,
                    <input
                        key={`${att.filename}_used_in_source_code_bundle_attachment`}
                        type='checkbox'
                        className='form-check-input'
                        disabled={isSourceCodeBundleDisabled(att.attachmentType)}
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
                                    selected: [...saveUsagesPayload.selected, val],
                                    deselected: saveUsagesPayload.deselected.filter((item) => item !== val),
                                })
                            } else {
                                setSaveUsagesPayload({
                                    ...saveUsagesPayload,
                                    selected: saveUsagesPayload.selected.filter((item) => item !== val),
                                    deselected: [...saveUsagesPayload.deselected, val],
                                })
                            }
                        }}
                    />,
                    <input
                        key={`${att.filename}_other_attachment`}
                        type='checkbox'
                        className='form-check-input'
                        disabled={isSourceCodeBundleDisabled(att.attachmentType)}
                        checked={
                            saveUsagesPayload.selected.indexOf(
                                `${r._links?.self.href.split('/').at(-1) ?? ''}_manuallySet_${att.attachmentContentId}`,
                            ) !== -1
                        }
                        onChange={() => {
                            const val = `${r._links?.self.href.split('/').at(-1) ?? ''}_manuallySet_${att.attachmentContentId}`
                            if (saveUsagesPayload.selected.indexOf(val) === -1) {
                                setSaveUsagesPayload({
                                    ...saveUsagesPayload,
                                    selected: [...saveUsagesPayload.selected, val],
                                    deselected: saveUsagesPayload.deselected.filter((item) => item !== val),
                                })
                            } else {
                                setSaveUsagesPayload({
                                    ...saveUsagesPayload,
                                    selected: saveUsagesPayload.selected.filter((item) => item !== val),
                                    deselected: [...saveUsagesPayload.deselected, val],
                                })
                            }
                        }}
                    />,
                ],
                children: [],
            }
            if (!release.children) release.children = []
            release.children.push(attachment)
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

    useEffect(() => {
        if (status !== 'authenticated') return
        const controller = new AbortController()
        const signal = controller.signal

        void (async () => {
            try {
                const res_licenseClearing = await ApiUtils.GET(
                    `projects/${projectId}/attachmentUsage?transitive=true`,
                    session.user.access_token,
                    signal,
                )

                const res_linkedProjects = ApiUtils.GET(
                    `projects/${projectId}/linkedProjects?transitive=true`,
                    session.user.access_token,
                    signal,
                )

                const responses = await Promise.all([res_licenseClearing, res_linkedProjects])
                if (
                    responses[0].status === HttpStatus.UNAUTHORIZED ||
                    responses[1].status === HttpStatus.UNAUTHORIZED
                ) {
                    return signOut()
                } else if (responses[0].status !== HttpStatus.OK || responses[1].status !== HttpStatus.OK) {
                    return notFound()
                }

                const attachmentUsages = (await responses[0].json()) as AttachmentUsages
                const linkedProjects = (await responses[1].json()) as LinkedProjects

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
                                            `${r._links?.self.href.split('/').at(-1) ?? ''}_licenseInfo_${att.attachmentContentId}`,
                                        ]),
                                    ]
                                }
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
    }, [status, projectId, session, t])

    useEffect(() => {
        if (attachmentUsagesAndLinkedProjects === undefined) return
        const tableData: NodeData[] = []

        const attachmentUsages = structuredClone(attachmentUsagesAndLinkedProjects.attachmentUsages)
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
            const projId = proj[0]['_links']['self']['href'].split('/').at(-1)
            const node: NodeData = {
                rowData: [
                    <Link
                        key={`${projId}_name_project`}
                        href={`/projects/detail/${projId}`}
                    >
                        {`${proj[0].name} ${proj[0].version ?? ''}`}
                    </Link>,
                    <div key={`${projId}_relationship_project`}>
                        {Capitalize(attachmentUsages['linkedProjects']?.[p].projectRelationship ?? '')}
                    </div>,
                    <div key={`${projId}_uploadedBy_project`}>{''}</div>,
                    <div key={`${projId}_type_project`}>{''}</div>,
                    <div key={`${projId}_used_in_license_info_project`}>{''}</div>,
                    <div key={`${projId}_used_in_license_info_conclusions_project`}>{''}</div>,
                    <div key={`${projId}_used_in_source_code_bundle_project`}>{''}</div>,
                    <div key={`${projId}_other_project`}>{''}</div>,
                ],
                children: [],
            }
            for (const r of attachmentUsages['_embedded']['sw360:release']) {
                const rel = r['_links']?.['self']['href'].split('/').at(-1)
                if (rel !== undefined && releases.has(rel)) {
                    const release: NodeData = {
                        rowData: [
                            <Link
                                key={`${projId}_name_release`}
                                href={`/components/releases/detail/${rel}`}
                            >
                                {`${r.name ?? ''} ${r.version ?? ''}`}
                            </Link>,
                            <div key={`${projId}_relation_release`}>
                                {Capitalize(attachmentUsages['releaseIdToUsage']?.[rel]?.releaseRelation ?? '')}
                            </div>,
                            <div key={`${projId}_uploadedBy_release`}>{''}</div>,
                            <div key={`${projId}_type_release`}>{''}</div>,
                            <div key={`${projId}_used_in_license_info_release`}>{''}</div>,
                            <div key={`${projId}_used_in_license_info_conclusions_release`}>{''}</div>,
                            <div key={`${projId}_used_in_source_code_bundle_release`}>{''}</div>,
                            <div key={`${projId}_other_release`}>{''}</div>,
                        ],
                        children: [],
                    }
                    formatReleaseAttachmentDataToTableData(r, release)
                    if (!node.children) node.children = []
                    node.children.push(release)
                }
            }
            attachmentUsages['_embedded']['sw360:release'] = attachmentUsages['_embedded']['sw360:release'].filter(
                (r: Release) => !releases.has(r['_links']?.['self']['href'].split('/').at(-1) ?? ''),
            )
            tableData.push(node)
        }

        for (const r of attachmentUsages['_embedded']['sw360:release']) {
            const rel = r['_links']?.['self']['href'].split('/').at(-1) ?? ''
            const release: NodeData = {
                rowData: [
                    <Link
                        key={`${rel}_name_release`}
                        href={`/components/releases/detail/${rel}`}
                    >
                        {`${r.name ?? ''} ${r.version ?? ''}`}
                    </Link>,
                    <div key={`${rel}_relation_release`}>
                        {Capitalize(attachmentUsages['releaseIdToUsage']?.[rel]?.releaseRelation ?? '')}
                    </div>,
                    <div key={`${rel}_uploadedBy_release`}>{''}</div>,
                    <div key={`${rel}_type_release`}>{''}</div>,
                    <div key={`${rel}_used_in_license_info_release`}>{''}</div>,
                    <div key={`${rel}_used_in_license_info_conclusions_release`}>{''}</div>,
                    <div key={`${rel}_used_in_license_info_source_code_bundle`}>{''}</div>,
                    <div key={`${rel}_other_release`}>{''}</div>,
                ],
                children: [],
            }
            formatReleaseAttachmentDataToTableData(r, release)
            tableData.push(release)
        }
        setData((prevState) => {
            if (prevState !== undefined) setExpandedFieldsOfNewData(prevState, tableData)
            return tableData
        })
    }, [attachmentUsagesAndLinkedProjects, saveUsagesPayload])

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
        </>
    )
}
