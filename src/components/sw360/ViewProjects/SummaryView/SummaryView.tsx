"use client"

import GeneralInformation from "./GeneralInformation/GeneralInformation"
import Roles from "./Roles/Roles"
import ProjectVendor from "./ProjectVendor/ProjectVendor"

export default function SummaryView() {


    return (
        <>
            <div className="container">
                <GeneralInformation/>
                <Roles/>
                <ProjectVendor/>
            </div>
        </>
    )
}