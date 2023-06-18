// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.
// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import React, { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { COMMON_NAMESPACE } from '@/object-types/Constants'
import { Dropdown } from 'react-bootstrap'

import { AdvancedSearch, PageButtonHeader, Table, _ } from '@/components/sw360'
import { sw360FetchData } from '@/utils/sw360fetchdata'

interface ProjectType {
    name: string
    description: string
    projectResponsible: string
    state: string
}

function Project() {
    const [data, setData] = useState([])
    const t = useTranslations(COMMON_NAMESPACE)

    const pagination = { limit: 10 }
    const columns = [
        t('Project Name'),
        t('Description'),
        t('Project Responsible'),
        t('License Clearing'),
        t('State'),
        t('Actions'),
    ]
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
    const headerbuttons = {
        'Add Projects': { link: '/projects/add', type: 'primary' },
        'Import SBOM': { link: '/projects', type: 'secondary' },
    }

    useEffect(() => {
        sw360FetchData('/projects?allDetails=true', 'projects').then((fetchedData) => {
            setData(fetchedData as ProjectType[])
        })
    }, [])

    return (
        <div className='container' style={{ maxWidth: '98vw', marginTop: '10px' }}>
            <div className='row'>
                <div className='col-2 sidebar'>
                    <AdvancedSearch title='Advanced Search' fields={advancedSearch} />
                </div>

                <div className='col'>
                    <div className='row'>
                        <PageButtonHeader title={`${t('Projects')} (${data.length})`} buttons={headerbuttons}>
                            <div style={{ marginLeft: '5px' }} className='btn-group' role='group'>
                                <Dropdown>
                                    <Dropdown.Toggle variant='secondary' id='project-export'>
                                        {t('Export Spreadsheet')}
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item>{t('Projects only')}</Dropdown.Item>
                                        <Dropdown.Item>{t('Projects with linked releases')}</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </div>
                        </PageButtonHeader>
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
