// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

"use client"

import { LinkReleasesModal } from "@/components/sw360"
import { useState } from "react"
import { _, Table } from "@/components/sw360"
import Link from "next/link"
import { OverlayTrigger, Tooltip } from "react-bootstrap"
import { MdDeleteOutline } from "react-icons/md"
import { BiInfoCircle } from "react-icons/bi"

export default function LinkReleases() {

    const [showLinkReleasesModal, setShowLinkReleasesModal] = useState(false)

    const RELEASE_RELATION_TEXT = `&quot;Unkown: If you just do not know 
    Contained: If you just do not know whether it is dynamically linked 
    Refered: Referencing a stand alone used other part 
    Dynamically Linked: Software dynamically linked - as the name says 
    Statically linked: Software statically linked - as the name says 
    Side by side: Not decided so far 
    Standalone: Software is given as standalone delivery, ie. not technically connected 
    Internal Use: Used for creating or building or ? the product or projects but not delivered 
    Optional: Is not mandatory part of the installation 
    To be replaced: Is there but should be moved out 
    Code Snippet: From references release, a fragment is used.&quot;;`

    const PROJECT_MAINLINE_STATE_TEXT = `
    Open: Not decided so far 
    Mainline: Organisation or person thinks that use of this software is recommended, which included multiple versions 
    Specific: The software is not recommended in general, but for special use case or for this particular version it is acceptable 
    In Phaseout: The software has issues, please consider removing it soon, if in use 
    Denied: Software which is not allowed for use. For example, software that does not have licensing`

    const columns = [
        {
            id: 'releaseName',
            name: 'Release Name',
            formatter: (releaseName: string) =>
            _(
                <Link href="#">
                    <input type="text" className="form-control" value={releaseName} readOnly/>                
                </Link>
            )
        },
        {
            id: 'version',
            name: 'Version',
            formatter: (version: string) =>
            _(
                <Link href="#">
                    <input type="text" className="form-control" value={version} readOnly/>                
                </Link>
            )
        },
        {
            id: 'relation',
            name: _(
                <>
                    {"Project Relation"} <OverlayTrigger overlay={<Tooltip>{RELEASE_RELATION_TEXT}</Tooltip>}>
                        <span className="d-inline-block pe-2">
                            <BiInfoCircle size={15}/>
                        </span>
                    </OverlayTrigger>
                </>
            ),
            formatter: () =>
            _(
                <select className="form-select" id="relation" defaultValue="Unknown">
                    <option value="Unknown">Unknown</option>
                    <option value="Contained">Contained</option>
                    <option value="Related">Related</option>
                    <option value="Dynamically Lniked">Dynamically Lniked</option>
                    <option value="Statically Linked">Statically Linked</option>
                    <option value="Side by side">Side by side</option>
                    <option value="Standalone">Standalone</option>
                    <option value="Internal use">Internal use</option>
                    <option value="Optional">Optional</option>
                    <option value="To be replaced">To be replaced</option>
                    <option value="Code snippet">Code snippet</option>
                </select>
            ),
        },
        {
            id: 'projectMainlineState',
            name: _(
                <>
                    {"Project Mainline State"} <OverlayTrigger overlay={<Tooltip>{PROJECT_MAINLINE_STATE_TEXT}</Tooltip>}>
                        <span className="d-inline-block pe-2">
                            <BiInfoCircle size={15}/>
                        </span>
                    </OverlayTrigger>
                </>
            ),
            formatter: () =>
            _(
                <select className="form-select" id="relation" defaultValue="Specific">
                    <option value="Specific">Specific</option>
                </select>
            ),
        },
        {
            id: 'comments',
            name: 'Comments',
            formatter: () =>
            _(
                <input type="text" className="form-control" placeholder="Enter Comment"/>                
            )
        },
        {
            id: 'delete',
            name: '',
            width: "80px",
            formatter: (releaseId: string) =>
            _(
                <OverlayTrigger overlay={<Tooltip>Delete</Tooltip>}>
                    <span className="d-inline-block pe-2">
                        < MdDeleteOutline size={25} className="ms-2 btn-icon"/>
                    </span>
                </OverlayTrigger>
            ),
        },
    ]

    const data = [
        { releaseId: "1", releaseName: "@ngx-translate/core", version: "14.0.0" },
        { releaseId: "2", releaseName: "@ngx-translate/htto-loader", version: "7.0.0" },
        { releaseId: "3", releaseName: "Angular", version: "14.1.2" },
        { releaseId: "4", releaseName: "ngx-bootstrap", version: "9.0.0" }
    ]

    return (
        <>
            <LinkReleasesModal show={showLinkReleasesModal} setShow={setShowLinkReleasesModal} />
            <div className="row mb-4">
                <div className="row header-1 mb-2 border-bottom">
                    <h6 className="fw-bold mt-3">LINKED RELEASES</h6>
                </div>
                <Table 
                    columns={columns}
                    data={data.map((data) => [data.releaseName, data.version, "", "", "", data.releaseId])}
                    sort={false}
                />
                <div className="row">
                    <div className="col-lg-4">
                        <button type="button" className="btn btn-secondary" onClick={() => setShowLinkReleasesModal(true)}>Link Releases</button>
                    </div>
                </div>
            </div>
        </>
    )
}