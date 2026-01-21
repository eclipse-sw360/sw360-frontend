// Copyright (C) TOSHIBA CORPORATION, 2025. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { useTranslations } from 'next-intl'
import { Dispatch, type JSX, SetStateAction } from 'react'
import { ConfigKeys, Configuration } from '@/object-types'
import OnOffSwitch from './OnOffSwitch'
import SelectUserGroup from './SelectUserGroup'

interface Props {
    currentConfig: Configuration
    setCurrentConfig: Dispatch<SetStateAction<Configuration | undefined>>
}

const PackageManagementConfigurations = ({ currentConfig, setCurrentConfig }: Props): JSX.Element => {
    const t = useTranslations('default')

    const onConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentConfig((prev) => {
            return {
                ...prev,
                [e.target.name]: e.target.value,
            } as Configuration
        })
    }

    return (
        <>
            <h6
                className='fw-bold text-uppercase'
                style={{
                    color: '#5D8EA9',
                }}
            >
                {t('Package Management Configurations')}
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
                    <tr id='is-package-management-enabled'>
                        <td className='align-middle fw-bold'>{t('Enable Package Management Feature')}</td>
                        <td>
                            <OnOffSwitch
                                size={25}
                                setCurrentConfig={setCurrentConfig}
                                checked={currentConfig[ConfigKeys.IS_PACKAGE_PORTLET_ENABLED] === 'true'}
                                propKey={ConfigKeys.IS_PACKAGE_PORTLET_ENABLED}
                            />
                        </td>
                        <td>{t('is-package-management-enabled_description')}</td>
                    </tr>
                    <tr id='package-management-write-access-usergroup'>
                        <td className='align-middle fw-bold'>{t('Package Management Write Access User Group')}</td>
                        <td>
                            <SelectUserGroup
                                configKey={ConfigKeys.PACKAGE_PORTLET_WRITE_ACCESS_USER_ROLE}
                                currentConfig={currentConfig}
                                setCurrentConfig={setCurrentConfig}
                                disabled={currentConfig[ConfigKeys.IS_PACKAGE_PORTLET_ENABLED] !== 'true'}
                            />
                        </td>
                        <td className='align-middle'>{t('package_management_write_access_usergroup_description')}</td>
                    </tr>
                    <tr id='sbom-tool-name'>
                        <td className='align-middle fw-bold'>{t('SBOM Tool Name')}</td>
                        <td>
                            <input
                                className='form-control form-control-sm'
                                defaultValue={currentConfig[ConfigKeys.TOOL_NAME]}
                                type='text'
                                name={ConfigKeys.TOOL_NAME}
                                onChange={onConfigChange}
                                disabled={currentConfig[ConfigKeys.IS_PACKAGE_PORTLET_ENABLED] !== 'true'}
                            />
                        </td>
                        <td className='align-middle'>{t('sbom_tool_name_description')}</td>
                    </tr>
                    <tr id='sbom-vendor-name'>
                        <td className='align-middle fw-bold'>{t('SBOM Tool Vendor Name')}</td>
                        <td>
                            <input
                                className='form-control form-control-sm'
                                defaultValue={currentConfig[ConfigKeys.TOOL_VENDOR]}
                                type='text'
                                name={ConfigKeys.TOOL_VENDOR}
                                onChange={onConfigChange}
                                disabled={currentConfig[ConfigKeys.IS_PACKAGE_PORTLET_ENABLED] !== 'true'}
                            />
                        </td>
                        <td className='align-middle'>{t('sbom_vendor_name_description')}</td>
                    </tr>
                </tbody>
            </table>
        </>
    )
}

export default PackageManagementConfigurations
