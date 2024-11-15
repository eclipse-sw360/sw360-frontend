// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { HttpStatus, NodeData, AttachmentUsages, Project, Release, Embedded, ProjectLinkedRelease, AttachmentUsage } from '@/object-types'
import { ApiUtils } from '@/utils'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { TreeTable } from 'next-sw360'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { useEffect, useState, SetStateAction, Dispatch } from 'react'
import { Spinner } from 'react-bootstrap'

type LinkedProjects = Embedded<Project, 'sw360:projects'>

const Capitalize = (text: string) =>
    text.split('_').reduce((s, c) => s + ' ' + (c.charAt(0) + c.substring(1).toLocaleLowerCase()), '')

export default function AttachmentUsagesComponent({ projectId }: { projectId: string }): JSX.Element {
    const t = useTranslations('default')
    const { data: session, status } = useSession()
    const [data, setData] = useState<Array<NodeData>>()

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
                    ]
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
            ]
        }
    ]

    const fetchProjectAndReleaseDetails = (linkedProjects: Project[] | undefined, projectId: string, proj: Project[]) => {
        if(!linkedProjects || proj.length !== 0) {
            return
        }
        for(const p of linkedProjects) {
            if(p['_links']['self']['href'].split('/').at(-1) === projectId
            ) {
                proj[0] = p
                return
            } else {
                fetchProjectAndReleaseDetails(p["_embedded"]?.["sw360:linkedProjects"], projectId, proj)
            }
        }
    }

    const formatReleaseAttachmentDataToTableData = (r: Release, release: NodeData, attachmentUsages: AttachmentUsages) => {
        for(const att of r.attachments ?? []) {
            let sourceCodeBundleChecked = false, manuallySetChecked = false, licenseInfoChecked = false
            const usages = attachmentUsages["_embedded"]["sw360:attachmentUsages"][0]?.filter((elem: AttachmentUsage) => elem.attachmentContentId === att.attachmentContentId)
            for(const u of usages) {
                if (u.usageData) {
                    if(u.usageData.sourcePackage) {
                        sourceCodeBundleChecked = true
                    }
                    if (u.usageData.manuallySet) {
                        manuallySetChecked = true
                    }
                    if (u.usageData.licenseInfo) {
                        licenseInfoChecked = true
                    }
                }
            }
            const attachment: NodeData = {
                rowData: [
                    <div key={`${att.filename}_name_attachment`}>
                        {att.filename}
                    </div>,
                    <div key={`${att.filename}_relation_attachment`}>
                        {''}
                    </div>,
                    <div key={`${att.filename}_uploadedBy_attachment`}>
                        {att.createdBy}
                    </div>,
                    <div key={`${att.filename}_type_attachment`}>
                        {att.attachmentType}
                    </div>,
                    <input
                        key={`${att.filename}_used_in_license_info_attachment`}
                        id='attachmentUsages.checkbox'
                        type='checkbox'
                        className='form-check-input'
                        checked={licenseInfoChecked}
                        readOnly
                    />,
                    <div key={`${att.filename}_used_in_license_info_conclusions_attachment`}>
                        {''}
                    </div>,
                    <input
                        key={`${att.filename}_used_in_source_code_bundle_attachment`}
                        id='attachmentUsages.sourceCodeBundle.checkbox'
                        type='checkbox'
                        className='form-check-input'
                        checked={sourceCodeBundleChecked}
                        readOnly
                    />,
                    <input
                    key={`${att.filename}_other_attachment`}
                        id='attachmentUsages.other.checkbox'
                        type='checkbox'
                        className='form-check-input'
                        checked={manuallySetChecked}
                        readOnly
                    />
                ], 
                children: []
            }
            if(!release.children)
                release.children = []
            release.children.push(attachment)
        }
    }

    useEffect(() => {
        if (status !== 'authenticated') return
        const controller = new AbortController()
        const signal = controller.signal

        ;void (async () => {
            try {
                const res_licenseClearing = await ApiUtils.GET(
                    `projects/${projectId}/attachmentUsage?transitive=true`,
                    session.user.access_token,
                    signal
                )

                const res_linkedProjects = ApiUtils.GET(
                    `projects/${projectId}/linkedProjects?transitive=true`,
                    session.user.access_token,
                    signal
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

                const attachmentUsages = await responses[0].json() as AttachmentUsages
                const linkedProjects = await responses[1].json() as LinkedProjects

                const tableData: NodeData[] = []

                for (const p in attachmentUsages['linkedProjects'] ?? {}) {
                    const proj: Project[] = []
                    fetchProjectAndReleaseDetails(linkedProjects['_embedded']['sw360:projects'], p, proj)
                    if(proj.length === 0) {
                        continue
                    }
                    const releases = new Set<string>()
                    proj[0].linkedReleases?.map((r: ProjectLinkedRelease) => {
                        releases.add(r.release.split('/').at(-1) as string)
                    })
                    const projId = proj[0]["_links"]["self"]["href"].split('/').at(-1)
                    const node: NodeData = {
                        rowData: [
                            <Link key={`${projId}_name_project`} 
                                href={`/projects/detail/${projId}`}>
                                {`${proj[0].name} ${proj[0].version ?? ''}`}
                            </Link>,
                            <div key={`${projId}_relationship_project`}>
                                {Capitalize(attachmentUsages['linkedProjects']?.[p].projectRelationship ?? '')}
                            </div>,
                            <div key={`${projId}_uploadedBy_project`}>
                                {''}
                            </div>,
                            <div key={`${projId}_type_project`}>
                                {''}
                            </div>,
                            <div key={`${projId}_used_in_license_info_project`}>
                                {''}
                            </div>,
                            <div key={`${projId}_used_in_license_info_conclusions_project`}>
                                {''}
                            </div>,
                            <div key={`${projId}_used_in_source_code_bundle_project`}>
                                {''}
                            </div>,
                            <div key={`${projId}_other_project`}>
                                {''}
                            </div>
                        ], 
                        children: []
                    }
                    for(const r of attachmentUsages['_embedded']['sw360:release']) {
                        const rel = r['_links']?.['self']['href'].split('/').at(-1)
                        if(rel !== undefined && releases.has(rel)) {
                                const release: NodeData = {
                                    rowData: [
                                        <Link 
                                            key={`${projId}_name_release`} 
                                            href={`/components/releases/detail/${
                                                rel
                                            }`}
                                        >
                                            {`${r.name ?? ''} ${r.version ?? ''}`}
                                        </Link>,
                                        <div key={`${projId}_relation_release`}>
                                            {
                                                Capitalize(attachmentUsages['releaseIdToUsage']?.[rel]?.releaseRelation ?? '')
                                            }
                                        </div>,
                                        <div key={`${projId}_uploadedBy_release`}>
                                            {''}
                                        </div>,
                                        <div key={`${projId}_type_release`}>
                                            {''}
                                        </div>,
                                        <div key={`${projId}_used_in_license_info_release`}>
                                            {''}
                                        </div>,
                                        <div key={`${projId}_used_in_license_info_conclusions_release`}>
                                            {''}
                                        </div>,
                                        <div key={`${projId}_used_in_source_code_bundle_release`}>
                                            {''}
                                        </div>,
                                        <div key={`${projId}_other_release`}>
                                            {''}
                                        </div>,
                                    ],
                                    children: []
                                }
                                formatReleaseAttachmentDataToTableData(r, release, attachmentUsages)
                                if(!node.children)
                                    node.children = []
                                node.children.push(release)
                        }
                    }
                    attachmentUsages['_embedded']['sw360:release'] = 
                    attachmentUsages['_embedded']['sw360:release'].filter((r: Release) => 
                        !releases.has(r['_links']?.['self']['href'].split('/').at(-1) ?? '')
                    )
                    tableData.push(node)
                }

                for(const r of attachmentUsages['_embedded']['sw360:release']) {
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
                                {
                                    Capitalize(attachmentUsages['releaseIdToUsage']?.[rel]?.releaseRelation ?? '')
                                }
                            </div>,
                            <div key={`${rel}_uploadedBy_release`}>
                                {''}
                            </div>,
                            <div key={`${rel}_type_release`}>
                                {''}
                            </div>,
                            <div key={`${rel}_used_in_license_info_release`}>
                                {''}
                            </div>,
                            <div key={`${rel}_used_in_license_info_conclusions_release`}>
                                {''}
                            </div>,
                            <div key={`${rel}_used_in_license_info_source_code_bundle`}>
                                {''}
                            </div>,
                            <div key={`${rel}_other_release`}>
                                {''}
                            </div>
                        ],
                        children: []
                    }
                    formatReleaseAttachmentDataToTableData(r, release, attachmentUsages)
                    tableData.push(release)
                }
                setData(tableData)
            } catch (e) {
                console.error(e)
            }
        })()

        return () => controller.abort()
    }, [status, projectId, session, t])

    return (
        <>
            {
                data
                ? <TreeTable columns={columns} data={data} setData={setData as Dispatch<SetStateAction<NodeData[]>>} selector={true} sort={false} />
                : <div className='col-12 text-center'>
                    <Spinner className='spinner' />
                </div>
            }
        </>
    )
}
