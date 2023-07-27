// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

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
                        <p>Do you really want to delete the project <span className="fw-bold">{"@building-x/2d-geo-viewer-ng (2023-03-09 5:00 UTC 2.1.x)"}</span>?</p>
                    </div>
                    <div className="row mb-2">
                        <p className="mb-0">This project <span className="fw-bold">{"@building-x/2d-geo-viewer-ng (2023-03-09 5:00 UTC 2.1.x)"}</span> contains:</p>
                        <div className="row ms-4">
                            <ul>
                                <li>51 linked releases</li>
                            </ul>
                        </div>
                    </div>
                    <hr className="my-2" />
                    <div className="mb-2 row mx-2">
                        <label htmlFor="moderationRequest" className="form-label fw-medium px-0">Please comment your changes</label>
                        <textarea className="form-control" aria-label="Moderation Request Comments" id="moderationRequest" placeholder="Comment your request..." style={{height: "120px"}}></textarea>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="dark" onClick={() => setShow(false)}>Cancel</Button>
                    <Button variant="danger" onClick={() => setShow(false)}>Delete Project</Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}