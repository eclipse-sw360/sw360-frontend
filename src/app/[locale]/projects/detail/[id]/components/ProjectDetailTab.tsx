// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { StatusCodes } from 'http-status-codes'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Breadcrumb, ShowInfoOnHover } from 'next-sw360'
import { Dispatch, type JSX, SetStateAction, useEffect, useState } from 'react'
import { Button, Col, Dropdown, ListGroup, Row, Spinner, Tab } from 'react-bootstrap'
import Attachments from '@/components/Attachments/Attachments'
import LinkProjectsModal from '@/components/sw360/LinkedProjectsModal/LinkProjectsModal'
import SidebarCountBadge from '@/components/sw360/SidebarCountBadge'
import { useConfigKeyValue } from '@/contexts'
import {
    ActionType,
    AdministrationDataType,
    ClearingDetailsCount,
    ConfigKeys,
    ErrorDetails,
    LinkedProjectData,
    Project,
    ProjectDetailTabCounts,
    ProjectPayload,
    SummaryDataType,
    UserGroupPriority,
    UserGroupType,
} from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiError, CommonUtils } from '@/utils'
import ApiUtils from '@/utils/api/authenticatedApi.util'
import { getAuthenticatedUserIdentity } from '@/utils/api/authenticatedUser.util'
import ImportSBOMMetadata from '../../../../../../object-types/cyclonedx/ImportSBOMMetadata'
import ImportSBOMModal from '../../../components/ImportSBOMModal'
import Obligations from '../../../components/Obligations/Obligations'
import Administration from './Administration'
import AttachmentUsages from './AttachmentUsages'
import ChangeLog from './Changelog'
import EccDetails from './Ecc'
import ExportProjectSbomModal from './ExportProjectSbomModal'
import LicenseClearing from './LicenseClearing'
import LinkedPackagesTab from './LinkedPackagesTab'
import ProjectVulnerabilities from './ProjectVulnerabilities'
import Summary from './Summary'
import VulnerabilityTrackingStatusComponent from './VulnerabilityTrackingStatus'

