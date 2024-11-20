// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Button, Dropdown, Nav, Tab } from 'react-bootstrap'
import ListView from './ListView'
import TreeView from './TreeView'
import { useRouter } from 'next/navigation'
import { ENABLE_FLEXIBLE_PROJECT_RELEASE_RELATIONSHIP } from '@/utils/env'
import dynamic from 'next/dynamic'
import CreateClearingRequestModal from './CreateClearingRequestModal'
import { ClearingRequestStates } from '@/object-types'
import ViewClearingRequestModal from './ViewClearingRequestModal'

const DependencyNetworkListView = dynamic(() => import('./DependencyNetworkListView'), { ssr: false })
const DependencyNetworkTreeView = dynamic(() => import('./DependencyNetworkTreeView'), { ssr: false })

export default function LicenseClearing({
    projectId,
    projectName,
    projectVersion,
    clearingState,
    clearingRequestId,
    isCalledFromModerationRequestCurrentProject,
}: {
    projectId: string
    projectName: string
    projectVersion: string
    clearingState?: string
    clearingRequestId?: string
    isCalledFromModerationRequestCurrentProject?: boolean
}): JSX.Element {
    const t = useTranslations('default')
    const [key, setKey] = useState('tree-view')
    const router = useRouter()
    const [showCreateClearingRequestModal, setShowCreateClearingRequestModal] = useState(false)
    const [showViewClearingRequestModal, setShowViewClearingRequestModal] = useState(false)

    const generateSourceCodeBundle = () => {
        router.push(`/projects/generateSourceCode/${projectId}`)
    }


    return (
        <>
            <CreateClearingRequestModal show = {showCreateClearingRequestModal}
                                        setShow = {setShowCreateClearingRequestModal}
                                        projectId = {projectId}
                                        projectName = {projectName}/>
            <ViewClearingRequestModal   show = {showViewClearingRequestModal}
                                        setShow = {setShowViewClearingRequestModal}
                                        projectName = {projectName}
                                        clearingRequestId = {clearingRequestId}/>
            <Tab.Container id='views-tab' activeKey={key} onSelect={(k) => setKey(k as string)}>
                <div className='row'
                     hidden={isCalledFromModerationRequestCurrentProject}>
                    <div className='col ps-0'>
                        <Nav variant='pills' className='d-inline-flex'>
                            <Nav.Item>
                                <Nav.Link eventKey='tree-view'>
                                    <span className='fw-medium'>{t('Tree View')}</span>
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey='list-view'>
                                    <span className='fw-medium'>{t('List View')}</span>
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item className='px-2'>
                                <Dropdown className='col-auto'>
                                    <Dropdown.Toggle variant='secondary'>{t('Export Spreadsheet')}</Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            <Dropdown.Item>{t('Projects only')}</Dropdown.Item>
                                            <Dropdown.Item>{t('Projects with sub projects')}</Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                            </Nav.Item>
                            <Nav.Item>
                                <Dropdown className='col-auto'>
                                    <Dropdown.Toggle variant='secondary'>{t('Generate License Info')}</Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            <Dropdown.Item>{t('Projects only')}</Dropdown.Item>
                                            <Dropdown.Item>{t('Projects with sub projects')}</Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                            </Nav.Item>
                            <Nav.Item>
                                <Dropdown className='col-auto'>
                                    <Dropdown.Toggle variant='secondary'>{t('Generate Source Code Bundle')}</Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            <Dropdown.Item
                                                onClick = {() => generateSourceCodeBundle()}
                                            >
                                                {t('Projects only')}
                                            </Dropdown.Item>
                                            <Dropdown.Item>
                                                {t('Projects with sub projects')}
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                            </Nav.Item>
                            <Nav.Item className='px-2'>
                                <Button
                                    variant='secondary'
                                    className='me-2 col-auto'
                                    onClick={ clearingState === ClearingRequestStates.OPEN ?
                                                () => setShowViewClearingRequestModal(true) :
                                                () => setShowCreateClearingRequestModal(true)}
                                    disabled={clearingState === ClearingRequestStates.CLOSED}
                                >
                                    {
                                        <>
                                            {clearingState === ClearingRequestStates.OPEN
                                            ? t('View Clearing Request')
                                            : t('Create Clearing Request')}
                                        </>
                                    }
                                </Button>
                            </Nav.Item>
                        </Nav>
                    </div>
                </div>
                <Tab.Content className='mt-3'>
                    <Tab.Pane eventKey='tree-view'>
                        {
                            ENABLE_FLEXIBLE_PROJECT_RELEASE_RELATIONSHIP === 'true'
                            ?
                                <DependencyNetworkTreeView projectId={projectId} />
                            :
                                <TreeView projectId={projectId} />
                        }
                    </Tab.Pane>
                    <Tab.Pane eventKey='list-view'>
                        {
                            ENABLE_FLEXIBLE_PROJECT_RELEASE_RELATIONSHIP === 'true'
                            ?
                                <DependencyNetworkListView projectId={projectId} />
                            :
                                <ListView projectId={projectId} projectName={projectName} projectVersion={projectVersion} />
                        }
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>
        </>
    )
}
