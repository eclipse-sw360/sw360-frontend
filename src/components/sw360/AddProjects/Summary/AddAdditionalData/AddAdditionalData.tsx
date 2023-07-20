// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

"use client"

import AdditionalDataInput from "./AddAdditionalData.types"
import { Tooltip, OverlayTrigger } from "react-bootstrap"
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
            <div className="row">
                <div className={`row header mb-2`}>
                    <h6>Add Additional Data</h6>
                </div>
                <div className="row mb-2">
                    <div className="col-lg-6">
                        <input type="text" className="form-control" name="key" value={inputList[0].key} readOnly/>
                    </div>
                    <div className="col-lg-6">
                        <select className="form-select" name="value" value={inputList[0].value} onChange={(e) => {         
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
                        </select>
                    </div>
                </div>
                <div className="row mb-2">
                    <div className="col-lg-6">
                        <input type="text" className="form-control" name="key" value={inputList[1].key} readOnly/>
                    </div>
                    <div className="col-lg-6">
                        <select className="form-select" name="value" value={inputList[1].value} onChange={(e) => {         
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
                        </select>
                    </div>
                </div>
                {
                    inputList.map((elem, j) => {
                        if(j <= 1) {
                            return
                        }
                        else {
                            return (
                                <>
                                    <div className="row mb-2" key={j}>
                                        <div className="col-lg-6">
                                            <input type="text" className="form-control" name="key" value={elem.key} onChange={(e) => {         
                                                    const { name, value } = e.target;
                                                    const list: AdditionalDataInput[] = [...inputList];
                                                    list[j][name as keyof AdditionalDataInput] = value;
                                                    setInputList(list)
                                                }} 
                                                placeholder="Click to add Additional Data"
                                            />
                                        </div>
                                        <div className="col-lg-5">
                                            <input type="text" className="form-control" name="value" value={elem.value} onChange={(e) => {         
                                                    const { name, value } = e.target;
                                                    const list: AdditionalDataInput[] = [...inputList];
                                                    list[j][name as keyof AdditionalDataInput] = value;
                                                    setInputList(list)
                                                }} 
                                                placeholder="Click to add Additional Data"
                                            />
                                        </div>
                                        <div className="col-lg-1">
                                            <OverlayTrigger overlay={<Tooltip>Delete</Tooltip>}>
                                                <span className="d-inline-block">
                                                    < MdDeleteOutline size={25} className="ms-2 btn-icon" onClick={() => handleRemoveClick(j)} />
                                                </span>
                                            </OverlayTrigger>
                                        </div>
                                    </div>
                                </>
                            )
                        }
                    })
                }
                <div className="col-lg-4">
                    <button type="button" className="btn btn-secondary" onClick={() => handleAddClick()}>Click to add row to Additional Data</button>
                </div>
            </div>
        </>
    );
}
