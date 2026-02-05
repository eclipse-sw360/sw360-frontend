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
import { ReactNode, useEffect, useState } from 'react'
import { Alert, Dropdown } from 'react-bootstrap'

import { AdvancedSearch, PageButtonHeader } from '@/components/sw360'
import { useConfigValue } from '@/contexts'
import { ConfigKeys, UIConfigKeys, UserGroupType } from '@/object-types'
import DownloadService from '@/services/download.service'
import { ApiUtils } from '@/utils'
import ComponentsTable from './ComponentsTable'
import ImportSBOMModal from './ImportSBOMModal'

const ComponentIndex = (): ReactNode => {
    const t = useTranslations('default')
    const [numberOfComponent, setNumberOfComponent] = useState(0)
    const [importModalOpen, setImportModalOpen] = useState(false)
    const [vendorsSuggestions, setVendorsSuggestions] = useState<string[]>([])
    const { data: session, status } = useSession()
    const languagesSuggestions = useConfigValue(UIConfigKeys.UI_PROGRAMMING_LANGUAGES) as string[] | null
    const platformsSuggestions = useConfigValue(UIConfigKeys.UI_SOFTWARE_PLATFORMS) as string[] | null
    const osSuggestions = useConfigValue(UIConfigKeys.UI_OPERATING_SYSTEMS) as string[] | null
    const [showExportMessage, setShowExportMessage] = useState(false)
    const [showExportError, setShowExportError] = useState(false)
    const [exportViaMail, setExportViaMail] = useState<boolean>(false)

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [
        status,
    ])

    useEffect(() => {
        const controller = new AbortController()

        const fetchVendors = async () => {
            if (!session) return signOut()
            const response = await ApiUtils.GET('vendors', session?.user?.access_token)
            if (!controller.signal.aborted && response.ok) {
                const data = await response.json()
                const names = data._embedded?.['sw360:vendors']?.map((v: { fullName: string }) => v.fullName) || []
                if (!controller.signal.aborted) {
                    setVendorsSuggestions(names)
                }
            }
        }

        if (session) {
            fetchVendors()
        }

        return () => {
            controller.abort()
        }
    }, [
        session,
    ])

    useEffect(() => {
        const fetchExportConfig = async () => {
            try {
                if (!session) return

                const response = await ApiUtils.GET('configurations', session?.user?.access_token)

                if (response.ok) {
                    const configs = await response.json()

                    const mailEnabled = configs[ConfigKeys.MAIL_REQUEST_FOR_COMPONENT_REPORT] === 'true'

                    setExportViaMail(mailEnabled)
                }
            } catch {
                setExportViaMail(false)
            }
        }

        fetchExportConfig()
    }, [
        session,
    ])

    const handleClickImportSBOM = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault()
        setImportModalOpen(true)
    }

    const headerbuttons = {
        'Add Component': {
            link: '/components/add',
            type: 'primary',
            name: t('Add Component'),
            disable: session?.user?.userGroup === UserGroupType.SECURITY_USER,
        },
        'Import SBOM': {
            link: '#',
            type: 'secondary',
            onClick: handleClickImportSBOM,
            name: t('Import SBOM'),
            hidden: session?.user?.userGroup === UserGroupType.SECURITY_USER,
        },
    }

    const advancedSearch = [
        {
            fieldName: t('Component Name'),
            value: '',
            paramName: 'name',
            enableAutocomplete: false,
        },
        {
            fieldName: t('Categories'),
            value: '',
            paramName: 'categories',
            enableAutocomplete: false,
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
            enableAutocomplete: false,
        },
        {
            fieldName: t('Languages'),
            value: '',
            paramName: 'languages',
            enableAutocomplete: true,
            autocompleteSuggestions: languagesSuggestions || [],
        },
        {
            fieldName: t('Software Platforms'),
            value: '',
            paramName: 'softwarePlatforms',
            enableAutocomplete: true,
            autocompleteSuggestions: platformsSuggestions || [],
        },
        {
            fieldName: t('Vendors'),
            value: '',
            paramName: 'vendors',
            enableAutocomplete: true,
            autocompleteSuggestions: vendorsSuggestions,
        },
        {
            fieldName: t('Operating Systems'),
            value: '',
            paramName: 'operatingSystems',
            enableAutocomplete: true,
            autocompleteSuggestions: osSuggestions || [],
        },
        {
            fieldName: t('Main Licenses'),
            value: '',
            paramName: 'mainLicenses',
            enableAutocomplete: false,
        },
        {
            fieldName: t('Created By (Email)'),
            value: '',
            paramName: 'createdBy',
            enableAutocomplete: false,
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
            enableAutocomplete: false,
        },
    ]

    const handleExportComponent = async (withLinkedReleases: string) => {
        if (!session) return signOut()
        const currentDate = new Date().toISOString().split('T')[0]
        const mailRequestParam = exportViaMail ? 'true' : 'false'
        const url = `reports?withlinkedreleases=${withLinkedReleases}&mimetype=xlsx&mailrequest=${mailRequestParam}&module=components`

        const handleSuccess = () => {
            setShowExportMessage(true)
            setShowExportError(false)
        }

        const handleError = () => {
            setShowExportError(true)
            setShowExportMessage(false)
        }

        try {
            if (exportViaMail) {
                const response = await ApiUtils.GET(url, session.user.access_token)

                response.status === 200 ? handleSuccess() : handleError()
            } else {
                const statusCode = await DownloadService.download(url, session, `components-${currentDate}.xlsx`)

                statusCode === 200 ? handleSuccess() : handleError()
            }
        } catch {
            handleError()
        }
    }

    return (
        <div className='container page-content'>
            <div className='row'>
                <div className='col-2 sidebar'>
                    <AdvancedSearch
                        title='Advanced Search'
                        fields={advancedSearch}
                    />
                </div>
                <div className='col'>
                    <PageButtonHeader
                        title={`${t('Components')} (${numberOfComponent})`}
                        buttons={headerbuttons}
                    >
                        <div
                            style={{
                                marginLeft: '5px',
                            }}
                            className='btn-group'
                            role='group'
                        >
                            <Dropdown>
                                <Dropdown.Toggle
                                    variant='secondary'
                                    id='project-export'
                                >
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
                    {showExportMessage && (
                        <Alert
                            variant='success'
                            onClose={() => setShowExportMessage(false)}
                            dismissible
                        >
                            {exportViaMail
                                ? t('Excel report generation has started')
                                : t('Spreadsheet download is successful')}
                        </Alert>
                    )}
                    {showExportError && (
                        <Alert
                            variant='danger'
                            onClose={() => setShowExportError(false)}
                            dismissible
                        >
                            {t('Export report generation has failed')}
                        </Alert>
                    )}
                    <div
                        className='row'
                        style={{
                            marginBottom: '20px',
                        }}
                    >
                        <ComponentsTable setNumberOfComponent={setNumberOfComponent} />
                    </div>
                    <ImportSBOMModal
                        show={importModalOpen}
                        setShow={setImportModalOpen}
                    />
                </div>
            </div>
        </div>
    )
}

export default ComponentIndex
