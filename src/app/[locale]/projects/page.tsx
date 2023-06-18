// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.
// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'

import { AdvancedSearch, Table, _ } from '@/components/sw360'
import { sw360FetchData } from '@/utils/sw360fetchdata'

import projectPageStyles from './projects.module.css'

interface ProjectType {
    name: string
    description: string
    projectResponsible: string
    state: string
}

async function Project() {
    const [data, setData] = useState([])

    const pagination = { limit: 10 }
    const columns = ['Project Name', 'Description', 'Project Responsible', 'License Clearing', 'State', 'Actions']
    const advancedSearch = {
        'Project Name': '',
        'Project Version': '',
        'Project Type': ['Customer Project', 'Internal Project', 'Product', 'Service', 'Inner Source'],
        'Project Responsible (Email)': '',
        Group: ['None'],
        State: ['Active', 'PhaseOut', 'Unknown'],
        'Clearing State': ['Open', 'In Progress', 'Closed'],
        Tag: '',
        'Additional Data': '',
    }

    useEffect(() => {
        sw360FetchData('/projects?allDetails=true', 'projects').then((fetchedData) => {
            console.log(fetchedData)
            setData(fetchedData as ProjectType[])
        })
    }, [])

    // if (fetchData !== null) {
    //     setData(
    //         fetchData.map((item) => ({
    //             name: item.name,
    //             description: item.description,
    //             projectResponsible: item.projectResponsible,
    //             state: item.state,
    //         }))
    //     )
    // }

    return (
        <div className='container' style={{ maxWidth: '98vw', marginTop: '10px' }}>
            <div className='row'>
                <div className='col-2 sidebar'>
                    <AdvancedSearch title='Advanced Search' fields={advancedSearch} />
                </div>

                <div className='col'>
                    <div className='row'>
                        <div className='col-lg-3'>
                            <div className='btn-group d-flex mb-2' role='group' aria-label='Project Utilities'>
                                <Link
                                    type='button'
                                    className={`fw-bold btn btn-primary ${projectPageStyles['button']}`}
                                    href='http://localhost:3000/projects/add/summary'
                                >
                                    Add Project
                                </Link>
                                <button
                                    type='button'
                                    className={`fw-bold btn btn-light ${projectPageStyles['button-plain']}`}
                                >
                                    Import SBOM
                                </button>
                            </div>
                        </div>
                        <div className='col-lg-3'>
                            <div className='dropdown'>
                                <button
                                    className={`fw-bold btn btn-light ${projectPageStyles['button-plain']} dropdown-toggle`}
                                    type='button'
                                    data-bs-toggle='dropdown'
                                    aria-expanded='false'
                                >
                                    Export Spreadsheet
                                </button>
                                <ul className='dropdown-menu'>
                                    <li>
                                        <button type='button' className='dropdown-item'>
                                            Projects only
                                        </button>
                                    </li>
                                    <li>
                                        <button type='button' className='dropdown-item'>
                                            Projects with linked releases
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className='row my-2'>
                        <div className='col-xl-2 d-flex'>
                            <p className='my-2'>show</p>
                            <select className='form-select form-select-sm mx-2' aria-label='page size select'>
                                <option defaultValue={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                            <p className='my-2'>entries</p>
                        </div>
                        <div className='col-xl-1 d-flex'>
                            <button
                                type='button'
                                className={`fw-bold btn btn-light ${projectPageStyles['button-plain']}`}
                            >
                                Print <i className='bi bi-printer'></i>
                            </button>
                        </div>
                    </div>
                    <div className='row'>
                        <Table
                            columns={columns}
                            data={data.map((data) => [data.name, data.description, data.projectResponsible])}
                            pagination={pagination}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Project
