// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import React from 'react'
import styles from "@/css/AddKeyValue.module.css"
import { useState } from 'react';

interface Props {
    header: string;
    keyName: string;
}

interface Input {
    key: string;
    value: string;
}

export default function AddKeyValueComponent(props: Props) {

    const [inputList, setInputList] = useState<Input[]>([]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const { name, value } = e.target;
        const list: Input[] = [...inputList];
        list[index][name as keyof Input] = value;
        setInputList(list);
    };

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
            <div className={`${styles["header"]} mb-2`}>
                <p className="fw-bold mt-3">{props.header}</p>
            </div>
            <div className="row">
                {
                    inputList.map((elem, j) => {
                        return (
                            <div className="row mb-2" key ="">
                                <div className="col-lg-5">
                                    <input name="key" value={elem.key} type="text" onChange={e => handleInputChange(e, j)} className="form-control" placeholder={`Enter ${props.keyName.toLowerCase()} key`} aria-describedby={`${props.keyName.toLowerCase()} key`} />
                                </div>
                                <div className="col-lg-5">
                                    <input name="value" value={elem.value} type="text" onChange={e => handleInputChange(e, j)} className="form-control" placeholder={`Enter ${props.keyName.toLowerCase()} value`} aria-describedby={`${props.keyName.toLowerCase()} value`} />
                                </div>
                                <div className="col-lg-2">
                                    <button type="button" onClick={() => handleRemoveClick(j)} className={`fw-bold btn btn-light ${styles['button-plain']}`}><i className="bi bi-trash3-fill"></i></button>
                                </div>
                            </div>
                        )
                    })
                }
                <div className="col-lg-3">
                    <button type="button" onClick={() => handleAddClick()} className={`fw-bold btn btn-light ${styles['button-plain']}`}>{`Click to add row to ${props.keyName.split(" ").map((elem) => elem[0].toUpperCase() + elem.substring(1)).join(" ")}`}</button>
                </div>
            </div>
        </>
    );
}
