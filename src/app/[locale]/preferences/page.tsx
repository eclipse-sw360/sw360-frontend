// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import { ApiUtils } from '@/utils/index'
import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import User from '../../../object-types/User'
import MessageContextProvider from './components/MessageContextProvider'
import NotificationSettingForm from './components/NotificationSettingForm'
import UpdateMessage from './components/UpdateMessage'
import UserAccessToken from './components/UserAccessToken'

export const metadata: Metadata = {
    title: 'Preferences',
}

const getUserPreferences = async (token: string) => {
    const res = await ApiUtils.GET(`users/profile`, token)
    return res.json()
}

const PreferencesPage = async () => {
    const session = await getServerSession(authOptions)
    const userPreferences: User = await getUserPreferences(session.user.access_token)

    return (
        <div className='container page-content'>
            <MessageContextProvider>
                <NotificationSettingForm user={userPreferences} />
                <br />
                <UserAccessToken />
                <UpdateMessage />
            </MessageContextProvider>
        </div>
    )
}

export default PreferencesPage
