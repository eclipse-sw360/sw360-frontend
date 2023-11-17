// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { notFound } from 'next/navigation'
import { ComponentType, useEffect, useState } from 'react'
import { Button, Col, Dropdown, ListGroup, Row, Spinner, Tab } from 'react-bootstrap'

import { withAuth } from '@/components/sw360'
import { AdministrationDataType, HttpStatus, SummaryDataType } from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils'
import { Session } from 'next-auth'
import LinkProjects from '../../../components/LinkProjects'
import Administration from './Administration'
import ChangeLog from './Changelog'
import EccDetails from './Ecc'
import Summary from './Summary'

const ViewProjects: ComponentType<{ projectId: string; session: Session }> = ({ projectId, session }) => {
    const t = useTranslations('default')
    const [summaryData, setSummaryData] = useState<SummaryDataType | undefined>(undefined)
    const [administrationData, setAdministrationData] = useState<AdministrationDataType | undefined>(undefined)
    const [show, setShow] = useState(false)

    useEffect(() => {
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

                const projectResponsibleResponse = CommonUtils.isNullEmptyOrUndefinedString(data.projectResponsible)
                    ? null
                    : await ApiUtils.GET(`users/${data.projectResponsible}`, session.user.access_token, signal)

                const modifiedByResponse = CommonUtils.isNullEmptyOrUndefinedString(data.modifiedBy)
                    ? null
                    : await ApiUtils.GET(`users/${data.modifiedBy}`, session.user.access_token, signal)

                const projectOwnerResponse = CommonUtils.isNullEmptyOrUndefinedString(data.projectOwner)
                    ? null
                    : await ApiUtils.GET(`users/${data.projectOwner}`, session.user.access_token, signal)

                const securityResponsibles: any = []
                for (const responsible of data.securityResponsibles) {
                    if (CommonUtils.isNullEmptyOrUndefinedString(responsible)) continue
                    securityResponsibles.push(ApiUtils.GET(`users/${responsible}`, session.user.access_token, signal))
                }
                const res = await Promise.all(securityResponsibles)

                if (
                    (projectResponsibleResponse !== null &&
                        projectResponsibleResponse.status === HttpStatus.UNAUTHORIZED) ||
                    (modifiedByResponse !== null && modifiedByResponse.status === HttpStatus.UNAUTHORIZED) ||
                    (modifiedByResponse !== null && modifiedByResponse.status === HttpStatus.UNAUTHORIZED)
                ) {
                    return signOut()
                } else if (
                    (projectResponsibleResponse !== null && projectResponsibleResponse.status !== HttpStatus.OK) ||
                    (modifiedByResponse !== null && modifiedByResponse.status !== HttpStatus.OK) ||
                    (modifiedByResponse !== null && modifiedByResponse.status !== HttpStatus.OK)
                ) {
                    return notFound()
                }

                for (const elem of res) {
                    if (elem.status === HttpStatus.UNAUTHORIZED) {
                        return signOut()
                    } else if (elem.status !== HttpStatus.OK) {
                        return notFound()
                    }
                }

                const responsibles = await Promise.all(res.map((r) => r.json()))
                const projectResponsible = CommonUtils.isNullOrUndefined(projectResponsibleResponse)
                    ? null
                    : await projectResponsibleResponse.json()
                const modifiedBy = CommonUtils.isNullOrUndefined(modifiedByResponse)
                    ? null
                    : await modifiedByResponse.json()
                const projectOwner = CommonUtils.isNullOrUndefined(projectOwnerResponse)
                    ? null
                    : await projectOwnerResponse.json()

                setSummaryData({
                    description: data.description,

                    // General Information
                    id: projectId,
                    name: data.name,
                    version: data.version,
                    visibility: data.visibility,
                    createdOn: data.createdOn,
                    createdBy: {
                        name: CommonUtils.isNullOrUndefined(data['_embedded']['createdBy'])
                            ? ''
                            : data['_embedded']['createdBy']['fullName'],
                        email: CommonUtils.isNullOrUndefined(data['_embedded']['createdBy'])
                            ? ''
                            : data['_embedded']['createdBy']['email'],
                    },
                    modifiedOn: data.modifiedOn,
                    modifiedBy: CommonUtils.isNullOrUndefined(modifiedBy)
                        ? { name: '', email: '' }
                        : { name: modifiedBy.fullName, email: modifiedBy.email },
                    projectType: data.projectType,
                    domain: data.domain,
                    tag: data.tag,
                    externalIds: new Map<string, string>(Object.entries(data.externalIds)),
                    additionalData: new Map<string, string>(Object.entries(data.additionalData)),
                    externalUrls: new Map<string, string>(Object.entries(data.externalUrls)),

                    // Roles
                    group: data.businessUnit,
                    projectResponsible: CommonUtils.isNullOrUndefined(projectResponsible)
                        ? { name: '', email: '' }
                        : { name: projectResponsible.fullName, email: projectResponsible.email },
                    projectOwner: CommonUtils.isNullOrUndefined(projectOwner)
                        ? { name: '', email: '' }
                        : { name: projectOwner.fullName, email: projectOwner.email },
                    ownerAccountingUnit: data.ownerAccountingUnit,
                    ownerBillingGroup: data.ownerGroup,
                    ownerCountry: data.ownerCountry,
                    leadArchitect: {
                        name: CommonUtils.isNullOrUndefined(data['_embedded']['leadArchitect'])
                            ? ''
                            : data['_embedded']['leadArchitect']['fullName'],
                        email: CommonUtils.isNullOrUndefined(data['_embedded']['leadArchitect'])
                            ? ''
                            : data['_embedded']['leadArchitect']['email'],
                    },
                    moderators: CommonUtils.isNullOrUndefined(data['_embedded']['sw360:moderators'])
                        ? []
                        : data['_embedded']['sw360:moderators'].map((moderator: any) => ({
                              name: moderator.fullName,
                              email: moderator.email,
                          })),
                    contributors: CommonUtils.isNullOrUndefined(data['_embedded']['sw360:contributors'])
                        ? []
                        : data['_embedded']['sw360:contributors'].map((contributor: any) => ({
                              name: contributor.fullName,
                              email: contributor.email,
                          })),
                    securityResponsibles: responsibles.map((elem: any) => {
                        return { name: elem.fullName, email: elem.email }
                    }),
                    additionalRoles: new Map<string, string>(Object.entries(data.roles)),

                    // Project Vendor
                    vendorFullName: CommonUtils.isNullEmptyOrUndefinedArray(data['_embedded']['sw360:vendors'])
                        ? ''
                        : data['_embedded']['sw360:vendors'][0]['fullName'],
                    vendorShortName: CommonUtils.isNullEmptyOrUndefinedArray(data['_embedded']['sw360:vendors'])
                        ? ''
                        : data['_embedded']['sw360:vendors'][0]['shortName'],
                    vendorUrl: CommonUtils.isNullEmptyOrUndefinedArray(data['_embedded']['sw360:vendors'])
                        ? ''
                        : data['_embedded']['sw360:vendors'][0]['url'],
                })
                setAdministrationData({
                    // Clearing
                    projectClearingState: data.clearingState,
                    clearingDetails: '',
                    clearingTeam: '',
                    deadlineForPreEval: data.preevaluationDeadline,
                    clearingSummary: data.clearingSummary,
                    specialRiskOpenSourceSoftware: data.specialRisksOSS,
                    generalRisksThirdPartySoftware: data.generalRisks3rdParty,
                    specialRisksThirdPartySoftware: data.specialRisks3rdParty,
                    salesAndDeliveryChannels: data.deliveryChannels,
                    remarksAdditionalRequirements: data.remarksAdditionalRequirements,

                    // Lifecycle
                    projectState: data.state,
                    systemStateBegin: data.systemTestStart,
                    systemStateEnd: data.systemTestEnd,
                    deliveryStart: data.deliveryStart,
                    phaseOutSince: data.phaseOutSince,

                    // LicenseInfoHeader
                    licenseInfoHeader: '',
                })
            } catch (e) {
                console.error(e)
            }
        })()

        return () => controller.abort()
    }, [projectId, session])

    return (
        <>
            <LinkProjects show={show} setShow={setShow} projectId={projectId} />
            <div className='ms-5 mt-2'>
                <Tab.Container defaultActiveKey='summary'>
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
                                    <Tab.Pane eventKey='licenseClearing'></Tab.Pane>
                                    <Tab.Pane eventKey='obligations'></Tab.Pane>
                                    <Tab.Pane eventKey='ecc'>
                                        <EccDetails projectId={projectId} />
                                    </Tab.Pane>
                                    <Tab.Pane eventKey='vulnerabilityTrackingStatus'></Tab.Pane>
                                    <Tab.Pane eventKey='attachments'></Tab.Pane>
                                    <Tab.Pane eventKey='attachmentUsages'></Tab.Pane>
                                    <Tab.Pane eventKey='vulnerabilities'></Tab.Pane>
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

export default withAuth(ViewProjects)
