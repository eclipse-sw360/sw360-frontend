// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { Image, NavDropdown } from 'react-bootstrap'

import sw360ProfileIcon from '@/assets/images/profile.svg'

function ProfileDropdown() {
    const t = useTranslations('default')
    const [useGravatar] = useState(() => {
        const state = localStorage.getItem('useGravatar')
        const initialValue = JSON.parse(state)
        return initialValue || false
    })
    const [profileImage, setProfileImage] = useState(sw360ProfileIcon.src)
    const cachedImage = localStorage.getItem('gravatarImage')

    useEffect(() => {
        if (useGravatar) {
            if (cachedImage) {
                setProfileImage(cachedImage)
            } else {
                setProfileImage(sw360ProfileIcon.src)
            }
        } else {
            setProfileImage(sw360ProfileIcon.src)
        }
    }, [profileImage, useGravatar, cachedImage])

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
