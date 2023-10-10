// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { Table } from '@/components/sw360'
import { Session } from '@/object-types'
import LinkProjectsModal from '@/components/sw360/LinkedProjectsModal/LinkProjectsModal'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ProjectPayload from '@/object-types/CreateProjectPayload'

interface Props {
    session: Session
    projectPayload: ProjectPayload
    setProjectPayload: React.Dispatch<React.SetStateAction<ProjectPayload>>
}

export default function LinkedProjects({ session, projectPayload, setProjectPayload }: Props) {
    const t = useTranslations('default')
    const [showLinkedProjectsModal, setShowLinkedProjectsModal] = useState(false)
    const [linkedProjectData, setLinkedProjectData] = useState<Map<string, any>>(new Map())

    const columns = [
        {
            id: 'tableData.name',
            name: t('Name'),
            sort: true,
        },
        {
            id: 'tableData.version',
            name: t('Version'),
            sort: true,
        },
        {
            id: 'tableData.projectRelationship',
            name: t('Project Relationship'),
            sort: true,
        },
        {
            id: 'tableData.enableSvm',
            name: t('Enable SVM'),
            sort: true,
        },
    ]

    const extractDataFromMap = (map: Map<string, any>) => {
        const extractedData: any = []
        map.forEach((value, key) => {
            const interimData: any = []
            interimData.push(value.name, value.version, value.projectRelationship, value.enableSvm, key)
            extractedData.push(interimData)
        })
        return extractedData
    }

    return (
        <>
            <LinkProjectsModal
                session={session}
                setLinkedProjectData={setLinkedProjectData}
                projectPayload={projectPayload}
                setProjectPayload={setProjectPayload}
                show={showLinkedProjectsModal}
                setShow={setShowLinkedProjectsModal}
            />
            <div className='row mb-4'>
                <div className='row header-1'>
                    <h6 className='fw-medium' style={{ color: '#5D8EA9', paddingLeft: '0px' }}>
                        LINKED PROJECTS
                        <hr className='my-2 mb-2' style={{ color: '#5D8EA9' }} />
                    </h6>
                </div>
                <div style={{ paddingLeft: '0px' }}>
                    <Table columns={columns} data={extractDataFromMap(linkedProjectData)} sort={false} />
                </div>
                <div className='row' style={{ paddingLeft: '0px' }}>
                    <div className='col-lg-4'>
                        <button
                            type='button'
                            className='btn btn-secondary'
                            onClick={() => setShowLinkedProjectsModal(true)}
                        >
                            Link Projects
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
