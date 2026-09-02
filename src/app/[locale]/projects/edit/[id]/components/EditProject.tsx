// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { StatusCodes } from 'http-status-codes'
import { notFound, useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Breadcrumb } from 'next-sw360'
import { type JSX, useCallback, useEffect, useRef, useState } from 'react'
import { Button, Col, ListGroup, Row, Tab } from 'react-bootstrap'
import { AccessControl } from '@/components/AccessControl/AccessControl'
import EditAttachments from '@/components/Attachments/EditAttachments'
import CreateMRCommentDialog from '@/components/CreateMRCommentDialog/CreateMRCommentDialog'
import Administration from '@/components/ProjectAddSummary/Administration'
import LinkedPackages from '@/components/ProjectAddSummary/LinkedPackages'
import LinkedReleasesAndProjects from '@/components/ProjectAddSummary/LinkedReleasesAndProjects'
import Summary from '@/components/ProjectAddSummary/Summary'
import SidebarCountBadge from '@/components/sw360/SidebarCountBadge'
import { useConfigKeyValue } from '@/contexts'
import {
    ActionType,
    ConfigKeys,
    DocumentTypes,
    ErrorDetails,
    InputKeyValue,
    LinkedPackageData,
    LinkedProjectData,
    LinkedReleaseData,
    ObligationEntry,
    ObligationType,
    Project,
    ProjectDetailTabCounts,
    ProjectPayload,
    User,
    UserGroupType,
    Vendor,
} from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiError, CommonUtils } from '@/utils'
import ApiUtils from '@/utils/api/authenticatedApi.util'
import DeleteProjectDialog from '../../../components/DeleteProjectDialog'
import Obligations from '../../../components/Obligations/Obligations'

