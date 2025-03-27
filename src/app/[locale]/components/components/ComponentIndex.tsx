// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { ReactNode, useState } from 'react'
import { Dropdown } from 'react-bootstrap'

import { AdvancedSearch, PageButtonHeader } from '@/components/sw360'
import DownloadService from '@/services/download.service'
import ComponentsTable from './ComponentsTable'
import ImportSBOMModal from './ImportSBOMModal'

const ComponentIndex = () : ReactNode => {
    const t = useTranslations('default')
    const [numberOfComponent, setNumberOfComponent] = useState(0)
    const [importModalOpen, setImportModalOpen] = useState(false)
    const { data: session, status } = useSession()

    const handleClickImportSBOM = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault()
        setImportModalOpen(true)
    }

    const headerbuttons = {
        'Add Component': { link: '/components/add', type: 'primary', name: t('Add Component') },
        'Import SBOM': { link: '#', type: 'secondary', onClick: handleClickImportSBOM, name: t('Import SBOM') },
    }

    const advancedSearch = [
        {
            fieldName: t('Component Name'),
            value: '',
            paramName: 'name',
        },
        {
            fieldName: t('Categories'),
            value: '',
            paramName: 'categories',
        },
        {
            fieldName: t('Component Type'),
            value: [
                {
                    key: 'OSS',
                    text: t('OSS'),
                },
                {
                    key: 'COTS',
                    text: t('COTS'),
                },
                {
                    key: 'INTERNAL',
                    text: t('Internal'),
                },
                {
                    key: 'INNER_SOURCE',
                    text: t('Inner Source'),
                },
                {
                    key: 'SERVICE',
                    text: t('Service'),
                },
                {
                    key: 'FREESOFTWARE',
                    text: t('Freeware'),
                },
                {
                    key: 'CODE_SNIPPET',
                    text: t('Code Snippet'),
                },
                {
                    key: 'COTS_TRUSTED_SUPPLIER',
                    text: t('COTS Trusted Supplier'),
                },
            ],
            paramName: 'type',
        },
        {
            fieldName: 'Group',
            value: [
                {
                    key: 'None',
                    text: t('None'),
                },
            ],
            paramName: 'group',
        },
        {
            fieldName: t('Languages'),
            value: '',
            paramName: 'languages',
        },
        {
            fieldName: t('Software Platforms'),
            value: '',
            paramName: 'softwarePlatform',
        },
        {
            fieldName: t('Vendors'),
            value: '',
            paramName: 'vendors',
        },
        {
            fieldName: t('Operating Systems'),
            value: '',
            paramName: 'operatingSystem',
        },
        {
            fieldName: t('Main Licenses'),
            value: '',
            paramName: 'mainLicenses',
        },
        {
            fieldName: t('Created By (Email)'),
            value: '',
            paramName: 'createdBy',
        },
        {
            fieldName: t('Created On'),
            value: [
                {
                    key: 'EQUAL',
                    text: '=',
                },
                {
                    key: 'LESS_THAN_OR_EQUAL_TO',
                    text: '<=',
                },
                {
                    key: 'GREATER_THAN_OR_EQUAL_TO',
                    text: '>=',
                },
                {
                    key: 'BETWEEN',
                    text: t('Between'),
                },
            ],
            paramName: 'createdOn',
        },
    ]

    const handleExportComponent = (withLinkedReleases: string) => {
        const currentDate = new Date().toISOString().split('T')[0]
        DownloadService.download(
            `reports?withlinkedreleases=${withLinkedReleases}&mimetype=xlsx&mailrequest=false&module=components`,
            session,
            `components-${currentDate}.xlsx`
        )
    }

    if (status === 'unauthenticated') {
        return signOut()
    } else {
        return (
            <div className='container page-content'>
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
                                        <Dropdown.Item onClick={() => handleExportComponent('false')}>
                                            {t('Components only')}
                                        </Dropdown.Item>
                                        <Dropdown.Item onClick={() => handleExportComponent('true')}>
                                            {t('Components with releases')}
                                        </Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </div>
                        </PageButtonHeader>
                        <div className='row' style={{ marginBottom: '20px' }}>
                            <ComponentsTable setNumberOfComponent={setNumberOfComponent} />
                        </div>
                        <ImportSBOMModal show={importModalOpen} setShow={setImportModalOpen} />
                    </div>
                </div>
            </div>
        )
    }
}

export default ComponentIndex
