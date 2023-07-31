// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

"use client"

import { Col, Row, ListGroup, Tab, Button } from 'react-bootstrap'
import { Summary, Administration, LinkedProjects, ModerationRequestModal, DeleteProjectModal } from "@/components/sw360"
import { useState } from 'react'

export default function EditProjects() {

    const [showRequestModerationModal, setShowRequestModerationModal] = useState(false)
    const [showDeleteProjectModal, setShowDeleteProjectModal] = useState(false)

    return (
        <>
            <ModerationRequestModal show={showRequestModerationModal} setShow={setShowRequestModerationModal}/>
            <DeleteProjectModal show={showDeleteProjectModal} setShow={setShowDeleteProjectModal}/>
            <div className="ms-5 mt-2">
                <Tab.Container defaultActiveKey="summary">
                    <Row>
                        <Col sm="auto" className="me-3">
                            <ListGroup>
                                <ListGroup.Item action eventKey="summary">
                                    <div className="my-2">Summary</div>
                                </ListGroup.Item>
                                <ListGroup.Item action eventKey="administration">
                                    <div className="my-2">Administration</div>
                                </ListGroup.Item>
                                <ListGroup.Item action eventKey="linkedProjects">
                                    <div className="my-2">Linked Projects and Releases</div>
                                </ListGroup.Item>
                                <ListGroup.Item action eventKey="attachments">
                                    <div className="my-2">Attachments</div>
                                </ListGroup.Item>
                            </ListGroup>
                        </Col>
                        <Col  className="me-3">
                            <Row className="d-flex justify-content-between">
                                <Col lg={5}>
                                    <Row>
                                        <Button variant="primary" className="me-2 col-auto" onClick={() => setShowRequestModerationModal(true)}>Update Project</Button>
                                        <Button variant="danger" className={`col-auto fw-bold me-2`} onClick={() => setShowDeleteProjectModal(true)}>Delete Project</Button>
                                        <Button variant="secondary" className="col-auto">Cancel</Button>
                                    </Row>
                                </Col>
                                <Col lg={4} className="text-truncate buttonheader-title me-3">
                                    {"-DICOMQUERYRETRIEVESCU (VANADIUM52)"}
                                </Col>
                            </Row>
                            <Row className="mt-5">
                                <Tab.Content>
                                    <Tab.Pane eventKey="summary"><Summary/></Tab.Pane>
                                    <Tab.Pane eventKey="administration"><Administration/></Tab.Pane>
                                    <Tab.Pane eventKey="linkedProjects"><LinkedProjects/></Tab.Pane>
                                    <Tab.Pane eventKey="attachments">Attachments</Tab.Pane>
                                </Tab.Content>
                            </Row>
                        </Col>
                    </Row>
                </Tab.Container>
            </div>
        </>
    )
}
