"use client"

import { Row, Col, Form, OverlayTrigger, Tooltip, Container } from "react-bootstrap"
import { BiInfoCircle } from "react-icons/bi"
import { useState } from "react"
import { GiCancel } from "react-icons/gi"
import { DepartmentModal, AddKeyValueComponent, VendorDialog, 
        AddAdditionalRolesComponent, SelectCountryComponent, UsersModal } from "@/components/sw360"
import AddAdditionalData from "./AddAdditionalData/AddAdditionalData"
import AdditionalDataInput from "./AddAdditionalData/AddAdditionalData.types"
import DocumentTypes from '@/object-types/enums/DocumentTypes'

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

export default function Summary() {

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

    const [showDepartmentModal, setShowDepartmentModal] = useState<boolean>(false)
    const [showUsersModal, setShowUsersModal] = useState<boolean>(false)
    const [showVendorsModal, setShowVendorsModal] = useState<boolean>(false)

    const [additionalDataList, setAdditionalDataList] = useState<AdditionalDataInput[]>([
        {
            key: "BA BL",
            value: ""
        },
        {
            key: "CSMS Asset Type",
            value: ""
        }
    ])

    return (
        <>
            <UsersModal show={showUsersModal} setShow={setShowUsersModal} />
            {/* <VendorDialog show={showVendorsModal} setShow={setShowVendorsModal}/> */}
            <DepartmentModal show={showDepartmentModal} setShow={setShowDepartmentModal} />
            <Container>
                <Row className="mb-4">
                    <Row className={`header mb-2`}>
                        <p className="fw-bold mt-3">General Information</p>
                    </Row>
                    <Row>
                        <Col lg={4}>
                            <Form.Group className="mb-3" controlId="addProjects.name">
                                <Form.Label className="fw-bold">Name</Form.Label>
                                <Form.Control type="text" aria-label="Name" placeholder="Enter Name"/>
                            </Form.Group>
                        </Col>
                        <Col lg={4}>
                            <Form.Group className="mb-3" controlId="addProjects.version">
                                <Form.Label className="fw-bold">Version</Form.Label>
                                <Form.Control type="text" aria-label="Version" placeholder="Enter Version"/>
                            </Form.Group>
                        </Col>
                        <Col lg={4}>
                            <Form.Group className="mb-3" controlId="addProjects.visibility">
                                <Form.Label className="fw-bold">Visibility</Form.Label>
                                <Form.Select defaultValue="Group and Moderators" aria-describedby="addProjects.visibility.HelpBlock">
                                    <option value="Private">Private</option>
                                    <option value="Me and Moderators">Me and Moderators</option>
                                    <option value="Group and Moderators">Group and Moderators</option>
                                    <option value="Everyone">Everyone</option>
                                </Form.Select>
                                <Form.Text id="addProjects.visibility.HelpBlock" muted>
                                    < ShowInfoOnHover text={VISIBILITY_INFO} /> Learn more about project visibilities.
                                </Form.Text>
                            </Form.Group>
                        </Col>
                    </Row>
                    <hr className="my-2" />
                    <Row>
                        <Col lg={4}>
                            <Form.Group className="mb-3" controlId="addProjects.createdBy">
                                <Form.Label className="fw-bold">Created By</Form.Label>
                                <Form.Control type="text" aria-label="Created By" placeholder="Will be set automatically" readOnly/>
                            </Form.Group>
                        </Col>
                        <Col lg={4}>
                            <Form.Group className="mb-3" controlId="addProjects.projectType">
                                <Form.Label className="fw-bold">Project Type</Form.Label>
                                <Form.Select defaultValue="Product" aria-describedby="addProjects.projectType.HelpBlock">
                                    <option value="Customer Project">Customer Project</option>
                                    <option value="Internal Project">Internal Project</option>
                                    <option value="Product">Product</option>
                                    <option value="Service">Service</option>
                                    <option value="Inner Source">Inner Source</option>
                                </Form.Select>
                                <Form.Text id="addProjects.projectType.HelpBlock" muted>
                                    < ShowInfoOnHover text={PROJECT_TYPE_INFO} /> Learn more about project types.
                                </Form.Text>
                            </Form.Group>
                        </Col>
                        <Col lg={4}>
                            <Form.Group className="mb-3" controlId="addProjects.tag">
                                <Form.Label className="fw-bold">Tag</Form.Label>
                                <Form.Control type="text" aria-label="Tag" placeholder="Enter one word tag"/>
                            </Form.Group>
                        </Col>
                    </Row>
                    <hr className="my-2" />
                    <Row>
                        <Col lg={4}>
                            <Form.Group className="mb-3" controlId="addProjects.description">
                                <Form.Label className="fw-bold">Description</Form.Label>
                                <Form.Control as="textarea" aria-label="Description" placeholder="Enter Description" style={{ height: '100px' }}/>
                            </Form.Group>
                        </Col>
                        <Col lg={4}>
                            <Form.Group className="mb-3" controlId="addProjects.domain">
                                <Form.Label className="fw-bold">Domain</Form.Label>
                                <Form.Select defaultValue="" aria-label="Domain">
                                    <option value="">-- Select Domain --</option>
                                    <option value="Application Software">Application Software</option>
                                    <option value="Documentation">Documentation</option>
                                    <option value="Embedded Software">Embedded Software</option>
                                    <option value="Hardware">Hardware</option>
                                    <option value="Test and Diagnostics">Test and Diagnostics</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col lg={4}>
                            <Form.Group className="mb-3" controlId="addProjects.vendor">
                                <Form.Label className="fw-bold">Vendor</Form.Label>
                                <Form.Control type="text" aria-describedby="addProjects.vendor.HelpBlock" placeholder="Click to set vendor" readOnly onClick={() => setShowVendorsModal(true)}/>
                                <Form.Text id="addProjects.vendor.HelpBlock">
                                     < GiCancel />
                                </Form.Text>
                            </Form.Group>
                        </Col>
                    </Row>
                    <hr className="my-2" />
                    <Row>
                         <Col lg={4}>
                            <Form.Group className="mb-3" controlId="addProjects.modifiedOn">
                                <Form.Label className="fw-bold">Modified On</Form.Label>
                                <Form.Control type="date" aria-label="Modified On" readOnly/>
                            </Form.Group>
                        </Col>
                        <Col lg={4}>
                            <Form.Group className="mb-3" controlId="addProjects.modifiedBy">
                                <Form.Label className="fw-bold">Modified By</Form.Label>
                                <Form.Control type="text" aria-label="Modified By" placeholder="Will be set automatically" readOnly/>
                            </Form.Group>
                        </Col>
                    </Row>
                    <hr className="my-2"/>
                    <Row>
                        <Col lg={4}>
                            <Form.Group>
                                <Form.Check
                                    className="fw-bold"
                                    disabled
                                    type="checkbox"
                                    label="Enable Security Vulnerability Monitoring"
                                    id="addProjects.enableSecurityVulnerabilityMonitoring"
                                />
                                <Form.Text id="addProjects.enableSecurityVulnerabilityMonitoring.PermissionBlock"  className="fw-bold" muted>
                                    You need a security responsible to enable monitoring
                                </Form.Text>
                            </Form.Group>
                        </Col>
                        <Col lg={4}>
                            <Form.Check
                                type="checkbox"
                                label="Do not create monitoring list, but use list from external id"
                                id="addProjects.useExternalIdList"
                            />
                        </Col>
                        <Col lg={4}>
                            <Form.Check
                                type="checkbox"
                                label="Enable Displaying Vulnerabilities"
                                id="addProjects.useExternalIdList"
                            />
                        </Col>
                    </Row>
                </Row>
                <Row className="mb-4">
                    <Row>
                        <AddKeyValueComponent
                            header={'External URLs'}
                            keyName={'external url'}
                        />
                    </Row>
                </Row>
                <Row className="mb-4">
                    <Row className={`header mb-2`}>
                        <p className="fw-bold mt-3">Roles</p>
                    </Row>
                    <Row>
                        <Col lg={4}>
                            <Form.Group className="mb-3" controlId="addProjects.group">
                                <Form.Label className="fw-bold">Group</Form.Label>
                                <Form.Control type="text" aria-label="Group" placeholder="Click to set Department" readOnly onClick={() => setShowDepartmentModal(true)}/>
                                <Form.Text id="addProjects.vendor.HelpBlock">
                                     < GiCancel />
                                </Form.Text>
                            </Form.Group>
                        </Col>
                        <Col lg={4}>
                            <Form.Group className="mb-3" controlId="addProjects.projectManager">
                                <Form.Label className="fw-bold">Project Manager</Form.Label>
                                <Form.Control type="text" aria-label="Project Manager" placeholder="Click to edit" readOnly onClick={() => setShowUsersModal(true)}/>
                            </Form.Group>
                        </Col>
                        <Col lg={4}>
                            <Form.Group className="mb-3" controlId="addProjects.projectOwner">
                                <Form.Label className="fw-bold">Project Owner</Form.Label>
                                <Form.Control type="text" aria-label="Project Owner" placeholder="Click to edit" readOnly onClick={() => setShowUsersModal(true)}/>
                            </Form.Group>
                        </Col>
                    </Row>
                    <hr className="my-2"/>
                    <Row className="w-100">
                        <Col lg={4}>
                            <Form.Group className="mb-3" controlId="addProjects.ownerAccountingUnit">
                                <Form.Label className="fw-bold">Owner Accounting Unit</Form.Label>
                                <Form.Control type="text" aria-label="Owner Accounting Unit" placeholder="Enter owner's accounting unit" readOnly/>
                            </Form.Group>
                        </Col>
                        <Col lg={4}>
                            <Form.Group className="mb-3" controlId="addProjects.ownerBillingGroup">
                                <Form.Label className="fw-bold">Owner Billing Group</Form.Label>
                                <Form.Control type="text" aria-label="Owner Billing Group" placeholder="Enter Owner Billing Group" readOnly/>
                            </Form.Group>
                        </Col>
                        <Col lg={4}>
                            <SelectCountryComponent/>
                        </Col>
                    </Row>
                    <hr className="my-2"/>
                    <Row>
                        <Col lg={4}>
                            <Form.Group className="mb-3" controlId="addProjects.leadArchitect">
                                <Form.Label className="fw-bold">Lead Architect</Form.Label>
                                <Form.Control type="text" aria-label="Lead Architect" placeholder="Click to edit" readOnly onClick={() => setShowUsersModal(true)}/>
                            </Form.Group>
                        </Col>
                        <Col lg={4}>
                            <Form.Group className="mb-3" controlId="addProjects.moderators">
                                <Form.Label className="fw-bold">Moderators</Form.Label>
                                <Form.Control type="text" aria-label="Moderators" placeholder="Click to edit" readOnly onClick={() => setShowUsersModal(true)}/>
                            </Form.Group>
                        </Col>
                        <Col lg={4}>
                            <Form.Group className="mb-3" controlId="addProjects.contributors">
                                <Form.Label className="fw-bold">Contributors</Form.Label>
                                <Form.Control type="text" aria-label="" placeholder="Click to edit" readOnly onClick={() => setShowUsersModal(true)}/>
                            </Form.Group>
                        </Col>
                    </Row>
                    <hr className="my-2" />
                    <Row>
                        <Col lg={4}>
                            <Form.Group className="mb-3" controlId="addProjects.securityResponsibles">
                                <Form.Label className="fw-bold">Security Responsibles</Form.Label>
                                <Form.Control type="text" aria-label="" placeholder="Click to edit" readOnly onClick={() => setShowUsersModal(true)}/>
                            </Form.Group>
                        </Col>
                    </Row>
                </Row>
                <Row className="mb-4">
                    <Row>
                        <AddAdditionalRolesComponent
                            documentType={DocumentTypes.PROJECT}
                        />
                    </Row>
                </Row>
                <Row className="mb-4">
                    <Row>
                        <AddKeyValueComponent
                            header={'External Ids'}
                            keyName={'external id'}
                        />
                    </Row>
                </Row>
                <Row className="mb-4">
                    <Row className={`header mb-2`}>
                        <p className="fw-bold mt-3">Add Additional Data</p>
                    </Row>
                    <Row>
                        <AddAdditionalData inputList={additionalDataList} setInputList={setAdditionalDataList} />
                    </Row>
                </Row>
            </Container>
        </>
    )
}