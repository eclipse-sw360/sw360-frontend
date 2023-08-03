// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

"use client"

import { useState } from "react"
import AddAdditionalRolesComponent from '@/components/AddAdditionalRoles'
import AddKeyValueComponent from '@/components/AddKeyValue'

import AddAdditionalData from "./AddAdditionalData/AddAdditionalData"
import AdditionalDataInput from "./AddAdditionalData/AddAdditionalData.types"
import DocumentTypes from '@/object-types/enums/DocumentTypes'
import GeneralInformation from "./GeneralInformation" 
import Roles from "./Roles/Roles"

export default function Summary() {

    const [additionalDataList, setAdditionalDataList] = useState<AdditionalDataInput[]>([
        {
            key: "BA BL",
            value: ""
        },
        {
            key: "CSMS Asset Type",
            value: ""
        }
    ])

    return (
        <>
            <div className="container">
                <GeneralInformation/>
                <div className="row mb-4">
                    <AddKeyValueComponent
                        header={'External URLs'}
                        keyName={'external url'}
                    />
                </div>
                <Roles/>
                <div className="row mb-4">
                    <AddAdditionalRolesComponent
                        documentType={DocumentTypes.PROJECT}
                    />
                </div>
                <div className="row mb-4">
                    <AddKeyValueComponent
                        header={'External Ids'}
                        keyName={'external id'}
                    />
                </div>
                <div className="row mb-4">
                    <AddAdditionalData inputList={additionalDataList} setInputList={setAdditionalDataList} />
                </div>
            </div>
        </>
    )
}