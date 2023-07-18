"use client"

import GeneralInformation from "./GeneralInformation/GeneralInformation"
import Roles from "./Roles/Roles"
import ProjectVendor from "./ProjectVendor/ProjectVendor"

export default function SummaryView() {

    const description = "Encapsulates Desigo CC's WEB Services Interface. Library is intended to be re-used for intern and extern (i.e. customer) projects."

    return (
        <>
            <div className="container">
                <div className="row ms-0">
                    <p className="ps-0">{description}</p>
                </div>
                <GeneralInformation/>
                <Roles/>
                <ProjectVendor/>
            </div>
        </>
    )
}