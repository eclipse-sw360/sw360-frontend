// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { HttpStatus, LicenseClearing, Project, Release, Embedded } from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils'
import { signOut, getSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Table, _ } from 'next-sw360'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { useEffect, useState, type JSX } from 'react';
import { OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap'
import { FaPencilAlt } from 'react-icons/fa'

const Capitalize = (text: string) =>
    text.split('_').reduce((s, c) => s + ' ' + (c.charAt(0) + c.substring(1).toLocaleLowerCase()), '')

interface ProjectState {
    state: string
    clearingState: string
}

interface ReleaseState {
    clearingState: string
}

enum ElementType {
    LINKED_PROJECT,
    LINKED_RELEASE,
}

interface ListViewData {
    elementType: ElementType
    elem: {
        name: string
        version: string
        id: string
    }
    type: string
    projectPath: string[]
    releasePath: string[]
    relation: string
    mainLicenses: string[]
    state: ProjectState | ReleaseState
    releaseMainlineState: string
    projectMainlineState: string
    comment: string
    actions: string
}

type LinkedProjects = Embedded<Project, 'sw360:projects'>

const extractLinkedProjectsAndTheirLinkedReleases = (
    licenseClearingData: LicenseClearing,
    linkedProjectsData: Project[] | undefined,
    finalData: ListViewData[],
    path: string[]
) => {
    if (!linkedProjectsData) return
    for (const p of linkedProjectsData) {
        path.push(`${p.name} (${p.version})`)

        finalData.push({
            elementType: ElementType.LINKED_PROJECT,
            elem: {
                name: p.name,
                version: p.version ?? '',
                id: p['_links']['self']['href'].substring(p['_links']['self']['href'].lastIndexOf('/') + 1),
            },
            type: p.projectType ?? '',
            projectPath: path.slice(),
            releasePath: [],
            relation: '',
            mainLicenses: [],
            state: {
                clearingState: p.clearingState ?? '',
                state: p.state ?? '',
            },
            releaseMainlineState: '',
            projectMainlineState: '',
            comment: '',
            actions: p['_links']['self']['href'].substring(p['_links']['self']['href'].lastIndexOf('/') + 1),
        })

        for (const l of p['linkedReleases'] ?? []) {
            const id = l.release.substring(l.release.lastIndexOf('/') + 1)
            const res = licenseClearingData['_embedded']['sw360:release'].filter(
                (e: Release) =>
                    e['_links']?.['self']['href'].substring(e['_links']['self']['href'].lastIndexOf('/') + 1) === id
            )
            finalData.push({
                elementType: ElementType.LINKED_RELEASE,
                elem: {
                    name: res[0].name ?? '',
                    version: res[0].version ?? '',
                    id: id,
                },
                type: res[0].componentType ?? '',
                projectPath: path.slice(),
                releasePath: [],
                relation: l.relation,
                mainLicenses: res[0].mainLicenseIds ?? [],
                state: {
                    clearingState: res[0].clearingState ?? '',
                },
                releaseMainlineState: l.mainlineState,
                projectMainlineState: l.mainlineState,
                comment: l.comment,
                actions: id,
            })
        }
        extractLinkedProjectsAndTheirLinkedReleases(
            licenseClearingData,
            p['_embedded']?.['sw360:linkedProjects'],
            finalData,
            path
        )
        path.pop()
    }
}

const extractLinkedReleases = (
    projectName: string,
    projectVersion: string,
    licenseClearingData: LicenseClearing,
    finalData: ListViewData[],
    path: string[]
) => {
    path.push(`${projectName} (${projectVersion})`)
    for (const l of licenseClearingData['linkedReleases']) {
        const id = l.release.substring(l.release.lastIndexOf('/') + 1)
        const res = licenseClearingData['_embedded']['sw360:release'].filter(
            (e: Release) => e['_links']?.['self']['href'].substring(e['_links']['self']['href'].lastIndexOf('/') + 1) === id
        )
        finalData.push({
            elementType: ElementType.LINKED_RELEASE,
            elem: {
                name: res[0].name ?? '',
                version: res[0].version ?? '',
                id: id,
            },
            type: res[0].componentType ?? '',
            projectPath: path.slice(),
            releasePath: [],
            relation: l.relation,
            mainLicenses: res[0].mainLicenseIds ?? [],
            state: {
                clearingState: res[0].clearingState ?? '',
            },
            releaseMainlineState: l.mainlineState,
            projectMainlineState: l.mainlineState,
            comment: l.comment,
            actions: id,
        })
    }
}

export default function ListView({
    projectId,
    projectName,
    projectVersion,
}: {
    projectId: string
    projectName: string
    projectVersion: string
}): JSX.Element {
    const t = useTranslations('default')
    const [data, setData] = useState<null | (object | string)[][]>()

    const columns = [
        {
            id: 'licenseClearing.name',
            name: t('Name'),
            width: '9%',
            formatter: ({
                name,
                version,
                id,
                type,
            }: {
                name: string
                version: string
                id: string
                type: ElementType
            }) =>
                _(
                    <Link
                        href={
                            type === ElementType.LINKED_RELEASE
                                ? `/components/releases/detail/${id}`
                                : `/projects/detail/${id}`
                        }
                        className='text-link'
                    >
                        {`${name} (${version})`}
                    </Link>
                ),
            sort: true,
        },
        {
            id: 'licenseClearing.type',
            name: t('Type'),
            width: '7%',
            formatter: (type: string) => _(<>{Capitalize(type)}</>),
            sort: true,
        },
        {
            id: 'licenseClearing.projectPath',
            name: t('Project Path'),
            width: '12%',
            formatter: (path: string[]) => _(<>{path.join(' -> ')}</>),
            sort: true,
        },
        {
            id: 'licenseClearing.releasePath',
            name: t('Release Path'),
            width: '9%',
            formatter: (path: string[]) => _(<>{path.join(' -> ')}</>),
            sort: true,
        },
        {
            id: 'licenseClearing.relation',
            name: t('Relation'),
            width: '9%',
            formatter: (type: string) => _(<>{Capitalize(type)}</>),
            sort: true,
        },
        {
            id: 'licenseClearing.mainLicenses',
            name: t('Main Licenses'),
            width: '10%',
            formatter: (licenses: string[]) =>
                _(
                    <>
                        {licenses.map((e, i) => (
                            <li key={e} style={{ display: 'inline' }}>
                                <Link href={`/licenses/detail${e}`} className='text-link'>
                                    {e}
                                </Link>
                                {i === licenses.length - 1 ? '' : ','}{' '}
                            </li>
                        ))}
                    </>
                ),
            sort: true,
        },
        {
            id: 'licenseClearing.state',
            name: t('State'),
            width: '8%',
            formatter: ({ state, elementType }: { state: ProjectState | ReleaseState; elementType: ElementType }) => {
                if (elementType === ElementType.LINKED_PROJECT) {
                    return _(
                        <>
                            <div className='text-center'>
                                <OverlayTrigger
                                    overlay={
                                        <Tooltip>{`${t('Project State')}: ${Capitalize(
                                            (state as ProjectState).state
                                        )}`}</Tooltip>
                                    }
                                >
                                    {(state as ProjectState).state === 'ACTIVE' ? (
                                        <span className='badge bg-success capsule-left overlay-badge'>{'PS'}</span>
                                    ) : (
                                        <span className='badge bg-secondary capsule-left overlay-badge'>{'PS'}</span>
                                    )}
                                </OverlayTrigger>
                                <OverlayTrigger
                                    overlay={
                                        <Tooltip>{`${t('Project Clearing State')}: ${Capitalize(
                                            (state as ProjectState).clearingState
                                        )}`}</Tooltip>
                                    }
                                >
                                    {(state as ProjectState).clearingState === 'OPEN' ? (
                                        <span className='badge bg-danger capsule-right overlay-badge'>{'CS'}</span>
                                    ) : (state as ProjectState).clearingState === 'IN_PROGRESS' ? (
                                        <span className='badge bg-warning capsule-right overlay-badge'>{'CS'}</span>
                                    ) : (
                                        <span className='badge bg-success capsule-right overlay-badge'>{'CS'}</span>
                                    )}
                                </OverlayTrigger>
                            </div>
                        </>
                    )
                }
                return _(
                    <>
                        <div className='text-center'>
                            <OverlayTrigger
                                overlay={
                                    <Tooltip>{`${t('Release Clearing State')}: ${Capitalize(
                                        (state as ReleaseState).clearingState
                                    )}`}</Tooltip>
                                }
                            >
                                {(state as ReleaseState).clearingState === 'NEW_CLEARING' ? (
                                    <span className='badge bg-danger overlay-badge'>{'CS'}</span>
                                ) : (state as ReleaseState).clearingState === 'REPORT_AVAILABLE' ? (
                                    <span className='badge bg-primary overlay-badge'>{'CS'}</span>
                                ) : (
                                    <span className='badge bg-success overlay-badge'>{'CS'}</span>
                                )}
                            </OverlayTrigger>
                        </div>
                    </>
                )
            },
            sort: true,
        },
        {
            id: 'licenseClearing.releaseMainlineState',
            name: t('Release Mainline State'),
            width: '8%',
            formatter: (type: string) => _(<>{Capitalize(type)}</>),
            sort: true,
        },
        {
            id: 'licenseClearing.projectMainlineState',
            name: t('Project Mainline State'),
            width: '8%',
            formatter: (type: string) => _(<>{Capitalize(type)}</>),
            sort: true,
        },
        {
            id: 'licenseClearing.comment',
            name: t('Comment'),
            width: '8%',
            sort: true,
        },
        {
            id: 'licenseClearing.actions',
            name: t('Actions'),
            sort: true,
            width: '6%',
            formatter: ({ id, type }: { id: string; type: ElementType }) =>
                _(
                    <>
                        <OverlayTrigger overlay={<Tooltip>{t('Edit')}</Tooltip>}>
                            <Link
                                href={
                                    type === ElementType.LINKED_PROJECT
                                        ? `/projects/edit/${id}`
                                        : `/components/releases/edit/${id}`
                                }
                                className='overlay-trigger'
                            >
                                <FaPencilAlt className='btn-icon' />
                            </Link>
                        </OverlayTrigger>
                    </>
                ),
        },
    ]

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal

        void (async () => {
            try {
                const session = await getSession()
                if(CommonUtils.isNullOrUndefined(session))
                    return signOut()
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

                const finalData: ListViewData[] = []
                const path: string[] = []
                extractLinkedReleases(projectName, projectVersion, licenseClearingData, finalData, path)
                extractLinkedProjectsAndTheirLinkedReleases(
                    licenseClearingData,
                    linkedProjectsData['_embedded']['sw360:projects'],
                    finalData,
                    path
                )

                const d = finalData.map((e) => [
                    { ...e.elem, type: e.elementType },
                    e.type,
                    e.projectPath,
                    e.releasePath,
                    e.relation,
                    e.mainLicenses,
                    { state: e.state, elementType: e.elementType },
                    e.releaseMainlineState,
                    e.projectMainlineState,
                    e.comment,
                    { id: e.elem.id, type: e.elementType },
                ])
                setData(d)
            } catch (e) {
                console.error(e)
            }
        })()

        return () => controller.abort()
    }, [projectId, projectName, projectVersion])

    return (
        <>
            {data ? (
                <Table columns={columns} data={data} selector={true} sort={false} />
            ) : (
                <div className='col-12 text-center'>
                    <Spinner className='spinner' />
                </div>
            )}
        </>
    )
}
