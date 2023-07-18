// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

"use client"

import { Col, Row, ListGroup, Tab, Container, Button } from 'react-bootstrap'
import { Summary, Administration, LinkedProjects, ModerationRequestModal, DeleteProjectModal } from "@/components/sw360"
import { useState } from 'react'

export default function EditProjects() {

    const [showRequestModerationModal, setShowRequestModerationModal] = useState(false)
    const [showDeleteProjectModal, setShowDeleteProjectModal] = useState(false)

    return (
        <>
            <ModerationRequestModal show={showRequestModerationModal} setShow={setShowRequestModerationModal}/>
            <DeleteProjectModal show={showDeleteProjectModal} setShow={setShowDeleteProjectModal}/>
            <Container className="mt-2">
                <Tab.Container defaultActiveKey="summary">
                    <Row>
                        <Col sm={3}>
                            <ListGroup>
                                <ListGroup.Item action eventKey="summary">
                                    Summary
                                </ListGroup.Item>
                                <ListGroup.Item action eventKey="administration">
                                    Administration
                                </ListGroup.Item>
                                <ListGroup.Item action eventKey="linkedProjects">
                                    Linked Projects and Releases
                                </ListGroup.Item>
                                <ListGroup.Item action eventKey="attachments">
                                    Attachments
                                </ListGroup.Item>
                            </ListGroup>
                        </Col>
                        <Col sm={9}>
                            <Row>
                                <Button variant="primary" className={`button-orange me-2 col-lg-3 fw-bold`} onClick={() => setShowRequestModerationModal(true)}>Update Project</Button>
                                <Button variant="danger" className={`col-lg-3 fw-bold  me-2`} onClick={() => setShowDeleteProjectModal(true)}>Delete Project</Button>
                                <Button variant="light" className={`button-plain col-lg-2 fw-bold`}>Cancel</Button>
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
            </Container>
        </>
    )
}
