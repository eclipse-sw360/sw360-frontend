// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { Table, _ } from '@/components/sw360'
import LinkProjectsModal from '@/components/sw360/LinkedProjectsModal/LinkProjectsModal'
import { ProjectPayload } from '@/object-types'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

interface Props {
    projectPayload: ProjectPayload
    setProjectPayload: React.Dispatch<React.SetStateAction<ProjectPayload>>
}

export default function LinkedProjects({ projectPayload, setProjectPayload }: Props) {
    const t = useTranslations('default')
    const [showLinkedProjectsModal, setShowLinkedProjectsModal] = useState(false)
    const [linkedProjectData, setLinkedProjectData] = useState<Map<string, any>>(new Map())
    const [tableData, setTableData] = useState<Array<any>>([])

    const updateProjectData = (
        projectId: string,
        updatedProjectRelationship: string,
        linkedProjectData: Map<string, any>
    ) => {
        try {
            if (linkedProjectData.has(projectId)) {
                linkedProjectData.forEach((value, key) => {
                    if (key === projectId) {
                        value.projectRelationship = updatedProjectRelationship
                        setLinkedProjectData(linkedProjectData)
                        projectPayload.linkedProjects[projectId].projectRelationship = updatedProjectRelationship
                        const data: any = extractDataFromMap(linkedProjectData)
                        setTableData(data)
                    }
                })
            }
        } catch (e) {
            console.error(e)
        }
    }

    const columns = [
        {
            id: 'linkedProjectData.name',
            name: t('Name'),
            sort: true,
        },
        {
            id: 'linkedProjectData.version',
            name: t('Version'),
            sort: true,
        },
        {
            id: 'linkedProjectData.projectRelationship',
            name: t('Project Relationship'),
            sort: true,
            formatter: ({ projectRelationship, key }: { projectRelationship: string; key: string }) =>
                _(
                    <div className='form-dropdown'>
                        <select
                            className='form-select'
                            id={projectRelationship}
                            aria-describedby='projectRelationship'
                            name={projectRelationship}
                            value={projectRelationship}
                            onChange={(event) => {
                                const updatedProjectRelationship = event.target.value
                                updateProjectData(key, updatedProjectRelationship, linkedProjectData)
                            }}
                            required
                        >
                            <option value='UNKNOWN'>{t('Unknown')}</option>
                            <option value='REFERRED'>{t('Related')}</option>
                            <option value='CONTAINED'>{t('Is a subproject')}</option>
                            <option value='DUPLICATE'>{t('Duplicate')}</option>
                        </select>
                    </div>
                ),
        },
        {
            id: 'linkedProjectData.enableSvm',
            name: t('Enable SVM'),
            sort: true,
        },
    ]

    useEffect(() => {
        const data = extractDataFromMap(linkedProjectData)
        setTableData(data)
    }, [linkedProjectData])

    const extractDataFromMap = (linkedProjectData: Map<string, any>) => {
        const extractedData: any = []
        linkedProjectData.forEach((value, key) => {
            const updatedProjectRelationship = value.projectRelationship
            extractedData.push([value.name, value.version, { updatedProjectRelationship, key }, value.enableSvm])
        })
        return extractedData
    }

    return (
        <>
            <LinkProjectsModal
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
                    <Table columns={columns} data={tableData} sort={false} />
                </div>
                <div className='row' style={{ paddingLeft: '0px' }}>
                    <div className='col-lg-4'>
                        <button
                            type='button'
                            className='btn btn-secondary'
                            onClick={() => setShowLinkedProjectsModal(true)}
                        >
                            Add Projects
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
