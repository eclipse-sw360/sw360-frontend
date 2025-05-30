// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { getSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useEffect, useState, type JSX } from 'react';
import { Nav, Tab } from 'react-bootstrap'
import MessageService from '@/services/message.service'
import { useRouter } from 'next/navigation'

import ChangeLogDetail from '@/components/ChangeLog/ChangeLogDetail/ChangeLogDetail'
import ChangeLogList from '@/components/ChangeLog/ChangeLogList/ChangeLogList'
import { Changelogs, HttpStatus, Embedded, ErrorDetails } from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils'

type EmbeddedChangeLogs = Embedded<Changelogs, 'sw360:changeLogs'>

function ChangeLog({ obligationId }: { obligationId: string }): JSX.Element {
    const t = useTranslations('default')
    const [key, setKey] = useState('list-change')
    const [changeLogList, setChangeLogList] = useState<Changelogs[]>([])
    const [changeLogIndex, setChangeLogIndex] = useState(-1)
    const router = useRouter()

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal

        void (async () => {
            try {
                const session = await getSession()
                if (CommonUtils.isNullOrUndefined(session))
                    return signOut()
                const response = await ApiUtils.GET(
                    `changelog/document/${obligationId}`,
                    session.user.access_token,
                    signal
                )
                if (response.status === HttpStatus.UNAUTHORIZED) {
                    return signOut()
                } else if (response.status !== HttpStatus.OK) {
                    const err = await response.json() as ErrorDetails
                    throw new Error(err.message)
                }

                const data = await response.json() as EmbeddedChangeLogs

                setChangeLogList(
                    CommonUtils.isNullOrUndefined(data['_embedded']['sw360:changeLogs'])
                        ? []
                        : data['_embedded']['sw360:changeLogs']
                )
            } catch (error) {
                if (error instanceof DOMException && error.name === "AbortError") {
                    return
                }
                const message = error instanceof Error ? error.message : String(error)
                MessageService.error(message)
            }
        })()

        return () => controller.abort()
    }, [obligationId])

    return (
        <>
            <Tab.Container activeKey={key} onSelect={(k) => setKey(k as string)}>
                <div className='row mx-5 mt-3'>
                    <div className='col ps-0 me-2'>
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
                        <button className="btn btn-dark ms-3 py-2 px-4 rounded" onClick={() => router.push('/admin/obligations')}>{t("Back")}</button>
                    </div>
                </div>
                <Tab.Content className='mt-3 mx-5'>
                    <Tab.Pane eventKey='list-change'>
                        <ChangeLogList
                            setChangeLogIndex={setChangeLogIndex}
                            documentId={obligationId}
                            setChangesLogTab={setKey}
                            changeLogList={changeLogList}
                        />
                    </Tab.Pane>
                    <Tab.Pane eventKey='view-log'>
                        <ChangeLogDetail changeLogData={changeLogList[changeLogIndex]} />
                        <div id='cardScreen' className='p-0'></div>
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>
        </>
    )
}

export default ChangeLog
