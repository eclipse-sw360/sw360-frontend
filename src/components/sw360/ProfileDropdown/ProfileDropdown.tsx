// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { MD5 } from 'crypto-js'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { Image, NavDropdown } from 'react-bootstrap'

import sw360ProfileIcon from '@/assets/images/profile.svg'

function ProfileDropdown() {
    const t = useTranslations('default')
    const { data: session } = useSession()
    const user_data = session
        ? JSON.parse(Buffer.from(session.user.access_token.split('.')[1], 'base64').toString())
        : null
    const emailhash = MD5(user_data?.user_name)
    const [profileImage, setProfileImage] = useState(`https://www.gravatar.com/avatar/${emailhash}?d=404`)

    useEffect(() => {
        fetch(profileImage)
            .then((response) => {
                if (!response.ok) {
                    setProfileImage(sw360ProfileIcon.src)
                }
            })
            .catch(() => {
                setProfileImage(sw360ProfileIcon.src)
            })
    }, [profileImage])

    console.log(profileImage)

    return (
        <NavDropdown
            id='profileDropdown'
            align='end'
            title={<Image className='profile-image' src={profileImage} alt='UserProfile' roundedCircle={true} />}
            className='no-border'
        >
            <NavDropdown.Item href='/preferences'>{t('Preferences')}</NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item href='' onClick={() => signOut({ callbackUrl: '/' })}>
                {t('Logout')}
            </NavDropdown.Item>
        </NavDropdown>
    )
}

export default ProfileDropdown
