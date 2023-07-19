"use client"

import { Modal, Form, Row, Col, Button } from "react-bootstrap"

export default function DepartmentModal({ show, setShow }: {
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
                aria-labelledby="Search Department Modal"
            >
                <Modal.Header closeButton>
                    <Modal.Title id="department-modal">
                        Search Department
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Col>
                            <Row className="mb-3 d-flex justify-content-end">
                                <Col xs={6}>
                                    <Form.Control type="text"/>
                                </Col>                    
                            </Row>
                        </Col>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShow(false)}>Close</Button>
                    <Button variant="primary" onClick={() => { setShow(false) }}>Select</Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}