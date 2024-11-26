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
import { HttpStatus, InputKeyValue, ProjectPayload, Vendor, Project } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'
import { ENABLE_FLEXIBLE_PROJECT_RELEASE_RELATIONSHIP } from '@/utils/env'
import { getSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button, Col, ListGroup, Row, Tab } from 'react-bootstrap'

function AddProjects(): JSX.Element {
    const router = useRouter()
    const t = useTranslations('default')
    const [vendor, setVendor] = useState<Vendor>({
        id: '',
        fullName: '',
    })
    const [externalUrls, setExternalUrls] = useState<InputKeyValue[]>([])
    const [externalIds, setExternalIds] = useState<InputKeyValue[]>([])
    const [additionalData, setAdditionalData] = useState<InputKeyValue[]>([])

    const [moderators, setModerators] = useState<{ [k: string]: string }>({})
    const [contributors, setContributors] = useState<{ [k: string]: string }>({})
    const [securityResponsibles, setSecurityResponsibles] = useState<{ [k: string]: string }>({})
    const [projectOwner, setProjectOwner] = useState<{ [k: string]: string }>({})
    const [projectManager, setProjectManager] = useState<{ [k: string]: string }>({})
    const [leadArchitect, setLeadArchitect] = useState<{ [k: string]: string }>({})

    const [projectPayload, setProjectPayload] = useState<ProjectPayload>({
        name: '',
        description: '',
        version: '',
        visibility: 'EVERYONE',
        projectType: 'PRODUCT',
        tag: '',
        domain: '',
        leadArchitect: '',
        defaultVendorId: '',
        state: 'ACTIVE',
        phaseOutSince: '',
        moderators: [],
        contributors: [],
        clearingState: 'OPEN',
        businessUnit: 'CT',
        preevaluationDeadline: '',
        clearingSummary: '',
        specialRisksOSS: '',
        generalRisks3rdParty: '',
        specialRisks3rdParty: '',
        deliveryChannels: '',
        remarksAdditionalRequirements: '',
        systemTestStart: '',
        systemTestEnd: '',
        deliveryStart: '',
        licenseInfoHeaderText: '',
        projectOwner: '',
        projectManager: '',
        securityResponsibles: [],
        linkedProjects: {},
        linkedReleases:{},
    })

    const setExternalUrlsData = (externalUrls: Map<string, string>) => {
        const obj = Object.fromEntries(externalUrls)
        setProjectPayload({
            ...projectPayload,
            externalUrls: obj,
        })
    }

    const setExternalIdsData = (externalIds: Map<string, string>) => {
        const obj = Object.fromEntries(externalIds)
        setProjectPayload({
            ...projectPayload,
            externalIds: obj,
        })
    }

    const setAdditionalDataObject = (additionalData: Map<string, string>) => {
        const obj = Object.fromEntries(additionalData)
        setProjectPayload({
            ...projectPayload,
            additionalData: obj,
        })
    }

    const createProject = async () => {
        try {
            const session = await getSession()
            if(CommonUtils.isNullOrUndefined(session))
                return signOut()
            const createUrl = (ENABLE_FLEXIBLE_PROJECT_RELEASE_RELATIONSHIP === 'true') ? `projects/network` : 'projects'
            const response = await ApiUtils.POST(createUrl, projectPayload, session.user.access_token)

            if (response.status == HttpStatus.CREATED) {
                const data = await response.json() as Project
                MessageService.success(t('Your project is created'))
                router.push(`/projects/detail/${data._links.self.href.split('/').at(-1)}`)
            } else {
                MessageService.error(t('There are some errors while creating project'))
            }
        } catch(e) {
            console.error(e)
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
                                                onClick={() => void createProject()}
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
                                        {t('New Project')}
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
                                                setExternalUrlsData={setExternalUrlsData}
                                                externalIds={externalIds}
                                                setExternalIds={setExternalIds}
                                                setExternalIdsData={setExternalIdsData}
                                                additionalData={additionalData}
                                                setAdditionalData={setAdditionalData}
                                                setAdditionalDataObject={setAdditionalDataObject}
                                                projectPayload={projectPayload}
                                                setProjectPayload={setProjectPayload}
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

export default AddProjects
