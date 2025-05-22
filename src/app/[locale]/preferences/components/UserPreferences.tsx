// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useTranslations } from 'next-intl'
import { Alert } from 'react-bootstrap'
import styles from '../preferences.module.css'

import NotificationSettings from './NotificationSettings'
import { ReactNode } from 'react'

interface NotificationSetting {
    wantsMailNotification: boolean
    notificationPreferences: { [key: string]: boolean }
}

interface Props {
    notificationSetting: NotificationSetting
    setNotificationSetting: React.Dispatch<React.SetStateAction<NotificationSetting>>
}

const UserPreferences = ({ notificationSetting, setNotificationSetting }: Props) : ReactNode => {
    const t = useTranslations('default')

    return (
        <>
            <div id={styles['preferences-tittle']}>{t('E-Mail Notification Preferences')}</div>
            <div className='form-group'>
                <div className='form-check'>
                    <input
                        type='checkbox'
                        className={`form-check-input ${styles.checkbox}`}
                        id='wants_mail_notification'
                        name='wantsMailNotification'
                        checked={notificationSetting.wantsMailNotification}
                        onChange={(e) =>
                            setNotificationSetting({
                                ...notificationSetting,
                                wantsMailNotification: e.target.checked,
                            })
                        }
                    />
                    <label className={`form-check-label ${styles.label}`} htmlFor='wants_mail_notification'>
                        {t('Enable E-Mail Notifications')}
                    </label>
                </div>
            </div>
            <Alert variant='info'>
                {t('You will be notified on changes')}.
            </Alert>

            <NotificationSettings
                notificationSetting={notificationSetting}
                setNotificationSetting={setNotificationSetting}
            />
        </>
    )
}

export default UserPreferences
