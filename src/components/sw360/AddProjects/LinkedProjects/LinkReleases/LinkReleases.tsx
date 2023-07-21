// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

"use client"

import { LinkReleasesModal } from "@/components/sw360"
import { useState } from "react"


export default function LinkReleases() {

    const [showLinkReleasesModal, setShowLinkReleasesModal] = useState(false);

    return (
        <>
            <LinkReleasesModal show={showLinkReleasesModal} setShow={setShowLinkReleasesModal} />
            <div className="row mb-4">
                <div className="row header-1 mb-2 border-bottom">
                    <h6 className="fw-bold mt-3">LINKED RELEASES</h6>
                </div>
                <div className="row">
                    <div className="col-lg-4">
                        <button type="button" className="btn btn-secondary" onClick={() => setShowLinkReleasesModal(true)}>Link Releases</button>
                    </div>
                </div>
            </div>
        </>
    )
}