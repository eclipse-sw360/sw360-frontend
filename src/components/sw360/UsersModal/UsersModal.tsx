// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

"use client"

import { Modal, Form, Row, Col, Button } from "react-bootstrap"
import { _, Table } from "@/components/sw360"
import Link from "next/link"

export default function UsersModal({ show, setShow }: {
    show: boolean,
    setShow: (show: boolean) => void
}) {

    const columns = [
        {
            id: 'selectUserRadio',
            name: '',
            formatter: (userId: string) =>
            _(
                  <div className="form-check">
                      <input className="form-check-input" type="radio" name="user" id={userId}/>
                  </div>
            ),
            width: "8%"
        },
        {
            id: 'givenName',
            name: 'Given Name',
            sort: true,
            width: "20%"
        },
        {
            id: 'lastName',
            name: 'Last Name',
            sort: true,
            width: "20%"
        },
        {
            id: 'email',
            name: 'Email',
            sort: true,
            formatter: (email: string) =>
            _(
                <Link href={"#"} className='link'>
                    {email}
                </Link>
            ),
            width: "30%"
        },
        {
            id: 'department',
            name: 'Department',
            sort: true,
            width: "15%"
        },
    ]

    const data = [
        { userId: "1", givenName: "Alexander", lastName: "D Amico", email: "alex.d-amico@siemens.com", department: "SI" },
        { userId: "2", givenName: "Adrian", lastName: "Saalfrank", email: "adrian.saalfrank@siemens.com", department: "SI" },
        { userId: "3", givenName: "Wen Tao", lastName: "Jing", email: "wentao.jing@siemens.com", department: "ADV" },
        { userId: "4", givenName: "Jeyakumar", lastName: "Aruchami", email: "jeyakumar.aruchami@siemens.com", department: "ADV" }
    ]

    return (
        <>
            <Modal
                size="lg"
                centered
                show={show}
                onHide={() => setShow(false)}
                aria-labelledby="Search Users Modal"
            >
                <Modal.Header closeButton>
                    <Modal.Title id="user-modal">
                        Search Users
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Col>
                            <Row className="mb-3">
                                <Col xs={6}>
                                    <Form.Control type="text" placeholder="Enter Search  Text..." />
                                </Col>
                                <Col xs={6}>
                                    <Button variant="secondary" className="me-2">Search</Button>      
                                    <Button variant="secondary">Reset</Button>     
                                </Col>                      
                            </Row>
                        </Col>
                    </Form>
                    <Row>
                        <Table
                            columns={columns}
                            data={data.map((data, i) => [data.userId, data.givenName, data.lastName, data.email, data.department])}
                        />
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="dark" onClick={() => setShow(false)}>Close</Button>
                    <Button variant="primary" onClick={() => { setShow(false) }}>Select Users</Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}