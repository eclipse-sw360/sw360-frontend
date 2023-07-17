"use client"

import { OverlayTrigger, Tooltip } from "react-bootstrap"
import { BiClipboard } from "react-icons/bi"
import Link from "next/link"

const Clipboard = ({text}: {text: string}) => {
    return (
        <>
            <OverlayTrigger overlay={<Tooltip>Copy to Clipboard</Tooltip>}>
                <span className="d-inline-block">
                    <BiClipboard onClick={() => {navigator.clipboard.writeText(text)}}/>
                </span>
            </OverlayTrigger>
      </>
    );
};  

export default function GeneralInformation() {
    return (
        <>
            <div className="row mb-4">
                <div className="row header mb-2">
                    <h6>General Information</h6>
                </div>
                <div className="row">
                    <div className="col-lg-4">{"Id"}:</div>
                    <div className="col">{"68359d958cb94ccd8af659ce0c7bfc21"} <Clipboard text={"68359d958cb94ccd8af659ce0c7bfc21"}/></div>
                    <hr className="my-2" />
                </div>
                <div className="row">
                    <div className="col-lg-4">{"Name"}:</div>
                    <div className="col">{"-DICOMQueryRetrieveScu"}</div>
                    <hr className="my-2" />
                </div>
                <div className="row">
                    <div className="col-lg-4">{"Version"}:</div>
                    <div className="col">{"Vanadium52"}</div>
                    <hr className="my-2" />
                </div>
                <div className="row">
                    <div className="col-lg-4">{"Visibility"}:</div>
                    <div className="col">{"Everyone"}</div>
                    <hr className="my-2" />
                </div>
                <div className="row">
                    <div className="col-lg-4">{"Created On"}:</div>
                    <div className="col">{"2022-10-17"}</div>
                    <hr className="my-2" />
                </div>
                <div className="row">
                    <div className="col-lg-4">{"Created By"}:</div>
                    <div className="col"><Link className={`text-link`} href="#">{"CLEARINGBOT DH"}</Link></div>
                    <hr className="my-2" />
                </div>
                <div className="row">
                    <div className="col-lg-4">{"Modified On"}:</div>
                    <div className="col">{"2022-10-17"}</div>
                    <hr className="my-2" />
                </div>
                <div className="row">
                    <div className="col-lg-4">{"Modified By"}:</div>
                    <div className="col"><Link className={`text-link`} href="#">{"CLEARINGBOT DH"}</Link></div>
                    <hr className="my-2" />
                </div>
                <div className="row">
                    <div className="col-lg-4">{"Project Type"}:</div>
                    <div className="col">{"Customer Project"}</div>
                    <hr className="my-2" />
                </div>
                <div className="row">
                    <div className="col-lg-4">{"Domain"}:</div>
                    <div className="col">{"Application Software"}</div>
                    <hr className="my-2" />
                </div>
                <div className="row">
                    <div className="col-lg-4">{"Tag"}:</div>
                    <div className="col">{"DH"}</div>
                    <hr className="my-2" />
                </div>
                <div className="row">
                    <div className="col-lg-4">{"External Ids"}:</div>
                    <div className="col"></div>
                    <hr className="my-2" />
                </div>
                <div className="row">
                    <div className="col-lg-4">{"Additional Data"}:</div>
                    <div className="col">        
                        <ul>
                            <li key={1}><span className="fw-bold">{"BA BL"}</span> {"SHS DI DH"}</li>
                        </ul>
                    </div>
                    <hr className="my-2" />
                </div>
                <div className="row">
                    <div className="col-lg-4">{"External  URLs"}:</div>
                    <div className="col"></div>
                    <hr className="my-2" />
                </div>
            </div>
        </>
    )
}