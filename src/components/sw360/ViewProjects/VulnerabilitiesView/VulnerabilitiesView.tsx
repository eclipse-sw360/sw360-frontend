// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

"use client"

import { Nav, Dropdown, Tab } from "react-bootstrap"
import { useState } from "react"
import VulnerabilityTab from "./VulnerabilityTab/VulnerabilityTab"

export default function VulnerabilitiesView() {

    const DEFAULT_VULNERABILITIES = 200
    const security_vulnerabilities_display = "enabled"
    const [num, SetNum] = useState<string|number>(DEFAULT_VULNERABILITIES)

    const packages = [
        {
            id: 1,
            name: "@data/users-dms-sdk (0.10.0)"
        }
    ]

    return (
        <>
            <div className='btn-group col-lg-3 mb-2 row' role='group'>
                <Dropdown className="px-0">
                    <Dropdown.Toggle variant='secondary' id='project-export'>
                        {typeof(num)==="number"?`Show latest ${num}`:`Show ${num}`}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item onClick={() => SetNum(200)}>200</Dropdown.Item>
                        <Dropdown.Item onClick={() => SetNum(500)}>500</Dropdown.Item>
                        <Dropdown.Item onClick={() => SetNum(1000)}>1000</Dropdown.Item>
                        <Dropdown.Item onClick={() => SetNum("All")}>All</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </div>
            <Tab.Container id="views-tab" defaultActiveKey={packages.length===0?"":packages[0].name}>
                <div className="row">
                    <Nav variant="tabs" className="d-inline-flex">
                        {
                            packages.map((elem, i) => {
                                return (
                                    <>
                                        <Nav.Item  key={elem.id}>
                                            <Nav.Link eventKey={elem.name}>{elem.name}</Nav.Link>
                                        </Nav.Item>
                                    </>
                                )
                            })
                        }
                    </Nav>
                </div>
                <Tab.Content className="mt-3">
                    {
                        packages.map((elem, i) => {
                            return (
                                <>
                                    <Tab.Pane key={elem.id} eventKey={elem.name}><VulnerabilityTab security_vulnerabilities_display={security_vulnerabilities_display}/></Tab.Pane>
                                </>
                            )
                        })
                    }
                </Tab.Content>
            </Tab.Container>
        </>
    )
}