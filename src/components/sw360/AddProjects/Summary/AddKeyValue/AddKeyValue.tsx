// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

"use client"

import React from 'react'
import styles from "../../AddProjects.module.css"
import Input from "./AddKeyValue.types"
import { Row, Col, Button, Form, Tooltip, OverlayTrigger } from "react-bootstrap"
import { MdDeleteOutline } from 'react-icons/md'

export default function AddKeyValue({ inputList, setInputList, keyName } : {
    inputList: Input[],
    setInputList: (inputList: Input[]) => void,
    keyName: string
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
            <Row className="w-100">
                {
                    inputList.map((elem, j) => {
                        return (
                            <>
                                <Row className="mb-2">
                                    <Col lg={6} >
                                        <Form.Control type="text" name="key" value={elem.key} onChange={(e) => {         
                                            const { name, value } = e.target;
                                            const list: Input[] = [...inputList];
                                            list[j][name as keyof Input] = value;
                                            setInputList(list)
                                        }} 
                                        placeholder={`Enter ${keyName.toLowerCase()} key`} aria-label={`${keyName.toLowerCase()} key`}/>
                                    </Col>
                                    <Col lg={5}>
                                        <Form.Control type="text" name="value" value={elem.value} onChange={(e) => {         
                                                const { name, value } = e.target;
                                                const list: Input[] = [...inputList];
                                                list[j][name as keyof Input] = value;
                                                setInputList(list)
                                            }}
                                        placeholder={`Enter ${keyName.toLowerCase()} value`} aria-label={`${keyName.toLowerCase()} value`}/>
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
                    })
                }
            </Row>
            <Row>
                <Col>
                    <Button onClick={() => handleAddClick()} className={`fw-bold btn btn-light ${styles['button-plain']}`} >
                        {`Click to add row to ${keyName.split(" ").map((elem) => elem[0].toUpperCase() + elem.substring(1)).join(" ")}`}
                    </Button>
                </Col>
            </Row>
        </>
    );
}
