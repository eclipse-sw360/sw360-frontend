"use client"

import { Modal, Form, Row, Col, Button } from "react-bootstrap"

export default function UsersModal({ show, setShow }: {
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
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShow(false)}>Close</Button>
                    <Button variant="primary" onClick={() => { setShow(false) }}>Select Users</Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}