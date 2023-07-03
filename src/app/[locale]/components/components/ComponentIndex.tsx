// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import ComponentsTable from './ComponentsTable'
import { Dropdown } from 'react-bootstrap'
import { useTranslations } from 'next-intl'
import { COMMON_NAMESPACE } from '@/object-types/Constants'
import { Session } from '@/object-types/Session'

import { PageButtonHeader, AdvancedSearch } from '@/components/sw360'
import { useState } from 'react'

interface Props {
    session?: Session
    length?: number
}

const ComponentIndex = ({ session }: Props) => {
    const t = useTranslations(COMMON_NAMESPACE)
    const [numberOfComponent, setNumberOfComponent] = useState(0)

    const headerbuttons = {
        'Add Component': { link: '/components/add', type: 'primary' },
        'Import SBOM': { link: '/projects', type: 'secondary' },
    }

    const advancedSearch = [
        {
            fieldName: 'Component Name',
            value: '',
            paramName: 'name'
        },
        {
            fieldName: 'Categories',
            value: '',
            paramName: 'categories'
        },
        {
            fieldName: 'Component Type',
            value: [
                {
                    key: 'OSS',
                    text: 'OSS'
                },
                {
                    key: 'COTS',
                    text: 'COTS'
                },
                {
                    key: 'INTERNAL',
                    text: 'Internal'
                },
                {
                    key: 'INNER_SOURCE',
                    text: 'Inner Source'
                },
                {
                    key: 'SERVICE',
                    text: 'Service'
                },
                {
                    key: 'FREESOFTWARE',
                    text: 'Freeware'
                },
                {
                    key: 'CODE_SNIPPET',
                    text: 'Code Snippet'
                }
            ],
            paramName: 'type'
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
            fieldName: 'Languages',
            value: '',
            paramName: 'languages'
        },
        {
            fieldName: 'Software Platforms',
            value: '',
            paramName: 'softwarePlatform'
        },
        {
            fieldName: 'Vendors',
            value: '',
            paramName: 'vendors'
        },
        {
            fieldName: 'Operating Systems',
            value: '',
            paramName: 'operatingSystem'
        },
        {
            fieldName: 'Main Licenses',
            value: '',
            paramName: 'mainLicenses'
        },
        {
            fieldName: 'Created By (Email)',
            value: '',
            paramName: 'createdBy'
        },
        {
            fieldName: 'Created On',
            value: [
                {
                    key: 'EQUAL',
                    text: '='
                },
                {
                    key: 'LESS_THAN_OR_EQUAL_TO',
                    text: '<='
                },
                {
                    key: 'GREATER_THAN_OR_EQUAL_TO',
                    text: '>='
                },
                {
                    key: 'BETWEEN',
                    text: 'Between'
                }
            ],
            paramName: 'createdOn'
        }
    ]

    return (
        <div className='container' style={{ maxWidth: '98vw', marginTop: '10px' }}>
            <div className='row'>
                <div className='col-2 sidebar'>
                    <AdvancedSearch title='Advanced Search' fields={advancedSearch} />
                </div>
                <div className='col'>
                    <PageButtonHeader title={`${t('Components')} (${numberOfComponent})`} buttons={headerbuttons}>
                        <div style={{ marginLeft: '5px' }} className='btn-group' role='group'>
                            <Dropdown>
                                <Dropdown.Toggle variant='secondary' id='project-export'>
                                    {t('Export Spreadsheet')}
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item>{t('Components only')}</Dropdown.Item>
                                    <Dropdown.Item>{t('Components with releases')}</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                    </PageButtonHeader>
                    <div className='row' style={{ marginBottom: '20px' }}>
                        <ComponentsTable session={session} setNumberOfComponent={setNumberOfComponent} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ComponentIndex
