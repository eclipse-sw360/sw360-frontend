// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

"use client"

import { Col, Row, ListGroup, Tab, Container, Button } from 'react-bootstrap'
import styles from '../projects.module.css'
import { Summary, Administration,  LinkedProjects } from "@/components/sw360"

export default function AddProjects() {
    return (
        <>
            <Container className="mt-2">
                <Tab.Container defaultActiveKey="#summary">
                    <Row>
                        <Col sm={3}>
                            <ListGroup>
                                <ListGroup.Item action href="#summary">
                                    Summary
                                </ListGroup.Item>
                                <ListGroup.Item action href="#administration">
                                    Administration
                                </ListGroup.Item>
                                <ListGroup.Item action href="#linkedProjects">
                                    Linked Projects and Releases
                                </ListGroup.Item>
                            </ListGroup>
                        </Col>
                        <Col sm={9}>
                            <Row>
                                <Button variant="primary" className={`${styles['button-orange']} me-2 col-lg-2 fw-bold`}>Create Project</Button>
                                <Button variant="light" className={`${styles['button-plain']} col-lg-2 fw-bold`}>Cancel</Button>
                            </Row>
                            <Row className="mt-5">
                                <Tab.Content>
                                    <Tab.Pane eventKey="#summary"><Summary/></Tab.Pane>
                                    <Tab.Pane eventKey="#administration"><Administration/></Tab.Pane>
                                    <Tab.Pane eventKey="#linkedProjects"><LinkedProjects/></Tab.Pane>
                                </Tab.Content>
                            </Row>
                        </Col>
                    </Row>
                </Tab.Container>
            </Container>
        </>
    )
}
