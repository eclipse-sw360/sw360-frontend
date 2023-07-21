// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

"use client"

import { OverlayTrigger, Tooltip } from "react-bootstrap"
import { BiInfoCircle } from "react-icons/bi"

const ShowInfoOnHover = ({ text }: { text: string }) => {
    return (
        <>
          <OverlayTrigger overlay={<Tooltip>{text}</Tooltip>}>
            <span className="d-inline-block">
              < BiInfoCircle />
            </span>
          </OverlayTrigger>
  
      </>
    );
}; 

export default function Clearing() {

    const CLEARING_STATE_INFO = `
    Open: 
    In Progress: 
    Closed:
    `

    return (
        <>
            <div className="row mb-4">
                <div className="row header mb-2">
                    <h6>Clearing</h6>
                </div>
                <div className="row mb-2">
                    <div className="col-lg-4 mb-3">
                        <label htmlFor="addProjects.clearingState" className="form-label fw-bold">Clearing State</label>
                        <select className="form-select" id="addProjects.clearingState" defaultValue="Open" aria-describedby="addProjects.clearingState.HelpBlock">
                            <option value="Open">Open</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Closed">Closed</option>
                        </select>
                        <div className="form-text" id="addProjects.clearingState.HelpBlock">< ShowInfoOnHover text={CLEARING_STATE_INFO} /> Learn more about project clearing state.</div>
                    </div>
                    <div className="col-lg-4 mb-3">
                        <label htmlFor="addProjects.clearingTeam" className="form-label fw-bold">Clearing Team</label>
                        <select className="form-select" id="addProjects.clearingTeam" defaultValue="ct" aria-label="Clearing Team">
                            <option value="ct">ct</option>
                            <option value="gp">gp</option>
                            <option value="iot">iot</option>
                            <option value="mo">mo</option>
                            <option value="mo its">mo its</option>
                            <option value="sgre">sgre</option>
                            <option value="shs">shs</option>
                            <option value="si">si</option>
                            <option value="sop">sop</option>
                        </select>
                    </div>
                    <div className="col-lg-4 mb-3">
                        <label htmlFor="addProjects.deadlinePreEvaluation" className="form-label fw-bold">Deadline for pre-evaluation</label>
                        <input type="text" className="form-control" aria-label="Deadline for pre-evaluation" id="addProjects.deadlinePreEvaluation" 
                            placeholder="Pre-evaluation date YYYY-MM-DD" onFocus={(e) => {(e.target.type as any) = "date"}} onBlur={(e) => {(e.target.type as any) = "text"}} 
                        />
                    </div>
                </div>
                <hr />
                <div className="mb-2 row">
                    <label htmlFor="addProjects.clearingSummary" className="form-label fw-bold">Clearing summary</label>
                    <textarea className="form-control" aria-label="Clearing Summary" id="addProjects.clearingSummary" style={{ height: '120px' }}></textarea>
                </div>
                <hr />
                <div className="mb-2 row">
                    <label htmlFor="addProjects.specialRiskOpenSourceSoftware" className="form-label fw-bold">Special risk Open Source Software</label>
                    <textarea className="form-control" id="addProjects.specialRiskOpenSourceSoftware" aria-label="Special Risk Open Source Software" style={{ height: '120px' }}></textarea>
                </div>
                <hr />
                <div className="mb-2 row">
                    <label htmlFor="addProjects.generalRiskThirdPartySoftware" className="form-label fw-bold">General risk 3rd party software</label>
                    <textarea className="form-control" id="addProjects.generalRiskThirdPartySoftware" aria-label="General risk 3rd party software" style={{ height: '120px' }}></textarea>
                </div>
                <hr />
                <div className="mb-2 row">
                    <label htmlFor="addProjects.specialRiskThirdPartySoftware" className="form-label fw-bold">Special risks 3rd party software</label>
                    <textarea className="form-control" id="addProjects.specialRiskThirdPartySoftware" aria-label="Special risk 3rd party software" style={{ height: '120px' }}></textarea>
                </div>
                <hr />
                <div className="mb-2 row">
                    <label htmlFor="addProjects.salesAndDeliveryChannels" className="form-label fw-bold">Sales and delivery channels</label>
                    <textarea className="form-control" id="addProjects.salesAndDeliveryChannels" aria-label="Sales and delivery channels" style={{ height: '120px' }}></textarea>
                </div>
                <hr />
                <div className="mb-2 row">
                    <label htmlFor="addProjects.remarksAdditionalRequirements" className="form-label fw-bold">Remarks additional requirements</label>
                    <textarea className="form-control" id="addProjects.remarksAdditionalRequirements" aria-label="Remarks additional requirements" style={{ height: '120px' }}></textarea>
                </div>
            </div>
        </>
    )
}