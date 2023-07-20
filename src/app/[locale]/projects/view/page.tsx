// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

"use client"

import { Col, Row, ListGroup, Tab, Container, Button } from 'react-bootstrap'
import { SummaryView, AdministrationView, LinkProjectsModal, 
            LicenseClearingView, ObligationsView, ECCView,
            VulnerabilityStatusView, AttachmentsView, VulnerabilitiesView,
            ChangelogView } from "@/components/sw360"
import { useState } from 'react'

export default function ViewProjects() {

    const [showLinkProjectsModal, setShowLinkProjectsModal] = useState(false)

    return (
        <>
            <LinkProjectsModal show={showLinkProjectsModal} setShow={setShowLinkProjectsModal} />
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
                        <Col sm={9} className="ps-2">
                            <Row>
                                <Row className="d-flex justify-content-between">
                                <Col lg={4}>
                                    <Row>
                                        <Button variant="primary" className="me-2 col-auto">Edit Projects</Button>
                                        <Button variant="secondary" className="col-auto" onClick={() => setShowLinkProjectsModal(true)}>Link to Projects</Button>
                                    </Row>
                                </Col>
                                <Col lg={4} className="text-truncate buttonheader-title">
                                    {"-DICOMQUERYRETRIEVESCU (VANADIUM52)"}
                                </Col>
                            </Row>
                            </Row>
                            <Row className="mt-3">
                                <Tab.Content>
                                    <Tab.Pane eventKey="summary"><SummaryView/></Tab.Pane>
                                    <Tab.Pane eventKey="administration"><AdministrationView/></Tab.Pane>
                                    <Tab.Pane eventKey="licenseClearing"><LicenseClearingView/></Tab.Pane>
                                    <Tab.Pane eventKey="obligations"><ObligationsView/></Tab.Pane>
                                    <Tab.Pane eventKey="ecc"><ECCView/></Tab.Pane>
                                    <Tab.Pane eventKey="vulnerabilityTrackingStatus"><VulnerabilityStatusView/></Tab.Pane>
                                    <Tab.Pane eventKey="attachments"><AttachmentsView/></Tab.Pane>
                                    <Tab.Pane eventKey="attachmentUsages">Tab 8</Tab.Pane>
                                    <Tab.Pane eventKey="vulnerabilities"><VulnerabilitiesView/></Tab.Pane>
                                    <Tab.Pane eventKey="changeLog"><ChangelogView/></Tab.Pane>
                                </Tab.Content>
                            </Row>
                        </Col>
                    </Row>
                </Tab.Container>
            </Container>
        </>
    )
}
