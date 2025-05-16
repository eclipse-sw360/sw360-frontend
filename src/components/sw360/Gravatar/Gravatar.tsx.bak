// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
'use client'

import { MD5 } from 'crypto-js'
import { useCallback, useEffect, type JSX } from 'react';
import { Form, Image } from 'react-bootstrap'
import { BsArrowCounterclockwise } from 'react-icons/bs'

import sw360ProfileIcon from '@/assets/images/profile.svg'

import { useLocalStorage } from '@/hooks'
import styles from './Gravatar.module.css'

function Gravatar({ email }: { email: string }) : JSX.Element {
    const [gravatarImage, setGravatarImage] = useLocalStorage<string | undefined | null>('gravatarImage', null)
    const [useGravatar, setUseGravatar] = useLocalStorage<boolean>('useGravatar', false)

    function handleCheckboxChange() {
        setUseGravatar((prevValue: boolean) => {
            const newValue = !prevValue
            return newValue
        })
    }

    const downloadGravatarImage = useCallback(() => {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        const gravatarUrl = `https://www.gravatar.com/avatar/${MD5(email)}?d=404`

        fetch(gravatarUrl)
            .then((response) => response.blob())
            .then((blob) => {
                const imageUrl = URL.createObjectURL(blob)
                setGravatarImage(gravatarUrl)
                console.log(imageUrl)
            })
            .catch((error) => console.error('Error downloading Gravatar image:', error))
    }, [email, setGravatarImage])

    useEffect(() => {
        if (useGravatar) {
            if (gravatarImage === null) {
                downloadGravatarImage()
            }
        }
    }, [useGravatar, gravatarImage, setGravatarImage, downloadGravatarImage])

    const iconSize = 64

    return (
        <>
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
                        src={useGravatar ? (gravatarImage ?? '') : (sw360ProfileIcon.src as string)}
                        width={iconSize}
                        height={iconSize}
                        alt='Gravatar'
                        roundedCircle
                    />
                    {useGravatar && <BsArrowCounterclockwise onClick={downloadGravatarImage} />}
                </div>
            </div>
        </>
    )
}

export default Gravatar
