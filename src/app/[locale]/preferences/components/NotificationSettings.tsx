// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useState } from 'react'
import styles from '../preferences.module.css'

import { Preferences } from '@/object-types'

interface NotificationSetting {
    wantsMailNotification: boolean
    notificationPreferences: { [key: string]: boolean }
}

interface Props {
    notificationSetting: NotificationSetting
    setNotificationSetting: React.Dispatch<React.SetStateAction<NotificationSetting>>
}

const NotificationSettings = ({ notificationSetting, setNotificationSetting }: Props) => {
    const [selectedType, setSelectedType] = useState('Project')

    const preferences = Preferences()

    const PREFERENCES = [
        {
            documentType: 'Project',
            setting: preferences.PROJECT,
        },
        {
            documentType: 'Component',
            setting: preferences.COMPONENT,
        },
        {
            documentType: 'Release',
            setting: preferences.RELEASE,
        },
        {
            documentType: 'Moderation',
            setting: preferences.MODERATION,
        },
        {
            documentType: 'Clearing',
            setting: preferences.CLEARING,
        },
    ]

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
                        {value.documentType}
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
                                            {entry.name}
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
