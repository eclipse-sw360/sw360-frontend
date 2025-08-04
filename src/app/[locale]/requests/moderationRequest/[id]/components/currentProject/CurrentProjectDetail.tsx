// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import Administration from '@/app/[locale]/projects/detail/[id]/components/Administration'
import ProjectAttachments from '@/app/[locale]/projects/detail/[id]/components/Attachments'
import ChangeLog from '@/app/[locale]/projects/detail/[id]/components/Changelog'
import EccDetails from '@/app/[locale]/projects/detail/[id]/components/Ecc'
import LicenseClearing from '@/app/[locale]/projects/detail/[id]/components/LicenseClearing'
import Summary from '@/app/[locale]/projects/detail/[id]/components/Summary'
import VulnerabilityTrackingStatusComponent from '@/app/[locale]/projects/detail/[id]/components/VulnerabilityTrackingStatus'
import { AdministrationDataType, HttpStatus, SummaryDataType } from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils'
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { notFound } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'
import { Col, ListGroup, Row, Spinner, Tab } from 'react-bootstrap'

export default function CurrentProjectDetail({ projectId }: Readonly<{ projectId: string }>): ReactNode {
    const t = useTranslations('default')
    const { data: session, status } = useSession()
    const [summaryData, setSummaryData] = useState<SummaryDataType | undefined>(undefined)
    const [administrationData, setAdministrationData] = useState<AdministrationDataType | undefined>(undefined)

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [status])

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal

        void (async () => {
            const session = await getSession()
            if (CommonUtils.isNullOrUndefined(session)) return signOut()
            try {
                const response = await ApiUtils.GET(
                    `projects/${projectId}/summaryAdministration`,
                    session.user.access_token,
                    signal,
                )
                if (response.status === HttpStatus.UNAUTHORIZED) {
                    return signOut()
                } else if (response.status !== HttpStatus.OK) {
                    return notFound()
                }

                const data = (await response.json()) as SummaryDataType | AdministrationDataType

                setSummaryData({ ...data, id: projectId } as SummaryDataType)
                setAdministrationData(data as AdministrationDataType)
            } catch (e) {
                console.error(e)
            }
        })()

        return () => controller.abort()
    }, [projectId, session, status])

    return (
        <div className='ms-5 mt-2'>
            <Tab.Container
                defaultActiveKey='summary'
                mountOnEnter={true}
                unmountOnExit={true}
            >
                <Row>
                    <Col
                        sm='auto'
                        className='me-3'
                    >
                        <ListGroup>
                            <ListGroup.Item
                                action
                                eventKey='summary'
                            >
                                <div className='my-2'>{t('Summary')}</div>
                            </ListGroup.Item>
                            <ListGroup.Item
                                action
                                eventKey='administration'
                            >
                                <div className='my-2'>{t('Administration')}</div>
                            </ListGroup.Item>
                            <ListGroup.Item
                                action
                                eventKey='licenseClearing'
                            >
                                <div className='my-2'>{t('License Clearing')}</div>
                            </ListGroup.Item>
                            <ListGroup.Item
                                action
                                eventKey='ecc'
                            >
                                <div className='my-2'>{t('ECC')}</div>
                            </ListGroup.Item>
                            <ListGroup.Item
                                action
                                eventKey='vulnerabilityTrackingStatus'
                            >
                                <div className='my-2'>{t('Vulnerability Tracking Status')}</div>
                            </ListGroup.Item>
                            <ListGroup.Item
                                action
                                eventKey='attachments'
                            >
                                <div className='my-2'>{t('Attachments')}</div>
                            </ListGroup.Item>
                            <ListGroup.Item
                                action
                                eventKey='changeLog'
                            >
                                <div className='my-2'>{t('Change Log')}</div>
                            </ListGroup.Item>
                        </ListGroup>
                    </Col>
                    <Col className='ps-2 me-3'>
                        <Row className='mt-3'>
                            <Tab.Content>
                                <Tab.Pane eventKey='summary'>
                                    {!summaryData ? (
                                        <div
                                            className='col-12'
                                            style={{ textAlign: 'center' }}
                                        >
                                            <Spinner className='spinner' />
                                        </div>
                                    ) : (
                                        <Summary summaryData={summaryData} />
                                    )}
                                </Tab.Pane>
                                <Tab.Pane eventKey='administration'>
                                    {!administrationData ? (
                                        <div
                                            className='col-12'
                                            style={{ textAlign: 'center' }}
                                        >
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
                                            projectName={summaryData.name}
                                            projectVersion={summaryData.version ?? ''}
                                            isCalledFromModerationRequestCurrentProject={true}
                                        />
                                    )}
                                </Tab.Pane>
                                <Tab.Pane eventKey='ecc'>
                                    <EccDetails projectId={projectId} />
                                </Tab.Pane>
                                <Tab.Pane eventKey='vulnerabilityTrackingStatus'>
                                    {summaryData && (
                                        <VulnerabilityTrackingStatusComponent
                                            projectData={{
                                                id: projectId,
                                                name: summaryData.name,
                                                version: summaryData.version ?? '',
                                                enableSvm: summaryData.enableSvm ?? false,
                                                enableVulnerabilitiesDisplay:
                                                    summaryData.enableVulnerabilitiesDisplay ?? false,
                                            }}
                                        />
                                    )}
                                </Tab.Pane>
                                <Tab.Pane eventKey='attachments'>
                                    <ProjectAttachments projectId={projectId} />
                                </Tab.Pane>
                                <Tab.Pane eventKey='changeLog'>
                                    <ChangeLog
                                        projectId={projectId}
                                        isCalledFromModerationRequestCurrentProject={true}
                                    />
                                </Tab.Pane>
                            </Tab.Content>
                        </Row>
                    </Col>
                </Row>
            </Tab.Container>
        </div>
    )
}
