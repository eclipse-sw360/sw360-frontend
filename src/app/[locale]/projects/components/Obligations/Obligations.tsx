// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { Dispatch, SetStateAction } from 'react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Button, Nav, Tab, Dropdown } from 'react-bootstrap'
import ObligationView from './ObligationsView/ObligationsView'
import ReleaseView from './ReleaseView'
import { ActionType, ProjectObligation } from '@/object-types'
import CompareObligation from './CompareObligation'

export default function Obligations({ projectId, actionType, payload, setPayload }: 
    { projectId: string, actionType: ActionType, payload?: ProjectObligation, setPayload?: Dispatch<SetStateAction<ProjectObligation>> }): JSX.Element {
    const t = useTranslations('default')
    const [key, setKey] = useState('obligations-view')
    const [show, setShow] = useState(false)
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)

    return (
        <>
        <CompareObligation show={show} setShow={setShow} setSelectedProjectId={setSelectedProjectId} />
            <Tab.Container id='views-tab' activeKey={key} onSelect={(k) => setKey(k as string)}>
                <div className='row'>
                    <div className='col ps-0'>
                        <Nav variant='pills' className='d-inline-flex'>
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
                    {
                        (actionType === ActionType.DETAIL) &&
                        <Dropdown className='col-auto'>
                            <Dropdown.Toggle variant='primary'>{t('Create Project Clearing Report')}</Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item eventKey={key}>{t('Project only')}</Dropdown.Item>
                                <Dropdown.Item eventKey={key}>{t('Project with sub project')}</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    }
                    {
                        (actionType === ActionType.EDIT) &&
                        <Button variant='secondary' className='col-auto' onClick={() => setShow(true)}>
                            {t('Compare Obligation')}
                        </Button>
                    }
                </div>
                <Tab.Content className='mt-4'>
                    <Tab.Pane eventKey='obligations-view'>
                        <ObligationView projectId={projectId} actionType={actionType} payload={payload} setPayload={setPayload} selectedProjectId={selectedProjectId} />
                    </Tab.Pane>
                    <Tab.Pane eventKey='release-view'>
                        <ReleaseView projectId={projectId} />
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>
        </>
    )
}
