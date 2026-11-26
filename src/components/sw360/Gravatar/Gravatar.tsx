// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
'use client'

import { MD5 } from 'crypto-js'
import { StatusCodes } from 'http-status-codes'
import { useTranslations } from 'next-intl'
import { type JSX, useCallback, useEffect, useRef, useState } from 'react'
import { Alert, Form, Image } from 'react-bootstrap'
import { BsArrowCounterclockwise } from 'react-icons/bs'

import sw360ProfileIcon from '@/assets/images/profile.svg'

import { useLocalStorage } from '@/hooks'

interface AlertData {
    variant: string
    message: string
}

function Gravatar({ email }: { email: string }): JSX.Element {
    const t = useTranslations('default')
    const [gravatarImage, setGravatarImage] = useLocalStorage<string | undefined | null>('gravatarImage', null)
    const [useGravatar, setUseGravatar] = useLocalStorage<boolean>('useGravatar', false)
    const [alert, setAlert] = useState<AlertData | null>(null)
    const setGravatarImageRef = useRef(setGravatarImage)
    const gravatarImageRef = useRef(gravatarImage)
    const latestRequestIdRef = useRef(0)
    const skipNextNullEffectRef = useRef(false)

    useEffect(() => {
        setGravatarImageRef.current = setGravatarImage
        gravatarImageRef.current = gravatarImage
    })

    function handleCheckboxChange() {
        setUseGravatar((prevValue: boolean) => {
            const newValue = !prevValue
            return newValue
        })
    }

    const downloadGravatarImage = useCallback(async () => {
        const requestId = ++latestRequestIdRef.current
        setAlert(null)

        const applyFallbackAlert = (variant: string, message: string) => {
            if (gravatarImageRef.current != null) {
                skipNextNullEffectRef.current = true
            }
            setGravatarImageRef.current(null)
            setAlert({
                variant,
                message,
            })
        }

        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        const gravatarUrl = `https://www.gravatar.com/avatar/${MD5(email)}?d=404`

        try {
            const response = await fetch(gravatarUrl)
            if (requestId !== latestRequestIdRef.current) {
                return
            }

            if (!response.ok) {
                // Gravatar answers 404 for users without a Gravatar image.
                // Fetch resolves for error statuses too, so clear the stored
                // image to fall back to the SW360 profile icon and alert the user.
                if (response.status === StatusCodes.NOT_FOUND) {
                    applyFallbackAlert('warning', t('Gravatar returned 404 falling back to default profile icon'))
                } else {
                    applyFallbackAlert(
                        'danger',
                        t('Failed to fetch Gravatar image falling back to default profile icon'),
                    )
                }
                return
            }

            const blob = await response.blob()
            if (requestId !== latestRequestIdRef.current) {
                return
            }

            if (blob) {
                skipNextNullEffectRef.current = false
                setGravatarImageRef.current(gravatarUrl)
                setAlert(null)
            }
        } catch (error) {
            if (requestId !== latestRequestIdRef.current) {
                return
            }
            console.error('Error downloading Gravatar image:', error)
            applyFallbackAlert('danger', t('Failed to fetch Gravatar image falling back to default profile icon'))
        }
    }, [
        email,
        t,
    ])

    useEffect(() => {
        skipNextNullEffectRef.current = false
    }, [
        email,
    ])

    useEffect(() => {
        if (!useGravatar) {
            latestRequestIdRef.current += 1
            skipNextNullEffectRef.current = false
            setAlert(null)
            return
        }

        if (gravatarImage == null) {
            if (skipNextNullEffectRef.current) {
                skipNextNullEffectRef.current = false
                return
            }
            void downloadGravatarImage()
        }

        return () => {
            latestRequestIdRef.current += 1
        }
    }, [
        useGravatar,
        gravatarImage,
        downloadGravatarImage,
    ])

    const iconSize = 64

    return (
        <>
            <div className='d-flex justify-content-between align-items-center'>
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
                        src={useGravatar && gravatarImage ? gravatarImage : (sw360ProfileIcon.src as string)}
                        width={iconSize}
                        height={iconSize}
                        alt='Gravatar'
                        roundedCircle
                        onError={() => {
                            if (useGravatar && gravatarImage) {
                                setGravatarImage(null)
                            }
                        }}
                    />
                    {useGravatar && (
                        <BsArrowCounterclockwise
                            size={20}
                            onClick={() => void downloadGravatarImage()}
                        />
                    )}
                </div>
            </div>
            {alert && (
                <Alert
                    variant={alert.variant}
                    className='mt-2 mb-0'
                    onClose={() => setAlert(null)}
                    dismissible
                >
                    {alert.message}
                </Alert>
            )}
        </>
    )
}

export default Gravatar
