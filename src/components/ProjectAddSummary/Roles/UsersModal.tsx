// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { Table, _ } from '@/components/sw360'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Button, Col, Form, Modal, Row } from 'react-bootstrap'

interface UserType {
    userId: string
    givenName: string
    lastName: string
    email: string
    department: string
}

export default function UsersModal({ show, setShow }: { show: boolean; setShow: (show: boolean) => void }) : JSX.Element {
    const t = useTranslations('default')

    const columns = [
        {
            id: 'selectUserRadio',
            name: '',
            formatter: (userId: string) =>
                _(
                    <div className='form-check'>
                        <input className='form-check-input' type='radio' name='user' id={userId} />
                    </div>
                ),
            width: '8%',
        },
        {
            id: 'givenName',
            name: t('Given Name'),
            sort: true,
            width: '20%',
        },
        {
            id: 'lastName',
            name: t('Last Name'),
            sort: true,
            width: '20%',
        },
        {
            id: 'email',
            name: t('Email'),
            sort: true,
            formatter: (email: string) =>
                _(
                    <Link href={'#'} className='link'>
                        {email}
                    </Link>
                ),
            width: '30%',
        },
        {
            id: 'department',
            name: t('Department'),
            sort: true,
            width: '15%',
        },
    ]

    const data: UserType[] = []

    return (
        <>
            <Modal size='lg' centered show={show} onHide={() => setShow(false)} aria-label='Search Users Modal'>
                <Modal.Header closeButton>
                    <Modal.Title id='user-modal'>{t('Search Users')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Col>
                            <Row className='mb-3'>
                                <Col xs={6}>
                                    <Form.Control type='text' placeholder={t('Enter search text')} />
                                </Col>
                                <Col xs={6}>
                                    <Button variant='secondary' className='me-2'>
                                        {t('Search')}
                                    </Button>
                                    <Button variant='secondary'>{t('Reset')}</Button>
                                </Col>
                            </Row>
                        </Col>
                    </Form>
                    <Row>
                        <Table
                            columns={columns}
                            data={data.map((data) => [
                                data.userId,
                                data.givenName,
                                data.lastName,
                                data.email,
                                data.department,
                            ])}
                        />
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant='dark' onClick={() => setShow(false)}>
                        {t('Close')}
                    </Button>
                    <Button
                        variant='primary'
                        onClick={() => {
                            setShow(false)
                        }}
                    >
                        {t('Select Users')}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}
