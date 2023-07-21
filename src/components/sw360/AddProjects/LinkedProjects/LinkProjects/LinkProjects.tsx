// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

"use client"

import { LinkProjectsModal } from "@/components/sw360"
import { useState } from "react"


export default function LinkProjects() {

    const [showLinkProjectsModal, setShowLinkProjectsModal] = useState(false)

    return (
        <>
            <LinkProjectsModal show={showLinkProjectsModal} setShow={setShowLinkProjectsModal} />
            <div className="row mb-4">
                <div className="row header-1 mb-2 border-bottom">
                    <h6 className="fw-bold mt-3">LINKED PROJECTS</h6>
                </div>
                <div className="row">
                    <div className="col-lg-4">
                        <button type="button" className="btn btn-secondary" onClick={() => setShowLinkProjectsModal(true)}>Link Projects</button>
                    </div>
                </div>
            </div>
        </>
    )
}