export default function ViewProjects({ projectId }: { projectId: string }): JSX.Element {
    const t = useTranslations('default')
    const isPackageFeatureEnabled = useConfigKeyValue(ConfigKeys.IS_PACKAGE_PORTLET_ENABLED) === 'true'
    const [summaryData, setSummaryData] = useState<SummaryDataType | undefined>(undefined)
    const [clearingDetailCount, setClearingDetailCount] = useState<ClearingDetailsCount | undefined>()
    const [obligationsTotal, setObligationsTotal] = useState<number>(0)
    const [obligationsNonOpenCount, setObligationsNonOpenCount] = useState<number>(0)
    const [obligationsLoading, setObligationsLoading] = useState<boolean>(false)
    const [vulnerabilitiesTotal, setVulnerabilitiesTotal] = useState<number>(0)
    const [vulnerabilitiesRatedCount, setVulnerabilitiesRatedCount] = useState<number>(0)
    const [vulnerabilitiesLoading, setVulnerabilitiesLoading] = useState<boolean>(false)
    const [administrationData, setAdministrationData] = useState<AdministrationDataType | undefined>(undefined)
    const [show, setShow] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const DEFAULT_ACTIVE_TAB = 'summary'
    const TABS = [
        'summary',
        'administration',
        'licenseClearing',
        'obligations',
        'ecc',
        'vulnerabilityTrackingStatus',
        'eventKey',
        'attachmentUsages',
        'vulnerabilities',
        'attachments',
        'changeLog',
        ...(isPackageFeatureEnabled
            ? [
                  'linkedPackages',
              ]
            : []),
    ]

    const [activeKey, setActiveKey] = useState(DEFAULT_ACTIVE_TAB)
    const [showExportProjectSbomModal, setShowExportProjectSbomModal] = useState<boolean>(false)
    const [importSBOMMetadata, setImportSBOMMetadata] = useState<ImportSBOMMetadata>({
        show: false,
        importType: 'CycloneDx',
    })
    const sbomImportExportAccessUserRole = useConfigKeyValue(ConfigKeys.SBOM_IMPORT_EXPORT_ACCESS_USER_ROLE)
    const normalizedSbomImportExportAccessUserRole: UserGroupType =
        sbomImportExportAccessUserRole && sbomImportExportAccessUserRole in UserGroupType
            ? (sbomImportExportAccessUserRole as UserGroupType)
            : UserGroupType.VIEWER
    const [userIdentity, setUserIdentity] = useState<Awaited<ReturnType<typeof getAuthenticatedUserIdentity>> | null>(
        null,
    )
    const [projectPayload, setProjectPayload] = useState<ProjectPayload>()

    useEffect(() => {
        void (async () => {
            try {
                setUserIdentity(await getAuthenticatedUserIdentity())
            } catch {
                setUserIdentity(null)
            }
        })()
    }, [])

    useEffect(() => {
        let tab = searchParams.get('tab')
        if (tab === null || TABS.indexOf(tab) === -1) {
            tab = DEFAULT_ACTIVE_TAB
        }
        setActiveKey(tab)
    }, [
        searchParams,
    ])

    const handleSelect = (key: string | null) => {
        setActiveKey(key ?? DEFAULT_ACTIVE_TAB)
        router.push(`?tab=${key}`)
    }

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal

        void (async () => {
            try {
                const response = await ApiUtils.GET(`projects/${projectId}/summaryAdministration`, signal)
                if (response.status !== StatusCodes.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new ApiError(err.message, {
                        status: response.status,
                    })
                }

                const data = (await response.json()) as SummaryDataType | AdministrationDataType

                setSummaryData(data as SummaryDataType)
                setAdministrationData(data as AdministrationDataType)

                const project = (await (await ApiUtils.GET(`projects/${projectId}`, signal)).json()) as Project
                if (response.status !== StatusCodes.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new ApiError(err.message, {
                        status: response.status,
                    })
                }
                const ob = {} as {
                    [k: string]: LinkedProjectData
                }
                project._embedded?.['sw360:projects']?.map((p) => {
                    ob[p?.id ?? ''] = {
                        enableSvm: p.enableSvm ?? false,
                        name: p.name ?? '',
                        projectRelationship:
                            project.linkedProjects?.filter((pr) => pr.project.split('/').at(-1) === p.id)?.[0]
                                ?.relation ?? 'CONTAINED',
                        version: p.version ?? '',
                    }
                })
                setProjectPayload({
                    id: projectId,
                    linkedProjects: ob,
                })
            } catch (error) {
                ApiUtils.reportError(error)
            }
        })()

        return () => controller.abort()
    }, [
        projectId,
    ])

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal
        void (async () => {
            try {
                const response = await ApiUtils.GET(`projects/${projectId}/clearingDetailsCount`, signal)
                if (response.status !== StatusCodes.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new ApiError(err.message, {
                        status: response.status,
                    })
                }
                const data = (await response.json()) as ClearingDetailsCount
                setClearingDetailCount(data)
            } catch (error: unknown) {
                ApiUtils.reportError(error)
            }
        })()
        return () => controller.abort()
    }, [
        projectId,
    ])

    const handleEditProject = (projectId: string) => {
        if (
            userIdentity?.email === summaryData?.['_embedded']?.['createdBy']?.['email'] ||
            userIdentity?.userGroup === UserGroupType.ADMIN
        ) {
            MessageService.info(t('You are editing the original document'))
            router.push(`/projects/edit/${projectId}?tab=${activeKey}`)
        } else {
            MessageService.info(t('You will create a moderation request if you update'))
            router.push(`/projects/edit/${projectId}?tab=${activeKey}`)
        }
    }

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal

        const fetchCounts = async () => {
            setObligationsLoading(true)
            setVulnerabilitiesLoading(true)
            try {
                const response = await ApiUtils.GET(`projects/${projectId}/tabCounts`, signal)
                const body = (await response.json().catch(() => ({}))) as ProjectDetailTabCounts | ErrorDetails

                if (response.status !== StatusCodes.OK) {
                    throw new ApiError(('message' in body ? body.message : undefined) ?? `Status ${response.status}`, {
                        status: response.status,
                    })
                }

                const data = body as ProjectDetailTabCounts
                setObligationsTotal(data.obligationCount)
                setObligationsNonOpenCount(data.obligationNonOpenCount)
                setVulnerabilitiesTotal(Math.max(0, data.vulnerabilityCount))
                setVulnerabilitiesRatedCount(Math.max(0, data.vulnerabilityRatedCount))
            } catch (error) {
                ApiUtils.reportError(error)
            } finally {
                setObligationsLoading(false)
                setVulnerabilitiesLoading(false)
            }
        }

        void fetchCounts()
        return () => controller.abort()
    }, [
        projectId,
    ])

    const isVulnerabilitiesDisplayEnabled = summaryData?.enableVulnerabilitiesDisplay ?? false

    const vulnerabilitiesBadgeClassName = !isVulnerabilitiesDisplayEnabled
        ? 'obligations-badge'
        : vulnerabilitiesRatedCount === vulnerabilitiesTotal && vulnerabilitiesTotal > 0
          ? 'obligations-badge--success'
          : vulnerabilitiesRatedCount === 0
            ? 'obligations-badge--danger'
            : 'obligations-badge'

    const vulnerabilitiesCountValue = isVulnerabilitiesDisplayEnabled
        ? `${vulnerabilitiesRatedCount} / ${vulnerabilitiesTotal}`
        : '?/?'

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
            {projectPayload && (
                <LinkProjectsModal
                    show={show}
                    setShow={setShow}
                    projectPayload={projectPayload}
                    setProjectPayload={setProjectPayload as Dispatch<SetStateAction<ProjectPayload>>}
                    mode='UPDATE'
                />
            )}
            {summaryData?.name ? (
                <Breadcrumb
                    name={`${summaryData.name}${
                        CommonUtils.isNullEmptyOrUndefinedString(summaryData.version) ? '' : ` (${summaryData.version})`
                    }`}
                />
            ) : (
                <Breadcrumb name={' '} />
            )}
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
                                    hidden={userIdentity?.userGroup === UserGroupType.SECURITY_USER}
                                >
                                    <div className='my-2'>{t('License Clearing')}</div>
                                </ListGroup.Item>
                                {isPackageFeatureEnabled && (
                                    <ListGroup.Item
                                        action
                                        eventKey='linkedPackages'
                                    >
                                        <div className='my-2'>{t('Linked Packages')}</div>
                                    </ListGroup.Item>
                                )}
                                <ListGroup.Item
                                    action
                                    eventKey='obligations'
                                    hidden={userIdentity?.userGroup === UserGroupType.SECURITY_USER}
                                >
                                    <SidebarCountBadge
                                        badgeClassName={
                                            obligationsNonOpenCount === obligationsTotal && obligationsTotal > 0
                                                ? 'obligations-badge--success'
                                                : obligationsNonOpenCount === 0
                                                  ? 'obligations-badge--danger'
                                                  : 'obligations-badge'
                                        }
                                        countId='obligationsCount'
                                        isLoading={obligationsLoading}
                                        label={t('Obligations')}
                                        value={`${obligationsNonOpenCount} / ${obligationsTotal}`}
                                    />
                                </ListGroup.Item>
                                <ListGroup.Item
                                    action
                                    eventKey='ecc'
                                    hidden={userIdentity?.userGroup === UserGroupType.SECURITY_USER}
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
                                    hidden={userIdentity?.userGroup === UserGroupType.SECURITY_USER}
                                >
                                    <div className='my-2'>{t('Attachments')}</div>
                                </ListGroup.Item>
                                <ListGroup.Item
                                    action
                                    eventKey='attachmentUsages'
                                    hidden={userIdentity?.userGroup === UserGroupType.SECURITY_USER}
                                >
                                    <div className='my-2'>{t('Attachment Usages')}</div>
                                </ListGroup.Item>
                                <ListGroup.Item
                                    action
                                    eventKey='vulnerabilities'
                                >
                                    <SidebarCountBadge
                                        badgeClassName={vulnerabilitiesBadgeClassName}
                                        countId='vulnerabilitiesCount'
                                        isLoading={vulnerabilitiesLoading}
                                        label={t('Vulnerabilities')}
                                        value={vulnerabilitiesCountValue}
                                    />
                                </ListGroup.Item>
                                <ListGroup.Item
                                    action
                                    eventKey='changeLog'
                                    hidden={userIdentity?.userGroup === UserGroupType.SECURITY_USER}
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
                                            disabled={userIdentity?.userGroup === UserGroupType.SECURITY_USER}
                                        >
                                            {t('Edit Projects')}
                                        </Button>
                                        <Button
                                            variant='secondary'
                                            className='col-auto'
                                            onClick={() => setShow(true)}
                                            disabled={userIdentity?.userGroup === UserGroupType.SECURITY_USER}
                                        >
                                            {t('Link to Projects')}
                                        </Button>
                                        {userIdentity?.userGroup &&
                                            UserGroupPriority[userIdentity.userGroup] <=
                                                UserGroupPriority[normalizedSbomImportExportAccessUserRole] && (
                                                <>
                                                    <Dropdown className='col-auto'>
                                                        <Dropdown.Toggle
                                                            variant='dark'
                                                            id='exportSBOM'
                                                            className='px-2'
                                                        >
                                                            {t('Import SBOM')}
                                                        </Dropdown.Toggle>
                                                        <Dropdown.Menu>
                                                            <Dropdown.Item
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    setImportSBOMMetadata({
                                                                        importType: 'CycloneDx',
                                                                        show: true,
                                                                        projectId: projectId,
                                                                        doNotReplace: false,
                                                                    })
                                                                }}
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
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    setImportSBOMMetadata({
                                                                        importType: 'CycloneDx',
                                                                        show: true,
                                                                        projectId: projectId,
                                                                        doNotReplace: true,
                                                                    })
                                                                }}
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
                                                        >
                                                            {t('Export SBOM')}
                                                        </Dropdown.Toggle>
                                                        <Dropdown.Menu>
                                                            <Dropdown.Item
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    setShowExportProjectSbomModal(true)
                                                                }}
                                                            >
                                                                {t('CycloneDX')}
                                                            </Dropdown.Item>
                                                        </Dropdown.Menu>
                                                    </Dropdown>
                                                </>
                                            )}
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
                                                style={{
                                                    textAlign: 'center',
                                                }}
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
                                                style={{
                                                    textAlign: 'center',
                                                }}
                                            >
                                                <Spinner className='spinner' />
                                            </div>
                                        ) : (
                                            <Administration
                                                data={administrationData}
                                                clearingDetailCount={clearingDetailCount}
                                            />
                                        )}
                                    </Tab.Pane>
                                    <Tab.Pane eventKey='licenseClearing'>
                                        {summaryData && administrationData && (
                                            <LicenseClearing
                                                projectId={projectId}
                                                projectName={summaryData.name}
                                                projectVersion={summaryData.version ?? ''}
                                                clearingRequestId={summaryData.clearingRequestId ?? ''}
                                                businessUnit={summaryData.businessUnit ?? ''}
                                                clearingState={summaryData.clearingState ?? ''}
                                                visibility={summaryData.visibility}
                                            />
                                        )}
                                    </Tab.Pane>
                                    {isPackageFeatureEnabled && (
                                        <Tab.Pane eventKey='linkedPackages'>
                                            <LinkedPackagesTab projectId={projectId} />
                                        </Tab.Pane>
                                    )}
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
                                        <Attachments
                                            documentId={projectId}
                                            documentType={'projects'}
                                        />
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
