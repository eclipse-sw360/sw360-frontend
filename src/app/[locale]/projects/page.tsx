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
import Link from 'next/link'

import { AdvancedSearch, PageButtonHeader, Table, _, Actions } from '@/components/sw360'
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
        {
            id: 'name',
            name: t('Project Name'),
            formatter: (name: string) =>
                _(
                    <Link href={"#"} className='link'>
                        {name}
                    </Link>
                ),
            width: "15%"
        },
        {
            id: 'description',
            name: t('Description'),
            formatter: (description: string) =>
                _(
                    <p>{description}</p>
                ),
            width: "20%",
        },
        {
            id: 'projectResponsible',
            name: t('Project Responsible'),
            formatter: (email: string) =>
                _(
                    <Link href={"#"} className='link'>
                        {email}
                    </Link>
                ),
            width: "20%",
        },
        t('State'),
        {
            id: 'licenseClearing',
            name: t('License Clearing'),
            width: "10%"
        },
        {
            id: 'actions',
            name: t('Actions'),
            formatter: () =>
                _(
                    <Actions/>
                ),
        },
    ]

    const advancedSearch = [
        {
            fieldName: 'Project Name',
            value: '',
            paramName: 'name'
        },
        {
            fieldName: 'Project Version',
            value: '',
            paramName: 'version'
        },
        {
            fieldName: 'Project Type',
            value: [
                {
                    key: 'Customer Project',
                    text: 'Customer Project'
                },
                {
                    key: 'Internal Project',
                    text: 'Internal Project'
                },
                {
                    key: 'Product',
                    text: 'Product'
                },
                {
                    key: 'Service',
                    text: 'Service'
                },
                {
                    key: 'Inner Source',
                    text: 'Inner Source'
                }
            ],
            paramName: 'type'
        },
        {
            fieldName: 'Project Responsible (Email)',
            value: '',
            paramName: 'projectResponsible'
        },
        {
            fieldName: 'Group',
            value: [
                {
                    key: 'None',
                    text: 'None'
                }
            ],
            paramName: 'group'
        },
        {
            fieldName: 'State',
            value:  [
                {
                    key: 'Active',
                    text: 'Active'
                },
                {
                    key: 'PhaseOut',
                    text: 'PhaseOut'
                },
                {
                    key: 'Unknown',
                    text: 'Unknown'
                }
            ],
            paramName: 'state'
        },
        {
            fieldName: 'Clearing State',
            value:  [
                {
                    key: 'Open',
                    text: 'Open'
                },
                {
                    key: 'In Progress',
                    text: 'In Progress'
                },
                {
                    key: 'Closed',
                    text: 'Closed'
                }
            ],
            paramName: 'clearingState'
        },
        {
            fieldName: 'Tag',
            value:  '',
            paramName: 'tag'
        },
        {
            fieldName: 'Additional Data',
            value:  '',
            paramName: 'additionalData'
        }
    ]

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
        <div className='mx-5' style={{ maxWidth: '98vw', marginTop: '10px' }}>
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
                            selector={true}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Project
