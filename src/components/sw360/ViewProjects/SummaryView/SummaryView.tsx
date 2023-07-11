"use client"

import { Container, Row, Col, OverlayTrigger, Tooltip } from "react-bootstrap"
import { BiClipboard } from "react-icons/bi"
import Link from "next/link";

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

export default function SummaryView() {

    const moderators = ["ashaya.chandrashekara@siemens-healthineers.com", "D. Krishna Prasad", "Sai Raj Devarakonda", "Sujith Manuel", "Vilasa Palleda Jagadish"]
    const securityResponsibles = ["ashaya.chandrashekara@siemens-healthineers.com", "D. Krishna Prasad", "Guruprasad B.G", "Marc Landry K Djamou", "Sai Raj Devarakonda", "Sujith Manuel", "Vilasa Palleda Jagadish"]

    return (
        <>
            <Container>
                <Row className="mb-4">
                    <Row className={`header mb-2`}>
                        <h6 className="my-2">General Information</h6>
                    </Row>
                    <Row>
                        <Col lg={4}>{"Id"}:</Col>
                        <Col>{"68359d958cb94ccd8af659ce0c7bfc21"} <Clipboard text={"68359d958cb94ccd8af659ce0c7bfc21"}/></Col>
                        <hr className="my-2" />
                    </Row>
                    <Row>
                        <Col lg={4}>{"Name"}:</Col>
                        <Col>{"-DICOMQueryRetrieveScu"}</Col>
                        <hr className="my-2" />
                    </Row>
                    <Row>
                        <Col lg={4}>{"Version"}:</Col>
                        <Col>{"Vanadium52"}</Col>
                        <hr className="my-2" />
                    </Row>
                    <Row>
                        <Col lg={4}>{"Visibility"}:</Col>
                        <Col>{"Everyone"}</Col>
                        <hr className="my-2" />
                    </Row>
                    <Row>
                        <Col lg={4}>{"Created On"}:</Col>
                            <Col>{"2022-10-17"}</Col>
                            <hr className="my-2" />
                        </Row>
                    <Row>
                        <Col lg={4}>{"Created By"}:</Col>
                        <Col><Link className={`text-link`} href="#">{"CLEARINGBOT DH"}</Link></Col>
                        <hr className="my-2" />
                    </Row>
                    <Row>
                        <Col lg={4}>{"Modified On"}:</Col>
                        <Col>{"2022-10-17"}</Col>
                        <hr className="my-2" />
                    </Row>
                    <Row>
                        <Col lg={4}>{"Modified By"}:</Col>
                        <Col><Link className={`text-link`} href="#">{"CLEARINGBOT DH"}</Link></Col>
                        <hr className="my-2" />
                    </Row>
                    <Row>
                        <Col lg={4}>{"Project Type"}:</Col>
                        <Col>{"Customer Project"}</Col>
                        <hr className="my-2" />
                    </Row>
                    <Row>
                        <Col lg={4}>{"Domain"}:</Col>
                        <Col>{"Application Software"}</Col>
                        <hr className="my-2" />
                    </Row>
                    <Row>
                        <Col lg={4}>{"Tag"}:</Col>
                        <Col>{"DH"}</Col>
                        <hr className="my-2" />
                    </Row>
                    <Row>
                        <Col lg={4}>{"External Ids"}:</Col>
                        <Col></Col>
                        <hr className="my-2" />
                    </Row>
                    <Row>
                        <Col lg={4}>{"Additional Data"}:</Col>
                        <Col>
                            <ul>
                                <li><span className="fw-bold">{"BA BL"}</span> {"SHS DI DH"}</li>
                            </ul>
                        </Col>
                        <hr className="my-2" />
                    </Row>
                    <Row>
                        <Col lg={4}>{"External  URLs"}:</Col>
                        <Col></Col>
                        <hr className="my-2" />
                    </Row>
                </Row>
                <Row className="mb-4">
                    <Row className={`header mb-2`}>
                        <h6 className="my-2">Roles</h6>
                    </Row>
                    <Row>
                        <Col lg={4}>{"Group"}:</Col>
                        <Col>{"SHS"}</Col>
                        <hr className="my-2" />
                    </Row>
                    <Row>
                        <Col lg={4}>{"Project Responsible"}:</Col>
                        <Col><Link className={`text-link`} href="#">{"Dilip Bhaskar"}</Link></Col>
                        <hr className="my-2" />
                    </Row>
                    <Row>
                        <Col lg={4}>{"Project Owner"}:</Col>
                        <Col><Link className={`text-link`} href="#">{"ashok.anandaram@siemens-healthineers.com"}</Link></Col>
                        <hr className="my-2" />
                    </Row>
                    <Row>
                        <Col lg={4}>{"Owner Accounting Unit"}:</Col>
                        <Col></Col>
                        <hr className="my-2" />
                    </Row>
                    <Row>
                        <Col lg={4}>{"Owner Billing Group"}:</Col>
                        <Col>{"SHS"}</Col>
                        <hr className="my-2" />
                    </Row>
                    <Row>
                        <Col lg={4}>{"Owner Country"}:</Col>
                        <Col></Col>
                        <hr className="my-2" />
                    </Row>
                    <Row>
                        <Col lg={4}>{"Lead Architect"}:</Col>
                        <Col><Link className={`text-link`} href="#">{"Sujith Manuel"}</Link></Col>
                        <hr className="my-2" />
                    </Row>
                    <Row>
                        <Col lg={4}>{"Moderators"}:</Col>
                        <Col>
                            {
                                moderators.map((elem, i) => { 
                                    return (
                                        <><Link className={`text-link`} href="#">{elem}</Link>{(i === moderators.length - 1)?"":","} </>
                                    )
                                })
                            }
                        </Col>
                        <hr className="my-2" />
                    </Row>
                    <Row>
                        <Col lg={4}>{"Contributors"}:</Col>
                        <Col></Col>
                        <hr className="my-2" />
                    </Row>
                    <Row>
                        <Col lg={4}>{"Security Responsibles"}:</Col>
                        <Col>
                            {
                                securityResponsibles.map((elem, i) => { 
                                    return (
                                        <><Link className={`text-link`} href="#">{elem}</Link>{(i === securityResponsibles.length - 1)?"":","} </>
                                    )
                                })
                            }
                        </Col>
                        <hr className="my-2" />
                    </Row>
                    <Row>
                        <Col lg={4}>{"Additional Roles"}:</Col>
                        <Col></Col>
                        <hr className="my-2" />
                    </Row>
                </Row>
                <Row className="mb-4">
                    <Row className={`header mb-2`}>
                        <h6 className="my-2">Project Vendor</h6>
                    </Row>
                    <Row>
                        <Col lg={4}>{"Full Name"}:</Col>
                        <Col></Col>
                        <hr className="my-2" />
                    </Row>
                    <Row>
                        <Col lg={4}>{"Short Name"}:</Col>
                        <Col></Col>
                        <hr className="my-2" />
                    </Row>
                    <Row>
                        <Col lg={4}>{"URL"}:</Col>
                        <Col></Col>
                        <hr className="my-2" />
                    </Row>
                </Row>
            </Container>
        </>
    )
}