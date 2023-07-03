import { Form, Modal, Button, FloatingLabel } from "react-bootstrap"
import { BsQuestionCircle } from 'react-icons/bs'
import styles from './DeleteModal.module.css'
 
export default function DeleteModal({ setShow, show } : {
    show: boolean,
    setShow: (show: boolean) => void
}) {
    return (
        <>
            <Modal 
                show={show} 
                onHide={() => setShow(false)}
                backdrop="static"
                centered
                size="lg"
            >
                <Modal.Header className={`${styles["delete-title"]}`} closeButton>
                <Modal.Title>< BsQuestionCircle /> Delete Project</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Do you really want to delete the project -<span className="fw-bold">{'xyz'}</span>?</p>
                    <p>This project -<span className="fw-bold">{'xyz'}</span> contains:</p>
                    <ul>
                        <li>{40} linked releases </li>
                    </ul>
                    <hr />
                    <Form>
                        <Form.Group className="mb-3" controlId="change-comment">
                            <Form.Label className="fw-bold">Please comment your changes</Form.Label>
                            <Form.Control as="textarea" placeholder="Comment your request..." style={{ height: '150px' }} />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="light" onClick={() => setShow(false)} className={`fw-bold ${styles['button-plain']}`}>Cancel</Button>
                    <Button variant="danger" onClick={() => setShow(false)} className={`fw-bold ${styles['button-plain']}`}>Delete Project</Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}