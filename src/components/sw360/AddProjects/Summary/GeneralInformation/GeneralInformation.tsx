"use client"

import { BiInfoCircle } from "react-icons/bi"
import { GiCancel } from "react-icons/gi"
import { useState } from "react"
import { OverlayTrigger, Tooltip } from "react-bootstrap"

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

export default function GeneralInformation() {

    const VISIBILITY_INFO = `
    Private: Only visible by creator (and admin which applies to all visibility levels) 
    Me and Moderators: Visible by creator and moderators 
    Group and Moderators: All users of the same group and the moderators 
    Everyone: Every user who is logged into the system
    `

    const PROJECT_TYPE_INFO = `
    Customer: 
    Internal: 
    Product: 
    Service: 
    Inner Source:
    `

    const [showVendorsModal, setShowVendorsModal] = useState<boolean>(false)

    return (
        <>
            {/* <VendorDialog show={showVendorsModal} setShow={setShowVendorsModal}/> */}
            <div className="row mb-4">
                <div className="row header mb-2">
                    <h6>General Information</h6>
                </div>
                <div className="row">
                    <div className="col-lg-4 mb-3">
                        <label htmlFor="addProjects.name" className="form-label fw-bold">Name</label>
                        <input type="text" className="form-control" id="addProjects.name" placeholder="Enter Name" />
                    </div>
                    <div className="col-lg-4 mb-3">
                        <label htmlFor="addProjects.version" className="form-label fw-bold">Version</label>
                        <input type="text" className="form-control" id="addProjects.version" placeholder="Enter Version" />
                    </div>
                    <div className="col-lg-4 mb-3">
                        <label htmlFor="addProjects.visibility" className="form-label fw-bold">Visibility</label>
                        <select className="form-select" id="addProjects.visibility" defaultValue="Group and Moderators" aria-describedby="addProjects.visibility.HelpBlock">
                            <option value="Private">Private</option>
                            <option value="Me and Moderators">Me and Moderators</option>
                            <option value="Group and Moderators">Group and Moderators</option>
                            <option value="Everyone">Everyone</option>
                        </select>
                        <div className="form-text" id="addProjects.visibility.HelpBlock">< ShowInfoOnHover text={VISIBILITY_INFO} /> Learn more about project visibilities.</div>
                    </div>
                </div>
                <hr className="my-2" />
                <div className="row">
                    <div className="col-lg-4 mb-3">
                        <label htmlFor="addProjects.createdBy" className="form-label fw-bold">Created By</label>
                        <input type="text" className="form-control" id="addProjects.createdBy" placeholder="Will be set automatically" readOnly={true} />
                    </div>
                    <div className="col-lg-4 mb-3">
                        <label htmlFor="addProjects.projectType" className="form-label fw-bold">Project Type</label>
                        <select className="form-select" defaultValue="Product" id="addProjects.projectType" aria-describedby="addProjects.projectType.HelpBlock">
                            <option value="Customer Project">Customer Project</option>
                            <option value="Internal Project">Internal Project</option>
                            <option value="Product">Product</option>
                            <option value="Service">Service</option>
                            <option value="Inner Source">Inner Source</option>
                        </select>
                        <div className="form-text" id="addProjects.projectType.HelpBlock">< ShowInfoOnHover text={PROJECT_TYPE_INFO} /> Learn more about project types.</div>
                    </div>
                    <div className="col-lg-4 mb-3">
                        <label htmlFor="addProjects.tag" className="form-label fw-bold">Tag</label>
                        <input type="text" className="form-control" id="addProjects.tag" placeholder="Enter one word tag" />
                    </div>
                </div>
                <hr className="my-2" />
                <div className="row">
                    <div className="col-lg-4 mb-3">
                        <label htmlFor="addProjects.description" className="form-label fw-bold">Description</label>
                        <textarea className="form-control" id="addProjects.description" placeholder="Enter Description" style={{ height: '100px' }}></textarea>
                    </div>
                    <div className="col-lg-4 mb-3">
                        <label htmlFor="addProjects.domain" className="form-label fw-bold">Project Type</label>
                        <select className="form-select" id="addProjects.domain" defaultValue="" aria-label="Enter Domain">
                            <option value="">-- Select Domain --</option>
                            <option value="Application Software">Application Software</option>
                            <option value="Documentation">Documentation</option>
                            <option value="Embedded Software">Embedded Software</option>
                            <option value="Hardware">Hardware</option>
                            <option value="Test and Diagnostics">Test and Diagnostics</option>
                        </select>
                    </div>
                    <div className="col-lg-4 mb-3">
                        <label htmlFor="addProjects.vendor" className="form-label fw-bold">Vendor</label>
                        <input type="text" className="form-control" id="addProjects.vendor" placeholder="Click to set vendor" readOnly={true} onClick={() => setShowVendorsModal(true)} />
                        <div className="form-text">< GiCancel /></div>
                    </div>
                </div>
                <hr className="my-2" />
                <div className="row">
                    <div className="col-lg-4 mb-3">
                        <label htmlFor="addProjects.modifiedOn" className="form-label fw-bold">Modified On</label>
                        <input type="date" className="form-control" id="addProjects.modifiedOn" readOnly={true} />
                    </div>
                    <div className="col-lg-4 mb-3">
                        <label htmlFor="addProjects.modifiedBy" className="form-label fw-bold">Modified By</label>
                        <input type="text" className="form-control" id="addProjects.modifiedBy" placeholder="Will be set automatically" readOnly={true} />
                    </div>
                </div>
                <hr className="my-2"/>
                <div className="row">
                    <div className="col-lg-4">
                        <input className="form-check-input" type="checkbox" value="" id="addProjects.enableSecurityVulnerabilityMonitoring" disabled={true} aria-describedby="addProjects.enableSecurityVulnerabilityMonitoring.HelpBlock"/>
                        <label className="form-check-label fw-bold" htmlFor="addProjects.enableSecurityVulnerabilityMonitoring">
                            Enable Security Vulnerability Monitoring
                        </label>
                        <div className="form-text fw-bold" id="addProjects.enableSecurityVulnerabilityMonitoring.HelpBlock">You need a security responsible to enable monitoring</div>
                    </div>
                    <div className="col-lg-4">
                        <input className="form-check-input" type="checkbox" value="" id="addProjects.useExternalIdList"/>
                        <label className="form-check-label fw-bold" htmlFor="addProjects.useExternalIdList">
                            Do not create monitoring list, but use list from external id
                        </label>
                    </div>
                    <div className="col-lg-4">
                        <input className="form-check-input" type="checkbox" value="" id="addProjects.enableDisplayingVulnerabilities"/>
                        <label className="form-check-label fw-bold" htmlFor="addProjects.enableDisplayingVulnerabilities">
                            Enable Displaying Vulnerabilities
                        </label>
                    </div>
                </div>
            </div>
        </>
    )
}