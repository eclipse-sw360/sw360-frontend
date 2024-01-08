// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { HttpStatus } from '@/object-types'
import { ApiUtils } from '@/utils/index'
import { getSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useContext, useState } from 'react'
import { Button } from 'react-bootstrap'
import User from '../../../../object-types/User'
import { MessageContext } from './MessageContextProvider'
import UserInformation from './UserInformation'
import UserPreferences from './UserPreferences'

const NotificationSettingForm = ({ user }: { user: User }) => {
    const t = useTranslations('default')
    const { setToastData } = useContext(MessageContext)

    const [notificationSetting, setNotificationSetting] = useState({
        wantsMailNotification: user.wantsMailNotification,
        notificationPreferences: user.notificationPreferences,
    })

    const updateNotificationSetting = async () => {
        const session = await getSession()
        const response = await ApiUtils.PATCH('users/profile', notificationSetting, session.user.access_token)
        if (response.status === HttpStatus.OK) {
            setToastData({
                show: true,
                message: t('Your request completed successfully'),
                type: t('Success'),
                contextual: 'success',
            })
            return
        }
        setToastData({
            show: true,
            message: t('Error while processing'),
            type: t('Error'),
            contextual: 'danger',
        })
    }

    return (
        <form>
            <div className='row'>
                <div className='col-auto'>
                    <Button variant='primary' onClick={() => updateNotificationSetting()}>
                        {t('Update Setting')}
                    </Button>
                </div>
            </div>
            <br />
            <div className='row'>
                <div className='col-6'>
                    <UserPreferences
                        notificationSetting={notificationSetting}
                        setNotificationSetting={setNotificationSetting}
                    />
                </div>
                <div className='col-6'>
                    <UserInformation user={user} />
                </div>
            </div>
        </form>
    )
}

export default NotificationSettingForm
