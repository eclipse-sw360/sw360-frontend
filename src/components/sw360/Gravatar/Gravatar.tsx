// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { MD5 } from 'crypto-js'
import { useCallback, useEffect, useState } from 'react'
import { Form, Image } from 'react-bootstrap'
import { BsArrowCounterclockwise } from 'react-icons/bs'

import sw360ProfileIcon from '@/assets/images/profile.svg'

import styles from './Gravatar.module.css'

function Gravatar({ email, noCache = false }: { email: string; noCache: boolean }) {
    const [useGravatar, setUseGravatar] = useState(() => {
        const state = localStorage.getItem('useGravatar')
        const initialValue = JSON.parse(state)
        return initialValue || false
    })
    const [gravatarImage, setGravatarImage] = useState(null)

    function handleCheckboxChange() {
        setUseGravatar((prevValue: string) => {
            const newValue = !prevValue
            localStorage.setItem('useGravatar', JSON.stringify(newValue))
            return newValue
        })
    }

    const downloadGravatarImage = useCallback(() => {
        const gravatarUrl = `https://www.gravatar.com/avatar/${MD5(email)}?d=identicon`

        fetch(gravatarUrl)
            .then((response) => response.blob())
            .then((blob) => {
                const imageUrl = URL.createObjectURL(blob)
                setGravatarImage(imageUrl)
                // Cache the image URL in localStorage
                localStorage.setItem('gravatarImage', imageUrl)
            })
            .catch((error) => console.error('Error downloading Gravatar image:', error))
    }, [email])

    const handleRefreshGravatar = () => {
        localStorage.removeItem('gravatarImage')
        downloadGravatarImage()
    }

    useEffect(() => {
        if (useGravatar) {
            const cachedImage = localStorage.getItem('gravatarImage')
            if (cachedImage || noCache) {
                setGravatarImage(cachedImage)
            } else {
                downloadGravatarImage()
            }
        } else {
            setGravatarImage(sw360ProfileIcon.src)
        }
    }, [useGravatar, email, downloadGravatarImage, noCache])

    const iconSize = 64

    return (
        <>
            <div className={styles.gravatar}>
                <div>
                    <Form.Check
                        type='checkbox'
                        checked={useGravatar}
                        onChange={handleCheckboxChange}
                        label='Use Gravatar Profile Images'
                    />
                </div>
                <div className='gap-2 d-flex align-items-center justify-contents-end'>
                    <Image src={gravatarImage} width={iconSize} height={iconSize} alt='Gravatar' roundedCircle />
                    {useGravatar && <BsArrowCounterclockwise onClick={handleRefreshGravatar} />}
                </div>
            </div>
        </>
    )
}

export default Gravatar
