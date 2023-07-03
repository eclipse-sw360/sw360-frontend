// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

"use client";

import styles from "@/css/AddProjects.module.css"
import AddKeyValueComponent from "@/components/AddKeyValue"
import SelectCountryComponent from "@/components/SelectCountry"
import AddAdditionalRolesComponent from "@/components/AddAdditionalRoles"
import SearchUsersModalComponent from "@/components/SearchUsersModal"
import Link from "next/link"

export default function Summary() {
    return (
        <>
            {/* <SearchUsersModalComponent /> */}
            <div className="row mb-4">
                <div className={`${styles["header"]} mb-2`}>
                    <p className="fw-bold mt-3">General Information</p>
                </div>
                <div className="row">
                    <div className="col-lg-4">
                        <label htmlFor="name" className="form-label fw-bold">Name</label>
                        <input type="text" className="form-control" placeholder="Enter Name" id="name" aria-describedby="name" />
                    </div>
                    <div className="col-lg-4">
                        <label htmlFor="version" className="form-label fw-bold">Version</label>
                        <input type="text" className="form-control" placeholder="Enter Version" id="version" aria-describedby="version" />
                    </div>
                    <div className="col-lg-4">
                        <label htmlFor="project_visibility" className="form-label fw-bold">Project Visibility</label>
                        <select className="form-select" aria-label="project visibility" id="project_visibility" defaultValue="Group and Moderators">
                            <option value="Private">Private</option>
                            <option value="Me and Moderators">Me and Moderators</option>
                            <option value="Group and Moderators">Group and Moderators</option>
                            <option value="Everyone">Everyone</option>
                        </select>
                        <div id="learn_more_project_visibility" className="form-text"><i className="bi bi-info-circle"></i> Learn more about project visibilities.</div>
                    </div>
                </div>
                <hr className="my-4" />
                <div className="row">
                    <div className="col-lg-4">
                        <label htmlFor="created_by" className="form-label fw-bold">Created by</label>
                        <input type="text" className="form-control" placeholder="Will be set automatically" id="created_by" aria-describedby="Created by" />
                    </div>
                    <div className="col-lg-4">
                        <label htmlFor="project_type" className="form-label fw-bold">Project type</label>
                        <select className="form-select" aria-label="project type" id="project_type" defaultValue="Product">
                            <option value="Customer Project">Customer Project</option>
                            <option value="Internal Project">Internal Project</option>
                            <option value="Product">Product</option>
                            <option value="Service">Service</option>
                            <option value="Inner Source">Inner Source</option>
                        </select>
                        <div id="learn_more_project_type" className="form-text"><i className="bi bi-info-circle"></i> Learn more about project types.</div>
                    </div>
                    <div className="col-lg-4">
                        <label htmlFor="tag" className="form-label fw-bold">Tag</label>
                        <input type="text" className="form-control" placeholder="Will be set automatically" id="tag" aria-describedby="Tag" />
                    </div>
                </div>
                <hr className="my-4" />
                <div className="row">
                    <div className="col-lg-4">
                        <label htmlFor="description" className="form-label fw-bold">Description</label>
                        <textarea className="form-control" placeholder="Enter Description" id="description" aria-describedby="Description"
                            style={{ height: "100px" }} />
                    </div>
                    <div className="col-lg-4">
                        <label htmlFor="domain" className="form-label fw-bold">Domain</label>
                        <select className="form-select" aria-label="domain" id="domain" defaultValue="">
                            <option value="">-- Select Domain --</option>
                            <option value="Application Software">Application Software</option>
                            <option value="Documentation">Documentation</option>
                            <option value="Embedded Software">Embedded Software</option>
                            <option value="Hardware">Hardware</option>
                            <option value="Test and Diagnostics">Test and Diagnostics</option>
                        </select>
                    </div>
                    <div className="col-lg-4">
                        <label htmlFor="vendor" className="form-label fw-bold">Vendor</label>
                        {/* defaultValue={vendor?vendor.fullName:""} */}
                        <input type="text" className="form-control" data-bs-toggle="modal" data-bs-target="#search_vendors_modal" placeholder="Click to set vendor" id="vendor" aria-describedby="Vendor" readOnly={true} />
                        <div id="close_vendor" className="form-text"><i className="bi bi-x-circle"></i></div>
                    </div>
                </div>
                <hr className="my-4" />
                <div className="row">
                    <div className="col-lg-4">
                        <label htmlFor="modified_on" className="form-label fw-bold">Modified On</label>
                        <input type="date" className="form-control" id="modified_on" aria-describedby="Modified on" />
                    </div>
                    <div className="col-lg-4">
                        <label htmlFor="modified_by" className="form-label fw-bold">Modified By</label>
                        <input type="text" className="form-control" placeholder="Will be set automatically" id="modified_by" aria-describedby="Modified By" readOnly={true} />
                    </div>
                </div>
                <hr className="my-4" />
                <div className="row">
                    <div className="col-lg-4">
                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" value="" id="security_monitoring" disabled />
                            <label className="form-check-label" htmlFor="security_monitoring">
                                Enable Security Vulnerability Monitoring
                            </label>
                        </div>
                        <small className="form-text fw-bold">You need a security responsible to enable monitoring</small>
                    </div>
                    <div className="col-lg-4">
                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" value="" id="display_vulnerability" />
                            <label className="form-check-label fw-bold" htmlFor="display_vulnerability">
                                Enable Displaying Vulnerabilities
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row mb-4">
                <AddKeyValueComponent header={"External URLs"} keyName={"external url"} />
            </div>
            <div className="row mb-4">
                <div className={`${styles["header"]} mb-2`}>
                    <p className="fw-bold mt-3">Roles</p>
                </div>
                <div className="row">
                    <div className="col-lg-4">
                        <label htmlFor="group" className="form-label fw-bold">Group</label>
                        <input type="text" className="form-control" placeholder="Click to set group" id="group" aria-describedby="Group" readOnly={true} />
                        <div id="close_group" className="form-text"><i className="bi bi-x-circle"></i></div>
                    </div>
                    <div className="col-lg-4">
                        <label htmlFor="project_manager" className="form-label fw-bold">Project Manager</label>
                        <input type="text" className="form-control" data-bs-toggle="modal" data-bs-target="#search_users_modal" placeholder="Click to set" id="project_manager" aria-describedby="Project Manager" readOnly={true} />
                    </div>
                    <div className="col-lg-4">
                        <label htmlFor="project_owner" className="form-label fw-bold">Project Owner</label>
                        <input type="text" className="form-control" data-bs-toggle="modal" data-bs-target="#search_users_modal" placeholder="Click to set" id="project_owner" aria-describedby="Project Owner" readOnly={true} />
                    </div>
                </div>
                <hr className="my-4" />
                <div className="row">
                    <div className="col-lg-4">
                        <label htmlFor="owner_accounting_unit" className="form-label fw-bold">Owner Accounting Unit</label>
                        <input type="text" className="form-control" placeholder="Enter owner's accounting unit" id="owner_accounting_unit" aria-describedby="Owner Accounting Unit" />
                    </div>
                    <div className="col-lg-4">
                        <label htmlFor="owner_billing_group" className="form-label fw-bold">Owner Billing Group</label>
                        <input type="text" className="form-control" placeholder="Enter owner billing group" id="owner_billing_group" aria-describedby="Owner Billing Group" />
                    </div>
                    <div className="col-lg-4">
                        < SelectCountryComponent />
                    </div>
                </div>
                <hr className="my-4"           />
                <div className="row">
                    <div className="col-lg-4">
                        <label htmlFor="lead_architect" className="form-label fw-bold">Lead Architect</label>
                        <input type="text" className="form-control" data-bs-toggle="modal" data-bs-target="#search_users_modal" placeholder="Click to edit" id="lead_architect" aria-describedby="Lead Architect" readOnly={true} />
                    </div>
                    <div className="col-lg-4">
                        <label htmlFor="moderators" className="form-label fw-bold">Moderators</label>
                        <input type="text" className="form-control" data-bs-toggle="modal" data-bs-target="#search_users_modal" placeholder="Click to edit" id="moderators" aria-describedby="Moderators" readOnly={true} />
                    </div>
                    <div className="col-lg-4">
                        <label htmlFor="contributors" className="form-label fw-bold">Contributors</label>
                        <input type="text" className="form-control" data-bs-toggle="modal" data-bs-target="#search_users_modal" placeholder="Click to edit" id="contributors" aria-describedby="Contributors" readOnly={true} />
                    </div>
                </div>
                <hr className="my-4" />
                <div className="row">
                    <div className="col-lg-4">
                        <label htmlFor="security_responsibles" className="form-label fw-bold">Security Responsibles</label>
                        <input type="text" className="form-control" data-bs-toggle="modal" data-bs-target="#search_users_modal" placeholder="Click to edit" id="security_responsibles" aria-describedby="Security Responsibles" readOnly={true} />
                    </div>
                </div>
            </div>
            <div className="row mb-4">
                <AddAdditionalRolesComponent />
            </div>
            <div className="row mb-4">
                <AddKeyValueComponent header={"External IDs"} keyName={"external id"} />
            </div>
            <div className="row mb-4">
                <AddKeyValueComponent header={"Additional Data"} keyName={"additional data"} />
            </div>
        </>
    )
}
