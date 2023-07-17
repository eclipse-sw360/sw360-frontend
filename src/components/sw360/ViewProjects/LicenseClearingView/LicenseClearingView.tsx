"use client"

import { Nav, Dropdown,Tab } from "react-bootstrap"

export default function LicenseClearingView() {
    return (
        <>
            <Tab.Container id="views-tab" defaultActiveKey="tree-view">
                <div className="row">
                    <div className="col-auto ps-0">
                        <Nav variant="pills" className="d-inline-flex">
                            <Nav.Item>
                                <Nav.Link eventKey="tree-view">Tree View</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="list-view">List View</Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </div>
                    <div className='col-lg-3'>
                        <Dropdown>
                            <Dropdown.Toggle variant='secondary' id='project-export'>
                                Export Spreadsheet
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item>Projects only</Dropdown.Item>
                                <Dropdown.Item>Projects with linked releases</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                    <div className='btn-group col-lg-5' role='group'>
                        <Dropdown>
                            <Dropdown.Toggle variant='secondary' id='project-export'>
                                Generate License Info
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item>Projects only</Dropdown.Item>
                                <Dropdown.Item>Projects with sub project</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                        <Dropdown>
                            <Dropdown.Toggle variant='secondary' id='project-export'>
                                Generate Source Code bundle
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item>Projects only</Dropdown.Item>
                                <Dropdown.Item>Projects with sub project</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                    <div className="row mt-2">
                        <button type="button" className="btn btn-secondary col-lg-4" disabled={true}>Create Clearing Request</button>
                    </div>
                </div>
                <Tab.Content className="mt-3">
                    <Tab.Pane eventKey="tree-view">Tree View Table</Tab.Pane>
                    <Tab.Pane eventKey="list-view">List View Table</Tab.Pane>
                </Tab.Content>
            </Tab.Container>
        </>
    )
}