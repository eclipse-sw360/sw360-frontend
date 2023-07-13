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
                        <button type="button" className="fw-bold btn btn-light button-plain" onClick={() => setShowLinkProjectsModal(true)}>Link Projects</button>
                    </div>
                </div>
            </div>
        </>
    )
}