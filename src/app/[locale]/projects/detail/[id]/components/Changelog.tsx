// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useTranslations } from 'next-intl'
import { signOut } from 'next-auth/react'
import { notFound } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Tab, Nav } from 'react-bootstrap'

import { COMMON_NAMESPACE } from '@/object-types/Constants'
import ChangeLogList from '@/components/ChangeLog/ChangeLogList/ChangeLogList'
import ChangeLogDetail from '@/components/ChangeLog/ChangeLogDetail/ChangeLogDetail'
import { ApiUtils, CommonUtils } from '@/utils'
import { HttpStatus, Session } from '@/object-types'

export default function ChangeLog({ projectId, session }: { projectId: string; session: Session }) {
    const t = useTranslations(COMMON_NAMESPACE)
    const [key, setKey] = useState('list-change')
    const [changeLogList, setChangeLogList] = useState<Array<any>>([])
    const [changeLogIndex, setChangeLogIndex] = useState(-1)

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal

        ;(async () => {
            try {
                const response = await ApiUtils.GET(
                    `changelog/document/${projectId}`,
                    session.user.access_token,
                    signal
                )
                if (response.status === HttpStatus.UNAUTHORIZED) {
                    return signOut()
                } else if (response.status !== HttpStatus.OK) {
                    return notFound()
                }

                const data = await response.json()

                setChangeLogList(
                    CommonUtils.isNullOrUndefined(data['_embedded']['sw360:changeLogs'])
                        ? []
                        : data['_embedded']['sw360:changeLogs']
                )
            } catch (e) {
                console.error(e)
            }
        })()

        return () => controller.abort()
    }, [projectId, session])

    return (
        <>
            <Tab.Container id='views-tab' activeKey={key} onSelect={(k) => setKey(k)}>
                <div className='row'>
                    <div className='col ps-0'>
                        <Nav variant='pills' className='d-inline-flex'>
                            <Nav.Item>
                                <Nav.Link eventKey='list-change'>
                                    <span className='fw-medium'>{t('Change Log')}</span>
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey='view-log' disabled={changeLogIndex === -1}>
                                    <span className='fw-medium'>{t('Changes')}</span>
                                </Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </div>
                </div>
                <Tab.Content className='mt-3'>
                    <Tab.Pane eventKey='list-change'>
                        <ChangeLogList
                            setChangeLogIndex={setChangeLogIndex}
                            documentId={projectId}
                            setChangesLogTab={setKey}
                            changeLogList={changeLogList}
                        />
                    </Tab.Pane>
                    <Tab.Pane eventKey='view-log'>
                        <ChangeLogDetail changeLogData={changeLogList[changeLogIndex]} />
                        <div id='cardScreen' style={{ padding: '0px' }}></div>
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>
        </>
    )
}
