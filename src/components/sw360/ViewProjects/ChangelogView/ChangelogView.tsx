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