// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import {
    CLEARING_PREFERENCES,
    COMPONENT_PREFERENCES,
    MODERATION_PREFERENCES,
    PROJECT_PREFERENCES,
    RELEASE_PREFERENCES,
} from '../DocumentsPreferences'

import { INTL_NAMESPACE } from '@/constants'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import styles from '../preferences.module.css'

interface NotificationSetting {
    wantsMailNotification: boolean
    notificationPreferences: { [key: string]: boolean }
}

interface Props {
    notificationSetting: NotificationSetting
    setNotificationSetting: React.Dispatch<React.SetStateAction<NotificationSetting>>
}

const PREFERENCES = [
    {
        documentType: 'Project',
        setting: PROJECT_PREFERENCES,
    },
    {
        documentType: 'Component',
        setting: COMPONENT_PREFERENCES,
    },
    {
        documentType: 'Release',
        setting: RELEASE_PREFERENCES,
    },
    {
        documentType: 'Moderation',
        setting: MODERATION_PREFERENCES,
    },
    {
        documentType: 'Clearing',
        setting: CLEARING_PREFERENCES,
    },
]

const NotificationSettings = ({ notificationSetting, setNotificationSetting }: Props) => {
    const t = useTranslations(INTL_NAMESPACE)
    const [selectedType, setSelectedType] = useState('Project')

    const setPreferences = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNotificationSetting({
            wantsMailNotification: notificationSetting.wantsMailNotification,
            notificationPreferences: {
                ...notificationSetting.notificationPreferences,
                [event.target.name]: event.target.checked,
            },
        })
    }

    return (
        <>
            {Object.values(PREFERENCES).map((value) => (
                <div className={styles.section} key={value.documentType}>
                    <div
                        className={`${styles['section-header']} ${
                            selectedType === value.documentType && styles.selected
                        }`}
                        id={`${value.documentType}Heading`}
                        onClick={() => {
                            setSelectedType(selectedType === value.documentType ? 'None' : value.documentType)
                        }}
                    >
                        {
                            /* @ts-expect-error: TS2345 invalidate translation even if is valid under */
                            t(value.documentType)
                        }
                    </div>
                    <div
                        id={value.documentType}
                        className={`${styles['body-wrapper']} ${
                            selectedType === value.documentType ? styles.show : styles.collapse
                        }`}
                    >
                        <div className={`${styles['section-body']}`}>
                            {Object.values(value.setting).map((entry) => (
                                <div className='form-group' key={entry.id}>
                                    <div className='form-check'>
                                        <input
                                            id={entry.id}
                                            type='checkbox'
                                            className={`form-check-input ${styles.checkbox}`}
                                            name={entry.id}
                                            defaultChecked={notificationSetting.notificationPreferences?.[entry.id]}
                                            disabled={!notificationSetting.wantsMailNotification}
                                            onChange={setPreferences}
                                        />
                                        <label className={`form-check-label ${styles.label}`} htmlFor={entry.id}>
                                            {
                                                /* @ts-expect-error: TS2345 invalidate translation even if is valid under */
                                                t(entry.name)
                                            }
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </>
    )
}

export default NotificationSettings
