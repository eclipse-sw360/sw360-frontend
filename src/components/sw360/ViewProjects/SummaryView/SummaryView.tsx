// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

"use client"

import GeneralInformation from "./GeneralInformation/GeneralInformation"
import Roles from "./Roles/Roles"
import ProjectVendor from "./ProjectVendor/ProjectVendor"

export default function SummaryView() {

    const description = "Encapsulates Desigo CC's WEB Services Interface. Library is intended to be re-used for intern and extern (i.e. customer) projects."

    return (
        <>
            <div className="container">
                <div className="row ms-0 my-2">
                    <p className="ps-0">{description}</p>
                </div>
                <GeneralInformation/>
                <Roles/>
                <ProjectVendor/>
            </div>
        </>
    )
}