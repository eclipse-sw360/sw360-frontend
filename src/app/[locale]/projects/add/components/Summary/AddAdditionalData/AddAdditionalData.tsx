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
import { useTranslations } from 'next-intl'
import { COMMON_NAMESPACE } from '@/object-types/Constants'

export default function AddAdditionalRoles({ inputList, setInputList } : {
    inputList: AdditionalDataInput[],
    setInputList: (inputList: AdditionalDataInput[]) => void
}) {

    const t = useTranslations(COMMON_NAMESPACE)

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
            <div className={`row header mb-2`}>
                <h6>{t('Add Additional Data')}</h6>
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
                        aria-label={t("Add Additional Data")}
                    >
                        <option value="">{t('Select')}:</option>
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
                        <option value="">{t('Select')}:</option>
                        <option value="Cloud Service">{t('Cloud Service')}</option>
                        <option value="Not Applicable">{t('Not Applicable')}</option>
                        <option value="Platform">{t('Platform')}</option>
                        <option value="Software Only">{t('Software Only')}</option>
                        <option value="System">{t('System')}</option>
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
                                            placeholder={t('Enter additional data key')}
                                        />
                                    </div>
                                    <div className="col-lg-5">
                                        <input type="text" className="form-control" name="value" value={elem.value} onChange={(e) => {         
                                                const { name, value } = e.target;
                                                const list: AdditionalDataInput[] = [...inputList];
                                                list[j][name as keyof AdditionalDataInput] = value;
                                                setInputList(list)
                                            }} 
                                            placeholder={t('Enter additional data value')}
                                        />
                                    </div>
                                    <div className="col-lg-1">
                                        <OverlayTrigger overlay={<Tooltip>{t('Delete')}</Tooltip>}>
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
                <button type="button" className="btn btn-secondary" onClick={() => handleAddClick()}>{t('Click to add row to Additional Data')}</button>
            </div>
        </>
    );
}
