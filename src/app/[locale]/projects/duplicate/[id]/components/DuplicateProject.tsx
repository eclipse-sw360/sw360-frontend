// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import Administration from '@/components/ProjectAddSummary/Administration'
import LinkedReleasesAndProjects from '@/components/ProjectAddSummary/LinkedReleasesAndProjects'
import Summary from '@/components/ProjectAddSummary/Summary'
import { HttpStatus, InputKeyValue, Project, ProjectPayload, ReleaseDetail, Vendor } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'
import { getSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { notFound, useRouter } from 'next/navigation'
import { useEffect, useState, type JSX } from 'react'
import { Button, Col, ListGroup, Row, Tab } from 'react-bootstrap'

interface Props {
    projectId: string
    isDependencyNetworkFeatureEnabled: boolean
}

interface LinkedReleaseProps {
    release?: string
    relation?: string
    mainlineState?: string
    releaseRelation?: string
    comment?: string
}

interface LinkedReleaseData {
    comment: string
    mainlineState: string
    name: string
    releaseRelation: string
    version: string
}

function DuplicateProject({ projectId, isDependencyNetworkFeatureEnabled }: Props): JSX.Element {
    const router = useRouter()
    const t = useTranslations('default')
    const [vendor, setVendor] = useState<Vendor>({
        id: '',
        fullName: '',
    })

    const [externalUrls, setExternalUrls] = useState<InputKeyValue[]>([])

    const [externalIds, setExternalIds] = useState<InputKeyValue[]>([])

    const [additionalData, setAdditionalData] = useState<InputKeyValue[]>([])

    const [additionalRoles, setAdditionalRoles] = useState<InputKeyValue[]>([])

    const [moderators, setModerators] = useState<{ [k: string]: string }>({})
    const [contributors, setContributors] = useState<{ [k: string]: string }>({})
    const [securityResponsibles, setSecurityResponsibles] = useState<{ [k: string]: string }>({})
    const [projectOwner, setProjectOwner] = useState<{ [k: string]: string }>({})
    const [projectManager, setProjectManager] = useState<{ [k: string]: string }>({})
    const [leadArchitect, setLeadArchitect] = useState<{ [k: string]: string }>({})
    const [existingReleaseData, setExistingReleaseData] = useState<Map<string, LinkedReleaseData>>()
    const [isDuplicateProjectFetched, setIsDuplicateProjectFetched] = useState(false)

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

    const setObjectToMap = async (linkedReleases: LinkedReleaseProps[]) => {
        try {
            const map = new Map<string, LinkedReleaseData>()
            const linkedReleasesObject: { [key: string]: LinkedReleaseProps } = {}
            const session = await getSession()
            if (CommonUtils.isNullOrUndefined(session)) return signOut()
            for (const l of linkedReleases) {
                const releaseId = l['release']?.split('/').pop()
                if (releaseId === undefined) continue
                const response = await ApiUtils.GET(`releases/${releaseId}`, session.user.access_token)
                const releaseData = (await response.json()) as ReleaseDetail
                map.set(releaseId, {
                    name: releaseData.name,
                    version: releaseData.version,
                    releaseRelation: l.relation ?? '',
                    mainlineState: l.mainlineState ?? '',
                    comment: l.comment ?? '',
                })
                setExistingReleaseData(map)
                linkedReleasesObject[releaseId] = {
                    releaseRelation: l.relation,
                    mainlineState: l.mainlineState,
                    comment: l.comment,
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

    useEffect(() => {
        void (async () => {
            try {
                const session = await getSession()
                if (CommonUtils.isNullOrUndefined(session)) return signOut()
                const response = await ApiUtils.GET(`projects/${projectId}`, session.user.access_token)
                if (response.status !== HttpStatus.OK) {
                    return notFound()
                }
                const project = (await response.json()) as Project
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

                if (project['_embedded']?.['projectOwner'] !== undefined) {
                    setProjectOwner({
                        [project['_embedded']['projectOwner'].email]:
                            project['_embedded']['projectOwner'].fullName ?? '',
                    })
                }

                if (project['_embedded']?.['projectManager'] !== undefined) {
                    setProjectManager({
                        [project['_embedded']['projectManager'].email]:
                            project['_embedded']['projectManager'].fullName ?? '',
                    })
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

                if (project['_embedded']?.['sw360:securityResponsibles'] !== undefined) {
                    const securityResponsiblesMap = new Map<string, string>()
                    project['_embedded']['sw360:securityResponsibles'].map((securityResponsible) => {
                        securityResponsiblesMap.set(securityResponsible.email, securityResponsible.fullName ?? '')
                    })
                    setSecurityResponsibles(Object.fromEntries(securityResponsiblesMap))
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
                    businessUnit: project.businessUnit ?? 'CT',
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
                    projectOwner: project._embedded?.projectOwner?.email ?? '',
                    leadArchitect: project._embedded?.leadArchitect?.email ?? '',
                    linkedReleases: projectPayload.linkedReleases ?? {},
                }
                setProjectPayload(projectPayloadData)
                setIsDuplicateProjectFetched(true)
            } catch (e) {
                console.error(e)
            }
        })()
    }, [projectId, setProjectPayload])

    const createProject = async () => {
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) return signOut()
        const createProjectUrl =
            isDependencyNetworkFeatureEnabled === true
                ? `projects/network/duplicate/${projectId}`
                : `projects/duplicate/${projectId}`
        const response = await ApiUtils.POST(createProjectUrl, projectPayload, session.user.access_token)

        if (response.status == HttpStatus.CREATED) {
            const data = (await response.json()) as Project
            MessageService.success(t('Your project is created'))
            router.push(`/projects/detail/${data._links.self.href.split('/').at(-1)}`)
        } else {
            MessageService.error(t('There are some errors while creating project'))
        }
    }

    const handleCancelClick = () => {
        router.push('/projects')
    }

    return (
        <div className='container page-content'>
            <form
                action=''
                id='form_submit'
                method='post'
                onSubmit={(event) => {
                    event.preventDefault()
                }}
            >
                <div>
                    <Tab.Container defaultActiveKey='summary'>
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
                                        eventKey='linkedProjects'
                                    >
                                        <div className='my-2'>{t('Linked Releases and Projects')}</div>
                                    </ListGroup.Item>
                                </ListGroup>
                            </Col>
                            <Col className='me-3'>
                                <Row className='d-flex justify-content-between'>
                                    <Col lg={3}>
                                        <Row>
                                            <Button
                                                variant='primary'
                                                type='submit'
                                                className='me-2 col-auto'
                                                onClick={() => void createProject()}
                                            >
                                                {t('Create Project')}
                                            </Button>
                                            <Button
                                                variant='secondary'
                                                className='col-auto'
                                                onClick={() => handleCancelClick()}
                                            >
                                                {t('Cancel')}
                                            </Button>
                                        </Row>
                                    </Col>
                                    <Col
                                        lg={4}
                                        className='text-truncate buttonheader-title'
                                    >
                                        {`${projectPayload.name} (${projectPayload.version})`}
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
                                        <Tab.Pane eventKey='linkedProjects'>
                                            {isDuplicateProjectFetched && (
                                                <LinkedReleasesAndProjects
                                                    projectId={projectId}
                                                    projectPayload={projectPayload}
                                                    setProjectPayload={setProjectPayload}
                                                    existingReleaseData={existingReleaseData}
                                                    isDependencyNetworkFeatureEnabled={
                                                        isDependencyNetworkFeatureEnabled
                                                    }
                                                />
                                            )}
                                        </Tab.Pane>
                                    </Tab.Content>
                                </Row>
                            </Col>
                        </Row>
                    </Tab.Container>
                </div>
            </form>
        </div>
    )
}

export default DuplicateProject
