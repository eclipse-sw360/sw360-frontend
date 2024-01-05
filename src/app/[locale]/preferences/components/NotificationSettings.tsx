// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useEffect, useState } from 'react'
import { Accordion, Form } from 'react-bootstrap'

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
    const preferences = Preferences()
    const [isClient, setIsClient] = useState(false)

    const setPreferences = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNotificationSetting({
            wantsMailNotification: notificationSetting.wantsMailNotification,
            notificationPreferences: {
                ...notificationSetting.notificationPreferences,
                [event.target.name]: event.target.checked,
            },
        })
    }

    useEffect(() => {
        setIsClient(true)
    }, [])

    return (
        // We always use the first key as initial key
        <Accordion defaultActiveKey={preferences[0].key}>
            {preferences.map((value) => (
                <>
                    {' '}
                    {isClient && (
                        <Accordion.Item eventKey={value.key} key={value.key}>
                            <Accordion.Header>{value.documentType}</Accordion.Header>
                            <Accordion.Body>
                                {value.entries.map((entry) => (
                                    <Form.Check
                                        type='checkbox'
                                        label={entry.name}
                                        title={entry.name}
                                        key={`${entry.id}`}
                                        disabled={!notificationSetting.wantsMailNotification}
                                        defaultChecked={notificationSetting.notificationPreferences?.[entry.id]}
                                        onChange={setPreferences}
                                    />
                                ))}
                            </Accordion.Body>
                        </Accordion.Item>
                    )}
                </>
            ))}
        </Accordion>
    )
}

export default NotificationSettings
