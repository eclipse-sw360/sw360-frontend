// Copyright (C) TOSHIBA CORPORATION, 2025. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import { useTranslations } from 'next-intl'
import { Dispatch, type JSX, SetStateAction } from 'react'
import { ConfigKeys, Configuration } from '@/object-types'
import OnOffSwitch from './OnOffSwitch'

interface Props {
    currentConfig: Configuration
    setCurrentConfig: Dispatch<SetStateAction<Configuration | undefined>>
}

const MailConfigurations = ({ currentConfig, setCurrentConfig }: Props): JSX.Element => {
    const t = useTranslations('default')

    return (
        <>
            <h6
                className='fw-bold text-uppercase'
                style={{
                    color: '#5D8EA9',
                }}
            >
                {t('Mail Configurations')}
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
                    <tr id='send-project-spreadsheet-export-to-mail-enabled'>
                        <td className='align-middle fw-bold'>
                            {t('Enable Sending Project Spreadsheet Export Via Mail')}
                        </td>
                        <td>
                            <OnOffSwitch
                                size={25}
                                setCurrentConfig={setCurrentConfig}
                                checked={currentConfig[ConfigKeys.MAIL_REQUEST_FOR_PROJECT_REPORT] === 'true'}
                                propKey={ConfigKeys.MAIL_REQUEST_FOR_PROJECT_REPORT}
                            />
                        </td>
                        <td>{t('send_project_spreadsheet_export_to_mail_enabled_description')}</td>
                    </tr>
                    <tr id='send-component-spreadsheet-export-to-mail-enabled'>
                        <td className='align-middle fw-bold'>
                            {t('Enable Sending Component Spreadsheet Export Via Mail')}
                        </td>
                        <td>
                            <OnOffSwitch
                                size={25}
                                setCurrentConfig={setCurrentConfig}
                                checked={currentConfig[ConfigKeys.MAIL_REQUEST_FOR_COMPONENT_REPORT] === 'true'}
                                propKey={ConfigKeys.MAIL_REQUEST_FOR_COMPONENT_REPORT}
                            />
                        </td>
                        <td>{t('send_component_spreadsheet_export_to_mail_enabled_description')}</td>
                    </tr>
                </tbody>
            </table>
        </>
    )
}

export default MailConfigurations
