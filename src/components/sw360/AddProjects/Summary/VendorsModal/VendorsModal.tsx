import { Modal, Form, Row, Col, Button } from "react-bootstrap"
import styles from './VendorModal.module.css'

export default function VendorsModal({ show, setShow }: {
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
                aria-labelledby="Link Projects Modal"
            >
                <Modal.Header closeButton>
                    <Modal.Title id="link-projects-modal">
                        Search Vendor
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Col>
                            <Row className="mb-3">
                                <Col xs={6}>
                                    <Form.Control type="text" placeholder="Enter Search  Text..." />
                                </Col>
                                <Col xs={2}>
                                    <Button type="submit" variant="light" className={`fw-bold ${styles['button-plain']}`}>Search</Button>                            
                                </Col>
                            </Row>
                        </Col>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="light" onClick={() => setShow(false)} className={`fw-bold ${styles['button-plain']}`}>Close</Button>
                    <Button variant="light" onClick={() => { setShow(false) }} className={`fw-bold ${styles['button-plain']}`}>Add Vendor</Button>
                    <Button variant="primary" onClick={() => { setShow(false) }} className={`fw-bold ${styles['button-orange']}`}>Select Vendor</Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}