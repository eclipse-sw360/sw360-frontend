"use client"

import { Modal, Button } from "react-bootstrap"
import { FaRegQuestionCircle } from "react-icons/fa"
import styles from "./DeleteProjectModal.module.css"

export default function DeleteProjectModal({ show, setShow }: {
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
                aria-labelledby="Delete Project Modal"
            >
                <Modal.Header className={`${styles["deletion-header"]}`} closeButton>
                    <Modal.Title id="delete-project-modal" className={`${styles["deletion-title"]}`}>
                        <FaRegQuestionCircle/> Delete Project?
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="row mb-2">
                        <p>Do you really want to delete the project ?</p>
                    </div>
                    <div className="row mb-2">
                        <p className="mb-0">This project contains:</p>
                        <div className="row ms-4">
                            <ul>
                                <li>51 linked releases</li>
                            </ul>
                        </div>
                    </div>
                    <hr className="my-2" />
                    <div className="mb-2 row mx-2">
                        <label htmlFor="moderationRequest" className="form-label px-0">Please comment your changes</label>
                        <textarea className="form-control" aria-label="Moderation Request Comments" id="moderationRequest" placeholder="Comment your request..." style={{height: "120px"}}></textarea>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShow(false)}>Cancel</Button>
                    <Button variant="danger" onClick={() => setShow(false)}>Delete Project</Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}