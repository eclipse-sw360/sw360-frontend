// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

"use client"

import styles from "./AddAdditionalData.module.css"
import AdditionalDataInput from "./AddAdditionalData.types"
import { Row, Col, Button, Form, Tooltip, OverlayTrigger } from "react-bootstrap"
import { MdDeleteOutline } from 'react-icons/md'
import { AddKeyValue } from "@/components/sw360"

export default function AddAdditionalRoles({ inputList, setInputList } : {
    inputList: AdditionalDataInput[],
    setInputList: (inputList: AdditionalDataInput[]) => void
}) {

    const handleRemoveClick = (index: number) => {
        const list = [...inputList];
        list.splice(index, 1);
        setInputList(list);
    };

    const handleAddClick = () => {
        setInputList([...inputList, { key: "", value: "" }]);
    };

    return(
        <>
            <Row>
                {
                    inputList.map((elem, j) => {
                        if(j <= 1) {
                            return (
                                <>
                                    <Row className="mb-2">
                                        <Col lg={5} >
                                            <Form.Control type="text" name="key" value={elem.key} onChange={(e) => {         
                                                const { name, value } = e.target;
                                                const list: AdditionalDataInput[] = [...inputList];
                                                list[j][name as keyof AdditionalDataInput] = value;
                                                setInputList(list)
                                            }} 
                                            placeholder="Click to add Additional Data"/>
                                        </Col>
                                        <Col lg={5}>
                                            <Form.Select name="value" value={elem.value} defaultValue="" onChange={(e) => {         
                                                        const { name, value } = e.target;
                                                        const list: AdditionalDataInput[] = [...inputList];
                                                        list[j][name as keyof AdditionalDataInput] = value;
                                                        setInputList(list)
                                                    }}
                                            aria-label="Add Additional Data">
                                                <option value="">Select:</option>
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
                                    </Row>
                                </>
                            )
                        }
                        else {
                            return (
                                <>
                                    <Row className="mb-2">
                                        <Col lg={5} >
                                            <Form.Control type="text" name="key" value={elem.key} onChange={(e) => {         
                                                const { name, value } = e.target;
                                                const list: AdditionalDataInput[] = [...inputList];
                                                list[j][name as keyof AdditionalDataInput] = value;
                                                setInputList(list)
                                            }} 
                                            placeholder="Click to add Additional Data"/>
                                        </Col>
                                        <Col lg={5}>
                                            <Form.Control type="text" name="value" value={elem.value} onChange={(e) => {         
                                                    const { name, value } = e.target;
                                                    const list: AdditionalDataInput[] = [...inputList];
                                                    list[j][name as keyof AdditionalDataInput] = value;
                                                    setInputList(list)
                                                }}
                                            placeholder="Enter additional data value"/>
                                        </Col>
                                        <Col lg={2} >
                                            <OverlayTrigger overlay={<Tooltip>Delete</Tooltip>}>
                                                <span className="d-inline-block">
                                                    < MdDeleteOutline size={25} className={`ml-2 ${styles["icon-link"]}`} onClick={() => handleRemoveClick(j)} />
                                                </span>
                                            </OverlayTrigger>
                                        </Col>
                                    </Row>
                                </>
                            )
                        }
                    })
                }
            </Row>
            <Row>
                <Col>
                    <Button onClick={() => handleAddClick()} className={`fw-bold btn btn-light ${styles['button-plain']}`} >
                        Click to add row to Additional Data
                    </Button>
                </Col>
            </Row>
        </>
    );
}
