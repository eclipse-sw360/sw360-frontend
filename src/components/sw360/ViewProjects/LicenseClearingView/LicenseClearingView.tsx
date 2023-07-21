// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

"use client"

import { Nav, Dropdown, Tab, NavItem } from "react-bootstrap"

export default function LicenseClearingView() {
    return (
        <>
            <Tab.Container id="views-tab" defaultActiveKey="tree-view">
                <div className="row ps-0">
                    <Nav variant="pills" className="d-inline-flex ps-0">
                        <Nav.Item>
                            <Nav.Link eventKey="tree-view">Tree View</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="list-view">List View</Nav.Link>
                        </Nav.Item>
                        <Dropdown as={NavItem} className="mx-2">
                            <Dropdown.Toggle variant='secondary'>
                                Export Spreadsheet
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item>Projects only</Dropdown.Item>
                                <Dropdown.Item>Projects with linked releases</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                        <Dropdown>
                            <Dropdown.Toggle variant='secondary'>
                                Generate License Info
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item>Projects only</Dropdown.Item>
                                <Dropdown.Item>Projects with sub project</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                        <Dropdown>
                            <Dropdown.Toggle variant='secondary'>
                                Generate Source Code bundle
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item>Projects only</Dropdown.Item>
                                <Dropdown.Item>Projects with sub project</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </Nav>
                </div>
                <div className="row mt-2">
                    <button type="button" className="btn btn-secondary col-lg-3" disabled={true}>Create Clearing Request</button>
                </div>
                <Tab.Content className="mt-3">
                    <Tab.Pane eventKey="tree-view">Tree View Table</Tab.Pane>
                    <Tab.Pane eventKey="list-view">List View Table</Tab.Pane>
                </Tab.Content>
            </Tab.Container>
        </>
    )
}