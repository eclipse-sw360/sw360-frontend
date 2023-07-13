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
                        <button type="button" className="fw-bold btn btn-light button-plain" onClick={() => setShowLinkReleasesModal(true)}>Link Releases</button>
                    </div>
                </div>
            </div>
        </>
    )
}