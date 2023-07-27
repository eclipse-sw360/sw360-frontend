// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

"use client"

import { Modal } from "react-bootstrap"
import { Button } from "react-bootstrap"
import styles from "./WarningModal.module.css"
import { AiOutlineWarning } from 'react-icons/ai'

export default function Warningmodal({ setShow, show } : {
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
                <Modal.Header className={`${styles["warning-title"]}`} closeButton>
                <Modal.Title>< AiOutlineWarning />Warning</Modal.Title>
                </Modal.Header>
                <Modal.Body>{"You don't have "}<span className="fw-medium">{"Write"}</span> {"access to the project!"}</Modal.Body>
                <Modal.Footer>
                    <Button variant="dark" onClick={() => setShow(false)} className="fw-bold">Ok</Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}