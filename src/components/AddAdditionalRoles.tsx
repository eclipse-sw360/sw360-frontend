// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import React, { useState } from 'react'
import styles from "@/css/AddKeyValue.module.css"

interface Input {
    role: string;
    email: string;
}

export default function AddAdditionalRolesComponent() {

    const [inputList, setInputList] = useState<Input[]>([]);

    const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>, index: number) => {
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
        setInputList([...inputList, { role: "Stakeholder", email: "" }]);
    };

    return(
        <>
            <div className={`${styles["header"]} mb-2`}>
                <p className="fw-bold mt-3">Additional Roles</p>
            </div>
            <div className="row">
                {
                    inputList.map((elem, j) => {
                        return (
                            <div className="row mb-2" key ="">
                                <div className="col-lg-5">
                                    <select className="form-select" key ="" name="role" value={elem.role} aria-label="additional role" defaultValue={"Stakeholder"} onChange={e => handleInputChange(e, j)}>
                                        <option value="Stakeholder">Stakeholder</option>
                                        <option value="Analyst">Analyst</option>
                                        <option value="Contributor">Contributor</option>
                                        <option value="Accountant">Accountant</option>
                                        <option value="End User">End User</option>
                                        <option value="Quality Manager">Quality Manager</option>
                                        <option value="Test Manager">Test Manager</option>
                                        <option value="Technical writer">Technical writer</option>
                                        <option value="Key User">Key User</option>
                                    </select>
                                </div>
                                <div className="col-lg-5">
                                    <input name="email" value={elem.email} type="email" onChange={e => handleInputChange(e, j)} className="form-control" placeholder={`Enter email`} aria-describedby={`Email`} />
                                </div>
                                <div className="col-lg-2">
                                    <button type="button" onClick={() => handleRemoveClick(j)} className={`fw-bold btn btn-light ${styles['button-plain']}`}><i className="bi bi-trash3-fill"></i></button>
                                </div>
                            </div>
                        )
                    })
                }
                <div className="col-lg-3">
                    <button type="button" onClick={() => handleAddClick()} className={`fw-bold btn btn-light ${styles['button-plain']}`}>Click to add row to Additional Roles</button>
                </div>
            </div>
        </>
    );
}
