// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { StatusCodes } from 'http-status-codes'
import { notFound, useRouter, useSearchParams } from 'next/navigation'
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Breadcrumb } from 'next-sw360'
import { type JSX, useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Col, ListGroup, Row, Tab } from 'react-bootstrap'
import { AccessControl } from '@/components/AccessControl/AccessControl'
import EditAttachments from '@/components/Attachments/EditAttachments'
import CreateMRCommentDialog from '@/components/CreateMRCommentDialog/CreateMRCommentDialog'
import Administration from '@/components/ProjectAddSummary/Administration'
import LinkedPackages from '@/components/ProjectAddSummary/LinkedPackages'
import LinkedReleasesAndProjects from '@/components/ProjectAddSummary/LinkedReleasesAndProjects'
import Summary from '@/components/ProjectAddSummary/Summary'
import {
    ActionType,
    DocumentTypes,
    InputKeyValue,
    LinkedPackageData,
    LinkedProjectData,
    LinkedReleaseData,
    ObligationEntry,
    Project,
    ProjectLinkedRelease,
    ProjectPayload,
    ReleaseDetail,
    User,
    UserGroupType,
    Vendor,
} from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'
import { ObligationLevels } from '../../../../../../object-types/Obligation'
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
        'linkedPackages',
    ]
    const DEFAULT_ACTIVE_TAB = 'summary'
    const [activeKey, setActiveKey] = useState(DEFAULT_ACTIVE_TAB)

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [hasClearingRequest, setHasClearingRequest] = useState(false)

    const session = useSession()

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            signOut()
        }
    }, [
        session,
    ])

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
    const [serverObl, setServerObl] = useState<
        Record<
            string,
            {
                status?: string
            }
        >
    >({})
    const [serverTotal, setServerTotal] = useState<number>(0)

    const { obligationsTotal, obligationsNonOpenCount } = useMemo(() => {
        const isOpen = (s?: string | null) => (s ?? '').trim().toUpperCase() === 'OPEN'

        const total = serverTotal

        const merged: Record<
            string,
            {
                status?: string
            }
        > = {
            ...serverObl,
        }

        Object.keys(obligations).forEach((key) => {
            if (merged[key]) {
                merged[key] = {
                    ...merged[key],
                    status: obligations[key]?.status,
                }
            } else {
                merged[key] = {
                    status: obligations[key]?.status,
                }
            }
        })

        const list = Object.values(merged)
        const nonOpen = list.filter((o) => !isOpen(o?.status)).length

        return {
            obligationsTotal: total,
            obligationsNonOpenCount: nonOpen,
        }
    }, [
        serverObl,
        serverTotal,
        obligations,
    ])

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

    const setObjectToMap = async (linkedReleases: ProjectLinkedRelease[]) => {
        try {
            const linkedReleasesObject: {
                [key: string]: LinkedReleaseData
            } = {}
            if (CommonUtils.isNullOrUndefined(session.data)) return signOut()
            for (const l of linkedReleases) {
                const releaseId = l['release']?.split('/').pop()
                if (releaseId === undefined) continue
                const response = await ApiUtils.GET(`releases/${releaseId}`, session.data.user.access_token)
                const releaseData = (await response.json()) as ReleaseDetail
                linkedReleasesObject[releaseId] = {
                    name: releaseData.name,
                    version: releaseData.version,
                    releaseRelation: l.relation ?? '',
                    mainlineState: l.mainlineState ?? '',
                    comment: l.comment ?? '',
                }
            }
            setProjectPayload((prevProjectPayload) => ({
                ...prevProjectPayload,
                linkedReleases: linkedReleasesObject,
            }))
        } catch (e) {
            console.error(e)
        }
    }

    const fetchUserData = useCallback(async (url: string) => {
        if (CommonUtils.isNullOrUndefined(session.data)) return signOut()
        const response = await ApiUtils.GET(url, session.data.user.access_token)
        if (response.status === StatusCodes.OK) {
            const data = (await response.json()) as User
            return data
        } else if (response.status === StatusCodes.UNAUTHORIZED) {
            MessageService.error(t('Unauthorized request'))
            return
        } else {
            return undefined
        }
    }, [])

    useEffect(() => {
        if (session.status === 'loading') return
        const controller = new AbortController()
        const signal = controller.signal

        const loadServerObligations = async () => {
            try {
                const s = await getSession()
                if (CommonUtils.isNullOrUndefined(s)) return signOut()

                const url = CommonUtils.createUrlWithParams(`projects/${projectId}/licenseObligations`, {
                    page: '0',
                    page_entries: '9999',
                })

                const resp = await ApiUtils.GET(url, s.user.access_token, signal)
                const body = (await resp.json().catch(() => ({}))) as {
                    obligations?: Record<
                        string,
                        {
                            status?: string
                        }
                    >
                    page?: {
                        totalElements?: number
                    }
                }

                if (resp.status !== StatusCodes.OK) return

                const obl = body?.obligations ?? {}
                const total =
                    typeof body?.page?.totalElements === 'number' ? body.page.totalElements : Object.keys(obl).length

                setServerObl(obl)
                setServerTotal(total)
            } catch (_e) {
                setIsLoading(false)
            }
        }

        void loadServerObligations()
        return () => controller.abort()
    }, [
        projectId,
        session.status,
    ])

    useEffect(() => {
        void (async () => {
            try {
                if (CommonUtils.isNullOrUndefined(session.data)) return signOut()
                const response = await ApiUtils.GET(`projects/${projectId}`, session.data.user.access_token)
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

                if (project.linkedReleases !== undefined) {
                    void setObjectToMap(project.linkedReleases)
                }

                if (project['_embedded']?.['leadArchitect'] !== undefined) {
                    setLeadArchitect({
                        [project['_embedded']['leadArchitect'].email]:
                            project['_embedded']['leadArchitect'].fullName ?? '',
                    })
                }

                if (project?.projectOwner !== undefined) {
                    const userData = await fetchUserData(`users/${project?.projectOwner}`)
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
                    const userData = await fetchUserData(`users/${project?.projectResponsible}`)
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
                            const userData = await fetchUserData(`users/${securityResponsible}`)
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
                    const vendorData = project['_embedded']['sw360:vendors'][0]
                    setVendor({
                        id: vendorData.id ?? '',
                        fullName: vendorData.fullName ?? '',
                        shortName: vendorData.shortName ?? '',
                        url: vendorData.url ?? '',
                    })
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
                    contributors: (project._embedded?.['sw360:contributors'] ?? []).map((user) => user.email),
                    moderators: (project._embedded?.['sw360:moderators'] ?? []).map((user) => user.email),
                    projectOwner: project.projectOwner ?? '',
                    projectResponsible: project.projectResponsible ?? '',
                    leadArchitect: project._embedded?.leadArchitect?.email ?? '',
                    linkedReleases: projectPayload.linkedReleases ?? {},
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
        session,
    ])

    const checkUpdateEligibility = async (projectId: string) => {
        if (CommonUtils.isNullOrUndefined(session.data)) return signOut()
        const url = CommonUtils.createUrlWithParams(`moderationrequest/validate`, {
            entityType: 'PROJECT',
            entityId: projectId,
        })
        const response = await ApiUtils.POST(url, {}, session.data.user.access_token)
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
                MessageService.error(t('Error when processing'))
                return 'DENIED'
        }
    }

    const updateProject = async (payload?: ProjectPayload) => {
        try {
            if (CommonUtils.isNullOrUndefined(session.data)) return signOut()
            const dataToUpdate = payload ?? projectPayload
            const requests = [
                ApiUtils.PATCH(
                    isDependencyNetworkFeatureEnabled === true
                        ? `projects/network/${projectId}`
                        : `projects/${projectId}`,
                    dataToUpdate,
                    session.data.user.access_token,
                ),
            ]
            if (Object.keys(obligations).length !== 0) {
                for (const key in obligations) {
                    if (obligations[key]?.obligationType === ObligationLevels.LICENSE_OBLIGATION) {
                        if (Object.hasOwn(obligations[key], 'obligationType')) {
                            delete obligations[key].obligationType
                        }
                        requests.push(
                            ApiUtils.PATCH(
                                `projects/${projectId}/updateLicenseObligation`,
                                obligations,
                                session.data.user.access_token,
                            ),
                        )
                    } else if (obligations[key]?.obligationType === ObligationLevels.COMPONENT_OBLIGATION) {
                        if (Object.hasOwn(obligations[key], 'obligationType')) {
                            delete obligations[key].obligationType
                        }
                        requests.push(
                            ApiUtils.PATCH(
                                `projects/${projectId}/updateObligation?obligationLevel=component`,
                                obligations,
                                session.data.user.access_token,
                            ),
                        )
                    } else if (obligations[key]?.obligationType === ObligationLevels.PROJECT_OBLIGATION) {
                        if (Object.hasOwn(obligations[key], 'obligationType')) {
                            delete obligations[key].obligationType
                        }
                        requests.push(
                            ApiUtils.PATCH(
                                `projects/${projectId}/updateObligation?obligationLevel=project`,
                                obligations,
                                session.data.user.access_token,
                            ),
                        )
                    } else if (obligations[key]?.obligationType === ObligationLevels.ORGANISATION_OBLIGATION) {
                        if (Object.hasOwn(obligations[key], 'obligationType')) {
                            delete obligations[key].obligationType
                        }
                        requests.push(
                            ApiUtils.PATCH(
                                `projects/${projectId}/updateObligation?obligationLevel=organization`,
                                obligations,
                                session.data.user.access_token,
                            ),
                        )
                    }
                }
            }
            const responses = await Promise.all(requests)
            let allOk = true
            for (const r of responses) {
                if (
                    !(
                        r.status === StatusCodes.OK ||
                        r.status === StatusCodes.CREATED ||
                        r.status === StatusCodes.ACCEPTED
                    )
                ) {
                    allOk = false
                    break
                }
            }
            if (allOk) {
                MessageService.success(
                    t('Project') + ` ${dataToUpdate.name} (${dataToUpdate.version}) ` + t('updated successfully'),
                )
                router.push(`/projects/detail/${projectId}`)
            } else {
                MessageService.error(
                    t('There are some errors while updating project') +
                        ` ${dataToUpdate.name} (${dataToUpdate.version})!`,
                )
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
        router.push('/projects')
    }

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
                                                <ListGroup.Item
                                                    action
                                                    eventKey='linkedPackages'
                                                >
                                                    <div className='my-2'>{t('Linked Packages')}</div>
                                                </ListGroup.Item>
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
                                                    <div className='d-flex align-items-center my-2'>
                                                        <span className='me-2'>{t('Obligations')}</span>
                                                        <span
                                                            id='obligationsCount'
                                                            className='badge obligations-badge--danger'
                                                            aria-live='polite'
                                                        >
                                                            {`${obligationsNonOpenCount} / ${obligationsTotal}`}
                                                        </span>
                                                    </div>
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
                                                    <Tab.Pane eventKey='linkedPackages'>
                                                        <LinkedPackages
                                                            projectId={projectId}
                                                            projectPayload={projectPayload}
                                                            setProjectPayload={setProjectPayload}
                                                        />
                                                    </Tab.Pane>
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
