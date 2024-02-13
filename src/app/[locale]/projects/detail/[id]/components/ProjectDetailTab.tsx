// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { AdministrationDataType, HttpStatus, SummaryDataType } from '@/object-types'
import { ApiUtils } from '@/utils'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { notFound } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button, Col, Dropdown, ListGroup, Row, Spinner, Tab } from 'react-bootstrap'
import LinkProjects from '../../../components/LinkProjects'
import Administration from './Administration'
import ChangeLog from './Changelog'
import EccDetails from './Ecc'
import LicenseClearing from './LicenseClearing'
import ProjectVulnerabilities from './ProjectVulnerabilities'
import Summary from './Summary'
import AttachmentUsages from './AttachmentUsages'

export default function ViewProjects({ projectId }: { projectId: string }) {
    const t = useTranslations('default')
    const { data: session, status } = useSession()
    const [summaryData, setSummaryData] = useState<SummaryDataType | undefined>(undefined)
    const [administrationData, setAdministrationData] = useState<AdministrationDataType | undefined>(undefined)
    const [show, setShow] = useState(false)

    useEffect(() => {
        if (status !== 'authenticated') return

        const controller = new AbortController()
        const signal = controller.signal

        ;(async () => {
            try {
                const response = await ApiUtils.GET(
                    `projects/${projectId}/summaryAdministration`,
                    session.user.access_token,
                    signal
                )
                if (response.status === HttpStatus.UNAUTHORIZED) {
                    return signOut()
                } else if (response.status !== HttpStatus.OK) {
                    return notFound()
                }

                const data = await response.json()

                setSummaryData({ id: projectId, ...data })
                setAdministrationData(data)
            } catch (e) {
                console.error(e)
            }
        })()

        return () => controller.abort()
    }, [projectId, session, status])

    return (
        <>
            <LinkProjects show={show} setShow={setShow} projectId={projectId} />
            <div className='ms-5 mt-2'>
                <Tab.Container defaultActiveKey='summary' mountOnEnter={true} unmountOnExit={true}>
                    <Row>
                        <Col sm='auto' className='me-3'>
                            <ListGroup>
                                <ListGroup.Item action eventKey='summary'>
                                    <div className='my-2'>{t('Summary')}</div>
                                </ListGroup.Item>
                                <ListGroup.Item action eventKey='administration'>
                                    <div className='my-2'>{t('Administration')}</div>
                                </ListGroup.Item>
                                <ListGroup.Item action eventKey='licenseClearing'>
                                    <div className='my-2'>{t('License Clearing')}</div>
                                </ListGroup.Item>
                                <ListGroup.Item action eventKey='obligations'>
                                    <div className='my-2'>{t('Obligations')}</div>
                                </ListGroup.Item>
                                <ListGroup.Item action eventKey='ecc'>
                                    <div className='my-2'>{t('ECC')}</div>
                                </ListGroup.Item>
                                <ListGroup.Item action eventKey='vulnerabilityTrackingStatus'>
                                    <div className='my-2'>{t('Vulnerability Tracking Status')}</div>
                                </ListGroup.Item>
                                <ListGroup.Item action eventKey='attachments'>
                                    <div className='my-2'>{t('Attachments')}</div>
                                </ListGroup.Item>
                                <ListGroup.Item action eventKey='attachmentUsages'>
                                    <div className='my-2'>{t('Attachment Usages')}</div>
                                </ListGroup.Item>
                                <ListGroup.Item action eventKey='vulnerabilities'>
                                    <div className='my-2'>{t('Vulnerabilities')}</div>
                                </ListGroup.Item>
                                <ListGroup.Item action eventKey='changeLog'>
                                    <div className='my-2'>{t('Change Log')}</div>
                                </ListGroup.Item>
                            </ListGroup>
                        </Col>
                        <Col className='ps-2 me-3'>
                            <Row className='d-flex justify-content-between'>
                                <Col lg={6}>
                                    <Row>
                                        <Button variant='primary' className='me-2 col-auto'>
                                            {t('Edit Projects')}
                                        </Button>
                                        <Button variant='secondary' className='col-auto' onClick={() => setShow(true)}>
                                            {t('Link to Projects')}
                                        </Button>
                                        <Dropdown className='col-auto'>
                                            <Dropdown.Toggle variant='dark' id='exportSBOM' className='px-2'>
                                                {t('Export SBOM')}
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item>{t('CycloneDX')}</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </Row>
                                </Col>
                                <Col lg={5} className='text-truncate buttonheader-title me-3'>
                                    {summaryData && `${summaryData.name} (${summaryData.version})`}
                                </Col>
                            </Row>
                            <Row className='mt-3'>
                                <Tab.Content>
                                    <Tab.Pane eventKey='summary'>
                                        {!summaryData ? (
                                            <div className='col-12' style={{ textAlign: 'center' }}>
                                                <Spinner className='spinner' />
                                            </div>
                                        ) : (
                                            <Summary summaryData={summaryData} />
                                        )}
                                    </Tab.Pane>
                                    <Tab.Pane eventKey='administration'>
                                        {!administrationData ? (
                                            <div className='col-12' style={{ textAlign: 'center' }}>
                                                <Spinner className='spinner' />
                                            </div>
                                        ) : (
                                            <Administration data={administrationData} />
                                        )}
                                    </Tab.Pane>
                                    <Tab.Pane eventKey='licenseClearing'>
                                        {summaryData && (
                                            <LicenseClearing
                                                projectId={projectId}
                                                projectName={summaryData.name ?? ''}
                                                projectVersion={summaryData.version ?? ''}
                                            />
                                        )}
                                    </Tab.Pane>
                                    <Tab.Pane eventKey='obligations'></Tab.Pane>
                                    <Tab.Pane eventKey='ecc'>
                                        <EccDetails projectId={projectId} />
                                    </Tab.Pane>
                                    <Tab.Pane eventKey='vulnerabilityTrackingStatus'></Tab.Pane>
                                    <Tab.Pane eventKey='attachments'></Tab.Pane>
                                    <Tab.Pane eventKey='attachmentUsages'>
                                        <AttachmentUsages projectId={projectId}/>
                                    </Tab.Pane>
                                    <Tab.Pane eventKey='vulnerabilities'>
                                        {summaryData && (
                                            <ProjectVulnerabilities
                                                projectData={{
                                                    id: projectId,
                                                    name: summaryData.name ?? '',
                                                    version: summaryData.version ?? '',
                                                    enableSvm: summaryData.enableSvm ?? false,
                                                    enableVulnerabilitiesDisplay:
                                                        summaryData.enableVulnerabilitiesDisplay ?? false,
                                                }}
                                            />
                                        )}
                                    </Tab.Pane>
                                    <Tab.Pane eventKey='changeLog'>
                                        <ChangeLog projectId={projectId} />
                                    </Tab.Pane>
                                </Tab.Content>
                            </Row>
                        </Col>
                    </Row>
                </Tab.Container>
            </div>
        </>
    )
}
