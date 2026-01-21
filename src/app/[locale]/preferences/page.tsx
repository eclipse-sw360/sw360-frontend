// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { Metadata } from 'next'
import { ReactNode } from 'react'
import NotificationSettingForm from './components/NotificationSettingForm'
import UserAccessToken from './components/UserAccessToken'

export const metadata: Metadata = {
    title: 'Preferences',
}

const PreferencesPage = (): ReactNode => {
    return (
        <div className='container page-content'>
            <NotificationSettingForm />
            <br />
            <UserAccessToken />
        </div>
    )
}

export default PreferencesPage
