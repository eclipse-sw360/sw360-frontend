// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { AccessControl } from '@/components/AccessControl/AccessControl'
import {
    ActionType,
    ComponentObligationData,
    LicenseObligationData,
    OrganizationObligationData,
    ProjectObligationData,
    UserGroupType,
} from '@/object-types'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Dispatch, SetStateAction, useEffect, useState, type JSX } from 'react'
import { Button, Dropdown, Nav, Tab } from 'react-bootstrap'
import CompareObligation from './CompareObligation'
import ObligationView from './ObligationsView/ObligationsView'
import ReleaseView from './ReleaseView'

interface Props {
    projectId: string
    actionType: ActionType
    payload?: LicenseObligationData | ComponentObligationData | ProjectObligationData | OrganizationObligationData
    setPayload?: Dispatch<
        SetStateAction<
            LicenseObligationData | ComponentObligationData | ProjectObligationData | OrganizationObligationData
        >
    >
}

function Obligations({ projectId, actionType, payload, setPayload }: Props): JSX.Element {
    const router = useRouter()
    const t = useTranslations('default')
    const [key, setKey] = useState('obligations-view')
    const [show, setShow] = useState(false)
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
    const { status } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [status])

    const generateLicenseInfo = (withSubProjects: boolean) => {
        const isCalledFromProjectLicenseTab = false
        sessionStorage.setItem('isCalledFromProjectLicenseTab', JSON.stringify(isCalledFromProjectLicenseTab))
        router.push(`/projects/generateLicenseInfo/${projectId}?withSubProjects=${withSubProjects}`)
    }

    return (
        <>
            <CompareObligation
                show={show}
                setShow={setShow}
                setSelectedProjectId={setSelectedProjectId}
            />
            <Tab.Container
                id='views-tab'
                activeKey={key}
                onSelect={(k) => setKey(k as string)}
            >
                <div className='row'>
                    <div className='col ms-0'>
                        <Nav
                            variant='pills'
                            className='d-inline-flex'
                        >
                            <Nav.Item>
                                <Nav.Link eventKey='obligations-view'>
                                    <span className='fw-medium'>{t('Obligations View')}</span>
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey='release-view'>
                                    <span className='fw-medium'>{t('Release View')}</span>
                                </Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </div>
                    {actionType === ActionType.DETAIL && (
                        <Dropdown className='col-auto'>
                            <Dropdown.Toggle variant='primary'>{t('Create Project Clearing Report')}</Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item onClick={() => generateLicenseInfo(false)}>
                                    {t('Projects only')}
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => generateLicenseInfo(true)}>
                                    {t('Projects with sub projects')}
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    )}
                    {actionType === ActionType.EDIT && (
                        <Button
                            variant='secondary'
                            className='col-auto'
                            onClick={() => setShow(true)}
                        >
                            {t('Compare Obligation')}
                        </Button>
                    )}
                </div>
                <Tab.Content className='mt-4'>
                    <Tab.Pane eventKey='obligations-view'>
                        <ObligationView
                            projectId={projectId}
                            actionType={actionType}
                            payload={payload}
                            setPayload={setPayload}
                            selectedProjectId={selectedProjectId}
                        />
                    </Tab.Pane>
                    <Tab.Pane eventKey='release-view'>
                        <ReleaseView projectId={projectId} />
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>
        </>
    )
}

// Pass notAllowedUserGroups to AccessControl to restrict access
export default AccessControl(Obligations, [UserGroupType.SECURITY_USER])
