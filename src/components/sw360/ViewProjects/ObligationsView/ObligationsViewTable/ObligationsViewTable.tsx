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