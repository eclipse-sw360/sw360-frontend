"use client"

import { Container, Row, Col, Form, OverlayTrigger, Tooltip,  Button } from "react-bootstrap"
import styles from "../AddProjects.module.css"
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

export default function Administration() {

    const CLEARING_STATE_INFO = `
    Open: 
    In Progress: 
    Closed:
    `

    const PROJECT_STATE_INFO = `
    Active: 
    Phaseout: 
    Unknown:
    `

    return (
        <>
            <Container>
                <Row className="mb-4">
                    <Row className={`${styles["header"]} mb-2`}>
                        <p className="fw-bold mt-3">Clearing</p>
                    </Row>
                    <Row>
                        <Col lg={4}>
                            <Form.Group className="mb-3" controlId="addProjects.clearingState">
                                <Form.Label className="fw-bold">Clearing State</Form.Label>
                                <Form.Select defaultValue="Open" aria-describedby="addProjects.clearingState.HelpBlock">
                                    <option value="Open">Open</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Closed">Closed</option>
                                </Form.Select>
                                <Form.Text id="addProjects.clearingState.HelpBlock" muted>
                                    < ShowInfoOnHover text={CLEARING_STATE_INFO} /> Learn more about project clearing state.
                                </Form.Text>
                            </Form.Group>
                        </Col>
                        <Col lg={4}>
                            <Form.Group className="mb-3" controlId="addProjects.clearingTeam">
                                <Form.Label className="fw-bold">Clearing Team</Form.Label>
                                <Form.Select defaultValue="ct" aria-label="Clearing Team">
                                    <option value="ct">ct</option>
                                    <option value="gp">gp</option>
                                    <option value="iot">iot</option>
                                    <option value="mo">mo</option>
                                    <option value="mo its">mo its</option>
                                    <option value="sgre">sgre</option>
                                    <option value="shs">shs</option>
                                    <option value="si">si</option>
                                    <option value="sop">sop</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col lg={4}>
                            <Form.Group className="mb-3" controlId="addProjects.deadlinePreEvaluation">
                                <Form.Label className="fw-bold">Deadline for pre-evaluation</Form.Label>
                                <Form.Control type="text" aria-label="Deadline for pre-evaluation" onFocus={(e) => {(e.target.type as any) = "date"}} onBlur={(e) => {(e.target.type as any) = "text"}} placeholder="Pre-evaluation date YYYY-MM-DD"/>
                            </Form.Group>
                        </Col>
                    </Row>
                </Row>
                <hr className="my-2" />
                <Row>
                    <Form.Group className="mb-3" controlId="addProjects.clearingSummary">
                        <Form.Label className="fw-bold">Clearing Summary</Form.Label>
                        <Form.Control as="textarea" aria-label="Clearing Summary" style={{ height: '120px' }}/>
                    </Form.Group>
                </Row>
                <hr className="my-2" />
                <Row>
                    <Form.Group className="mb-3" controlId="addProjects.specialRiskOpenSourceSoftware">
                        <Form.Label className="fw-bold">Special Risk Open Source Software</Form.Label>
                        <Form.Control as="textarea" aria-label="Special Risk Open Source Software" style={{ height: '120px' }}/>
                    </Form.Group>
                </Row>
                <hr className="my-2" />
                <Row>
                    <Form.Group className="mb-3" controlId="addProjects.generalRiskThirdPartySoftware">
                        <Form.Label className="fw-bold">General risk 3rd party software</Form.Label>
                        <Form.Control as="textarea" aria-label="General risk 3rd party software" style={{ height: '120px' }}/>
                    </Form.Group>
                </Row>
                <hr className="my-2" />
                <Row>
                    <Form.Group className="mb-3" controlId="addProjects.specialRiskThirdPartySoftware">
                        <Form.Label className="fw-bold">Special risk 3rd party software</Form.Label>
                        <Form.Control as="textarea" aria-label="Special risk 3rd party software" style={{ height: '120px' }}/>
                    </Form.Group>
                </Row>
                <hr className="my-2" />
                <Row>
                    <Form.Group className="mb-3" controlId="addProjects.salesAndDeliveryChannels">
                        <Form.Label className="fw-bold">Sales and delivery channels</Form.Label>
                        <Form.Control as="textarea" aria-label="Sales and delivery channels" style={{ height: '120px' }}/>
                    </Form.Group>
                </Row>
                <hr className="my-2" />
                <Row>
                    <Form.Group className="mb-3" controlId="addProjects.remarksAdditionalRequirements">
                        <Form.Label className="fw-bold">Remarks additional requirements</Form.Label>
                        <Form.Control as="textarea" aria-label="Remarks additional requirements" style={{ height: '120px' }}/>
                    </Form.Group>
                </Row>
                <Row className="mb-4">
                    <Row className={`${styles["header"]} mb-2`}>
                        <p className="fw-bold mt-3">Lifecycle</p>
                    </Row>
                    <Row>
                        <Col lg={4}>
                            <Form.Group className="mb-3" controlId="addProjects.projectState">
                                <Form.Label className="fw-bold">Project State</Form.Label>
                                <Form.Select defaultValue="Open" aria-describedby="addProjects.projectState.HelpBlock">
                                    <option value="Active">Active</option>
                                    <option value="Phaseout">Phaseout</option>
                                    <option value="Unknown">Unknown</option>
                                </Form.Select>
                                <Form.Text id="addProjects.projectState.HelpBlock" muted>
                                    < ShowInfoOnHover text={PROJECT_STATE_INFO} /> Learn more about project state.
                                </Form.Text>
                            </Form.Group>
                        </Col>
                        <Col lg={4}>
                            <Form.Group className="mb-3" controlId="addProjects.systemTestBeginDate">
                                <Form.Label className="fw-bold">System test begin date</Form.Label>
                                <Form.Control type="text" aria-label="System test begin date" onFocus={(e) => {(e.target.type as any) = "date"}} onBlur={(e) => {(e.target.type as any) = "text"}} placeholder="System test begin date YYYY-MM-DD"/>
                            </Form.Group>
                        </Col>
                        <Col lg={4}>
                            <Form.Group className="mb-3" controlId="addProjects.systemTestEndDate">
                                <Form.Label className="fw-bold">System test end date</Form.Label>
                                <Form.Control type="text" aria-label="System test end date" onFocus={(e) => {(e.target.type as any) = "date"}} onBlur={(e) => {(e.target.type as any) = "text"}} placeholder="System test end date YYYY-MM-DD"/>
                            </Form.Group>
                        </Col>
                    </Row>
                    <hr className="my-2" />
                    <Row>
                        <Col lg={4}>
                            <Form.Group className="mb-3" controlId="addProjects.deliveryStartDate">
                                <Form.Label className="fw-bold">Delivery start date</Form.Label>
                                <Form.Control type="text" aria-label="Delivery start date" onFocus={(e) => {(e.target.type as any) = "date"}} onBlur={(e) => {(e.target.type as any) = "text"}} placeholder="Delivery start date YYYY-MM-DD"/>
                            </Form.Group>
                        </Col>
                        <Col lg={4}>
                            <Form.Group className="mb-3" controlId="addProjects.phaseOutDate">
                                <Form.Label className="fw-bold">Phase-out date</Form.Label>
                                <Form.Control type="text" aria-label="Phase-out date" onFocus={(e) => {(e.target.type as any) = "date"}} onBlur={(e) => {(e.target.type as any) = "text"}} placeholder="Phase-out since YYYY-MM-DD"/>
                            </Form.Group>
                        </Col>
                    </Row>
                </Row>
                <Row className="mb-4">
                    <Row className={`${styles["header"]} mb-2`}>
                        <p className="fw-bold mt-3">License Info Header</p>
                    </Row>
                    <Row className="d-flex justify-content-end">
                        <Col lg={3}>
                            <Button variant="primary" className={`${styles['button-link']} fw-normal`}>Set to default text</Button>
                        </Col>
                    </Row>
                    <Row>
                        <Form.Control as="textarea" id="addProjects.licenseInfoHeader" aria-label="License Info Header" style={{ height: '500px' }}/>
                    </Row>
                </Row>
            </Container>
        </>
    )
}