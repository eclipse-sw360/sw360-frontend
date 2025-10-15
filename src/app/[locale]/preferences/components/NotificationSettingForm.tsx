// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { StatusCodes } from 'http-status-codes'
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { PageButtonHeader } from 'next-sw360'
import { ReactNode, useCallback, useEffect, useState } from 'react'
import { User } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils/index'
import UserInformation from './UserInformation'
import UserPreferences from './UserPreferences'

interface NotificationSetting {
    wantsMailNotification: boolean
    notificationPreferences: {
        [key: string]: boolean
    }
}

const NotificationSettingForm = (): ReactNode => {
    const t = useTranslations('default')
    const [user, setUser] = useState<User | undefined>(undefined)
    const { status } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [
        status,
    ])
    const [notificationSetting, setNotificationSetting] = useState<NotificationSetting>({
        wantsMailNotification: false,
        notificationPreferences: {},
    })

    const updateNotificationSetting = async () => {
        try {
            const session = await getSession()
            if (CommonUtils.isNullOrUndefined(session)) return signOut()
            const response = await ApiUtils.PATCH('users/profile', notificationSetting, session.user.access_token)

            if (response.status === StatusCodes.OK) {
                MessageService.success(t('Your request completed successfully'))
                await fetchData('users/profile')
            } else {
                MessageService.error(t('Error while processing'))
            }
        } catch (error) {
            console.error('An error occurred:', error)
            MessageService.error(t('Error while processing'))
        }
    }

    const fetchData = useCallback(async (url: string) => {
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) return signOut()
        const response = await ApiUtils.GET(url, session.user.access_token)

        if (response.status === StatusCodes.OK) {
            const data: User = (await response.json()) as User
            setUser(data)
            setNotificationSetting({
                wantsMailNotification: data.wantsMailNotification ?? false,
                notificationPreferences: data.notificationPreferences ?? {},
            })
        } else if (response.status === StatusCodes.UNAUTHORIZED) {
            await signOut()
        } else {
            setUser(undefined)
        }
    }, [])

    const buttonHeaders = {
        'Update settings': {
            name: t('Update settings'),
            link: '#',
            type: 'primary',
            onClick: updateNotificationSetting,
        },
    }

    useEffect(() => {
        fetchData('users/profile').catch((error) => {
            console.error(error)
        })
    }, [
        fetchData,
    ])

    return (
        <form>
            <div className='row'>
                <div className='col-12'>
                    <PageButtonHeader
                        buttons={buttonHeaders}
                        title={t('User preferences')}
                    />
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
