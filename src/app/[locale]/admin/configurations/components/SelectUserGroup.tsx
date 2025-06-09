// Copyright (C) TOSHIBA CORPORATION, 2025. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { ConfigKeys, Configuration, UserGroupType } from '@/object-types'
import { useTranslations } from 'next-intl'
import { Dispatch, type JSX, SetStateAction } from 'react'

interface Props {
    configKey: ConfigKeys
    currentConfig: Configuration
    setCurrentConfig: Dispatch<SetStateAction<Configuration | undefined>>
    disabled?: boolean
}

const SelectUserGroup = ({ currentConfig, configKey, setCurrentConfig, disabled = false }: Props): JSX.Element => {
    const t = useTranslations('default')
    return (
        <select
            className='form-control form-control-sm'
            name='userGroup'
            defaultValue={currentConfig[configKey]}
            required
            disabled={disabled}
            onChange={(e) => {
                setCurrentConfig((prev) => {
                    return {
                        ...prev,
                        [configKey]: e.target.value,
                    } as Configuration
                })
            }}
        >
            {Object.entries(UserGroupType).map(([key, value]) => (
                <option
                    key={key}
                    value={key}
                >
                    {t(value as never)}
                </option>
            ))}
        </select>
    )
}

export default SelectUserGroup
