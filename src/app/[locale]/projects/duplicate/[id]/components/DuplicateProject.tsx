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
import { HttpStatus, InputKeyValue, Project, ProjectPayload, ToastData, Vendor } from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils'
import { AUTH_TOKEN } from '@/utils/env'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { ToastMessage } from 'next-sw360'
import { notFound, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { Button, Col, ListGroup, Row, Tab, ToastContainer } from 'react-bootstrap'

interface Props{
    projectId: string
}

function DuplicateProject({projectId}:Props) {

    const router = useRouter()
    const t = useTranslations('default')
    const { data: session, status } = useSession()
    const [vendor, setVendor] = useState<Vendor>({
        id: '',
        fullName: '',
    })

    const [externalUrls, setExternalUrls] = useState<InputKeyValue[]>([])

    const [externalIds, setExternalIds] = useState<InputKeyValue[]>([
        {
            key: '',
            value: '',
        },
    ])

    const [additionalData, setAdditionalData] = useState<InputKeyValue[]>([
        {
            key: '',
            value: '',
        },
    ])

    const [additionalRoles, setAdditionalRoles] = useState<InputKeyValue[]>([])

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

    const [toastData, setToastData] = useState<ToastData>({
        show: false,
        type: '',
        message: '',
        contextual: '',
    })

    const alert = (show_data: boolean, status_type: string, message: string, contextual: string) => {
        setToastData({
            show: show_data,
            type: status_type,
            message: message,
            contextual: contextual,
        })
    }

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
            const response = await ApiUtils.GET(url, AUTH_TOKEN)
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
        const response = await ApiUtils.POST(`projects/duplicate/${projectId}`, projectPayload, session.user.access_token)

        if (response.status == HttpStatus.CREATED) {
            await response.json()
            alert(true, 'success', t('Your project is created'), 'success')
            // router.push('/projects')
        } else {
            alert(true, 'error', t('There are some errors while creating project'), 'danger')
            // router.push('/projects')
        }
    }

    const handleCancelClick = () => {
        router.push('/projects')
    }

    if (status === 'unauthenticated') {
        signOut()
    } else {
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
                    <ToastContainer position='top-start'>
                        <ToastMessage
                            show={toastData.show}
                            type={toastData.type}
                            message={toastData.message}
                            contextual={toastData.contextual}
                            onClose={() => setToastData({ ...toastData, show: false })}
                            setShowToast={setToastData}
                        />
                    </ToastContainer>
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
}

export default DuplicateProject