function EditProject({
    projectId,
    isDependencyNetworkFeatureEnabled,
}: {
    projectId: string
    isDependencyNetworkFeatureEnabled: boolean
}): JSX.Element {
    const router = useRouter()
    const t = useTranslations('default')
    const isPackageFeatureEnabled = useConfigKeyValue(ConfigKeys.IS_PACKAGE_PORTLET_ENABLED) === 'true'
    const [vendor, setVendor] = useState<Vendor>({
        id: '',
        fullName: '',
    })

    const searchParams = useSearchParams()
    const TABS = [
        'summary',
        'administration',
        'linkedProjectsAndReleases',
        'attachments',
        'obligations',
        ...(isPackageFeatureEnabled
            ? [
                  'linkedPackages',
              ]
            : []),
    ]
    const DEFAULT_ACTIVE_TAB = 'summary'
    const [activeKey, setActiveKey] = useState(DEFAULT_ACTIVE_TAB)

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [hasClearingRequest, setHasClearingRequest] = useState(false)

    const handleDeleteProject = () => {
        setDeleteDialogOpen(true)
    }

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

    const [showCommentModal, setShowCommentModal] = useState<boolean>(false)

    const [externalUrls, setExternalUrls] = useState<InputKeyValue[]>([])

    const [externalIds, setExternalIds] = useState<InputKeyValue[]>([])

    const [additionalData, setAdditionalData] = useState<InputKeyValue[]>([])

    const [additionalRoles, setAdditionalRoles] = useState<InputKeyValue[]>([])

    const [moderators, setModerators] = useState<{
        [k: string]: string
    }>({})
    const [contributors, setContributors] = useState<{
        [k: string]: string
    }>({})
    const [securityResponsibles, setSecurityResponsibles] = useState<{
        [k: string]: string
    }>({})
    const [projectOwner, setProjectOwner] = useState<{
        [k: string]: string
    }>({})
    const [projectManager, setProjectManager] = useState<{
        [k: string]: string
    }>({})
    const [leadArchitect, setLeadArchitect] = useState<{
        [k: string]: string
    }>({})
    const [obligations, setObligations] = useState<ObligationEntry>({})
    const [obligationsTotal, setObligationsTotal] = useState<number>(0)
    const [obligationsNonOpenCount, setObligationsNonOpenCount] = useState<number>(0)
    const baselineObligationStatusRef = useRef<Record<string, string>>({})
    const prevObligationsRef = useRef<ObligationEntry>({})

    const [projectPayload, setProjectPayload] = useState<ProjectPayload>({
        name: '',
        version: '',
        visibility: 'EVERYONE',
        createdBy: '',
        projectType: 'PRODUCT',
        tag: '',
        description: '',
        domain: '',
        vendorId: '',
        modifiedOn: '',
        modifiedBy: '',
        additionalData: {},
        ownerAccountingUnit: '',
        ownerGroup: '',
        ownerCountry: '',
        clearingState: '',
        businessUnit: '',
        preevaluationDeadline: '',
        clearingSummary: '',
        specialRisksOSS: '',
        generalRisks3rdParty: '',
        specialRisks3rdParty: '',
        deliveryChannels: '',
        remarksAdditionalRequirements: '',
        state: '',
        systemTestStart: '',
        systemTestEnd: '',
        deliveryStart: '',
        phaseOutSince: '',
        licenseInfoHeaderText: '',
        linkedReleases: {},
        securityResponsibles: [],
        moderators: [],
        contributors: [],
        projectOwner: '',
        leadArchitect: '',
        projectManager: '',
        packageIds: {},
        comment: '',
        projectResponsible: '',
    })

    const setDataExternalUrls = (externalUrls: Map<string, string>) => {
        const obj = Object.fromEntries(externalUrls)
        setProjectPayload({
            ...projectPayload,
            externalUrls: obj,
        })
    }

    const setDataExternalIds = (externalIds: Map<string, string>) => {
        const obj = Object.fromEntries(externalIds)
        setProjectPayload({
            ...projectPayload,
            externalIds: obj,
        })
    }

    const setDataAdditionalData = (additionalData: Map<string, string>) => {
        const obj = Object.fromEntries(additionalData)
        setProjectPayload({
            ...projectPayload,
            additionalData: obj,
        })
    }

    const setDataAdditionalRoles = (additionalRoles: InputKeyValue[]) => {
        const obj = CommonUtils.convertRoles(additionalRoles)
        setProjectPayload({
            ...projectPayload,
            roles: obj,
        })
    }

    const fetchUserData = useCallback(async (email: string | undefined | null) => {
        if (!email) {
            return undefined
        }
        const url = `users/${email}`
        const response = await ApiUtils.GET(url)
        if (response.status === StatusCodes.OK) {
            return (await response.json()) as User
        } else {
            return undefined
        }
    }, [])

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal

        const fetchObligationCounts = async () => {
            try {
                const response = await ApiUtils.GET(`projects/${projectId}/tabCounts`, signal)
                const body = (await response.json().catch(() => ({}))) as ProjectDetailTabCounts | ErrorDetails

                if (response.status !== StatusCodes.OK) {
                    throw new ApiError(('message' in body ? body.message : undefined) ?? `Status ${response.status}`, {
                        status: response.status,
                    })
                }

                const data = body as ProjectDetailTabCounts
                setObligationsTotal(Math.max(0, data.readmeOssObligationCount))
                setObligationsNonOpenCount(Math.max(0, data.obligationNonOpenCount))
            } catch (error) {
                ApiUtils.reportError(error)
            }
        }

        const fetchBaselineObligationStatuses = async () => {
            try {
                const url = CommonUtils.createUrlWithParams(`projects/${projectId}/licenseObligations`, {
                    page: '0',
                    page_entries: '9999',
                })
                const response = await ApiUtils.GET(url, signal)
                if (response.status !== StatusCodes.OK) return
                const body = (await response.json().catch(() => ({}))) as {
                    obligations?: Record<
                        string,
                        {
                            status?: string
                        }
                    >
                }
                const baseline: Record<string, string> = {}
                Object.entries(body?.obligations ?? {}).forEach(([key, value]) => {
                    baseline[key] = value?.status ?? 'OPEN'
                })
                baselineObligationStatusRef.current = baseline
            } catch (_e) {
                // Baseline is only used for live badge updates, ignore failures silently
            }
        }

        void fetchObligationCounts()
        void fetchBaselineObligationStatuses()
        return () => controller.abort()
    }, [
        projectId,
    ])

    useEffect(() => {
        const isOpen = (status?: string) => (status ?? 'OPEN').trim().toUpperCase() === 'OPEN'
        const prevObligations = prevObligationsRef.current
        let delta = 0

        Object.keys(obligations).forEach((key) => {
            const entry = obligations[key]
            if (entry?.obligationType !== ObligationType.LICENSE_OBLIGATION) return

            const prevStatus = prevObligations[key]?.status ?? baselineObligationStatusRef.current[key]
            const wasOpen = isOpen(prevStatus)
            const isNowOpen = isOpen(entry.status)

            if (wasOpen && !isNowOpen) {
                delta += 1
            } else if (!wasOpen && isNowOpen) {
                delta -= 1
            }
        })

        if (delta !== 0) {
            setObligationsNonOpenCount((count) => Math.max(0, count + delta))
        }

        prevObligationsRef.current = obligations
    }, [
        obligations,
    ])

    useEffect(() => {
        void (async () => {
            try {
                const response = await ApiUtils.GET(`projects/${projectId}`)
                if (response.status !== StatusCodes.OK) {
                    return notFound()
                }
                const project = (await response.json()) as Project

                // Check if project has open clearing request using clearingState from project response
                if (project.clearingRequestId && project.clearingRequestId !== '') {
                    const clearingState = project.clearingState?.toUpperCase()
                    const hasOpenCR = clearingState === 'OPEN' || clearingState === 'IN_PROGRESS'
                    setHasClearingRequest(hasOpenCR)
                }

                if (project.externalIds !== undefined) {
                    setExternalIds(CommonUtils.convertObjectToMap(project.externalIds))
                }

                if (project.externalUrls !== undefined) {
                    setExternalUrls(CommonUtils.convertObjectToMap(project.externalUrls))
                }

                if (project.additionalData !== undefined) {
                    setAdditionalData(CommonUtils.convertObjectToMap(project.additionalData))
                }

                if (project.roles !== undefined) {
                    setAdditionalRoles(CommonUtils.convertObjectToMapRoles(project.roles))
                }

                if (project['_embedded']?.['leadArchitect'] !== undefined) {
                    setLeadArchitect({
                        [project['_embedded']['leadArchitect'].email]:
                            project['_embedded']['leadArchitect'].fullName ?? '',
                    })
                }

                if (project?.projectOwner !== undefined) {
                    const userData = await fetchUserData(project?.projectOwner)
                    if (!CommonUtils.isNullOrUndefined(userData)) {
                        setProjectOwner({
                            [project?.projectOwner]: userData?.fullName ?? project?.projectOwner,
                        })
                    } else {
                        setProjectOwner({
                            [project?.projectOwner]: project?.projectOwner,
                        })
                    }
                }

                if (project?.projectResponsible !== undefined) {
                    const userData = await fetchUserData(project?.projectResponsible)
                    if (!CommonUtils.isNullOrUndefined(userData)) {
                        setProjectManager({
                            [project?.projectResponsible]: userData?.fullName ?? project?.projectResponsible,
                        })
                    } else {
                        setProjectManager({
                            [project?.projectResponsible]: project?.projectResponsible,
                        })
                    }
                }

                if (project['_embedded']?.['sw360:moderators'] !== undefined) {
                    const moderatorMap = new Map<string, string>()
                    project['_embedded']['sw360:moderators'].map((moderator) => {
                        moderatorMap.set(moderator.email, moderator.fullName ?? '')
                    })
                    setModerators(Object.fromEntries(moderatorMap))
                }

                if (project['_embedded']?.['sw360:contributors'] !== undefined) {
                    const contributorMap = new Map<string, string>()
                    project['_embedded']['sw360:contributors'].map((contributor) => {
                        contributorMap.set(contributor.email, contributor.fullName ?? '')
                    })
                    setContributors(Object.fromEntries(contributorMap))
                }

                if (project?.securityResponsibles !== undefined) {
                    const securityResponsiblesMap = new Map<string, string>()
                    await Promise.all(
                        project.securityResponsibles.map(async (securityResponsible) => {
                            const userData = await fetchUserData(securityResponsible)
                            if (!CommonUtils.isNullOrUndefined(userData)) {
                                securityResponsiblesMap.set(
                                    securityResponsible,
                                    userData?.fullName ?? securityResponsible,
                                )
                            } else {
                                securityResponsiblesMap.set(securityResponsible, securityResponsible)
                            }
                        }),
                    )
                    setSecurityResponsibles(Object.fromEntries(securityResponsiblesMap))
                }

                if (project['_embedded']?.['sw360:vendors']?.[0] !== undefined) {
                    const selectedVendor = project['_embedded']['sw360:vendors'][0]
                    setVendor({
                        ...selectedVendor,
                        id: project.vendorId ?? selectedVendor.id ?? '',
                    })
                }

                const releaseData: {
                    [k: string]: LinkedReleaseData
                } = {}
                for (const r of project._embedded?.['sw360:releases'] ?? []) {
                    const rel = (project.linkedReleases ?? []).filter((rel) => rel.release.split('/').at(-1) === r.id)
                    releaseData[r.id ?? ''] = {
                        name: r.name,
                        version: r.version,
                        comment: rel?.[0].comment,
                        releaseRelation: rel?.[0].relation,
                        mainlineState: rel?.[0].mainlineState,
                    } as LinkedReleaseData
                }

                const projectPayloadData: ProjectPayload = {
                    name: project.name,
                    version: project.version ?? '',
                    visibility: project.visibility ?? 'EVERYONE',
                    createdBy: project._embedded?.createdBy?.fullName ?? '',
                    projectType: project.projectType ?? 'PRODUCT',
                    tag: project.tag ?? '',
                    description: project.description ?? '',
                    domain: project.domain ?? '',
                    clearingTeam: project.clearingTeam ?? '',
                    vendorId: project.vendorId ?? '',
                    modifiedOn: project.modifiedOn ?? '',
                    modifiedBy: project.modifiedBy ?? '',
                    externalIds: project.externalIds ?? {},
                    externalUrls: project.externalUrls ?? {},
                    additionalData: project.additionalData ?? {},
                    roles: CommonUtils.convertRoles(CommonUtils.convertObjectToMapRoles(project.roles)),
                    ownerAccountingUnit: project.ownerAccountingUnit ?? '',
                    ownerGroup: project.ownerGroup ?? '',
                    ownerCountry: project.ownerCountry ?? '',
                    clearingState: project.clearingState ?? 'OPEN',
                    businessUnit: project.businessUnit ?? '',
                    preevaluationDeadline: project.preevaluationDeadline ?? '',
                    clearingSummary: project.clearingSummary ?? '',
                    specialRisksOSS: project.specialRisksOSS ?? '',
                    generalRisks3rdParty: project.generalRisks3rdParty ?? '',
                    specialRisks3rdParty: project.specialRisks3rdParty ?? '',
                    deliveryChannels: project.deliveryChannels ?? '',
                    remarksAdditionalRequirements: project.remarksAdditionalRequirements ?? '',
                    state: project.state ?? 'ACTIVE',
                    systemTestStart: project.systemTestStart ?? '',
                    systemTestEnd: project.systemTestEnd ?? '',
                    deliveryStart: project.deliveryStart ?? '',
                    phaseOutSince: project.phaseOutSince ?? '',
                    licenseInfoHeaderText: project.licenseInfoHeaderText ?? '',
                    securityResponsibles: project.securityResponsibles ?? [],
                    enableSvm: project.enableSvm ?? false,
                    enableVulnerabilitiesDisplay: project.enableVulnerabilitiesDisplay ?? false,
                    contributors: (project._embedded?.['sw360:contributors'] ?? []).map((user) => user.email),
                    moderators: (project._embedded?.['sw360:moderators'] ?? []).map((user) => user.email),
                    projectOwner: project.projectOwner ?? '',
                    projectResponsible: project.projectResponsible ?? '',
                    leadArchitect: project._embedded?.leadArchitect?.email ?? '',
                    linkedReleases: releaseData,
                    linkedProjects: (project._embedded?.['sw360:projects'] ?? []).reduce(
                        (acc, proj) => {
                            acc[proj.id ?? ''] = {
                                name: proj.name,
                                version: proj.version ?? '',
                                enableSvm:
                                    project.linkedProjects?.filter((p) => p.project.split('/').at(-1) === proj.id)?.[0]
                                        ?.enableSvm === 'true',
                                projectRelationship:
                                    project.linkedProjects?.filter((p) => p.project.split('/').at(-1) === proj.id)?.[0]
                                        ?.relation ?? '',
                            }
                            return acc
                        },
                        {} as {
                            [k: string]: LinkedProjectData
                        },
                    ),
                    comment: projectPayload.comment ?? '',
                    packageIds: (project._embedded?.['sw360:packages'] ?? []).reduce(
                        (acc, singlePackage) => {
                            if (singlePackage.id) {
                                // Get comment from project's packageIds if it exists, otherwise empty string
                                const existingComment = project.packageIds?.[singlePackage.id]?.comment || ''
                                acc[singlePackage.id] = {
                                    packageId: singlePackage._links?.self.href.split('/').at(-1) ?? '',
                                    name: singlePackage.name ?? '',
                                    version: singlePackage.version ?? '',
                                    licenseIds: singlePackage.licenseIds ?? [],
                                    packageManager: singlePackage.packageManager ?? '',
                                    comment: existingComment,
                                }
                            }
                            return acc
                        },
                        {} as {
                            [key: string]: LinkedPackageData
                        },
                    ),
                }
                setProjectPayload(projectPayloadData)
                setIsLoading(false)
            } catch (e) {
                console.error(e)
            }
        })()
    }, [
        projectId,
        setProjectPayload,
    ])

    const checkUpdateEligibility = async (projectId: string) => {
        const url = CommonUtils.createUrlWithParams(`moderationrequest/validate`, {
            entityType: 'PROJECT',
            entityId: projectId,
        })
        const response = await ApiUtils.POST(url, {})
        switch (response.status) {
            case StatusCodes.UNAUTHORIZED:
                MessageService.warn(t('Unauthorized request'))
                return 'DENIED'
            case StatusCodes.FORBIDDEN:
                MessageService.warn(t('Access Denied'))
                return 'DENIED'
            case StatusCodes.BAD_REQUEST:
                MessageService.warn(t('Invalid input or missing required parameters'))
                return 'DENIED'
            case StatusCodes.INTERNAL_SERVER_ERROR:
                MessageService.error(t('Internal server error'))
                return 'DENIED'
            case StatusCodes.OK:
                MessageService.info(t('You can write to the entity'))
                return 'OK'
            case StatusCodes.ACCEPTED:
                MessageService.info(t('You are allowed to perform write with MR'))
                return 'ACCEPTED'
            default:
                MessageService.error(t('Error while processing'))
                return 'DENIED'
        }
    }

    const updateProject = async (payload?: ProjectPayload) => {
        try {
            const dataToUpdate = payload ?? projectPayload
            const requests = [
                ApiUtils.PATCH(
                    isDependencyNetworkFeatureEnabled === true
                        ? `projects/network/${projectId}`
                        : `projects/${projectId}`,
                    dataToUpdate,
                ),
            ]
            if (Object.keys(obligations).length !== 0) {
                const licenseObligations: Record<string, object> = {}
                const componentObligations: Record<string, object> = {}
                const projectObligations: Record<string, object> = {}
                const organisationObligations: Record<string, object> = {}

                for (const key in obligations) {
                    const obligation = {
                        ...obligations[key],
                    }
                    const obligationType = obligation.obligationType
                    delete obligation.obligationType

                    if (obligationType === ObligationType.LICENSE_OBLIGATION) {
                        licenseObligations[key] = {
                            ...obligation,
                            obligationLevel: ObligationType.LICENSE_OBLIGATION,
                        }
                    } else if (obligationType === ObligationType.COMPONENT_OBLIGATION) {
                        componentObligations[key] = {
                            ...obligation,
                            obligationLevel: ObligationType.COMPONENT_OBLIGATION,
                        }
                    } else if (obligationType === ObligationType.PROJECT_OBLIGATION) {
                        projectObligations[key] = {
                            ...obligation,
                            obligationLevel: ObligationType.PROJECT_OBLIGATION,
                        }
                    } else if (obligationType === ObligationType.ORGANISATION_OBLIGATION) {
                        organisationObligations[key] = {
                            ...obligation,
                            obligationLevel: ObligationType.ORGANISATION_OBLIGATION,
                        }
                    }
                }

                const nonEmptyBuckets = [
                    licenseObligations,
                    componentObligations,
                    projectObligations,
                    organisationObligations,
                ].filter((b) => Object.keys(b).length > 0)

                if (nonEmptyBuckets.length > 1) {
                    const allObligations = {
                        ...licenseObligations,
                        ...componentObligations,
                        ...projectObligations,
                        ...organisationObligations,
                    }
                    requests.push(
                        ApiUtils.PATCH(`projects/${projectId}/updateObligation?obligationLevel=all`, allObligations),
                    )
                } else {
                    if (Object.keys(licenseObligations).length > 0) {
                        requests.push(
                            ApiUtils.PATCH(`projects/${projectId}/updateLicenseObligation`, licenseObligations),
                        )
                    }
                    if (Object.keys(componentObligations).length > 0) {
                        requests.push(
                            ApiUtils.PATCH(
                                `projects/${projectId}/updateObligation?obligationLevel=component`,
                                componentObligations,
                            ),
                        )
                    }
                    if (Object.keys(projectObligations).length > 0) {
                        requests.push(
                            ApiUtils.PATCH(
                                `projects/${projectId}/updateObligation?obligationLevel=project`,
                                projectObligations,
                            ),
                        )
                    }
                    if (Object.keys(organisationObligations).length > 0) {
                        requests.push(
                            ApiUtils.PATCH(
                                `projects/${projectId}/updateObligation?obligationLevel=organization`,
                                organisationObligations,
                            ),
                        )
                    }
                }
            }
            const responses = await Promise.all(requests)
            for (const r of responses) {
                if (r.status === StatusCodes.OK || r.status === StatusCodes.CREATED) {
                    MessageService.success(
                        t('Project') + ` ${dataToUpdate.name} (${dataToUpdate.version}) ` + t('updated successfully'),
                    )
                    router.push(`/projects/detail/${projectId}`)
                } else if (r.status === StatusCodes.ACCEPTED) {
                    MessageService.success(t('Moderation request is created'))
                    router.push(`/projects/detail/${projectId}`)
                } else if (r.status === StatusCodes.FORBIDDEN) {
                    const err = (await r.json()) as ErrorDetails
                    throw new ApiError(err.message || t('Access Denied'), {
                        status: r.status,
                    })
                } else {
                    const err = (await r.json()) as ErrorDetails
                    throw new ApiError(err.message, {
                        status: r.status,
                    })
                }
            }
        } catch (error: unknown) {
            ApiUtils.reportError(error)
        }
    }

    const preRequisite = async () => {
        const isEligible = await checkUpdateEligibility(projectId)
        if (isEligible === 'OK') {
            await updateProject()
        } else if (isEligible === 'ACCEPTED') {
            setShowCommentModal(true)
        } else if (isEligible === 'DENIED') {
            return
        }
    }

    const handleCancelClick = () => {
        router.push(`/projects/detail/${projectId}?tab=${activeKey ?? DEFAULT_ACTIVE_TAB}`)
    }

    const obligationsBadgeClassName =
        obligationsNonOpenCount === 0
            ? 'obligations-badge--danger'
            : obligationsTotal === obligationsNonOpenCount
              ? 'obligations-badge--success'
              : 'obligations-badge'

    return (
        <>
            {projectPayload?.name ? <Breadcrumb name={projectPayload?.name} /> : <Breadcrumb name={' '} />}
            <div className='container page-content'>
                {isLoading ? (
                    <div
                        className='d-flex justify-content-center align-items-center'
                        style={{
                            minHeight: '400px',
                        }}
                    >
                        <div
                            className='spinner-border text-primary'
                            role='status'
                        >
                            <span className='visually-hidden'>Loading...</span>
                        </div>
                    </div>
                ) : (
                    <>
                        {projectId && (
                            <DeleteProjectDialog
                                projectId={projectId}
                                show={deleteDialogOpen}
                                setShow={setDeleteDialogOpen}
                                hasClearingRequest={hasClearingRequest}
                            />
                        )}
                        {projectId && (
                            <CreateMRCommentDialog<ProjectPayload>
                                show={showCommentModal}
                                setShow={setShowCommentModal}
                                updateEntity={updateProject}
                                setEntityPayload={setProjectPayload}
                            />
                        )}
                        <form
                            action=''
                            id='form_submit'
                            method='post'
                            onSubmit={(event) => {
                                event.preventDefault()
                            }}
                        >
                            <div>
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
                                                    eventKey='linkedProjectsAndReleases'
                                                >
                                                    <div className='my-2'>{t('Linked Releases and Projects')}</div>
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
                                                    eventKey='attachments'
                                                >
                                                    <div className='my-2'>{t('Attachments')}</div>
                                                </ListGroup.Item>
                                                <ListGroup.Item
                                                    action
                                                    eventKey='obligations'
                                                >
                                                    <SidebarCountBadge
                                                        badgeClassName={obligationsBadgeClassName}
                                                        countId='obligationsCount'
                                                        isLoading={false}
                                                        label={t('Obligations')}
                                                        value={`${obligationsNonOpenCount} / ${obligationsTotal}`}
                                                    />
                                                </ListGroup.Item>
                                            </ListGroup>
                                        </Col>
                                        <Col className='me-3'>
                                            <Row className='d-flex justify-content-between'>
                                                <Col lg={4}>
                                                    <Row>
                                                        <Button
                                                            variant='primary'
                                                            type='submit'
                                                            className='me-2 col-auto'
                                                            onClick={() => void preRequisite()}
                                                        >
                                                            {t('Update Project')}
                                                        </Button>
                                                        <Button
                                                            variant='danger'
                                                            type='submit'
                                                            className='me-2 col-auto'
                                                            onClick={handleDeleteProject}
                                                        >
                                                            {t('Delete Project')}
                                                        </Button>
                                                        <Button
                                                            variant='secondary'
                                                            className='col-auto'
                                                            onClick={handleCancelClick}
                                                        >
                                                            {t('Cancel')}
                                                        </Button>
                                                    </Row>
                                                </Col>
                                                <Col
                                                    lg={4}
                                                    className='text-truncate buttonheader-title'
                                                >
                                                    {t('Update Project')}
                                                </Col>
                                            </Row>
                                            <Row className='mt-5'>
                                                <Tab.Content>
                                                    <Tab.Pane eventKey='summary'>
                                                        <Summary
                                                            vendor={vendor}
                                                            setVendor={setVendor}
                                                            externalUrls={externalUrls}
                                                            setExternalUrls={setExternalUrls}
                                                            setExternalUrlsData={setDataExternalUrls}
                                                            externalIds={externalIds}
                                                            setExternalIds={setExternalIds}
                                                            setExternalIdsData={setDataExternalIds}
                                                            additionalData={additionalData}
                                                            setAdditionalData={setAdditionalData}
                                                            setAdditionalDataObject={setDataAdditionalData}
                                                            projectPayload={projectPayload}
                                                            setProjectPayload={setProjectPayload}
                                                            additionalRoles={additionalRoles}
                                                            setAdditionalRoles={setAdditionalRoles}
                                                            setDataAdditionalRoles={setDataAdditionalRoles}
                                                            moderators={moderators}
                                                            setModerators={setModerators}
                                                            contributors={contributors}
                                                            setContributors={setContributors}
                                                            securityResponsibles={securityResponsibles}
                                                            setSecurityResponsibles={setSecurityResponsibles}
                                                            projectOwner={projectOwner}
                                                            setProjectOwner={setProjectOwner}
                                                            projectManager={projectManager}
                                                            setProjectManager={setProjectManager}
                                                            leadArchitect={leadArchitect}
                                                            setLeadArchitect={setLeadArchitect}
                                                        />
                                                    </Tab.Pane>
                                                    <Tab.Pane eventKey='administration'>
                                                        <Administration
                                                            projectPayload={projectPayload}
                                                            setProjectPayload={setProjectPayload}
                                                        />
                                                    </Tab.Pane>
                                                    <Tab.Pane eventKey='linkedProjectsAndReleases'>
                                                        {projectPayload.name && (
                                                            <LinkedReleasesAndProjects
                                                                projectId={projectId}
                                                                projectPayload={projectPayload}
                                                                setProjectPayload={setProjectPayload}
                                                                isDependencyNetworkFeatureEnabled={
                                                                    isDependencyNetworkFeatureEnabled
                                                                }
                                                            />
                                                        )}
                                                    </Tab.Pane>
                                                    {isPackageFeatureEnabled && (
                                                        <Tab.Pane eventKey='linkedPackages'>
                                                            <LinkedPackages
                                                                projectId={projectId}
                                                                payload={projectPayload}
                                                                setPayload={setProjectPayload}
                                                            />
                                                        </Tab.Pane>
                                                    )}
                                                    <Tab.Pane eventKey='attachments'>
                                                        <EditAttachments
                                                            documentId={projectId}
                                                            documentType={DocumentTypes.PROJECT}
                                                            documentPayload={projectPayload}
                                                            setDocumentPayload={setProjectPayload}
                                                        />
                                                    </Tab.Pane>
                                                    <Tab.Pane eventKey='obligations'>
                                                        <Obligations
                                                            projectId={projectId}
                                                            actionType={ActionType.EDIT}
                                                            payload={obligations}
                                                            setPayload={setObligations}
                                                        />
                                                    </Tab.Pane>
                                                </Tab.Content>
                                            </Row>
                                        </Col>
                                    </Row>
                                </Tab.Container>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </>
    )
}
// Pass notAllowedUserGroups to AccessControl to restrict access
export default AccessControl(EditProject, [
    UserGroupType.SECURITY_USER,
])
