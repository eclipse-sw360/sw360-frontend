// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { HttpStatus, ProjectData, ProjectVulnerabilityTabType, Embedded, Project } from '@/object-types'
import { ApiUtils } from '@/utils'
import { signOut, useSession } from 'next-auth/react'
import { notFound } from 'next/navigation'
import { useEffect, useState, type JSX } from 'react';
import { Tab, Tabs } from 'react-bootstrap'
import VulnerabilityTab from './VulnerabilityTab'

type LinkedProjects = Embedded<Project, 'sw360:projects'>

const extractLinkedProjects = (projectPayload: Project[], projectData: ProjectData[]) => {
    for (const x of projectPayload) {
        projectData.push({
            id: x['_links']['self']['href'].substring(x['_links']['self']['href'].lastIndexOf('/') + 1),
            name: x.name,
            version: x.version ?? '',
            enableSvm: x.enableSvm ?? false,
            enableVulnerabilitiesDisplay: x.enableVulnerabilitiesDisplay ?? false,
        })
        if(x._embedded?.['sw360:linkedProjects']) {
            extractLinkedProjects(x._embedded['sw360:linkedProjects'], projectData)
        }
    }
}

export default function ProjectVulnerabilities({ projectData }: { projectData: ProjectData }): JSX.Element {
    const { data: session, status } = useSession()
    const [data, setData] = useState<ProjectData[]>([])

    useEffect(() => {
        if (status !== 'authenticated') return

        const controller = new AbortController()
        const signal = controller.signal

        void (async () => {
            try {
                const response = await ApiUtils.GET(
                    `projects/${projectData.id}/linkedProjects?transitive=true`,
                    session.user.access_token,
                    signal
                )
                if (response.status === HttpStatus.UNAUTHORIZED) {
                    return signOut()
                } else if (response.status !== HttpStatus.OK) {
                    return notFound()
                }

                const data = await response.json() as LinkedProjects

                const d: ProjectData[] = []
                d.push(projectData)

                extractLinkedProjects(data._embedded['sw360:projects'], d)

                setData(d)
            } catch (e) {
                console.error(e)
            }
        })()

        return () => controller.abort(signal)
    }, [status])

    return (
        <>
            <Tabs defaultActiveKey={projectData.id} className='mb-3' mountOnEnter={true} unmountOnExit={true}>
                {data.length !== 0 && <Tab eventKey='summary' title='Summary'>
                    <VulnerabilityTab projectData={projectData} tabType={ProjectVulnerabilityTabType.SUMMARY} />
                </Tab>}
                {data.map((e: ProjectData) => (
                    <Tab eventKey={e.id} key={e.id} title={`${e.name} (${e.version})`}>
                        <VulnerabilityTab projectData={e} tabType={ProjectVulnerabilityTabType.PROJECT} />
                    </Tab>
                ))}
            </Tabs>
        </>
    )
}
