// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

// import { Table } from '@/components/sw360'
import LinkedReleasesModal from '@/components/sw360/LinkedReleasesModal/LinkedReleasesModal'
import { useState } from 'react'

export default function LinkedReleases() {
    const [showLinkedReleasesModal, setShowLinkedReleasesModal] = useState(false)
    // const [linkedRelease, setLinkedRelease] = useState([])

    // const columns = [
    //     {
    //         id: 'name',
    //         name: 'Release Name',
    //         sort: true,
    //     },
    //     {
    //         id: 'version',
    //         name: 'Release Version',
    //         sort: true,
    //     },
    //     {
    //         id: 'relation',
    //         name: 'Release Relation',
    //         sort: true,
    //     },
    //     {
    //         id: 'mainlineState',
    //         name: 'Project Mainline State',
    //         sort: true,
    //     },
    //     {
    //         id: 'comments',
    //         name: 'Comments',
    //         sort: true,
    //     }
    // ]

    return (
        <>
            <LinkedReleasesModal show={showLinkedReleasesModal} setShow={setShowLinkedReleasesModal} />
            <div className='row mb-4'>
                <div className='row header-1'>
                    <h6 className='fw-medium' style={{ color: '#5D8EA9', paddingLeft: '0px' }}>
                        LINKED RELEASES
                        <hr className='my-2 mb-2' style={{ color: '#5D8EA9', paddingLeft: '0px' }} />
                    </h6>
                </div>
                <div style={{ paddingLeft: '0px' }}>{/* <Table data={linkedRelease} columns={columns}/> */}</div>
                <div className='row' style={{ paddingLeft: '0px' }}>
                    <div className='col-lg-4'>
                        <button
                            type='button'
                            className='btn btn-secondary'
                            onClick={() => setShowLinkedReleasesModal(true)}
                        >
                            Link Releases
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
