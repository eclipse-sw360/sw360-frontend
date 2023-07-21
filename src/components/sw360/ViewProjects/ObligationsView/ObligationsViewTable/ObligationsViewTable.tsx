// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

"use client"

import { Nav, Tab } from "react-bootstrap"

export default function ObligationsViewTable() {
    return (
        <>
            <Tab.Container id="views-tab" defaultActiveKey="license-obligation">
                <Nav variant="tabs" className="d-inline-flex">
                    <Nav.Item>
                        <Nav.Link eventKey="license-obligation">License Obligation</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="component-obligation">Component Obligation</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="project-obligation">Project Obligation</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="organisation-obligation">Organisation Obligation</Nav.Link>
                    </Nav.Item>
                </Nav>
                <Tab.Content className="mt-3">
                    <Tab.Pane eventKey="license-obligation">License Obligation</Tab.Pane>
                    <Tab.Pane eventKey="component-obligation">Component Obligation</Tab.Pane>
                    <Tab.Pane eventKey="project-obligation">Project Obligation</Tab.Pane>
                    <Tab.Pane eventKey="organisation-obligation">Organisation Obligation</Tab.Pane>
                </Tab.Content>
            </Tab.Container>
        </>
    )
}