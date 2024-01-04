// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

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
        <Accordion defaultActiveKey='Project'>
            {Object.values(PREFERENCES).map((value) => (
                <>
                    <Accordion.Item eventKey={value.documentType}>
                        <Accordion.Header>{value.documentType}</Accordion.Header>
                        <Accordion.Body>
                            <Form name={value.documentType}>
                                <div className='mb-3'>
                                    {Object.values(value.setting).map((entry) => (
                                        <Form.Check
                                            type='checkbox'
                                            label={entry.name}
                                            title={entry.name}
                                            key={`${value.documentType}_${entry.id}`}
                                            disabled={!notificationSetting.wantsMailNotification}
                                            defaultChecked={notificationSetting.notificationPreferences?.[entry.id]}
                                            onChange={setPreferences}
                                        />
                                    ))}
                                </div>
                            </Form>
                        </Accordion.Body>
                    </Accordion.Item>
                </>
            ))}
        </Accordion>
    )
}

export default NotificationSettings
