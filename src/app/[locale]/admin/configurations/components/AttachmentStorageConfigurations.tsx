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

const AttachmentStorageConfigurations = ({ currentConfig, setCurrentConfig }: Props): JSX.Element => {
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
                {t('Attachment Storage Configurations')}
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
                    <tr id='is-store-attachment-to-file-system-enabled'>
                        <td className='align-middle fw-bold'>{t('Enable Storage Of Attachment In File System')}</td>
                        <td>
                            <OnOffSwitch
                                size={25}
                                setCurrentConfig={setCurrentConfig}
                                checked={
                                    currentConfig[ConfigKeys.IS_STORE_ATTACHMENT_TO_FILE_SYSTEM_ENABLED] === 'true'
                                }
                                propKey={ConfigKeys.IS_STORE_ATTACHMENT_TO_FILE_SYSTEM_ENABLED}
                            />
                        </td>
                        <td>{t('is_store_attachment_to_file_system_enabled_description')}</td>
                    </tr>
                    <tr id='attachment-storage-location'>
                        <td className='align-middle fw-bold'>{t('Attachment Storage Location')}</td>
                        <td>
                            <input
                                className='form-control form-control-sm'
                                defaultValue={currentConfig[ConfigKeys.ATTACHMENT_STORE_FILE_SYSTEM_LOCATION]}
                                type='text'
                                name={ConfigKeys.ATTACHMENT_STORE_FILE_SYSTEM_LOCATION}
                                onChange={onConfigChange}
                                disabled={
                                    currentConfig[ConfigKeys.IS_STORE_ATTACHMENT_TO_FILE_SYSTEM_ENABLED] !== 'true'
                                }
                            />
                        </td>
                        <td className='align-middle'>{t('attachment_storage_location_description')}</td>
                    </tr>
                    <tr id='attachment-delete-number-of-days'>
                        <td className='align-middle fw-bold'>{t('Attachment Cleanup')}</td>
                        <td>
                            <input
                                className='form-control form-control-sm'
                                defaultValue={parseInt(currentConfig[ConfigKeys.ATTACHMENT_DELETE_NO_OF_DAYS])}
                                type='number'
                                name={ConfigKeys.ATTACHMENT_DELETE_NO_OF_DAYS}
                                onChange={onConfigChange}
                                disabled={
                                    currentConfig[ConfigKeys.IS_STORE_ATTACHMENT_TO_FILE_SYSTEM_ENABLED] !== 'true'
                                }
                            />
                        </td>
                        <td className='align-middle'>{t('attachment_delete_number_of_days_description')}</td>
                    </tr>
                </tbody>
            </table>
        </>
    )
}

export default AttachmentStorageConfigurations
