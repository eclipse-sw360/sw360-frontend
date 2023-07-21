// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

"use client"

import { Nav, Tab } from "react-bootstrap"

export default function ChangelogView() {
    return (
        <>
            <Tab.Container id="views-tab" defaultActiveKey="changelog">
                <div className="row">
                    <div className="col-auto ps-0">
                        <Nav variant="pills" className="d-inline-flex">
                            <Nav.Item>
                                <Nav.Link eventKey="changelog">Changelog</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="changes">Changes</Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </div>
                </div>
                <Tab.Content className="mt-3">
                    <Tab.Pane eventKey="changelog">Changelog</Tab.Pane>
                    <Tab.Pane eventKey="changes">Changes</Tab.Pane>
                </Tab.Content>
            </Tab.Container>
        </>
    )
}