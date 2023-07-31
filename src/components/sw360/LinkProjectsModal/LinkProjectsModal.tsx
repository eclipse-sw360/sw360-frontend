// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

"use client"

import { Modal, Form, Row, Col, Button } from "react-bootstrap"
import { FaInfoCircle } from "react-icons/fa"
import Link from "next/link"
import { _, Table } from "@/components/sw360"

interface projectData {
    projectId: string;
    projectName: string;
    version: string;
    state: string;
    responsible: string;
    description: string;
}

export default function LinkedProjectsModal({ show, setShow }: {
    show: boolean,
    setShow: (show: boolean) => void
}) {

    const data: projectData[] = [
        { projectId:'1', projectName: 'Reuse: QtControlLib (V04.02)', version: 'V04.02', state: '', responsible: 'oleksandr.pochayevets@siemens.com', description:'The widgets(controls) are based on the Qt provided controls thus serving as wrapper of the native Qt widgets while at the same time providing additional E D EA specific functionality. Therefore the widgets of this library shall be used rather than direct usage ot Qt widgets. Additionally there are widgets added that do not exist as standard widgets in QT or Windows. At least, there are some helper classes for creating models and business logic with Qt. (ClearCase, VS2017)' },
        { projectId:'2', projectName: 'Reuse: QtControlLib (V04.02)', version: 'V04.02', state: '', responsible: 'oleksandr.pochayevets@siemens.com', description:'The widgets(controls) are based on the Qt provided controls thus serving as wrapper of the native Qt widgets while at the same time providing additional E D EA specific functionality. Therefore the widgets of this library shall be used rather than direct usage ot Qt widgets. Additionally there are widgets added that do not exist as standard widgets in QT or Windows. At least, there are some helper classes for creating models and business logic with Qt. (ClearCase, VS2017)' },
        { projectId:'3', projectName: 'Reuse: QtControlLib (V04.02)', version: 'V04.02', state: '', responsible: 'oleksandr.pochayevets@siemens.com', description:'The widgets(controls) are based on the Qt provided controls thus serving as wrapper of the native Qt widgets while at the same time providing additional E D EA specific functionality. Therefore the widgets of this library shall be used rather than direct usage ot Qt widgets. Additionally there are widgets added that do not exist as standard widgets in QT or Windows. At least, there are some helper classes for creating models and business logic with Qt. (ClearCase, VS2017)' },
        { projectId:'4', projectName: 'Reuse: QtControlLib (V04.02)', version: 'V04.02', state: '', responsible: 'oleksandr.pochayevets@siemens.com', description:'The widgets(controls) are based on the Qt provided controls thus serving as wrapper of the native Qt widgets while at the same time providing additional E D EA specific functionality. Therefore the widgets of this library shall be used rather than direct usage ot Qt widgets. Additionally there are widgets added that do not exist as standard widgets in QT or Windows. At least, there are some helper classes for creating models and business logic with Qt. (ClearCase, VS2017)' },
        { projectId:'5', projectName: 'Reuse: QtControlLib (V04.02)', version: 'V04.02', state: '', responsible: 'oleksandr.pochayevets@siemens.com', description:'The widgets(controls) are based on the Qt provided controls thus serving as wrapper of the native Qt widgets while at the same time providing additional E D EA specific functionality. Therefore the widgets of this library shall be used rather than direct usage ot Qt widgets. Additionally there are widgets added that do not exist as standard widgets in QT or Windows. At least, there are some helper classes for creating models and business logic with Qt. (ClearCase, VS2017)' },
        { projectId:'6', projectName: 'Reuse: QtControlLib (V04.02)', version: 'V04.02', state: '', responsible: 'oleksandr.pochayevets@siemens.com', description:'The widgets(controls) are based on the Qt provided controls thus serving as wrapper of the native Qt widgets while at the same time providing additional E D EA specific functionality. Therefore the widgets of this library shall be used rather than direct usage ot Qt widgets. Additionally there are widgets added that do not exist as standard widgets in QT or Windows. At least, there are some helper classes for creating models and business logic with Qt. (ClearCase, VS2017)' },
        { projectId:'7', projectName: 'Reuse: QtControlLib (V04.02)', version: 'V04.02', state: '', responsible: 'oleksandr.pochayevets@siemens.com', description:'The widgets(controls) are based on the Qt provided controls thus serving as wrapper of the native Qt widgets while at the same time providing additional E D EA specific functionality. Therefore the widgets of this library shall be used rather than direct usage ot Qt widgets. Additionally there are widgets added that do not exist as standard widgets in QT or Windows. At least, there are some helper classes for creating models and business logic with Qt. (ClearCase, VS2017)' },
        { projectId:'8', projectName: 'Reuse: QtControlLib (V04.02)', version: 'V04.02', state: '', responsible: 'oleksandr.pochayevets@siemens.com', description:'The widgets(controls) are based on the Qt provided controls thus serving as wrapper of the native Qt widgets while at the same time providing additional E D EA specific functionality. Therefore the widgets of this library shall be used rather than direct usage ot Qt widgets. Additionally there are widgets added that do not exist as standard widgets in QT or Windows. At least, there are some helper classes for creating models and business logic with Qt. (ClearCase, VS2017)' },
        { projectId:'9', projectName: 'Reuse: QtControlLib (V04.02)', version: 'V04.02', state: '', responsible: 'oleksandr.pochayevets@siemens.com', description:'The widgets(controls) are based on the Qt provided controls thus serving as wrapper of the native Qt widgets while at the same time providing additional E D EA specific functionality. Therefore the widgets of this library shall be used rather than direct usage ot Qt widgets. Additionally there are widgets added that do not exist as standard widgets in QT or Windows. At least, there are some helper classes for creating models and business logic with Qt. (ClearCase, VS2017)' },
        { projectId:'10', projectName: 'Reuse: QtControlLib (V04.02)', version: 'V04.02', state: '', responsible: 'oleksandr.pochayevets@siemens.com', description:'The widgets(controls) are based on the Qt provided controls thus serving as wrapper of the native Qt widgets while at the same time providing additional E D EA specific functionality. Therefore the widgets of this library shall be used rather than direct usage ot Qt widgets. Additionally there are widgets added that do not exist as standard widgets in QT or Windows. At least, there are some helper classes for creating models and business logic with Qt. (ClearCase, VS2017)' }
    ]

    const columns = [
        {
          id: 'selectProjectCheckbox',
          name: '',
          formatter: (projectId: string) =>
          _(
                <div className="form-check">
                    <input className="form-check-input" type="checkbox" value="" id={projectId}/>
                </div>
          )
        },
        {
            id: 'projectName',
            name: 'Project Name',
            sort: true,
            width: '40%'
        },
        {
            id: 'version',
            name: 'Version',
            sort: true,
            width: '30%'
        },
        {
            id: 'state',
            name: 'State',
            sort: true
        },
        {
            id: 'responsible',
            name: 'Responsible',
            formatter: (email: string) =>
            _(
                <Link href={"#"} className='link'>
                    {email}
                </Link>
            ),
            sort: true,
            width: '40%'
        },
        {
            id: 'description',
            name: 'Description',
            sort: true,
            width: '80%'
        }
    ]

    return (
        <>
            <Modal
                size="lg"
                centered
                show={show}
                onHide={() => setShow(false)}
                aria-labelledby="Linked Projects Modal"
                scrollable
            >
                <Modal.Header closeButton>
                    <Modal.Title id="linked-projects-modal">
                        Link Projects
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{overflowX:"scroll"}}>
                <Form>
                        <Col>
                            <Row className="mb-3">
                                <Col xs={6}>
                                    <Form.Control type="text" placeholder="Enter Search Text..." />
                                </Col>
                                <Col xs="auto">
                                    <Form.Group controlId="exact-match-group">
                                        <Form.Check
                                                inline
                                                name="exact-match"
                                                type="checkbox"
                                                id="exact-match"
                                        />
                                        <Form.Label className="pt-2">Exact Match <sup>< FaInfoCircle /></sup></Form.Label>
                                    </Form.Group>
                                </Col>
                                <Col xs="auto">
                                    <Button type="submit" variant="secondary">Search</Button>                            
                                </Col>
                            </Row>
                            <Row>
                                <Table
                                    columns={columns}
                                    data={data.map((data) => [data.projectId, data.projectName, data.version, data.state, data.responsible, data.description])}
                                />
                            </Row>
                        </Col>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="dark" onClick={() => setShow(false)}>Close</Button>
                    <Button variant="primary" onClick={async () => { 
                        setShow(false) 
                    }}>Link Projects</Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}