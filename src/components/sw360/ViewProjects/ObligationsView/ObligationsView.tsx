"use client"

import { Nav, Dropdown, Tab } from "react-bootstrap"
import ObligationsViewTable from "./ObligationsViewTable/ObligationsViewTable"

export default function ObligationsView() {
    return (
        <>
        <Tab.Container id="views-tab" defaultActiveKey="obligations-view">
            <div className="row">
                <div className="col-auto ps-0">
                    <Nav variant="pills" className="d-inline-flex">
                        <Nav.Item>
                            <Nav.Link eventKey="obligations-view">Obligations View</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="release-view">Release View</Nav.Link>
                        </Nav.Item>
                    </Nav>
                </div>
                <div className='btn-group col-lg-3' role='group'>
                    <Dropdown>
                        <Dropdown.Toggle variant='secondary' id='project-export'>
                            Export Spreadsheet
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item>Projects only</Dropdown.Item>
                            <Dropdown.Item>Projects with sub projects</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </div>
            <Tab.Content className="mt-3">
                <Tab.Pane eventKey="obligations-view"><ObligationsViewTable/></Tab.Pane>
                <Tab.Pane eventKey="release-view">Release View Table</Tab.Pane>
            </Tab.Content>
        </Tab.Container>
        </>
    )
}