// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

"use client"

import { Col, Row, ListGroup, Tab, Container, Button } from 'react-bootstrap'
import styles from '../projects.module.css'
import { SummaryView, AdministrationView, LinkedProjects } from "@/components/sw360"

export default function EditProjects() {
    return (
        <>
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
                                <ListGroup.Item action eventKey="licenseClearing">
                                    License Clearing
                                </ListGroup.Item>
                                <ListGroup.Item action eventKey="obligations">
                                    Obligations
                                </ListGroup.Item>
                                <ListGroup.Item action eventKey="ecc">
                                    ECC
                                </ListGroup.Item>
                                <ListGroup.Item action eventKey="vulnerabilityTrackingStatus">
                                    Vulnerability Tracking Status
                                </ListGroup.Item>
                                <ListGroup.Item action eventKey="attachments">
                                    Attachments
                                </ListGroup.Item>
                                <ListGroup.Item action eventKey="attachmentUsages">
                                    Attachment Usages
                                </ListGroup.Item>
                                <ListGroup.Item action eventKey="vulnerabilities">
                                    Vulnerabilities
                                </ListGroup.Item>
                                <ListGroup.Item action eventKey="changeLog">
                                    Change Log
                                </ListGroup.Item>
                            </ListGroup>
                        </Col>
                        <Col sm={9}>
                            <Row>
                                <Button variant="primary" className={`${styles['button-orange']} me-2 col-lg-3 fw-bold`}>Edit Projects</Button>
                                <Button variant="light" className={`${styles['button-plain']} col-lg-3 fw-bold`}>Link to Projects</Button>
                            </Row>
                            <Row className="mt-5">
                                <Tab.Content>
                                    <Tab.Pane eventKey="summary"><SummaryView/></Tab.Pane>
                                    <Tab.Pane eventKey="administration"><AdministrationView/></Tab.Pane>
                                    <Tab.Pane eventKey="licenseClearing"><LinkedProjects/></Tab.Pane>
                                    <Tab.Pane eventKey="obligations"><SummaryView/></Tab.Pane>
                                    <Tab.Pane eventKey="ecc"><AdministrationView/></Tab.Pane>
                                    <Tab.Pane eventKey="vulnerabilityTrackingStatus"><LinkedProjects/></Tab.Pane>
                                    <Tab.Pane eventKey="attachments"><SummaryView/></Tab.Pane>
                                    <Tab.Pane eventKey="attachmentUsages"><AdministrationView/></Tab.Pane>
                                    <Tab.Pane eventKey="vulnerabilities"><LinkedProjects/></Tab.Pane>
                                    <Tab.Pane eventKey="changeLog"><SummaryView/></Tab.Pane>
                                </Tab.Content>
                            </Row>
                        </Col>
                    </Row>
                </Tab.Container>
            </Container>
        </>
    )
}
