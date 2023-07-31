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

interface releaseData {
    releaseId: string;
    vendor: string;
    componentName: string;
    releaseVersion: string;
    clearingState: string;
    mainlineState: string;
}

export default function LinkReleasesModal({ show, setShow }: {
    show: boolean,
    setShow: (show: boolean) => void
}) {

    const columns = [
        {
          id: 'selectReleaseCheckbox',
          name: '',
          formatter: (releaseId: string) =>
          _(
                <div className="form-check">
                    <input className="form-check-input" type="checkbox" value="" id={releaseId}/>
                </div>
          )
        },
        {
            id: 'vendor',
            name: 'Vendor',
            sort: true
        },
        {
            id: 'componentName',
            name: 'Component Name',
            sort: true
        },
        {
            id: 'releaseVersion',
            name: 'Release Version',
            sort: true
        },
        {
            id: 'clearingState',
            name: 'Clearing State',
            sort: true
        },
        {
            id: 'mainlineState',
            name: 'Mainline State',
            sort: true
        }
    ]

    const data: releaseData[] = [
        { releaseId:"1", vendor:"jhdsrv", componentName:"biwe8by", releaseVersion:"nci7we5bcgy", clearingState: "verv", mainlineState: "niq3g74bfc"}
    ]

    return (
        <>
            <Modal
                size="lg"
                centered
                show={show}
                onHide={() => setShow(false)}
                aria-labelledby="Linked Releases Modal"
                scrollable
            >
                <Modal.Header closeButton>
                    <Modal.Title id="linked-projects-modal">
                        Link Releases
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{overflowX:"scroll"}}>
                    <Form>
                        <Col>
                            <Row className="mb-3">
                                <Col xs={6}>
                                    <Form.Control type="text" placeholder="Enter Search  Text..." />
                                </Col>
                                <Col xs="auto">
                                    <Button type="submit" variant="secondary">Search</Button>                            
                                </Col>
                                <Col xs="auto">
                                <Button type="submit" variant="secondary">Releases of linked projects</Button>                            
                                </Col>
                            </Row>
                            <Row>
                                <Form.Group controlId="exact-match-group">
                                    <Form.Check
                                            inline
                                            name="exact-match"
                                            type="checkbox"
                                            id="exact-match"
                                    />
                                    <Form.Label>Exact Match <sup>< FaInfoCircle /></sup></Form.Label>
                                </Form.Group>
                            </Row>
                            <Row>
                                <Table
                                    columns={columns}
                                    data={data.map((data, i) => [data.releaseId, data.componentName, data.releaseVersion, data.clearingState, data.clearingState, data.mainlineState])}
                                />
                            </Row>
                        </Col>
                    </Form>
                    <Row>
                        {/* <Grid
                            data={data}
                            columns={columns}
                        /> */}
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="dark" onClick={() => setShow(false)}>Close</Button>
                    <Button variant="primary" onClick={() => { setShow(false) }}>Link Releases</Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}