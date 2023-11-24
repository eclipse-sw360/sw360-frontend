// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { signIn, useSession } from 'next-auth/react'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next-intl/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Alert, Button, Form, Modal } from 'react-bootstrap'

import { CREDENTIALS, KEYCLOAK } from '@/constants'
import { HttpStatus } from '@/object-types'
import { LanguageSwitcher, PageSpinner } from 'next-sw360'

function AuthScreen() {
    const router = useRouter()
    const locale = useLocale()
    const t = useTranslations('default')
    const [dialogShow, setDialogShow] = useState<boolean>(false)
    const [messageShow, setMessageShow] = useState<boolean>(false)
    const [emailAddress, setEmailAddress] = useState<string>('@sw360.org')
    const [password, setPassword] = useState<string>('')
    const { status } = useSession()

    const handleClose = () => setDialogShow(false)
    // const handleShow = () => setDialogShow(true)

    const handleLogin = async () => {
        await signIn(CREDENTIALS, {
            username: emailAddress,
            password: password,
            redirect: false,
        }).then((result) => {
            if (result.status == HttpStatus.OK) {
                router.push(`/${locale}/home`)
            } else {
                setMessageShow(true)
            }
        })
    }

    return (
        <>
            <section className='portlet' id='portlet_sw360_portlet_welcome'>
                <div>
                    {status == 'loading' ? (
                        <PageSpinner />
                    ) : (
                        <div className='portlet-content-container p-1' style={{ background: '#f1f2f5' }}>
                            <div className='portlet-body p-5'>
                                <div className='jumbotron'>
                                    <h1 className='display-4'>{t('Welcome to SW360!')}</h1>
                                    <LanguageSwitcher />
                                    <br />
                                    <p className='mt-3'>{t('SW360_INFO')}</p>
                                    <hr className='my-4' />
                                    <h3>{t('In order to go ahead, please sign in or create a new account!')}</h3>
                                    {status === 'unauthenticated' ? (
                                        <div className='buttons'>
                                            <span>
                                                <a
                                                    className='btn btn-primary btn-lg'
                                                    role='button'
                                                    onClick={() => signIn(KEYCLOAK)}
                                                >
                                                    {t('Sign In')}
                                                </a>
                                            </span>
                                            {/* <span>
                                                <a
                                                    className='btn btn-primary btn-lg'
                                                    role='button'
                                                    style={{ marginLeft: '3rem' }}
                                                    onClick={handleShow}
                                                >
                                                    {t('Sign In')}
                                                </a>
                                            </span> */}
                                            <a
                                                className='btn btn-outline-primary btn-lg'
                                                style={{ marginLeft: '3rem' }}
                                                role='button'
                                            >
                                                {t('Create Account')}
                                            </a>
                                        </div>
                                    ) : (
                                        <div className='buttons'>
                                            <span>
                                                <Link className='btn btn-primary btn-lg' role='button' href='/home'>
                                                    {t('Start')}
                                                </Link>
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <Modal show={dialogShow} onHide={() => handleClose()} backdrop='static' className='login-modal' centered>
                <Modal.Header closeButton>
                    <Modal.Title>{t('Sign In')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Alert variant='danger' onClose={() => setMessageShow(false)} dismissible show={messageShow}>
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
                            <Form.Control
                                type='password'
                                placeholder=''
                                onChange={(event) => setPassword(event.target.value)}
                                required
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer className='justify-content-start'>
                    <Button className='login-btn' variant='primary' onClick={() => handleLogin()}>
                        {' '}
                        {t('Sign In')}{' '}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

export default AuthScreen
