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
import { HttpStatus, InputKeyValue, Project, ProjectPayload, Vendor } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'
import { signOut, getSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { notFound, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { Button, Col, ListGroup, Row, Tab } from 'react-bootstrap'

interface Props{
    projectId: string
}

function DuplicateProject({projectId}:Props) {

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

    const [projectPayload, setProjectPayload] = useState<ProjectPayload>({
        name: '',
        version: '',
        visibility: 'EVERYONE',
        createdBy: '',
        projectType: 'PRODUCT',
        tag: '',
        description: '',
        domain: '',
        defaultVendorId: '',
        modifiedOn: '',
        modifiedBy: '',
        externalUrls: null,
        additionalData: {},
        externalIds: null,
        roles: null,
        ownerAccountingUnit: '',
        ownerGroup: '',
        ownerCountry: '',
        clearingState : '',
        businessUnit : '',
        preevaluationDeadline : '',
        clearingSummary : '',
        specialRisksOSS : '',
        generalRisks3rdParty : '',
        specialRisks3rdParty : '',
        deliveryChannels : '',
        remarksAdditionalRequirements : '',
        state : '',
        systemTestStart : '',
        systemTestEnd : '',
        deliveryStart : '',
        phaseOutSince : '',
        licenseInfoHeaderText : '',
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

    const fetchData = useCallback(
        async (url: string) => {
            const session = await getSession()
            const response = await ApiUtils.GET(url, session.user.access_token)
            if (response.status == HttpStatus.OK) {
                const data = (await response.json()) as Project
                return data
            } else if (response.status == HttpStatus.UNAUTHORIZED) {
                return signOut()
            } else {
                notFound()
            }
        },[]
    )

    useEffect(() => {
        void fetchData(`projects/${projectId}`).then((project: Project) => {
            if (typeof project.externalIds !== 'undefined') {
                setExternalIds(CommonUtils.convertObjectToMap(project.externalIds))
            }

            if (typeof project.externalUrls !== 'undefined') {
                setExternalUrls(CommonUtils.convertObjectToMap(project.externalUrls))
            }

            if (typeof project.additionalData !== 'undefined') {
                setAdditionalData(CommonUtils.convertObjectToMap(project.additionalData))
            }

            if (typeof project.roles !== 'undefined') {
                setAdditionalRoles(CommonUtils.convertObjectToMapRoles(project.roles))
            }

            if (typeof project["_embedded"]["leadArchitect"] !== 'undefined') {
                setLeadArchitect({ [project["_embedded"]["leadArchitect"].email]: project["_embedded"]["leadArchitect"].fullName })
            }

            if (typeof project["_embedded"]["projectOwner"] !== 'undefined') {
                setProjectOwner({ [project["_embedded"]["projectOwner"].email]: project["_embedded"]["projectOwner"].fullName })
            }

            if (typeof project["_embedded"]["projectManager"] !== 'undefined') {
                setProjectManager({ [project["_embedded"]["projectManager"].email]: project["_embedded"]["projectManager"].fullName })
            }

            if (typeof project["_embedded"]["sw360:moderators"] !== 'undefined') {
                const moderatorMap = new Map<string, string>()
                project["_embedded"]["sw360:moderators"].map((moderator) => {
                    moderatorMap.set(moderator.email, moderator.fullName)
                })
                setModerators(Object.fromEntries(moderatorMap))
            }

            if (typeof project["_embedded"]["sw360:contributors"] !== 'undefined') {
                const contributorMap = new Map<string, string>()
                project["_embedded"]["sw360:contributors"].map((contributor) => {
                    contributorMap.set(contributor.email, contributor.fullName)
                })
                setContributors(Object.fromEntries(contributorMap))
            }

            if (typeof project["_embedded"]["sw360:securityResponsibles"] !== 'undefined') {
                const securityResponsiblesMap = new Map<string, string>()
                project["_embedded"]["sw360:securityResponsibles"].map((securityResponsible) => {
                    securityResponsiblesMap.set(securityResponsible.email, securityResponsible.fullName)
                })
                setSecurityResponsibles(Object.fromEntries(securityResponsiblesMap))
            }

            const projectPayloadData: ProjectPayload = {
                name: project.name,
                version: project.version,
                visibility: project.visibility,
                createdBy: project._embedded.createdBy.fullName,
                projectType: project.projectType,
                tag: project.tag,
                description: project.description,
                domain: project.domain,
                modifiedOn: project.modifiedOn,
                modifiedBy: project.modifiedBy,
                externalIds: project.externalIds,
                externalUrls:project.externalUrls,
                additionalData: project.additionalData,
                roles: CommonUtils.convertRoles(CommonUtils.convertObjectToMapRoles(project.roles)),
                ownerAccountingUnit: project.ownerAccountingUnit,
                ownerGroup: project.ownerGroup,
                ownerCountry: project.ownerCountry,
                clearingState: project.clearingState,
                businessUnit: project.businessUnit,
                preevaluationDeadline: project.preevaluationDeadline,
                clearingSummary: project.clearingSummary,
                specialRisksOSS: project.specialRisksOSS,
                generalRisks3rdParty: project.generalRisks3rdParty,
                specialRisks3rdParty: project.specialRisks3rdParty,
                deliveryChannels: project.deliveryChannels,
                remarksAdditionalRequirements: project.remarksAdditionalRequirements,
                state: project.state,
                systemTestStart: project.systemTestStart,
                systemTestEnd: project.systemTestEnd,
                deliveryStart: project.deliveryStart,
                phaseOutSince: project.phaseOutSince,
                licenseInfoHeaderText: project.licenseInfoHeaderText
            }
            setProjectPayload(projectPayloadData)
        })
    }, [projectId, fetchData, setProjectPayload])

    const createProject = async () => {
        const session = await getSession()
        const response = await ApiUtils.POST(`projects/duplicate/${projectId}`, projectPayload, session.user.access_token)

        if (response.status == HttpStatus.CREATED) {
            await response.json()
            MessageService.success(t('Your project is created'))
            router.push(`/projects/detail/${projectId}`)
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
                            <Col sm='auto' className='me-3'>
                                <ListGroup>
                                    <ListGroup.Item action eventKey='summary'>
                                        <div className='my-2'>{t('Summary')}</div>
                                    </ListGroup.Item>
                                    <ListGroup.Item action eventKey='administration'>
                                        <div className='my-2'>{t('Administration')}</div>
                                    </ListGroup.Item>
                                    <ListGroup.Item action eventKey='linkedProjects'>
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
                                                onClick={createProject}
                                            >
                                                {t('Create Project')}
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
                                    <Col lg={4} className='text-truncate buttonheader-title'>
                                        {projectPayload && `${projectPayload.name} (${projectPayload.version})`}
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
                                            <LinkedReleasesAndProjects
                                                projectPayload={projectPayload}
                                                setProjectPayload={setProjectPayload}
                                            />
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
