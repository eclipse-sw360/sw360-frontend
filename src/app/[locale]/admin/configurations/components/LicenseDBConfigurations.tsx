// Copyright Sandip Mandal, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { StatusCodes } from 'http-status-codes'
import { useTranslations } from 'next-intl'
import { PageButtonHeader, PageSpinner } from 'next-sw360'
import { type JSX, useCallback, useEffect, useState } from 'react'
import { ConfigurationContainers, LicenseDBConfigKeys, LicenseDBConfiguration } from '@/object-types'
import MessageService from '@/services/message.service'
import ApiUtils from '@/utils/api/authenticatedApi.util'
import { dispatchSessionExpiredEvent } from '@/utils/sessionExpiry.utils'
import OnOffSwitch from './OnOffSwitch'

const LicenseDBConfigurations = (): JSX.Element => {
    const t = useTranslations('default')
    const [currentConfig, setCurrentConfig] = useState<LicenseDBConfiguration | undefined>(undefined)
    const apiEndpoint = `configurations/container/${ConfigurationContainers.LICENSEDB_REST}`

    const fetchLicenseDBConfig = useCallback(async () => {
        const response = await ApiUtils.GET(apiEndpoint)
        if (response.status == StatusCodes.OK) {
            const data = (await response.json()) as LicenseDBConfiguration
            setCurrentConfig(data)
        } else if (response.status == StatusCodes.UNAUTHORIZED) {
            dispatchSessionExpiredEvent()
        } else {
            setCurrentConfig({} as LicenseDBConfiguration)
        }
    }, [])

    useEffect(() => {
        fetchLicenseDBConfig()
    }, [])

    const updateConfig = async (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault()
        if (currentConfig === undefined) return

        const response = await ApiUtils.PATCH(apiEndpoint, currentConfig)
        if (response.status == StatusCodes.OK) {
            MessageService.success(t('Updated LicenseDB configurations successfully'))
        } else if (response.status == StatusCodes.UNAUTHORIZED) {
            dispatchSessionExpiredEvent()
        } else {
            const responseData = await response.json()
            MessageService.error(responseData.message)
        }
    }

    const headerButtons = {
        'Update LicenseDB Configuration': {
            link: '#',
            onClick: updateConfig,
            type: 'primary',
            name: t('Update LicenseDB Configurations'),
        },
    }

    return (
        <>
            <div className='container page-content'>
                <PageButtonHeader
                    title={`${t('LicenseDB Configurations')}`}
                    buttons={headerButtons}
                />
                {currentConfig ? (
                    <>
                        <h6 className='fw-bold text-uppercase text-blue'>
                            {t('LicenseDB Connection')}
                            <hr className='my-2 mb-2' />
                        </h6>
                        <table className='table'>
                            <thead>
                                <tr>
                                    <th>{t('Name')}</th>
                                    <th>{t('Value')}</th>
                                    <th>{t('Description')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr id='licensedb-enabled'>
                                    <td className='align-middle fw-bold'>{t('Enable LicenseDB Integration')}</td>
                                    <td>
                                        <OnOffSwitch
                                            size={25}
                                            setCurrentLicenseDBConfig={setCurrentConfig}
                                            checked={currentConfig[LicenseDBConfigKeys.LICENSEDB_ENABLED] === 'true'}
                                            propKey={LicenseDBConfigKeys.LICENSEDB_ENABLED}
                                        />
                                    </td>
                                    <td className='align-middle'>{t('licensedb_enabled_description')}</td>
                                </tr>
                                <tr id='licensedb-base-url'>
                                    <td className='align-middle fw-bold'>{t('LicenseDB Base URL')}</td>
                                    <td>
                                        <input
                                            type='text'
                                            className='form-control'
                                            value={currentConfig[LicenseDBConfigKeys.LICENSEDB_BASE_URL] ?? ''}
                                            onChange={(event) => {
                                                setCurrentConfig((prev) => {
                                                    return {
                                                        ...prev,
                                                        [LicenseDBConfigKeys.LICENSEDB_BASE_URL]:
                                                            event.target.value.toString(),
                                                    } as LicenseDBConfiguration
                                                })
                                            }}
                                        />
                                    </td>
                                    <td className='align-middle'>{t('licensedb_base_url_description')}</td>
                                </tr>
                                <tr id='licensedb-username'>
                                    <td className='align-middle fw-bold'>{t('LicenseDB Username')}</td>
                                    <td>
                                        <input
                                            type='text'
                                            className='form-control'
                                            value={currentConfig[LicenseDBConfigKeys.LICENSEDB_USERNAME] ?? ''}
                                            onChange={(event) => {
                                                setCurrentConfig((prev) => {
                                                    return {
                                                        ...prev,
                                                        [LicenseDBConfigKeys.LICENSEDB_USERNAME]:
                                                            event.target.value.toString(),
                                                    } as LicenseDBConfiguration
                                                })
                                            }}
                                        />
                                    </td>
                                    <td className='align-middle'>{t('licensedb_username_description')}</td>
                                </tr>
                                <tr id='licensedb-password'>
                                    <td className='align-middle fw-bold'>{t('LicenseDB Password')}</td>
                                    <td>
                                        <input
                                            type='password'
                                            className='form-control'
                                            value={currentConfig[LicenseDBConfigKeys.LICENSEDB_PASSWORD] ?? ''}
                                            onChange={(event) => {
                                                setCurrentConfig((prev) => {
                                                    return {
                                                        ...prev,
                                                        [LicenseDBConfigKeys.LICENSEDB_PASSWORD]:
                                                            event.target.value.toString(),
                                                    } as LicenseDBConfiguration
                                                })
                                            }}
                                        />
                                    </td>
                                    <td className='align-middle'>{t('licensedb_password_description')}</td>
                                </tr>
                            </tbody>
                        </table>
                    </>
                ) : (
                    <PageSpinner />
                )}
            </div>
        </>
    )
}

export default LicenseDBConfigurations
