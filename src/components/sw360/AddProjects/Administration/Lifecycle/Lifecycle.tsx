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

export default function Lifecycle() {

    const PROJECT_STATE_INFO = `
    Active: 
    Phaseout: 
    Unknown:
    `

    return (
        <>
            <div className="row mb-4">
                <div className="row header mb-2">
                    <h6>Lifecycle</h6>
                </div>
                <div className="row">
                    <div className="col-lg-4 mb-3">
                        <label htmlFor="addProjects.projectState" className="form-label fw-bold">Project State</label>
                        <select className="form-select" id="addProjects.projectState" defaultValue="Open" aria-describedby="addProjects.projectState.HelpBlock">
                            <option value="Active">Active</option>
                            <option value="Phaseout">Phaseout</option>
                            <option value="Unknown">Unknown</option>
                        </select>
                        <div className="form-text" id="addProjects.projectState.HelpBlock">< ShowInfoOnHover text={PROJECT_STATE_INFO} /> Learn more about project state.</div>
                    </div>
                    <div className="col-lg-4 mb-3">
                        <label htmlFor="addProjects.systemTestBeginDate" className="form-label fw-bold">System test begin date</label>
                        <input type="text" className="form-control" aria-label="Deadline for pre-evaluation" id="addProjects.systemTestBeginDate" 
                            placeholder="System test begin date YYYY-MM-DD" onFocus={(e) => {(e.target.type as any) = "date"}} onBlur={(e) => {(e.target.type as any) = "text"}} 
                        />
                    </div>
                    <div className="col-lg-4 mb-3">
                        <label htmlFor="addProjects.systemTestEndDate" className="form-label fw-bold">System test end date</label>
                        <input type="text" className="form-control" aria-label="Deadline for pre-evaluation" id="addProjects.systemTestEndDate" 
                            placeholder="System test end date YYYY-MM-DD" onFocus={(e) => {(e.target.type as any) = "date"}} onBlur={(e) => {(e.target.type as any) = "text"}} 
                        />
                    </div>
                </div>
                <hr className="my-2" />
                <div className="row">
                    <div className="col-lg-4 mb-3">
                        <label htmlFor="addProjects.systemTestBeginDate" className="form-label fw-bold">Delivery start date</label>
                        <input type="text" className="form-control" aria-label="Deadline for pre-evaluation" id="addProjects.systemTestBeginDate" 
                            placeholder="Delivery start date YYYY-MM-DD" onFocus={(e) => {(e.target.type as any) = "date"}} onBlur={(e) => {(e.target.type as any) = "text"}} 
                        />
                    </div>
                    <div className="col-lg-4 mb-3">
                        <label htmlFor="addProjects.phaseOutDate" className="form-label fw-bold">Phase-out date</label>
                        <input type="text" className="form-control" aria-label="Deadline for pre-evaluation" id="addProjects.phaseOutDate" 
                            placeholder="Phase-out since YYYY-MM-DD" onFocus={(e) => {(e.target.type as any) = "date"}} onBlur={(e) => {(e.target.type as any) = "text"}} 
                        />
                    </div>
                </div>
            </div>
        </>
    )
}