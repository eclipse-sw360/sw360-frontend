// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { Table } from '@/components/sw360'
import LinkedProjectsModal from '@/components/sw360/LinkedProjectsModal/LinkedProjectsModal'
import { useState } from 'react'

export default function LinkedProjects() {
    const [showLinkedProjectsModal, setShowLinkedProjectsModal] = useState(false)
    const [linkedProject, setLinkedProject] = useState([])

    const columns = [
        {
            id: 'name',
            name: 'Project Name',
            sort: true,
        },
        {
            id: 'version',
            name: 'Project Version',
            sort: true,
        },
        {
            id: 'relation',
            name: 'Project Relation',
            sort: true,
        },
        {
            id: 'svm',
            name: 'Enable SVM',
            sort: true,
        }
    ]

    return (
        <>
            <LinkedProjectsModal show={showLinkedProjectsModal} setShow={setShowLinkedProjectsModal} />
            <div className='row mb-4'>
                <div className='row header-1'>
                    <h6 className='fw-medium' style={{ color: '#5D8EA9', paddingLeft: '0px' }}>
                        LINKED PROJECTS
                        <hr className='my-2 mb-2' style={{ color: '#5D8EA9' }} />
                    </h6>
                </div>
                <div style={{paddingLeft: '0px' }}>
                    <Table data={linkedProject} columns={columns}/>
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
