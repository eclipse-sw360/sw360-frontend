import { Modal, Form, Row, Col, Button } from "react-bootstrap"
import styles from "../../AddProjects.module.css"

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
                    <Button variant="light" onClick={() => setShow(false)} className={`fw-bold ${styles['button-plain']}`}>Close</Button>
                    <Button variant="primary" onClick={() => { setShow(false) }} className={`fw-bold ${styles['button-orange']}`}>Select</Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}