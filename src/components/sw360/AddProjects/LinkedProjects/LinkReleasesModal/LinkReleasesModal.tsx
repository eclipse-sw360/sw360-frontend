import { Modal, Form, Row, Col, Button } from "react-bootstrap"
import styles from "../../AddProjects.module.css"
import { FaInfoCircle } from "react-icons/fa"

export default function LinkedReleasesModal({ show, setShow }: {
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
                        Link Releases
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
                                    <Button type="submit" variant="light" className={`fw-bold ${styles['button-plain']} w-100`}>Search</Button>                            
                                </Col>
                                <Col ls={3}>
                                <Button type="submit" variant="light" className={`fw-bold ${styles['button-plain']}`}>Releases of linked projects</Button>                            
                                </Col>
                            </Row>
                            <Row>
                                <Form.Group controlId="exact-match-group">
                                    <Form.Check
                                            inline
                                            name="exact-match"
                                            type="checkbox"
                                            id="exact-match"
                                    />
                                    <Form.Label>Exact Match <sup>< FaInfoCircle /></sup></Form.Label>
                                </Form.Group>
                            </Row>
                        </Col>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="light" onClick={() => setShow(false)} className={`fw-bold ${styles['button-plain']}`}>Close</Button>
                    <Button variant="primary" onClick={() => { setShow(false) }} className={`fw-bold ${styles['button-orange']}`}>Link Releases</Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}