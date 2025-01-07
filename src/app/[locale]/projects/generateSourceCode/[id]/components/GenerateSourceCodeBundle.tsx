// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { TreeTable, _ } from 'next-sw360'
import { useTranslations } from "next-intl"
import { Button, Form, Spinner } from "react-bootstrap"
import Link from "next/link"
import { useEffect, useState, ReactNode, Dispatch, SetStateAction } from "react"
import { useSession, getSession, signOut } from "next-auth/react"
import { ApiUtils, CommonUtils } from "@/utils"
import { AttachmentUsages, HttpStatus, Project, NodeData, Embedded, ProjectLinkedRelease, Release, Attachment, AttachmentUsage } from "@/object-types"
import { notFound, useSearchParams } from "next/navigation"

type LinkedProjects = Embedded<Project, 'sw360:projects'>

const Capitalize = (text: string) =>
    text.split('_').reduce((s, c) => s + ' ' + (c.charAt(0) + c.substring(1).toLocaleLowerCase()), '')

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

const filterSRCTypeAttachments = (attachmentUsages: AttachmentUsages) => {
    for(const r of attachmentUsages['_embedded']['sw360:release']) {
        r.attachments = (r.attachments ?? []).filter((att: Attachment) => att.attachmentType === 'SRC')
    }
}

