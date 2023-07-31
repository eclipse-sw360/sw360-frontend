// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

"use client"

import { LinkProjectsModal } from "@/components/sw360"
import { useState } from "react"
import { _, Table } from "@/components/sw360"
import Link from "next/link"
import { OverlayTrigger, Tooltip } from "react-bootstrap"
import { MdDeleteOutline } from "react-icons/md"
import { BiInfoCircle } from "react-icons/bi"

export default function LinkProjects() {

    const PROJECT_RELATION_TEXT = `
    Unknown: 
    Duplicate: 
    Contained: 
    Refered:
    `

    const [showLinkProjectsModal, setShowLinkProjectsModal] = useState(false)

    const data = [
        { projectId:'1', projectName: 'Reuse: QtControlLib (V04.02)', version: 'V04.02' },
        { projectId:'2', projectName: 'Reuse: QtControlLib (V04.02)', version: 'V04.02' },
        { projectId:'3', projectName: 'Reuse: QtControlLib (V04.02)', version: 'V04.02' },
        { projectId:'4', projectName: 'Reuse: QtControlLib (V04.02)', version: 'V04.02' }
    ]

    // const handleRemoveClick = (projectId: string) => {
    //     const ind = data.findIndex(x => x.projectId === projectId)
    //     data.splice(ind, 1)
    //     console.log(data)
    // }

    const columns = [
        {
            id: 'projectName',
            name: 'Project Name',
            formatter: (projectName: string) =>
            _(
                <Link href="#">
                    <input type="text" className="form-control" defaultValue={projectName} readOnly/>                
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
                    {"Project Relation"} <OverlayTrigger overlay={<Tooltip>{PROJECT_RELATION_TEXT}</Tooltip>}>
                        <span className="d-inline-block pe-2">
                            <BiInfoCircle size={15}/>
                        </span>
                    </OverlayTrigger>
                </>
            ),
            formatter: () =>
            _(
                <select className="form-select" id="relation" defaultValue="Is a subproject">
                    <option value="Unknown">Unknown</option>
                    <option value="Is a subproject">Is a subproject</option>
                    <option value="Duplicate">Duplicate</option>
                    <option value="Related">Related</option>
                </select>
            )
        },
        {
            id: 'enableSVM',
            name: 'Enable SVM',
            width: "110px",
            formatter: () =>
            _(
                <div className="form-check d-flex justify-content-center">
                    <input className="form-check-input" type="checkbox"/>
                </div>
            ),
        },
        {
            id: 'delete',
            name: '',
            width: "80px",
            sort: false,
            formatter: (projectId: string) =>
            _(
                <OverlayTrigger overlay={<Tooltip>Delete</Tooltip>}>
                    <span className="d-inline-block pe-2">
                        < MdDeleteOutline size={25} className="ms-2 btn-icon"/>
                    </span>
                </OverlayTrigger>
            ),
        },
    ]

    return (
        <>
            <LinkProjectsModal show={showLinkProjectsModal} setShow={setShowLinkProjectsModal} />
            <div className="row mb-4">
                <div className="row header-1 mb-2 border-bottom">
                    <h6 className="fw-bold mt-3">LINKED PROJECTS</h6>
                </div>
                <Table
                    columns={columns}
                    data={data.map((data) => [data.projectName, data.version, "", "", data.projectId])}
                    sort={false}
                />
                <div className="row">
                    <div className="col-lg-4">
                        <button type="button" className="btn btn-secondary" onClick={() => setShowLinkProjectsModal(true)}>Link Projects</button>
                    </div>
                </div>
            </div>
        </>
    )
}