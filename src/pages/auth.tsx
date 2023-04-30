// Copyright (C) SW360 Frontend Authors (see <https://github.com/eclipse-sw360/sw360-frontend/blob/main/NOTICE>)

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { useState } from 'react';
import Link from 'next/link';
import { VN, GB, JP, CN } from 'country-flag-icons/react/3x2';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import { signIn } from 'next-auth/react';
import { CREDENTIALS } from '@/object-types/Constants';
import { useSession } from 'next-auth/react';
import HttpStatus from '@/object-types/enums/HttpStatus';
import { useRouter } from 'next/router'

const AuthScreen = () => {
    const router = useRouter();
    const [dialogShow, setDialogShow] = useState<boolean>(false);
    const [messageShow, setMessageShow] = useState<boolean>(false);
    const [emailAddress, setEmailAddress] = useState<string>('@sw360.org');
    const [password, setPassword] = useState<string>('');
    const handleClose = () => setDialogShow(false);
    const handleShow = () => setDialogShow(true);
    const { data: session } = useSession();

    const handleLogin = async () => {
        await signIn(CREDENTIALS, {
            username: emailAddress,
            password: password,
            redirect: false,
        }).then((result) => {
            if (result.status == HttpStatus.OK) {
                router.push('/');
            } else {
                setMessageShow(true);
            }
        })
    };

    return (
        <>
            <section className='portlet' id='portlet_sw360_portlet_welcome'>
                <div>
                    <div className='autofit-float autofit-row portlet-header'>
                        <div className='autofit-col autofit-col-expand'>
                            <h2 className='portlet-title-text'>Welcome</h2>
                        </div>
                        <div className='autofit-col autofit-col-end'>
                            <div className='autofit-section'>
                            </div>
                        </div>
                    </div>
                    <div className='portlet-content-container p-1' style={{ background: '#f1f2f5' }}>
                        <div className='portlet-body p-5'>
                            <div className='jumbotron'>
                                <h1 className='display-4' >Welcome to SW360!</h1>
                                <Link href='' title='Great Britain'><GB title='English' className='flags'/></Link>
                                <Link href='' title='Japan'><JP title='Japanese'className='flags'/></Link>
                                <Link href='' title='Vietnam'><VN title='Vietnamese'className='flags'/></Link>
                                <Link href='' title='China'><CN title='Chinese' className='flags'/></Link>
                                <br />
                                <p className='mt-3'>
                                    SW360 is an open source software project that provides both a web application and a repository to collect, organize and make available information about software components. It establishes a central hub for software components in an organization.
                                </p>
                                <hr className='my-4' />
                                <h3>In order to go ahead, please sign in or create a new account!</h3>
                                {(!session) ? (
                                    <div className='buttons'>
                                        <span>
                                            <a className='btn btn-primary btn-lg' role='button' onClick={handleShow}>Sign In</a>
                                        </span>
                                        <a className='btn btn-outline-primary btn-lg' style={{ marginLeft: '3rem' }} role='button'>Create Account</a>
                                    </div>)
                                    :
                                    <div className='buttons'>
                                        <span>
                                            <Link className='btn btn-primary btn-lg' role='button' href='/'>Start</Link>
                                        </span>
                                    </div>
                                }
                            </div>

                        </div>
                    </div>
                </div>
            </section>

            <Modal
                show={dialogShow}
                onHide={handleClose}
                backdrop='static'
                className='login-modal'
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Sign in</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Alert variant='danger' onClose={() => setMessageShow(false)} dismissible show={messageShow}>
                        Authentication failed. Please try again.
                    </Alert>
                    <Form>
                        <Form.Group className='mb-3'>
                            <Form.Label>Email address</Form.Label>
                            <Form.Control
                                type='email'
                                defaultValue='@sw360.org'
                                onChange={event => setEmailAddress(event.target.value)}
                                autoFocus
                                required
                            />
                        </Form.Group>
                        <Form.Group
                            className='mb-3'
                        >
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type='password'
                                placeholder=''
                                onChange={event => setPassword(event.target.value)}
                                required
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer className='justify-content-start' >
                    <Button className='login-btn' variant='primary' onClick={handleLogin}> Sign in </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default AuthScreen
