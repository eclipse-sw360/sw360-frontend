// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ActionType, AdministrationDataType, HttpStatus, SummaryDataType, UserGroupType } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { notFound, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, type JSX } from 'react'
import { Button, Col, Dropdown, ListGroup, Row, Spinner, Tab } from 'react-bootstrap'
import LinkProjects from '../../../components/LinkProjects'
import Obligations from '../../../components/Obligations/Obligations'
import Administration from './Administration'
import ProjectAttachments from './Attachments'
import AttachmentUsages from './AttachmentUsages'
import ChangeLog from './Changelog'
import EccDetails from './Ecc'
import ExportProjectSbomModal from './ExportProjectSbomModal'
import LicenseClearing from './LicenseClearing'
import LinkedPackagesTab from './LinkedPackagesTab'
import ProjectVulnerabilities from './ProjectVulnerabilities'
import Summary from './Summary'
import VulnerabilityTrackingStatusComponent from './VulnerabilityTrackingStatus'

import { ShowInfoOnHover } from 'next-sw360'
import ImportSBOMMetadata from '../../../../../../object-types/cyclonedx/ImportSBOMMetadata'
import ImportSBOMModal from '../../../components/ImportSBOMModal'

export default function ViewProjects({ projectId }: { projectId: string }): JSX.Element {
    const t = useTranslations('default')
    const { data: session, status } = useSession()
    const [summaryData, setSummaryData] = useState<SummaryDataType | undefined>(undefined)
    const [administrationData, setAdministrationData] = useState<AdministrationDataType | undefined>(undefined)
    const [show, setShow] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const DEFAULT_ACTIVE_TAB = 'summary'
    const [activeKey, setActiveKey] = useState(DEFAULT_ACTIVE_TAB)
    const [showExportProjectSbomModal, setShowExportProjectSbomModal] = useState<boolean>(false)
    const [importSBOMMetadata, setImportSBOMMetadata] = useState<ImportSBOMMetadata>({
        show: false,
        importType: 'CycloneDx',
    })

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [status])

    useEffect(() => {
        const fragment = searchParams.get('tab') ?? DEFAULT_ACTIVE_TAB
        setActiveKey(fragment)
    }, [searchParams])

    const handleSelect = (key: string | null) => {
        setActiveKey(key ?? DEFAULT_ACTIVE_TAB)
        router.push(`?tab=${key}`)
    }

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal

        void (async () => {
            try {
                const session = await getSession()
                if (CommonUtils.isNullOrUndefined(session)) return signOut()
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

                setSummaryData(data as SummaryDataType)
                setAdministrationData(data as AdministrationDataType)
            } catch (e) {
                console.error(e)
            }
        })()

        return () => controller.abort()
    }, [projectId, session, status])

    const handleEditProject = (projectId: string) => {
        if (CommonUtils.isNullOrUndefined(session)) return signOut()
        if (session.user.email === summaryData?.['_embedded']?.['createdBy']?.['email']) {
            MessageService.success(t('You are editing the original document'))
            router.push(`/projects/edit/${projectId}?tab=${activeKey}`)
        } else {
            MessageService.success(t('You will create a moderation request if you update'))
            router.push(`/projects/edit/${projectId}?tab=${activeKey}`)
        }
    }

    return (
        <>
            <ImportSBOMModal
                importSBOMMetadata={importSBOMMetadata}
                setImportSBOMMetadata={setImportSBOMMetadata}
            />
            <ExportProjectSbomModal
                show={showExportProjectSbomModal}
                setShow={setShowExportProjectSbomModal}
                projectId={projectId}
                projectName={summaryData?.name}
                projectVersion={summaryData?.version}
            />
            <LinkProjects
                show={show}
                setShow={setShow}
                projectId={projectId}
            />
            <div className='container page-content'>
                <Tab.Container
                    activeKey={activeKey}
                    onSelect={(k) => handleSelect(k)}
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
                                    hidden={
                                        status === 'authenticated' &&
                                        session?.user?.userGroup === UserGroupType.SECURITY_USER
                                    }
                                >
                                    <div className='my-2'>{t('License Clearing')}</div>
                                </ListGroup.Item>
                                <ListGroup.Item
                                    action
                                    eventKey='linkedPackages'
                                >
                                    <div className='my-2'>{t('Linked Packages')}</div>
                                </ListGroup.Item>
                                <ListGroup.Item
                                    action
                                    eventKey='obligations'
                                    hidden={
                                        status === 'authenticated' &&
                                        session?.user?.userGroup === UserGroupType.SECURITY_USER
                                    }
                                >
                                    <div className='my-2'>{t('Obligations')}</div>
                                </ListGroup.Item>
                                <ListGroup.Item
                                    action
                                    eventKey='ecc'
                                    hidden={
                                        status === 'authenticated' &&
                                        session?.user?.userGroup === UserGroupType.SECURITY_USER
                                    }
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
                                    hidden={
                                        status === 'authenticated' &&
                                        session?.user?.userGroup === UserGroupType.SECURITY_USER
                                    }
                                >
                                    <div className='my-2'>{t('Attachments')}</div>
                                </ListGroup.Item>
                                <ListGroup.Item
                                    action
                                    eventKey='attachmentUsages'
                                    hidden={
                                        status === 'authenticated' &&
                                        session?.user?.userGroup === UserGroupType.SECURITY_USER
                                    }
                                >
                                    <div className='my-2'>{t('Attachment Usages')}</div>
                                </ListGroup.Item>
                                <ListGroup.Item
                                    action
                                    eventKey='vulnerabilities'
                                >
                                    <div className='my-2'>{t('Vulnerabilities')}</div>
                                </ListGroup.Item>
                                <ListGroup.Item
                                    action
                                    eventKey='changeLog'
                                    hidden={
                                        status === 'authenticated' &&
                                        session?.user?.userGroup === UserGroupType.SECURITY_USER
                                    }
                                >
                                    <div className='my-2'>{t('Change Log')}</div>
                                </ListGroup.Item>
                            </ListGroup>
                        </Col>
                        <Col className='ps-2 me-3'>
                            <Row className='d-flex justify-content-between'>
                                <Col lg={6}>
                                    <Row>
                                        <Button
                                            variant='primary'
                                            className='me-2 col-auto'
                                            onClick={() => handleEditProject(projectId)}
                                            disabled={
                                                status === 'authenticated' &&
                                                session?.user?.userGroup === UserGroupType.SECURITY_USER
                                            }
                                        >
                                            {t('Edit Projects')}
                                        </Button>
                                        <Button
                                            variant='secondary'
                                            className='col-auto'
                                            onClick={() => setShow(true)}
                                            disabled={
                                                status === 'authenticated' &&
                                                session?.user?.userGroup === UserGroupType.SECURITY_USER
                                            }
                                        >
                                            {t('Link to Projects')}
                                        </Button>
                                        <Dropdown className='col-auto'>
                                            <Dropdown.Toggle
                                                variant='dark'
                                                id='exportSBOM'
                                                className='px-2'
                                                hidden={
                                                    status === 'authenticated' &&
                                                    session?.user?.userGroup === UserGroupType.SECURITY_USER
                                                }
                                            >
                                                {t('Import SBOM')}
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item
                                                    onClick={() =>
                                                        setImportSBOMMetadata({
                                                            importType: 'CycloneDx',
                                                            show: true,
                                                            projectId: projectId,
                                                            doNotReplace: false,
                                                        })
                                                    }
                                                >
                                                    <span
                                                        style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                        }}
                                                    >
                                                        {t('replace existing releases and packages')}
                                                        <ShowInfoOnHover
                                                            text={t(
                                                                'This will remove all current releases and packages and replace them with data from the SBOM',
                                                            )}
                                                        />
                                                    </span>
                                                </Dropdown.Item>
                                                <Dropdown.Item
                                                    onClick={() =>
                                                        setImportSBOMMetadata({
                                                            importType: 'CycloneDx',
                                                            show: true,
                                                            projectId: projectId,
                                                            doNotReplace: true,
                                                        })
                                                    }
                                                >
                                                    <span
                                                        style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                        }}
                                                    >
                                                        {t('Add new releases and packages')}
                                                        <ShowInfoOnHover
                                                            text={t(
                                                                'Adds new data from the SBOM without modifying existing releases and packages',
                                                            )}
                                                        />
                                                    </span>
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                        <Dropdown className='col-auto'>
                                            <Dropdown.Toggle
                                                variant='dark'
                                                id='exportSBOM'
                                                className='px-2'
                                                hidden={
                                                    status === 'authenticated' &&
                                                    session?.user?.userGroup === UserGroupType.SECURITY_USER
                                                }
                                            >
                                                {t('Export SBOM')}
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item onClick={() => setShowExportProjectSbomModal(true)}>
                                                    {t('CycloneDX')}
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </Row>
                                </Col>
                                <Col
                                    lg={5}
                                    className='text-truncate buttonheader-title me-3'
                                >
                                    {summaryData && `${summaryData.name} (${summaryData.version})`}
                                </Col>
                            </Row>
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
                                        {summaryData && administrationData && (
                                            <LicenseClearing
                                                projectId={projectId}
                                                projectName={summaryData.name}
                                                projectVersion={summaryData.version ?? ''}
                                                clearingState={administrationData.clearingState ?? ''}
                                                clearingRequestId={summaryData.clearingRequestId ?? ''}
                                            />
                                        )}
                                    </Tab.Pane>
                                    <Tab.Pane eventKey='linkedPackages'>
                                        <LinkedPackagesTab projectId={projectId} />
                                    </Tab.Pane>
                                    <Tab.Pane eventKey='obligations'>
                                        <Obligations
                                            projectId={projectId}
                                            actionType={ActionType.DETAIL}
                                        />
                                    </Tab.Pane>
                                    <Tab.Pane eventKey='ecc'>
                                        {summaryData && (
                                            <EccDetails
                                                projectId={projectId}
                                                projectName={summaryData.name}
                                                projectVersion={summaryData.version ?? ''}
                                            />
                                        )}
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
                                    <Tab.Pane eventKey='attachmentUsages'>
                                        <AttachmentUsages projectId={projectId} />
                                    </Tab.Pane>
                                    <Tab.Pane eventKey='vulnerabilities'>
                                        {summaryData && (
                                            <ProjectVulnerabilities
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
