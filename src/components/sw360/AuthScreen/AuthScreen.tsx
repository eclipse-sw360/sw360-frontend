// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { StatusCodes } from 'http-status-codes'
import { useRouter } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'
import { useLocale, useTranslations } from 'next-intl'
import { LanguageSwitcher, PageSpinner } from 'next-sw360'
import { ReactNode, useState } from 'react'
import { Alert, Button, Form, Modal } from 'react-bootstrap'
import { CREDENTIALS, KEYCLOAK_PROVIDER, SW360OAUTH_PROVIDER } from '@/constants'
import { AUTH_PROVIDER } from '@/utils/env'

function AuthScreen(): ReactNode {
    const router = useRouter()
    const locale = useLocale()
    const t = useTranslations('default')
    const [dialogShow, setDialogShow] = useState<boolean>(false)
    const [messageShow, setMessageShow] = useState<boolean>(false)
    const [emailAddress, setEmailAddress] = useState<string>('@sw360.org')
    const [password, setPassword] = useState<string>('')
    const [showPassword, setShowPassword] = useState<boolean>(false)
    const { status } = useSession()

    const handleClose = () => setDialogShow(false)
    const handleShow = () => {
        const authProvider = AUTH_PROVIDER
        if (authProvider === 'keycloak') {
            void signIn(KEYCLOAK_PROVIDER)
        } else if (authProvider === 'sw360oauth') {
            void signIn(SW360OAUTH_PROVIDER)
        } else {
            setDialogShow(true)
        }
    }

    const handleLogin = async () => {
        await signIn(CREDENTIALS, {
            username: emailAddress,
            password: password,
            redirect: false,
        }).then((result) => {
            if (result === undefined) {
                setMessageShow(true)
                return
            }

            if (result.status === StatusCodes.OK) {
                router.push(`/${locale}/home`)
            } else {
                setMessageShow(true)
            }
        })
    }

    return (
        <>
            <section
                className='portlet'
                id='portlet_sw360_portlet_welcome'
            >
                <div>
                    {status == 'loading' ? (
                        <PageSpinner />
                    ) : (
                        <div className='authscreen'>
                            <div className='portlet-body p-5'>
                                <div className='jumbotron'>
                                    <h1 className='display-4'>{t('Welcome to SW360!')}</h1>
                                    <LanguageSwitcher />
                                    <br />
                                    <p className='mt-3'>{t('SW360_INFO')}</p>
                                    <hr className='my-4' />
                                    <h3>{t('In order to go ahead, please sign in or create a new account!')}</h3>
                                    {status === 'unauthenticated' ? (
                                        <>
                                            <Button
                                                className='me-3'
                                                variant='primary'
                                                size='lg'
                                                onClick={handleShow}
                                            >
                                                {t('Sign In')}
                                            </Button>
                                            <Button
                                                variant='outline-primary'
                                                size='lg'
                                            >
                                                {t('Create Account')}
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button
                                                variant='primary'
                                                size='lg'
                                                href='/home'
                                            >
                                                {t('Start')}
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <Modal
                show={dialogShow}
                onHide={() => handleClose()}
                backdrop='static'
                className='login-modal'
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>{t('Sign In')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Alert
                        variant='danger'
                        onClose={() => setMessageShow(false)}
                        dismissible
                        show={messageShow}
                    >
                        {t('Authentication failed Please try again')}
                    </Alert>
                    <Form>
                        <Form.Group className='mb-3'>
                            <Form.Label>{t('Email Address')}</Form.Label>
                            <Form.Control
                                type='email'
                                defaultValue='@sw360.org'
                                onChange={(event) => setEmailAddress(event.target.value)}
                                autoFocus
                                required
                            />
                        </Form.Group>
                        <Form.Group className='mb-3'>
                            <Form.Label>{t('Password')}</Form.Label>
                            <div className='password-input-wrapper'>
                                <Form.Control
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder=''
                                    onChange={(event) => setPassword(event.target.value)}
                                    required
                                    className='password-input'
                                />
                                <button
                                    type='button'
                                    className='password-toggle-btn'
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? t('Hide password') : t('Show password')}
                                    title={showPassword ? t('Hide password') : t('Show password')}
                                >
                                    {showPassword ? (
                                        <svg
                                            xmlns='http://www.w3.org/2000/svg'
                                            width='20'
                                            height='20'
                                            viewBox='0 0 24 24'
                                            fill='none'
                                            stroke='currentColor'
                                            strokeWidth='2'
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                        >
                                            <path d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' />
                                            <circle
                                                cx='12'
                                                cy='12'
                                                r='3'
                                            />
                                        </svg>
                                    ) : (
                                        <svg
                                            xmlns='http://www.w3.org/2000/svg'
                                            width='20'
                                            height='20'
                                            viewBox='0 0 24 24'
                                            fill='none'
                                            stroke='currentColor'
                                            strokeWidth='2'
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                        >
                                            <path d='M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24' />
                                            <line
                                                x1='1'
                                                y1='1'
                                                x2='23'
                                                y2='23'
                                            />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer className='justify-content-start'>
                    <Button
                        className='login-btn'
                        variant='primary'
                        onClick={() => void handleLogin()}
                    >
                        {' '}
                        {t('Sign In')}{' '}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

export default AuthScreen
