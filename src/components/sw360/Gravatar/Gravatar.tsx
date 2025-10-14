// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
'use client'

import { type JSX, useCallback, useEffect } from 'react'
import { Form, Image } from 'react-bootstrap'
import { BsArrowCounterclockwise } from 'react-icons/bs'

import sw360ProfileIcon from '@/assets/images/profile.svg'

import { useLocalStorage } from '@/hooks'
import styles from './Gravatar.module.css'

function Gravatar({ email }: { email: string }): JSX.Element {
    const [gravatarImage, setGravatarImage] = useLocalStorage<string>('gravatarImage', null)
    const [useGravatar, setUseGravatar] = useLocalStorage<boolean>('useGravatar', false)

    function handleCheckboxChange(event: React.ChangeEvent<HTMLInputElement>) {
        const checked = event.target.checked
        setUseGravatar(checked)

        if (checked) {
            downloadGravatarImage()
        } else {
            setGravatarImage(sw360ProfileIcon.src as string)
        }
        console.log(`GRAVATAR_IMAGE: ${gravatarImage}`)
    }

    const downloadGravatarImage = useCallback(() => {
        const gravatarUrl = `/api/gravatar?email=${encodeURIComponent(email)}`
        console.log(`LOCAL URL: ${gravatarUrl}`)
        fetch(gravatarUrl)
            .then((response) => response.blob())
            .then((blob) => {
                const imageUrl = URL.createObjectURL(blob)
                setGravatarImage(imageUrl)
            })
            .catch((error) => console.error('Error downloading Gravatar image:', error))
    }, [
        email,
        setGravatarImage,
    ])

    useEffect(() => {
        if (useGravatar && !gravatarImage) {
            downloadGravatarImage()
        }
    }, [
        useGravatar,
        downloadGravatarImage,
        gravatarImage,
    ])

    const iconSize = 64

    return (
        <div className={styles.gravatar}>
            <div>
                <Form.Check
                    type='checkbox'
                    checked={useGravatar}
                    id='gravatar'
                    onChange={handleCheckboxChange}
                    label='Use Gravatar Profile Images'
                />
            </div>
            <div className='gap-2 d-flex align-items-center justify-contents-end'>
                <Image
                    src={gravatarImage}
                    width={iconSize}
                    height={iconSize}
                    alt='Gravatar'
                    roundedCircle
                />
                {useGravatar && <BsArrowCounterclockwise onClick={downloadGravatarImage} />}
            </div>
        </div>
    )
}

export default Gravatar
