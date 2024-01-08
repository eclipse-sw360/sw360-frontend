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
import { useLocalStorage } from '@/hooks'

function ProfileDropdown() {
    const t = useTranslations('default')
    const [profileImage, setProfileImage] = useState(sw360ProfileIcon.src)
    const [useGravatar] = useLocalStorage('useGravatar', false)
    const [gravatarImage] = useLocalStorage('gravatarImage', null)

    useEffect(() => {
        if (useGravatar) {
            if (gravatarImage) {
                setProfileImage(gravatarImage ? gravatarImage : sw360ProfileIcon.src)
            }
        } else {
            setProfileImage(sw360ProfileIcon.src)
        }
    }, [gravatarImage, useGravatar])

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
