// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

"use client"

import { Modal, Form, Row, Col, Button } from "react-bootstrap"
import { FaInfoCircle } from "react-icons/fa"

export default function LinkedProjectsModal({ show, setShow }: {
    show: boolean,
    setShow: (show: boolean) => void
}) {
    return (
        <>
            <Modal
                size="lg"
                centered
                show={show}
                onHide={() => setShow(false)}
                aria-labelledby="Linked Projects Modal"
            >
                <Modal.Header closeButton>
                    <Modal.Title id="linked-projects-modal">
                        Link Projects
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                <Form>
                        <Col>
                            <Row className="mb-3">
                                <Col xs={6}>
                                    <Form.Control type="text" placeholder="Enter Search  Text..." />
                                </Col>
                                <Col xs={3}>
                                    <Form.Group controlId="exact-match-group">
                                        <Form.Check
                                                inline
                                                name="exact-match"
                                                type="checkbox"
                                                id="exact-match"
                                        />
                                        <Form.Label>Exact Match <sup>< FaInfoCircle /></sup></Form.Label>
                                    </Form.Group>
                                </Col>
                                <Col xs={2}>
                                    <Button type="submit" variant="secondary">Search</Button>
                                </Col>
                            </Row>
                        </Col>
                    </Form>

                </Modal.Body>
                <Modal.Footer>
                    <Button variant="dark" onClick={() => setShow(false)}>Close</Button>
                    <Button variant="primary" onClick={() => { setShow(false) }}>Link Projects</Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}
