"use client"

import { Container, Button, Row, Col } from "react-bootstrap"
import { useState } from "react"
import { LinkProjectsModal } from "@/components/sw360"
import { LinkReleasesModal } from "@/components/sw360"

export default function LinkedProjects() {

    const [showLinkProjectsModal, setShowLinkProjectsModal] = useState(false);
    const [showLinkReleasesModal, setShowLinkReleasesModal] = useState(false);

    return (
        <>
            <LinkProjectsModal show={showLinkProjectsModal} setShow={setShowLinkProjectsModal} />
            <LinkReleasesModal show={showLinkReleasesModal} setShow={setShowLinkReleasesModal} />
            <Container>
                <Row className="mb-4">
                    <Row className={`header-1 mb-2 border-bottom`}>
                        <h6 className="fw-bold mt-3">LINKED PROJECTS</h6>
                    </Row>
                    <Row>
                        <Col lg={4} >
                            <Button variant="light" className={`button-plain`} onClick={() => setShowLinkProjectsModal(true)} >Link Projects</Button>
                        </Col>
                    </Row>
                </Row>
                <Row className="mb-4">
                    <Row className={`header-1 mb-2 border-bottom`}>
                        <h6 className="fw-bold mt-3">LINKED RELEASES</h6>
                    </Row>
                    <Row>
                        <Col lg={4} >
                                <Button variant="light" className={`button-plain`} onClick={() => setShowLinkReleasesModal(true)} >Link Releases</Button>
                        </Col>
                    </Row>
                </Row>
            </Container>
        </>
    )
}