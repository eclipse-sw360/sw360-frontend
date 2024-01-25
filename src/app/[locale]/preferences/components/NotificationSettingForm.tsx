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
import { getSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { PageButtonHeader } from 'next-sw360'
import { useCallback, useContext, useEffect, useState } from 'react'
import User from '../../../../object-types/User'
import { MessageContext } from './MessageContextProvider'
import UserInformation from './UserInformation'
import UserPreferences from './UserPreferences'

const NotificationSettingForm = () => {
    const t = useTranslations('default')
    const [user, setUser] = useState<User>(undefined)
    const { setToastData } = useContext(MessageContext)
    const [notificationSetting, setNotificationSetting] = useState({
        wantsMailNotification: undefined,
        notificationPreferences: {},
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

            if (!notificationSetting.wantsMailNotification) {
                fetchData('users/profile')
            }
            return
        }
        setToastData({
            show: true,
            message: t('Error while processing'),
            type: t('Error'),
            contextual: 'danger',
        })
    }

    const fetchData = useCallback(async (url: string) => {
        const session = await getSession()
        const response = await ApiUtils.GET(url, session.user.access_token)
        if (response.status == HttpStatus.OK) {
            const data = await response.json()
            setUser(data)
            setNotificationSetting({
                wantsMailNotification: data.wantsMailNotification,
                notificationPreferences: data.notificationPreferences,
            })
        } else if (response.status == HttpStatus.UNAUTHORIZED) {
            await signOut()
        } else {
            setUser(undefined)
        }
    }, [])

    const buttonHeaders = {
        'Update Setting': { name: t('Update Setting'), link: '#', type: 'primary', onClick: updateNotificationSetting },
    }

    useEffect(() => {
        fetchData('users/profile')
    }, [fetchData])

    return (
        <form>
            <div className='row'>
                <div className='col-12'>
                    <PageButtonHeader buttons={buttonHeaders} title={t('User preferences')} />
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
