"use client"

import { useState } from "react"
import { AddKeyValueComponent, AddAdditionalRolesComponent } from "@/components/sw360"
import AddAdditionalData from "./AddAdditionalData/AddAdditionalData"
import AdditionalDataInput from "./AddAdditionalData/AddAdditionalData.types"
import DocumentTypes from '@/object-types/enums/DocumentTypes'
import GeneralInformation from "./GeneralInformation/GeneralInformation" 
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