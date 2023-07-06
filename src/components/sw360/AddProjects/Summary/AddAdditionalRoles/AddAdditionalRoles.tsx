// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

"use client"

import styles from "./AddAdditionalRoles.module.css"
import RoleInput from "./AddAdditionalRoles.types"
import { Row, Col, Button, Form, Tooltip, OverlayTrigger } from "react-bootstrap"
import { MdDeleteOutline } from 'react-icons/md'

export default function AddAdditionalRoles({ inputList, setInputList } : {
    inputList: RoleInput[],
    setInputList: (inputList: RoleInput[]) => void
}) {

    const handleRemoveClick = (index: number) => {
        const list = [...inputList];
        list.splice(index, 1);
        setInputList(list);
    };

    const handleAddClick = () => {
        setInputList([...inputList, { role: "Stakeholder", email: "" }]);
    };

    return(
        <>
            <Row>
            {
                    inputList.map((elem, j) => {
                        return (
                            <Row className="mb-2" key="addAdditionalData">
                                <Col lg={6}>
                                    <Form.Select name="role" value={elem.role} defaultValue="Stakeholder" onChange={(e) => {         
                                                const { name, value } = e.target;
                                                const list: RoleInput[] = [...inputList];
                                                list[j][name as keyof RoleInput] = value;
                                                setInputList(list)
                                            }}
                                    aria-label="Roles">
                                        <option value="">-- Select Domain --</option>
                                        <option value="Stakeholder">Stakeholder</option>
                                        <option value="Analyst">Analyst</option>
                                        <option value="Contributor">Contributor</option>
                                        <option value="Accountant">Accountant</option>
                                        <option value="End User">End User</option>
                                        <option value="Quality Manager">Quality Manager</option>
                                        <option value="Test Manager">Test Manager</option>
                                        <option value="Technical writer">Technical writer</option>
                                        <option value="Key User">Key User</option>
                                    </Form.Select>
                                </Col>
                                <Col lg={5}>
                                    <Form.Control type="email" name="email" value={elem.email} onChange={(e) => {         
                                            const { name, value } = e.target;
                                            const list: RoleInput[] = [...inputList];
                                            list[j][name as keyof RoleInput] = value;
                                            setInputList(list)
                                        }}
                                    placeholder="Enter Email Address" aria-label="Enter Email Address"/>
                                </Col>
                                <Col lg={1} >
                                        <OverlayTrigger overlay={<Tooltip>Delete</Tooltip>}>
                                            <span className="d-inline-block">
                                                < MdDeleteOutline size={25} className={`ml-2 ${styles["icon-link"]}`} onClick={() => handleRemoveClick(j)} />
                                            </span>
                                        </OverlayTrigger>
                                </Col>
                            </Row>
                        )
                    })
                }
                <Col lg={4}>
                    <Button onClick={() => handleAddClick()} className={`fw-bold btn btn-light ${styles['button-plain']}`}>
                        Click to add row to Additional Roles
                    </Button>
                </Col>
            </Row>
        </>
    );
}
