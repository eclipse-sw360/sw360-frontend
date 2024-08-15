// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useState, useCallback } from 'react'
import { getSession, signOut } from 'next-auth/react'
import { ApiUtils } from '@/utils'
import { Configuration, HttpStatus, ConfigKeys } from '@/object-types'
import OnOffSwitch from './OnOffSwitch'
import { PageButtonHeader, PageSpinner } from 'next-sw360'
import MessageService from '@/services/message.service'

const FeatureConfigurations = () => {
    const t = useTranslations('default')
    const [currentConfig, setCurrentConfig] = useState<Configuration>(undefined)

    const fetchConfig = useCallback(
        async () => {
            const session = await getSession()
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
        const session = await getSession()
        if (!session) signOut()
        const response = await ApiUtils.PATCH('configurations', currentConfig, session.user.access_token)
        if (response.status == HttpStatus.OK) {
            MessageService.success('Update configuration successfully')
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
                                    checked={currentConfig[ConfigKeys.SPDX_DOCUMENT_ENABLED] == 'true'}
                                    propKey={ConfigKeys.SPDX_DOCUMENT_ENABLED}
                                />
                            </td>
                            <td>
                                {t('spdx_feature_description')}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </>
            :
            <PageSpinner />
            }
        </div>
    )
}

export default FeatureConfigurations