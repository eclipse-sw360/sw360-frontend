// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useState, type JSX  } from 'react'
import { Button, Dropdown, Nav, Tab } from 'react-bootstrap'
import ListView from './ListView'
import TreeView from './TreeView'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import CreateClearingRequestModal from './CreateClearingRequestModal'
import { ApiUtils, CommonUtils } from '@/utils/index'
import MessageService from '@/services/message.service'
import { ClearingRequestStates, ConfigKeys, HttpStatus } from '@/object-types'
import ViewClearingRequestModal from './ViewClearingRequestModal'
import { getSession, signOut } from 'next-auth/react'

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
    const [isDependencyNetworkFeatureEnabled, setDependencyNetworkFeatureEnabled] = useState(false)

    useEffect(() => {
        ;(async () => {
            try {
                const session = await getSession()
                if (CommonUtils.isNullOrUndefined(session)) {
                    MessageService.error(t('Session has expired'))
                    return signOut()
                }
                const response = await ApiUtils.GET('configurations', session.user.access_token)
                if (response.status === HttpStatus.UNAUTHORIZED) {
                    signOut()
                } else if (response.status !== HttpStatus.OK) {
                    setDependencyNetworkFeatureEnabled(false)
                    return
                }
                const config = await response.json()
                setDependencyNetworkFeatureEnabled(config[ConfigKeys.ENABLE_FLEXIBLE_PROJECT_RELEASE_RELATIONSHIP] == 'true')
            } catch {
                setDependencyNetworkFeatureEnabled(false)
            }
        })()
    }, [])

    const generateSourceCodeBundle = (withSubProjects: boolean) => {
        router.push(`/projects/generateSourceCode/${projectId}?withSubProjects=${withSubProjects ? "true" : "false"}`)
    }

    const generateLicenseInfo = (withSubProjects: boolean) => {
        const isCalledFromProjectLicenseTab = true
        sessionStorage.setItem("isCalledFromProjectLicenseTab",
                                JSON.stringify(isCalledFromProjectLicenseTab))
        router.push(`/projects/generateLicenseInfo/${projectId}?withSubProjects=${withSubProjects ? "true" : "false"}`)
    }

    const exportProjectSpreadsheet = async (withLinkedRelease: boolean) => {
        try {
            const session = await getSession()
            if (CommonUtils.isNullOrUndefined(session))
                return signOut()
            if (withLinkedRelease === false) {
                const response = await ApiUtils.GET('reports?module=PROJECTS', session.user.access_token)
                if (response.status == HttpStatus.OK) {
                    MessageService.success(t('Excel report generation has started'))
                }
                else if (response.status == HttpStatus.FORBIDDEN) {
                    MessageService.warn(t('Access Denied'))
                }
                else if (response.status == HttpStatus.INTERNAL_SERVER_ERROR) {
                    MessageService.error(t('Internal server error'))
                }
                else if (response.status == HttpStatus.UNAUTHORIZED) {
                    MessageService.error(t('Unauthorized request'))
                }
            }
            else {
                const response = await ApiUtils.GET('reports?module=PROJECTS&withLinkedRelease=true',
                                                     session.user.access_token)
                if (response.status == HttpStatus.OK) {
                    MessageService.success(t('Excel report generation has started'))
                }
                else if (response.status == HttpStatus.FORBIDDEN) {
                    MessageService.warn(t('Access Denied'))
                }
                else if (response.status == HttpStatus.INTERNAL_SERVER_ERROR) {
                    MessageService.error(t('Internal server error'))
                }
                else if (response.status == HttpStatus.UNAUTHORIZED) {
                    MessageService.error(t('Unauthorized request'))
                }
            }
        }
        catch(e) {
            console.error(e)
        }
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
                <div className='row ms-0'
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
                                        <Dropdown.Item
                                                onClick = {() => exportProjectSpreadsheet(false)}>
                                                {t('Projects only')}
                                            </Dropdown.Item>
                                            <Dropdown.Item
                                                onClick = {() => exportProjectSpreadsheet(true)}>
                                                {t('Projects with linked releases')}
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                            </Nav.Item>
                            <Nav.Item>
                                <Dropdown className='col-auto'>
                                    <Dropdown.Toggle variant='secondary'>
                                        {t('Generate License Info')}
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item
                                            onClick = {() => generateLicenseInfo(false)}
                                        >
                                            {t('Projects only')}
                                        </Dropdown.Item>
                                        <Dropdown.Item
                                            onClick = {() => generateLicenseInfo(true)}
                                        >
                                            {t('Projects with sub projects')}
                                        </Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </Nav.Item>
                            <Nav.Item>
                                <Dropdown className='col-auto'>
                                    <Dropdown.Toggle variant='secondary'>{t('Generate Source Code Bundle')}</Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            <Dropdown.Item
                                                onClick = {() => generateSourceCodeBundle(false)}
                                            >
                                                {t('Projects only')}
                                            </Dropdown.Item>
                                            <Dropdown.Item
                                                onClick = {() => generateSourceCodeBundle(true)}
                                            >
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
                                                () => setShowCreateClearingRequestModal(true) :
                                                () => setShowViewClearingRequestModal(true)}
                                >
                                    {
                                        <>
                                            {clearingState === ClearingRequestStates.OPEN
                                            ? t('Create Clearing Request')
                                            : t('View Clearing Request')}
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
                            isDependencyNetworkFeatureEnabled
                            ?
                                <DependencyNetworkTreeView projectId={projectId} />
                            :
                                <TreeView projectId={projectId} />
                        }
                    </Tab.Pane>
                    <Tab.Pane eventKey='list-view'>
                        {
                            isDependencyNetworkFeatureEnabled
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
