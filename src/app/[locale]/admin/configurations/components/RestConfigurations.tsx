// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import { useTranslations } from 'next-intl'
import { Dispatch, type JSX, SetStateAction } from 'react'
import { ConfigKeys, Configuration } from '@/object-types'

interface Props {
    currentConfig: Configuration
    setCurrentConfig: Dispatch<SetStateAction<Configuration | undefined>>
}

const RestConfigurations = ({ currentConfig, setCurrentConfig }: Props): JSX.Element => {
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
            <h6 className='header-underlined'>{t('Rest Configurations')}</h6>
            <table className='table label-value-table'>
                <thead>
                    <tr>
                        <th>{t('Name')}</th>
                        <th>{t('Value')}</th>
                        <th>{t('Description')}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr id='rest-api-token-length'>
                        <td className='align-middle fw-bold'>{t('API Token Length')}</td>
                        <td>
                            <input
                                className='form-control form-control-sm'
                                defaultValue={
                                    currentConfig[ConfigKeys.REST_API_TOKEN_LENGTH]
                                        ? parseInt(currentConfig[ConfigKeys.REST_API_TOKEN_LENGTH])
                                        : ''
                                }
                                type='number'
                                min='20'
                                name={ConfigKeys.REST_API_TOKEN_LENGTH}
                                onChange={onConfigChange}
                            />
                        </td>
                        <td className='align-middle'>{t('rest_api_token_length_description')}</td>
                    </tr>
                </tbody>
            </table>
        </>
    )
}

export default RestConfigurations
