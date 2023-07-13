// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

"use client"

import React, { useState } from 'react'
import DocumentTypes from '@/object-types/enums/DocumentTypes';
import { RolesType } from '@/object-types/RolesType';
import { useTranslations } from 'next-intl';
import { COMMON_NAMESPACE } from '@/object-types/Constants';
import { MdDeleteOutline } from 'react-icons/md'

interface Props {
    documentType?: string;
    setRoles?: RolesType
}

interface Input {
    role: string;
    email: string;
}

export default function AddAdditionalRolesComponent({documentType, setRoles}: Props) {

    const t = useTranslations(COMMON_NAMESPACE);
    const [inputList, setInputList] = useState<Input[]>([]);

    const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>, index: number) => {
        const { name, value } = e.target;
        const list: Input[] = [...inputList];
        list[index][name as keyof Input] = value;
        setInputList(list);
        setRoles(list);
    };

    const handleRemoveClick = (index: number) => {
        const list = [...inputList];
        list.splice(index, 1);
        setInputList(list);
    };

    const handleAddClick = () => {
        documentType === DocumentTypes.COMPONENT?
        setInputList([...inputList, { role: "Committer", email: "" }])
        : setInputList([...inputList, { role: "Stakeholder", email: "" }]);
    };

    const defaultValue = () => {
        return documentType === DocumentTypes.COMPONENT ? "Commiter" : "Stakeholder";
    }

    return(
        <>
            <div className={`row header mb-2`}>
                <h6>{t('Additional Roles')}</h6>
            </div>
            <div className="row">
                {
                    inputList.map((elem, j) => {
                        return (
                            <div className="row mb-2" key ="">
                                <div className="col-lg-5">
                                    <select className="form-select" key ="" name="role" value={elem.role} aria-label="additional role" defaultValue = {defaultValue()} onChange={e => handleInputChange(e, j)}>
                                        {
                                        documentType === DocumentTypes.COMPONENT
                                        ?
                                        <>
                                            <option value="Committer">{t('Committer')}</option>
                                            <option value="Contributor">{t('Contributor')}</option>
                                            <option value="Expert">{t('Expert')}</option>
                                        </>
                                        :
                                        <>
                                            <option value="Stakeholder">Stakeholder</option>
                                            <option value="Analyst">Analyst</option>
                                            <option value="Contributor">Contributor</option>
                                            <option value="Accountant">Accountant</option>
                                            <option value="End User">End User</option>
                                            <option value="Quality Manager">Quality Manager</option>
                                            <option value="Test Manager">Test Manager</option>
                                            <option value="Technical writer">Technical writer</option>
                                            <option value="Key User">Key User</option>
                                        </>
                                        }
                                    </select>
                                </div>
                                <div className="col-lg-5">
                                    <input name="email" value={elem.email} type="email"
                                           onChange={e => handleInputChange(e, j)}
                                           className="form-control"
                                           placeholder={`Enter email`}
                                           aria-describedby={`Email`} />
                                </div>
                                <div className="col-lg-2">
                                    < MdDeleteOutline size={25} className={`ml-2 icon-link`} onClick={() => handleRemoveClick(j)} />
                                </div>
                            </div>
                        )
                    })
                }
                <div className="col-lg-4">
                    <button type="button" onClick={() => handleAddClick()} className={`fw-bold btn btn-light button-plain`}>{t('Click to add row to Additional Roles')}</button>
                </div>
            </div>
        </>
    );
}
