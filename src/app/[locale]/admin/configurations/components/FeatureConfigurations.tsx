// Copyright (C) TOSHIBA CORPORATION, 2025. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useState, useCallback, type JSX } from 'react'
import { getSession, signOut } from 'next-auth/react'
import { ApiUtils, CommonUtils } from '@/utils'
import { Configuration, HttpStatus, ConfigKeys } from '@/object-types'
import OnOffSwitch from './OnOffSwitch'
import { PageButtonHeader, PageSpinner } from 'next-sw360'
import MessageService from '@/services/message.service'
import AttachmentStorageConfigurations from './AttachmentStorageConfigurations'
import SelectUserGroup from './SelectUserGroup'
import PackageManagementConfigurations from './PackageManagementConfigurations'
import MailConfigurations from './MailConfigurations'

const FeatureConfigurations = () : JSX.Element => {
    const t = useTranslations('default')
    const [currentConfig, setCurrentConfig] = useState<Configuration | undefined>(undefined)

    const fetchConfig = useCallback(
        async () => {
            const session = await getSession()
            if (CommonUtils.isNullOrUndefined(session)) {
                MessageService.error(t('Session has expired'))
                signOut()
                return
            }
            const response = await ApiUtils.GET('configurations?changeable=true', session.user.access_token)
            if (response.status == HttpStatus.OK) {
                const data = await response.json() as Configuration
                setCurrentConfig(data)
            } else if (response.status == HttpStatus.UNAUTHORIZED) {
                await signOut()
            } else {
                setCurrentConfig({} as Configuration)
            }
        },
        []
    )

    useEffect(() => {
        fetchConfig()
    }, [])

    const updateConfig = async (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault()
        if (currentConfig === undefined)
            return
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) {
            MessageService.error(t('Session has expired'))
            signOut()
            return
        }
        const response = await ApiUtils.PATCH('configurations', currentConfig, session.user.access_token)
        if (response.status == HttpStatus.OK) {
            MessageService.success(t('Update configurations successfully'))
        } else if (response.status == HttpStatus.UNAUTHORIZED) {
            await signOut()
        } else {
            const message = await response.json()
            MessageService.error(message)
        }
    }

    const headerbuttons = {
        'Update Configuration': { link: '#', onClick: updateConfig, type: 'primary', name: t('Update Configurations') },
    }

    return (
        <div className='container page-content'>
            <PageButtonHeader title={`${t('Configurations')}`} buttons={headerbuttons} />
            {
            currentConfig
            ? <>
                <h6 className='fw-bold text-uppercase' style={{ color: '#5D8EA9' }}>
                    {t('Feature Configurations')}
                    <hr className='my-2 mb-2' />
                </h6>
                <table className='table label-value-table'>
                    <thead>
                        <tr>
                            <th>{t('Name')}</th>
                            <th>{t('Value')}</th>
                            <th>{t('Description')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr id='spdx-document'>
                            <td className='align-middle fw-bold'>
                                {t('SPDX Document Feature')}
                            </td>
                            <td>
                                <OnOffSwitch size={25}
                                    setCurrentConfig={setCurrentConfig}
                                    checked={currentConfig[ConfigKeys.SPDX_DOCUMENT_ENABLED] === 'true'}
                                    propKey={ConfigKeys.SPDX_DOCUMENT_ENABLED}
                                />
                            </td>
                            <td className='align-middle'>
                                {t('spdx_feature_description')}
                            </td>
                        </tr>
                        <tr id='component-visibility-restriction'>
                            <td className='align-middle fw-bold'>
                                {t('Component Visibility Restriction Feature')}
                            </td>
                            <td>
                                <OnOffSwitch size={25}
                                    setCurrentConfig={setCurrentConfig}
                                    checked={currentConfig[ConfigKeys.IS_COMPONENT_VISIBILITY_RESTRICTION_ENABLED] === 'true'}
                                    propKey={ConfigKeys.IS_COMPONENT_VISIBILITY_RESTRICTION_ENABLED}
                                />
                            </td>
                            <td className='align-middle'>
                                {t('component_visibility_retriction_description')}
                            </td>
                        </tr>
                        <tr id='use-license-info-from-files'>
                            <td className='align-middle fw-bold'>
                                {t('Use license info from files')}
                            </td>
                            <td>
                                <OnOffSwitch size={25}
                                    setCurrentConfig={setCurrentConfig}
                                    checked={currentConfig[ConfigKeys.USE_LICENSE_INFO_FROM_FILES] === 'true'}
                                    propKey={ConfigKeys.USE_LICENSE_INFO_FROM_FILES}
                                />
                            </td>
                            <td className='align-middle'>
                                {t('use_license_info_from_file_description')}
                            </td>
                        </tr>
                        <tr id='mainline-state-enabled-for-user'>
                            <td className='align-middle fw-bold'>
                                {t('Enable Editing Of Mainline State For User')}
                            </td>
                            <td>
                                <OnOffSwitch size={25}
                                    setCurrentConfig={setCurrentConfig}
                                    checked={currentConfig[ConfigKeys.MAINLINE_STATE_ENABLED_FOR_USER] === 'true'}
                                    propKey={ConfigKeys.MAINLINE_STATE_ENABLED_FOR_USER}
                                />
                            </td>
                            <td className='align-middle'>
                                {t('mainline_state_enabled_for_user_description')}
                            </td>
                        </tr>
                        <tr id='auto-set-ecc-status'>
                            <td className='align-middle fw-bold'>
                                {t('Enable Auto Set ECC Status')}
                            </td>
                            <td>
                                <OnOffSwitch size={25}
                                    setCurrentConfig={setCurrentConfig}
                                    checked={currentConfig[ConfigKeys.AUTO_SET_ECC_STATUS] === 'true'}
                                    propKey={ConfigKeys.AUTO_SET_ECC_STATUS}
                                />
                            </td>
                            <td className='align-middle'>
                                {t('enable_auto_set_ecc_status_description')}
                            </td>
                        </tr>
                        <tr id='bulk-release-deleting'>
                            <td className='align-middle fw-bold'>
                                {t('Bulk Release Deleting Feature')}
                            </td>
                            <td>
                                <OnOffSwitch size={25}
                                    setCurrentConfig={setCurrentConfig}
                                    checked={currentConfig[ConfigKeys.IS_BULK_RELEASE_DELETING_ENABLED] === 'true'}
                                    propKey={ConfigKeys.IS_BULK_RELEASE_DELETING_ENABLED}
                                />
                            </td>
                            <td className='align-middle'>
                                {t('bulk_release_deleting_description')}
                            </td>
                        </tr>
                        <tr id='disable-clearing-report-download'>
                            <td className='align-middle fw-bold'>
                                {t('Disable Clearing Report Download')}
                            </td>
                            <td>
                                <OnOffSwitch size={25}
                                    setCurrentConfig={setCurrentConfig}
                                    checked={currentConfig[ConfigKeys.DISABLE_CLEARING_FOSSOLOGY_REPORT_DOWNLOAD] === 'true'}
                                    propKey={ConfigKeys.DISABLE_CLEARING_FOSSOLOGY_REPORT_DOWNLOAD}
                                />
                            </td>
                            <td className='align-middle'>
                                {t('disable_clearing_report_download_description')}
                            </td>
                        </tr>
                        <tr id='force-update-enabled'>
                            <td className='align-middle fw-bold'>
                                {t('Enable Force Update Feature')}
                            </td>
                            <td>
                                <OnOffSwitch size={25}
                                    setCurrentConfig={setCurrentConfig}
                                    checked={currentConfig[ConfigKeys.IS_FORCE_UPDATE_ENABLED] === 'true'}
                                    propKey={ConfigKeys.IS_FORCE_UPDATE_ENABLED}
                                />
                            </td>
                            <td className='align-middle'>
                                {t('force_update_enabled_description')}
                            </td>
                        </tr>
                        <tr id='admin-private-access-enabled'>
                            <td className='align-middle fw-bold'>
                                {t('Enable Admin Private Access')}
                            </td>
                            <td>
                                <OnOffSwitch size={25}
                                    setCurrentConfig={setCurrentConfig}
                                    checked={currentConfig[ConfigKeys.IS_ADMIN_PRIVATE_ACCESS_ENABLED] === 'true'}
                                    propKey={ConfigKeys.IS_ADMIN_PRIVATE_ACCESS_ENABLED}
                                />
                            </td>
                            <td className='align-middle'>
                                {t('admin_private_access_description')}
                            </td>
                        </tr>
                        <tr id='sbom-import-export-access-usergroup'>
                            <td className='align-middle fw-bold'>
                                {t('SBOM Import Export Access User Group')}
                            </td>
                            <td>
                                <SelectUserGroup
                                    setCurrentConfig={setCurrentConfig}
                                    currentConfig={currentConfig}
                                    configKey={ConfigKeys.SBOM_IMPORT_EXPORT_ACCESS_USER_ROLE}
                                />
                            </td>
                            <td className='align-middle'>
                                {t('SBOM Import Export Access User Group')}
                            </td>
                        </tr>
                    </tbody>
                </table>
                <AttachmentStorageConfigurations currentConfig={currentConfig} setCurrentConfig={setCurrentConfig} />
                <PackageManagementConfigurations currentConfig={currentConfig} setCurrentConfig={setCurrentConfig} />
                <MailConfigurations currentConfig={currentConfig} setCurrentConfig={setCurrentConfig} />
            </>
            :
            <PageSpinner />
            }
        </div>
    )
}

export default FeatureConfigurations