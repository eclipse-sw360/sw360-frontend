// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { INTL_NAMESPACE } from '@/constants'
import { HttpStatus } from '@/object-types'
import { ApiUtils } from '@/utils/index'
import { getSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Button } from 'react-bootstrap'
import User from '../../../../object-types/User'
import UpdateMessage from './UpdateMessage'
import UserInformation from './UserInformation'
import UserPreferences from './UserPreferences'

const NotificationSettingForm = ({ user }: { user: User }) => {
    const t = useTranslations(INTL_NAMESPACE)
    const [notificationSetting, setNotificationSetting] = useState({
        wantsMailNotification: user.wantsMailNotification,
        notificationPreferences: user.notificationPreferences,
    })

    const [updateState, setUpdateState] = useState({
        message: undefined,
        status: undefined,
    })

    const updateNotificationSetting = async () => {
        const session = await getSession()
        const response = await ApiUtils.PATCH('users/profile', notificationSetting, session.user.access_token)
        if (response.status === HttpStatus.OK) {
            setUpdateState({
                message: 'Your request completed successfully',
                status: 'Success',
            })
            return
        }
        setUpdateState({
            message: 'Error while processing',
            status: 'Error',
        })
    }

    return (
        <>
            <form className='container page-content'>
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
            <UpdateMessage state={updateState} />
        </>
    )
}

export default NotificationSettingForm
