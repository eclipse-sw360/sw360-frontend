// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Nav, Tab } from 'react-bootstrap'
import ListView from './ListView'
import TreeView from './TreeView'

export default function LicenseClearing({
    projectId,
    projectName,
    projectVersion,
}: {
    projectId: string
    projectName: string
    projectVersion: string
}) {
    const t = useTranslations('default')
    const [key, setKey] = useState('tree-view')

    return (
        <>
            <Tab.Container id='views-tab' activeKey={key} onSelect={(k) => setKey(k)}>
                <div className='row'>
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
                        </Nav>
                    </div>
                </div>
                <Tab.Content className='mt-3'>
                    <Tab.Pane eventKey='tree-view'>
                        <TreeView projectId={projectId} />
                    </Tab.Pane>
                    <Tab.Pane eventKey='list-view'>
                        <ListView projectId={projectId} projectName={projectName} projectVersion={projectVersion} />
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>
        </>
    )
}
