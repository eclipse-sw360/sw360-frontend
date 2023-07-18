"use client"

import { Modal, Form, Button } from "react-bootstrap"
import { FiEdit2 } from "react-icons/fi"

export default function ModerationRequestModal({ show, setShow }: {
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
                aria-labelledby="Moderation Request Modal"
            >
                <Modal.Header closeButton>
                    <Modal.Title id="moderation-request-modal">
                        <FiEdit2/> Create Moderation Request
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="mb-2 row mx-2">
                        <label htmlFor="moderationRequest" className="form-label px-0">Please comment your changes</label>
                        <textarea className="form-control" aria-label="Moderation Request Comments" id="moderationRequest"></textarea>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="light" onClick={() => setShow(false)} className={`fw-bold button-plain`}>Cancel</Button>
                    <Button variant="primary" onClick={() => { setShow(false) }} className={`fw-bold button-orange`}>Send Moderation Request</Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}