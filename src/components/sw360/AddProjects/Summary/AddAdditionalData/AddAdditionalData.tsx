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
                <Row className="mb-2">
                    <Col lg={6} >
                        <Form.Control type="text" name="key" value={inputList[0].key} readOnly/>
                    </Col>
                    <Col lg={6}>
                        <Form.Select name="value" value={inputList[0].value} defaultValue="" onChange={(e) => {         
                                    const { name, value } = e.target;
                                    const list: AdditionalDataInput[] = [...inputList];
                                    list[0][name as keyof AdditionalDataInput] = value;
                                    setInputList(list)
                                }}
                                aria-label="Add Additional Data"
                        >
                            <option value="">Select:</option>
                            <option value="SHS AT">SHS AT</option>
                            <option value="SHS AT COR">SHS AT COR</option>
                            <option value="SHS CS">SHS CS</option>
                            <option value="SHS CC">SHS CC</option>
                            <option value="SHS DI">SHS DI</option>
                            <option value="SHS DI CT">SHS DI CT</option>
                            <option value="SHS DI DH">SHS DI DH</option>
                            <option value="SHS DI DH ITH">SHS DI DH ITH</option>
                            <option value="SHS DI MI">SHS DI MI</option>
                            <option value="SHS DI MR">SHS DI MR</option>
                            <option value="SHS DI SY">SHS DI SY</option>
                            <option value="SHS DI XP">SHS DI XP</option>
                            <option value="SHS ES">SHS ES</option>
                            <option value="SHS IT">SHS IT</option>
                            <option value="SHS LD">SHS LD</option>
                            <option value="SHS POC">SHS POC</option>
                            <option value="SHS TE">SHS TE</option>
                            <option value="SHS TE DC">SHS TE DC</option>
                            <option value="SHS TE DTI">SHS TE DTI</option>
                            <option value="SHS TE ME">SHS TE ME</option>
                            <option value="SHS TE MP">SHS TE MP</option>
                            <option value="SHS TE PV">SHS TE PV</option>
                            <option value="SHS TE PLE UX">SHS TE PLE UX</option>
                            <option value="SHS US">SHS US</option>
                            <option value="SHS VAR">SHS VAR</option>
                        </Form.Select>
                    </Col>
                </Row>
                <Row className="mb-2">
                    <Col lg={6} >
                        <Form.Control type="text" name="key" value={inputList[1].key} readOnly/>
                    </Col>
                    <Col lg={6}>
                        <Form.Select name="value" value={inputList[1].value} defaultValue="" onChange={(e) => {         
                                    const { name, value } = e.target;
                                    const list: AdditionalDataInput[] = [...inputList];
                                    list[1][name as keyof AdditionalDataInput] = value;
                                    setInputList(list)
                                }}
                                aria-label="Add Additional Data"
                        >
                            <option value="">Select:</option>
                            <option value="Cloud Service">Cloud Service</option>
                            <option value="Not Applicable">Not Applicable</option>
                            <option value="Platform">Platform</option>
                            <option value="Software Only">Software Only</option>
                            <option value="System">System</option>
                        </Form.Select>
                    </Col>
                </Row>
                {
                    inputList.map((elem, j) => {
                        if(j <= 1) {
                            return
                        }
                        else {
                            return (
                                <>
                                    <Row className="mb-2">
                                        <Col lg={6} >
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
                                        <Col lg={1} >
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
