// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Dispatch, type JSX, SetStateAction, useState } from 'react'
import { Button, Dropdown, Nav, Spinner, Tab } from 'react-bootstrap'
import { AccessControl } from '@/components/AccessControl/AccessControl'
import { ActionType, ObligationEntry, UserGroupType } from '@/object-types'
import DownloadService from '@/services/download.service'
import ObligationView from './ObligationsView/ObligationsView'
import ReleaseView from './ReleaseView'

interface Props {
    projectId: string
    actionType: ActionType
    payload?: ObligationEntry
    setPayload?: Dispatch<SetStateAction<ObligationEntry>>
}

function Obligations({ projectId, actionType, payload, setPayload }: Props): JSX.Element {
    const router = useRouter()
    const t = useTranslations('default')
    const [key, setKey] = useState('obligations-view')
    const [exportingObligations, setExportingObligations] = useState<boolean>(false)

    const generateLicenseInfo = (withSubProjects: boolean) => {
        const isCalledFromProjectLicenseTab = false
        sessionStorage.setItem('isCalledFromProjectLicenseTab', JSON.stringify(isCalledFromProjectLicenseTab))
        router.push(`/projects/generateLicenseInfo/${projectId}?withSubProjects=${withSubProjects}&variant=REPORT`)
    }

    // Download the current project's obligations as an XLSX report.
    const handleExportObligations = async () => {
        if (!projectId) return
        setExportingObligations(true)
        try {
            const currentDate = new Date().toISOString().split('T')[0]
            await DownloadService.download(
                `reports?module=Obligations&projectId=${projectId}&format=xlsx`,
                `obligations-${currentDate}.xlsx`,
            )
        } finally {
            setExportingObligations(false)
        }
    }

    return (
        <>
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
                        <div className='col-auto d-flex gap-2'>
                            <Button
                                variant='secondary'
                                aria-label={t('Export Obligations Report')}
                                disabled={!projectId || exportingObligations}
                                onClick={() => void handleExportObligations()}
                            >
                                {t('Export Obligations Report')}
                                {exportingObligations && (
                                    <Spinner
                                        size='sm'
                                        className='ms-1 spinner'
                                    />
                                )}
                            </Button>
                            <Dropdown>
                                <Dropdown.Toggle variant='primary'>
                                    {t('Create Project Clearing Report')}
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item onClick={() => generateLicenseInfo(false)}>
                                        {t('Projects only')}
                                    </Dropdown.Item>
                                    <Dropdown.Item onClick={() => generateLicenseInfo(true)}>
                                        {t('Projects with sub projects')}
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                    )}
                </div>
                <Tab.Content className='mt-4'>
                    <Tab.Pane eventKey='obligations-view'>
                        <ObligationView
                            projectId={projectId}
                            actionType={actionType}
                            payload={payload}
                            setPayload={setPayload}
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
export default AccessControl(Obligations, [
    UserGroupType.SECURITY_USER,
])
