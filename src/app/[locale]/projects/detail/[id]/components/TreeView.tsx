// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { HttpStatus, NodeData, Embedded, Project, LicenseClearing, Release } from '@/object-types'
import { ApiUtils } from '@/utils'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { TreeTable } from 'next-sw360'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Dispatch, SetStateAction, useEffect, useState, type JSX } from 'react';
import { OverlayTrigger, Tooltip, Spinner } from 'react-bootstrap'
import { FaPencilAlt } from 'react-icons/fa'
import ExpandableTextList from '@/components/ExpandableList/ExpandableTextLink'

const Capitalize = (text: string) =>
    text.split('_').reduce((s, c) => s + ' ' + (c.charAt(0) + c.substring(1).toLocaleLowerCase()), '')

type LinkedProjects = Embedded<Project, 'sw360:projects'>

export default function TreeView({ projectId }: { projectId: string }): JSX.Element {
    const t = useTranslations('default')
    const { data: session, status } = useSession()
    const [data, setData] = useState<Array<NodeData> | null>(null)

    const columns = [
        {
            id: 'licenseClearing.treeview.name',
            name: t('Name'),
            width: '20%',
            sort: true,
        },
        {
            id: 'licenseClearing.treeview.type',
            name: t('Type'),
            width: '5%',
            sort: true,
        },
        {
            id: 'licenseClearing.treeview.relation',
            name: t('Relation'),
            width: '6%',
            sort: true,
        },
        {
            id: 'licenseClearing.treeview.mainLicenses',
            name: t('Main Licenses'),
            width: '10%',
            sort: true,
        },
        {
            id: 'licenseClearing.treeview.otherLicenses',
            name: t('Other licenses'),
            width: '10%',
            sort: true,
        },
        {
            id: 'licenseClearing.treeview.state',
            name: t('State'),
            width: '6%',
            sort: true,
        },
        {
            id: 'licenseClearing.treeview.releaseMainlineState',
            name: t('Release Mainline State'),
            width: '6%',
            sort: true,
        },
        {
            id: 'licenseClearing.treeview.projectMainlineState',
            name: t('Project Mainline State'),
            width: '6%',
            sort: true,
        },
        {
            id: 'licenseClearing.treeview.comment',
            name: t('Comment'),
            width: '8%',
            sort: true,
        },
        {
            id: 'licenseClearing.treeview.actions',
            name: t('Actions'),
            sort: true,
            width: '6%',
        },
    ]

    const extractLinkedProjectsAndTheirLinkedReleases = (
        licenseClearingData: LicenseClearing,
        linkedProjectsData: Project[] | undefined
    ): NodeData[] => {
        if (!linkedProjectsData) return []
        const treeData: NodeData[] = []

        for (const p of linkedProjectsData) {
            const nodeProject: NodeData = {
                rowData: [
                    <Link
                        href={`/projects/detail/${p['_links']['self']['href'].substring(
                            p['_links']['self']['href'].lastIndexOf('/') + 1
                        )}`}
                        className='text-link text-center'
                        key={`${p['_links']['self']['href'].substring(
                            p['_links']['self']['href'].lastIndexOf('/') + 1
                        )}-link`}
                    >
                        {`${p.name} (${p.version ?? ''})`}
                    </Link>,
                    <div
                        className='text-center'
                        key={`${p['_links']['self']['href'].substring(
                            p['_links']['self']['href'].lastIndexOf('/') + 1
                        )}-projectType`}
                    >
                        {Capitalize(p.projectType ?? '')}
                    </div>,
                    <>{''}</>,
                    <>{''}</>,
                    <>{''}</>,
                    <div
                        className='text-center'
                        key={`${p['_links']['self']['href'].substring(
                            p['_links']['self']['href'].lastIndexOf('/') + 1
                        )}-state`}
                    >
                        <OverlayTrigger
                            overlay={<Tooltip>{`${t('Project State')}: ${Capitalize(p.state ?? '')}`}</Tooltip>}
                        >
                            {p.state === 'ACTIVE' ? (
                                <span className='badge bg-success capsule-left overlay-badge'>{'PS'}</span>
                            ) : (
                                <span className='badge bg-secondary capsule-left overlay-badge'>{'PS'}</span>
                            )}
                        </OverlayTrigger>
                        <OverlayTrigger
                            overlay={
                                <Tooltip>{`${t('Project Clearing State')}: ${Capitalize(
                                    p.clearingState ?? ''
                                )}`}</Tooltip>
                            }
                        >
                            {p.clearingState === 'OPEN' ? (
                                <span className='badge bg-danger capsule-right overlay-badge'>{'CS'}</span>
                            ) : p.clearingState === 'IN_PROGRESS' ? (
                                <span className='badge bg-warning capsule-right overlay-badge'>{'CS'}</span>
                            ) : (
                                <span className='badge bg-success capsule-right overlay-badge'>{'CS'}</span>
                            )}
                        </OverlayTrigger>
                    </div>,
                    <>{''}</>,
                    <>{''}</>,
                    <>{''}</>,
                    <div
                        className='text-center'
                        key={`${p['_links']['self']['href'].substring(
                            p['_links']['self']['href'].lastIndexOf('/') + 1
                        )}-edit`}
                    >
                        <OverlayTrigger overlay={<Tooltip>{t('Edit')}</Tooltip>}>
                            <Link
                                href={`/projects/edit/${p['_links']['self']['href'].substring(
                                    p['_links']['self']['href'].lastIndexOf('/') + 1
                                )}`}
                                className='overlay-trigger'
                            >
                                <FaPencilAlt className='btn-icon' />
                            </Link>
                        </OverlayTrigger>
                    </div>,
                ],
                children: extractLinkedProjectsAndTheirLinkedReleases(
                    licenseClearingData,
                    p['_embedded']?.['sw360:linkedProjects']
                ),
            }

            for (const l of p['linkedReleases'] ?? []) {
                const res = licenseClearingData['_embedded']['sw360:release'].filter(
                    (e: Release) =>
                        e['_links']?.['self']['href'].substring(e['_links']['self']['href'].lastIndexOf('/') + 1) ===
                        l.release.substring(l.release.lastIndexOf('/') + 1)
                )
                const nodeRelease: NodeData = {
                    rowData: [
                        <Link
                            href={`/components/releases/detail/${l.release.substring(l.release.lastIndexOf('/') + 1)}`}
                            className='text-link text-center'
                            key={`${l.release.substring(l.release.lastIndexOf('/') + 1)}-link`}
                        >
                            {`${res[0].name} (${res[0].version})`}
                        </Link>,
                        <div
                            className='text-center'
                            key={`${l.release.substring(l.release.lastIndexOf('/') + 1)}-componentType`}
                        >
                            {Capitalize(res[0].componentType ?? '')}
                        </div>,
                        <div
                            className='text-center'
                            key={`${l.release.substring(l.release.lastIndexOf('/') + 1)}-relation`}
                        >
                            {Capitalize(l.relation)}
                        </div>,
                        <div
                            className='text-center'
                            key={`${l.release.substring(l.release.lastIndexOf('/') + 1)}-mainLicenses`}
                        >
                            {(res[0].mainLicenseIds ?? []).join(', ')}
                        </div>,
                        <div
                            className='text-center'
                            key={`${l.release.substring(l.release.lastIndexOf('/') + 1)}-otherLicenses`}
                        >
                            <ExpandableTextList list={res[0].otherLicenseIds ?? []} />
                        </div>,
                        <div
                            className='text-center'
                            key={`${l.release.substring(l.release.lastIndexOf('/') + 1)}-state`}
                        >
                            <OverlayTrigger
                                overlay={
                                    <Tooltip>{`${t('Release Clearing State')}: ${Capitalize(
                                        res[0].clearingState ?? ''
                                    )}`}</Tooltip>
                                }
                            >
                                {res[0].clearingState === 'NEW_CLEARING' ? (
                                    <span className='badge bg-danger overlay-badge'>{'CS'}</span>
                                ) : res[0].clearingState === 'REPORT_AVAILABLE' ? (
                                    <span className='badge bg-primary overlay-badge'>{'CS'}</span>
                                ) : (
                                    <span className='badge bg-success overlay-badge'>{'CS'}</span>
                                )}
                            </OverlayTrigger>
                        </div>,
                        <div
                            className='text-center'
                            key={`${l.release.substring(l.release.lastIndexOf('/') + 1)}-mainlineState`}
                        >
                            {Capitalize(l.mainlineState)}
                        </div>,
                        <div
                            className='text-center'
                            key={`${l.release.substring(l.release.lastIndexOf('/') + 1)}-projectMainLineState`}
                        >
                            {Capitalize(l.mainlineState)}
                        </div>,
                        <div
                            className='text-center'
                            key={`${l.release.substring(l.release.lastIndexOf('/') + 1)}-comment`}
                        >
                            {l.comment}
                        </div>,
                        <div
                            className='text-center'
                            key={`${l.release.substring(l.release.lastIndexOf('/') + 1)}-edit`}
                        >
                            <OverlayTrigger overlay={<Tooltip>{t('Edit')}</Tooltip>}>
                                <Link
                                    href={`/components/releases/edit/${l.release.substring(
                                        l.release.lastIndexOf('/') + 1
                                    )}`}
                                    className='overlay-trigger'
                                >
                                    <FaPencilAlt className='btn-icon' />
                                </Link>
                            </OverlayTrigger>
                        </div>,
                    ],
                    children: [],
                }
                if(nodeProject.children === undefined)
                    nodeProject.children = []
                nodeProject.children.push(nodeRelease)
            }
            treeData.push(nodeProject)
        }
        return treeData
    }

    useEffect(() => {
        if (status !== 'authenticated') return
        const controller = new AbortController()
        const signal = controller.signal
        
        void (async () => {
            try {
                const res_licenseClearing = await ApiUtils.GET(
                    `projects/${projectId}/licenseClearing?transitive=true`,
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

                const licenseClearingData = await responses[0].json() as LicenseClearing
                const linkedProjectsData = await responses[1].json() as LinkedProjects

                const releases: NodeData[] = []
                for (const l of licenseClearingData['linkedReleases']) {
                    const res = licenseClearingData['_embedded']['sw360:release'].filter(
                        (e: Release) =>
                            e['_links']?.['self']['href'].substring(e['_links']['self']['href'].lastIndexOf('/') + 1) ===
                            l.release.substring(l.release.lastIndexOf('/') + 1)
                    )
                    const nodeRelease: NodeData = {
                        rowData: [
                            <Link
                                href={`/components/releases/detail/${l.release.substring(
                                    l.release.lastIndexOf('/') + 1
                                )}`}
                                className='text-link text-center'
                                key={`${l.release.substring(l.release.lastIndexOf('/') + 1)}-link`}
                            >
                                {`${res[0].name} (${res[0].version})`}
                            </Link>,
                            <div
                                className='text-center'
                                key={`${l.release.substring(l.release.lastIndexOf('/') + 1)}-componentType`}
                            >
                                {Capitalize(res[0].componentType ?? '')}
                            </div>,
                            <div
                                className='text-center'
                                key={`${l.release.substring(l.release.lastIndexOf('/') + 1)}-relation`}
                            >
                                {Capitalize(l.relation)}
                            </div>,
                            <div
                                className='text-center'
                                key={`${l.release.substring(l.release.lastIndexOf('/') + 1)}-mainLicenses`}
                            >
                                {(res[0].mainLicenseIds ?? []).join(', ')}
                            </div>,
                            <div
                                className='text-center'
                                key={`${l.release.substring(l.release.lastIndexOf('/') + 1)}-otherLicenses`}
                            >
                                <ExpandableTextList list={res[0].otherLicenseIds ?? []} />
                            </div>,
                            <div
                                className='text-center'
                                key={`${l.release.substring(l.release.lastIndexOf('/') + 1)}-state`}
                            >
                                <OverlayTrigger
                                    overlay={
                                        <Tooltip>{`${t('Release Clearing State')}: ${Capitalize(
                                            res[0].clearingState ?? ''
                                        )}`}</Tooltip>
                                    }
                                >
                                    {res[0].clearingState === 'NEW_CLEARING' ? (
                                        <span className='badge bg-danger overlay-badge'>{'CS'}</span>
                                    ) : res[0].clearingState === 'REPORT_AVAILABLE' ? (
                                        <span className='badge bg-primary overlay-badge'>{'CS'}</span>
                                    ) : (
                                        <span className='badge bg-success overlay-badge'>{'CS'}</span>
                                    )}
                                </OverlayTrigger>
                            </div>,
                            <div
                                className='text-center'
                                key={`${l.release.substring(l.release.lastIndexOf('/') + 1)}-mainLineState`}
                            >
                                {Capitalize(l.mainlineState)}
                            </div>,
                            <div
                                className='text-center'
                                key={`${l.release.substring(l.release.lastIndexOf('/') + 1)}-projectMainLineState`}
                            >
                                {Capitalize(l.mainlineState)}
                            </div>,
                            <div
                                className='text-center'
                                key={`${l.release.substring(l.release.lastIndexOf('/') + 1)}-comment`}
                            >
                                {l.comment}
                            </div>,
                            <div
                                className='text-center'
                                key={`${l.release.substring(l.release.lastIndexOf('/') + 1)}-edit`}
                            >
                                <OverlayTrigger overlay={<Tooltip>{t('Edit')}</Tooltip>}>
                                    <Link
                                        href={`/components/releases/edit/${l.release.substring(
                                            l.release.lastIndexOf('/') + 1
                                        )}`}
                                        className='overlay-trigger'
                                    >
                                        <FaPencilAlt className='btn-icon' />
                                    </Link>
                                </OverlayTrigger>
                            </div>,
                        ],
                        children: [],
                    }
                    releases.push(nodeRelease)
                }

                setData([
                    ...releases,
                    ...extractLinkedProjectsAndTheirLinkedReleases(
                        licenseClearingData,
                        linkedProjectsData['_embedded']['sw360:projects']
                    ),
                ])
            } catch (e) {
                console.error(e)
                setData([])
            } 
        })()

        return () => controller.abort()
    }, [status, projectId, session, t])

    return (
        <>
            {
                data ?
                <TreeTable columns={columns} data={data} setData={setData as Dispatch<SetStateAction<NodeData[]>>} selector={true} sort={false} />:
                <div className='col-12 mt-1 text-center'>
                    <Spinner className='spinner' />
                </div>
            }
        </>
    )
}
