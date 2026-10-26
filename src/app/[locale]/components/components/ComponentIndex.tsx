// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import { useTranslations } from 'next-intl'
import { ReactNode, useEffect, useState } from 'react'

import ExportListModal from '@/components/ExportListModal/ExportListModal'
import { AdvancedSearch, PageButtonHeader } from '@/components/sw360'
import { useConfigKeyValue, useConfigValue } from '@/contexts'
import { COMPONENT_NOT_FOUND_WARNING_KEY, useStoredWarning } from '@/hooks'
import { ConfigKeys, UIConfigKeys, UserGroupPriority, UserGroupType } from '@/object-types'
import ApiUtils from '@/utils/api/authenticatedApi.util'
import { getAuthenticatedUserIdentity } from '@/utils/api/authenticatedUser.util'
import ComponentsTable from './ComponentsTable'
import ImportSBOMModal from './ImportSBOMModal'

const ComponentIndex = (): ReactNode => {
    const t = useTranslations('default')
    const [numberOfComponent, setNumberOfComponent] = useState(0)
    const [importModalOpen, setImportModalOpen] = useState(false)
    const [vendorsSuggestions, setVendorsSuggestions] = useState<string[]>([])
    const languagesSuggestions = useConfigValue(UIConfigKeys.UI_PROGRAMMING_LANGUAGES) as string[] | null
    const platformsSuggestions = useConfigValue(UIConfigKeys.UI_SOFTWARE_PLATFORMS) as string[] | null
    const osSuggestions = useConfigValue(UIConfigKeys.UI_OPERATING_SYSTEMS) as string[] | null
    const [showExportListModal, setShowExportListModal] = useState<boolean>(false)
    const [userIdentity, setUserIdentity] = useState<Awaited<ReturnType<typeof getAuthenticatedUserIdentity>> | null>(
        null,
    )
    const sbomImportExportAccessUserRole = useConfigKeyValue(ConfigKeys.SBOM_IMPORT_EXPORT_ACCESS_USER_ROLE)
    const normalizedSbomImportExportAccessUserRole: UserGroupType =
        sbomImportExportAccessUserRole && sbomImportExportAccessUserRole in UserGroupType
            ? (sbomImportExportAccessUserRole as UserGroupType)
            : UserGroupType.VIEWER
    useEffect(() => {
        void (async () => {
            try {
                setUserIdentity(await getAuthenticatedUserIdentity())
            } catch {
                setUserIdentity(null)
            }
        })()
    }, [])

    useStoredWarning(COMPONENT_NOT_FOUND_WARNING_KEY, 'Component does not exist')

    useEffect(() => {
        const controller = new AbortController()

        const fetchVendors = async () => {
            const response = await ApiUtils.GET('vendors')
            if (!controller.signal.aborted && response.ok) {
                const data = await response.json()
                const names = data._embedded?.['sw360:vendors']?.map((v: { fullName: string }) => v.fullName) || []
                if (!controller.signal.aborted) {
                    setVendorsSuggestions(names)
                }
            }
        }

        fetchVendors()

        return () => {
            controller.abort()
        }
    }, [])

    const handleClickImportSBOM = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault()
        setImportModalOpen(true)
    }

    const headerbuttons = {
        'Add Component': {
            link: '/components/add',
            type: 'primary',
            name: t('Add Component'),
            disable: userIdentity?.userGroup === UserGroupType.SECURITY_USER,
        },
        'Import SBOM': {
            link: '#',
            type: 'secondary',
            onClick: handleClickImportSBOM,
            name: t('Import SBOM'),
            hidden:
                !userIdentity?.userGroup ||
                UserGroupPriority[userIdentity.userGroup] > UserGroupPriority[normalizedSbomImportExportAccessUserRole],
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

    return (
        <div className='container page-content'>
            {showExportListModal && (
                <ExportListModal
                    module='components'
                    onHide={() => setShowExportListModal(false)}
                />
            )}
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
                        <button
                            type='button'
                            className='btn btn-secondary ms-1'
                            onClick={() => setShowExportListModal(true)}
                        >
                            {t('Export List')}
                        </button>
                    </PageButtonHeader>
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
