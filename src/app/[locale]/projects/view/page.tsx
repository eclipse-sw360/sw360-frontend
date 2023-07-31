// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

"use client"

import { Col, Row, ListGroup, Tab, Button } from 'react-bootstrap'
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
                                <ListGroup.Item action eventKey="licenseClearing">
                                    <div className="my-2">License Clearing</div>
                                </ListGroup.Item>
                                <ListGroup.Item action eventKey="obligations">
                                    <div className="my-2">Obligations</div>
                                </ListGroup.Item>
                                <ListGroup.Item action eventKey="ecc">
                                    <div className="my-2">ECC</div>
                                </ListGroup.Item>
                                <ListGroup.Item action eventKey="vulnerabilityTrackingStatus">
                                    <div className="my-2">Vulnerability Tracking Status</div>
                                </ListGroup.Item>
                                <ListGroup.Item action eventKey="attachments">
                                    <div className="my-2">Attachments</div>
                                </ListGroup.Item>
                                <ListGroup.Item action eventKey="attachmentUsages">
                                    <div className="my-2">Attachment Usages</div>
                                </ListGroup.Item>
                                <ListGroup.Item action eventKey="vulnerabilities">
                                    <div className="my-2">Vulnerabilities</div>
                                </ListGroup.Item>
                                <ListGroup.Item action eventKey="changeLog">
                                    <div className="my-2">Change Log</div>
                                </ListGroup.Item>
                            </ListGroup>
                        </Col>
                        <Col className="ps-2 me-3">
                            <Row>
                                <Row className="d-flex justify-content-between">
                                <Col lg={4}>
                                    <Row>
                                        <Button variant="primary" className="me-2 col-auto">Edit Projects</Button>
                                        <Button variant="secondary" className="col-auto" onClick={() => setShowLinkProjectsModal(true)}>Link to Projects</Button>
                                    </Row>
                                </Col>
                                <Col lg={4} className="text-truncate buttonheader-title me-3">
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
            </div>
        </>
    )
}