export default function GenerateSourceCodeBundle({ projectId }: Readonly<{projectId: string}>): ReactNode {
    const t = useTranslations('default')
    const { status } = useSession()
    const [project, setProject] = useState<Project>()
    const params = useSearchParams()
    const [attachmentUsagesAndLinkedProjects, setAttachmentUsagesAndLinkedProjects] = useState<{
        attachmentUsages: AttachmentUsages
        linkedProjects: LinkedProjects | null
    }>()
    const [data, setData] = useState<NodeData[]>()
    
    const handleDownloadProject = (projectId: string) => {
        console.log('download  project', projectId)
    }

    const formatReleaseAndAttachments = (attachmentUsage: AttachmentUsage[], r: Release, level: number): NodeData | undefined => {
        if (!r.attachments) {
            r.attachments = []
        }
        const release_id = r._links?.self.href.split('/').at(-1) ?? ''
        const attNodes: NodeData[] = []
        let row_color_class = 'green-cell'
        if (r.attachments.length > 1) {
            row_color_class = 'orange-cell'
        }
        for(const att of r.attachments) {
            let usedIn = 0
            for(const usage of attachmentUsage) {
                if(usage.attachmentContentId === att.attachmentContentId) {
                    usedIn++
                }
            
            }
            const attNode: NodeData = {
                rowData: [                    
                    <div className={`form-check text-center ${row_color_class}`} key={`${att.attachmentContentId ?? ''}_select`}>
                        <input className='form-check-input' type='checkbox' value={att.attachmentContentId ?? ''} />
                    </div>, 
                    <div className={`text-center ${row_color_class}`} key={`${att.attachmentContentId ?? ''}_level`}>{level}</div>,
                    <div className={`${row_color_class}`} key={`${att.attachmentContentId ?? ''}_name`}>{att.filename}</div>, 
                    <p key={`${att.attachmentContentId ?? ''}_used_by`} className={`${row_color_class}`}>
                        {
                            usedIn !== 0 ? <>{
                                t.rich('USED_BY_PROJECTS', {
                                    count: usedIn,
                                    strong: (chunks) => <b>{chunks}</b>,
                                })
                            }</>: <>{t('not used in any project yet')}</>
                        }
                    </p>,
                    <div className={`text-center ${row_color_class}`} key={`${att.attachmentContentId ?? ''}_name`}>
                        {Capitalize(r.clearingState ?? '')}
                    </div>,
                    <div className='text-center' key={`${att.attachmentContentId}_uploaded_by`}>
                        <Link
                            className={`text-link ${row_color_class}`}
                            href={`mailto:${att.createdBy}`}
                        >
                            {att.createdBy}
                        </Link>
                    </div>, 
                    <div className={`text-center ${row_color_class}`} key={`${att.attachmentContentId ?? ''}_clearing_team`}>{att.checkedTeam ?? ''}</div>
                ]
            }
            attNodes.push(attNode)
        }
        if(attNodes.length === 0) {
            return
        }
        const relNode: NodeData = {
            rowData: [
                <div className={`text-center ${row_color_class}`} key={`${release_id}_select`}></div>,
                <div className={`text-center ${row_color_class}`}
                    key={`${release_id}_level`}
                >1</div>,
                <Link href={`/component/release/detail/${release_id}`} 
                    className={`text-center text-link ${row_color_class}`} key={`${release_id}_release_name`}>
                    {r.name ?? ''}{r.version ?? ` ${r.version}`}
                </Link>,
                <div className={`text-center ${row_color_class}`} key={`${release_id}_component_type`}>
                    {r.componentType ?? ''}
                </div>,
                <div className={`text-center ${row_color_class}`} key={`${release_id}_clearing_state`}>
                    {Capitalize(r.clearingState ?? '')}
                </div>,
                <div className={`text-center ${row_color_class}`} key={`${release_id}_uploaded_by`}></div>,
                <div className={`text-center ${row_color_class}`} key={`${release_id}_clearing_team`}></div>
            ],
            children: attNodes
        }
        return relNode
    }

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal
        ;(async () => {
            try {
                const searchParams = Object.fromEntries(params)
                if(Object.prototype.hasOwnProperty.call(searchParams, "withSubProjects") === false) {
                    return
                }
                const session = await getSession()
                if (CommonUtils.isNullOrUndefined(session))
                    return signOut()
                const requests = [ApiUtils.GET(`projects/${projectId}`, session.user.access_token, signal)]
                if(searchParams.withSubProjects === 'true') {
                    requests.push(
                        ApiUtils.GET(`projects/${projectId}/attachmentUsage?transitive=true`, session.user.access_token, signal),
                        ApiUtils.GET(`projects/${projectId}/linkedProjects?transitive=true`, session.user.access_token, signal)
                    )
                } else {
                    requests.push(ApiUtils.GET(`projects/${projectId}/attachmentUsage?transitive=false`, session.user.access_token, signal))
                }
                const responses = await Promise.all(requests)
                if (responses.filter(response => (response.status === HttpStatus.UNAUTHORIZED)).length !== 0) {
                    return signOut()
                } else if (responses.filter(response => (response.status !== HttpStatus.OK)).length !== 0) {
                    return notFound()
                }
    
                const proj = await responses[0].json() as Project
                setProject(proj)
                const attachmentUsages = await responses[1].json() as AttachmentUsages
                const linkedProjects = (searchParams.withSubProjects === 'true') ? await responses[2].json() as LinkedProjects: null
                setAttachmentUsagesAndLinkedProjects({
                    attachmentUsages: attachmentUsages,
                    linkedProjects: linkedProjects
                })
            } catch(e) {
                console.error(e)
            }
        })()
        return () => controller.abort()
    }, [projectId, params])

    
    useEffect(() => {
        if(attachmentUsagesAndLinkedProjects === undefined)
            return

        const attachmentUsages = structuredClone(attachmentUsagesAndLinkedProjects.attachmentUsages)
        filterSRCTypeAttachments(attachmentUsages)

        const tableData: NodeData[] = []

        if(attachmentUsagesAndLinkedProjects.linkedProjects !== null) {
            const linkedProjects = structuredClone(attachmentUsagesAndLinkedProjects.linkedProjects)
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
                const projectNode: NodeData = {
                    rowData: [
                        <div className="text-center" key={`${p}_select`}></div>,
                        <div className="text-center"
                            key={`${p}_level`}
                        >1</div>,
                        <Link href={`/projects/detail/${p}`} 
                            className="text-center text-link" key={`${p}_release_name`}>
                            {proj[0].name}{proj[0].version !== undefined && ` ${proj[0].version}`}
                        </Link>,
                        <div className="text-center" key={`${p}_component_type`}>
                            {Capitalize(proj[0].projectType ?? '')}
                        </div>,
                        <div className="text-center" key={`${p}_clearing_state`}>
                            {Capitalize(proj[0].clearingState ?? '')}
                        </div>,
                        <div className="text-center" key={`${p}_uploaded_by`}></div>,
                        <div className="text-center" key={`${p}_clearing_team`}></div>
                    ],
                    children: []
                }
                for(const r of attachmentUsages['_embedded']['sw360:release']) {
                    if(!r.attachments)
                        continue
                    const release_id = r._links?.self.href.split('/').at(-1)
                    if(release_id !== undefined && releases.has(release_id)) {
                        const relNode = formatReleaseAndAttachments(attachmentUsages._embedded["sw360:attachmentUsages"][0], r, 2)
                        if(!relNode)
                            continue
                        projectNode.children?.push(relNode)
                    }
                }
                attachmentUsages['_embedded']['sw360:release'] = 
                attachmentUsages['_embedded']['sw360:release'].filter((r: Release) => 
                    !releases.has(r['_links']?.['self']['href'].split('/').at(-1) ?? '')
                )
                if(projectNode.children && projectNode.children.length !== 0) {
                    tableData.push(projectNode)
                }
            }
        }

        for (const r of attachmentUsages._embedded["sw360:release"]) {
            const relNode = formatReleaseAndAttachments(attachmentUsages._embedded["sw360:attachmentUsages"][0], r, 1)
            if(!relNode)
                continue
            tableData.push(relNode)
        }
        setData(tableData)

    }, [attachmentUsagesAndLinkedProjects])

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
    } else if(project === undefined) {
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
                            <div className='col-auto buttonheader-title'>
                                {t('GENERATE SOURCE CODE BUNDLE')}
                            </div>
                            <div className='col-auto text-truncate buttonheader-title'>
                                {project.name}{' '}{(project.version !== undefined) && `(${project.version})`}
                            </div>
                        </div>
                        <div className='col-lg-12'>
                            <Button
                                variant='primary'
                                className='me-2 py-2 col-auto'
                                onClick={() => handleDownloadProject(projectId)}
                            >
                                {t('Download File')}
                            </Button>
                            <div className='subscriptionBox my-2' style={{ maxWidth: '98vw',
                                                                           textAlign:'left',
                                                                           fontSize: '15px'}}>
                                {t('No previous selection found If you have writing permissions to this project your selection will be stored automatically when downloading')}
                            </div>
                            {
                                data
                                ? <TreeTable columns={columns} data={data} setData={setData as Dispatch<SetStateAction<NodeData[]>>} selector={true} sort={false} />
                                : <div className='col-12 text-center'>
                                    <Spinner className='spinner' />
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </>
        )
    }
}
