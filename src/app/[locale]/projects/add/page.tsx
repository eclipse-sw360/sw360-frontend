// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

"use client"

import { Col, Row, ListGroup, Tab, Button } from 'react-bootstrap'
import Summary from "./components/Summary/Summary"
import { useTranslations } from 'next-intl'
import { COMMON_NAMESPACE } from '@/object-types/Constants'

export default function AddProjects() {

    const t = useTranslations(COMMON_NAMESPACE)

    return (
        <>
            <div className="ms-5 mt-2">
                <Tab.Container defaultActiveKey="summary">
                    <Row>
                        <Col sm="auto" className="me-3">
                            <ListGroup>
                                <ListGroup.Item action eventKey="summary">
                                    <div className="my-2">{t('Summary')}</div>
                                </ListGroup.Item>
                                <ListGroup.Item action eventKey="administration">
                                    <div className="my-2">{t('Administration')}</div>
                                </ListGroup.Item>
                                <ListGroup.Item action eventKey="linkedProjects">
                                    <div className="my-2">{t('Linked Releases and Projects')}</div>
                                </ListGroup.Item>
                            </ListGroup>
                        </Col>
                        <Col className="me-3">
                            <Row className="d-flex justify-content-between">
                                <Col lg={3}>
                                    <Row>
                                        <Button variant="primary" className="me-2 col-auto">{t('Create Project')}</Button>
                                        <Button variant="secondary" className="col-auto">{t('Cancel')}</Button>
                                    </Row>
                                </Col>
                                <Col lg={4} className="text-truncate buttonheader-title">
                                    {t("New Project")}
                                </Col>
                            </Row>
                            <Row className="mt-5">
                                <Tab.Content>
                                    <Tab.Pane eventKey="summary"><Summary/></Tab.Pane>
                                    <Tab.Pane eventKey="administration"></Tab.Pane>
                                    <Tab.Pane eventKey="linkedProjects"></Tab.Pane>
                                </Tab.Content>
                            </Row>
                        </Col>
                    </Row>
                </Tab.Container>
            </div>
        </>
    )
}
