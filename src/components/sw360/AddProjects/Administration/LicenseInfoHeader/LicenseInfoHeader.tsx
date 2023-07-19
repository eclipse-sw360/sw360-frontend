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

export default function LicenseInfoHeader() {
    return (
        <>
            <div className="row mb-4">
                <div className="row header mb-2">
                    <h6>License Info Header</h6>
                </div>
                <div className="row d-flex justify-content-end">
                    <div className="col-lg-3">
                        <button type="button" className="btn btn-light">Set to default text</button>
                    </div>
                </div>
                <div className="mb-2 row">
                    <textarea className="form-control" id="addProjects.licenseInfoHeader" aria-label="License Info Header" style={{ height: '500px' }}></textarea>
                </div>
            </div>
        </>
    )
}