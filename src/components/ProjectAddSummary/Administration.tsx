// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

"use client"

import Clearing from "./component/Administration/Clearing"
import Lifecycle from "./component/Administration/LifeCycle"
import LicenseInfoHeader from "./component/Administration/LicenseInfoHeader"
import ProjectPayload from "@/object-types/CreateProjectPayload"

interface Props{
    token: string
    projectPayload: ProjectPayload
    setProjectPayload: React.Dispatch<React.SetStateAction<ProjectPayload>>
}

export default function Administration({token, projectPayload, setProjectPayload}: Props) {

    return (
        <>
            <div className="ms-1">
                <Clearing   token={token}
                            projectPayload={projectPayload}
                            setProjectPayload={setProjectPayload}/>
                <Lifecycle  token={token}
                            projectPayload={projectPayload}
                            setProjectPayload={setProjectPayload}/>
                <LicenseInfoHeader/>
            </div>
        </>
    )
}
