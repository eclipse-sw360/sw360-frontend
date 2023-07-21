// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

"use client"

import { GiCancel } from "react-icons/gi"
import { useState } from "react"
import { DepartmentModal, UsersModal, SelectCountryComponent } from "@/components/sw360"

export default function Roles() {

    const [showDepartmentModal, setShowDepartmentModal] = useState<boolean>(false)
    const [showUsersModal, setShowUsersModal] = useState<boolean>(false)

    return (
        <>
            <DepartmentModal show={showDepartmentModal} setShow={setShowDepartmentModal} />
            <UsersModal show={showUsersModal} setShow={setShowUsersModal} />
            <div className="row mb-4">
                <div className="row mb-2 header">
                    <h6>Roles</h6>
                </div>
                <div className="row">
                    <div className="col-lg-4 mb-3">
                        <label htmlFor="addProjects.group" className="form-label fw-bold">Group</label>
                        <input type="text" className="form-control" id="addProjects.group" aria-label="Group" placeholder="Click to edit" readOnly={true} onClick={() => setShowDepartmentModal(true)} />
                        <div className="form-text"> <GiCancel /></div>
                    </div>
                    <div className="col-lg-4 mb-3">
                        <label htmlFor="addProjects.projectManager" className="form-label fw-bold">Project Manager</label>
                        <input type="text" className="form-control" id="addProjects.projectManager" aria-label="Project Manager" placeholder="Click to edit" readOnly={true} onClick={() => setShowUsersModal(true)} />
                    </div>
                    <div className="col-lg-4 mb-3">
                        <label htmlFor="addProjects.projectOwner" className="form-label fw-bold">Project Owner</label>
                        <input type="text" className="form-control" id="addProjects.projectOwner" aria-label="Project Owner" placeholder="Click to edit" readOnly={true} onClick={() => setShowUsersModal(true)} />
                    </div>
                </div>
                <hr className="my-2"/>
                <div className="row">
                    <div className="col-lg-4 mb-3">
                        <label htmlFor="addProjects.ownerAccountingUnit" className="form-label fw-bold">Owner Accounting Unit</label>
                        <input type="text" className="form-control" aria-label="Owner Accounting Unit" id="addProjects.ownerAccountingUnit" placeholder="Enter owner's accounting unit" readOnly={true}/>
                    </div>
                    <div className="col-lg-4 mb-3">
                        <label htmlFor="addProjects.ownerBillingGroup" className="form-label fw-bold">Owner Billing Group</label>
                        <input type="text" className="form-control" aria-label="Owner Billing Group" id="addProjects.ownerBillingGroup" placeholder="Enter Owner Billing Group" readOnly={true}/>
                    </div>
                    <div className="col-lg-4 mb-3">
                        <SelectCountryComponent/>
                    </div>
                </div>
                <hr className="my-2"/>
                <div className="row">
                    <div className="col-lg-4 mb-3">
                        <label htmlFor="addProjects.leadArchitect" className="form-label fw-bold">Lead Architect</label>
                        <input type="text" className="form-control" id="addProjects.leadArchitect" aria-label="Lead Architect" placeholder="Click to edit" readOnly={true} onClick={() => setShowUsersModal(true)}/>
                    </div>
                    <div className="col-lg-4 mb-3">
                        <label htmlFor="addProjects.moderators" className="form-label fw-bold">Moderators</label>
                        <input type="text" className="form-control" id="addProjects.moderators" aria-label="Moderators" placeholder="Click to edit" readOnly={true} onClick={() => setShowUsersModal(true)}/>
                    </div>
                    <div className="col-lg-4 mb-3">
                        <label htmlFor="addProjects.contributors" className="form-label fw-bold">Contributors</label>
                        <input type="text" className="form-control" id="addProjects.contributors" aria-label="Contributors" placeholder="Click to edit" readOnly={true} onClick={() => setShowUsersModal(true)}/>
                    </div>
                </div>
                <hr className="my-2" />
                <div className="row">
                    <div className="col-lg-4 mb-3">
                        <label htmlFor="addProjects.securityResponsibles" className="form-label fw-bold">Security Responsibles</label>
                        <input type="text" className="form-control" id="addProjects.securityResponsibles" aria-label="Contributors" placeholder="Click to edit" readOnly={true} onClick={() => setShowUsersModal(true)}/>
                    </div>
                </div>
            </div>
        </>
    )
}