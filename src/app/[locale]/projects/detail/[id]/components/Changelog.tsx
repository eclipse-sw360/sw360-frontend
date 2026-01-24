// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { StatusCodes } from 'http-status-codes'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { type JSX, useEffect, useMemo, useState } from 'react'
import { Nav, Tab } from 'react-bootstrap'

import { AccessControl } from '@/components/AccessControl/AccessControl'
import ChangeLogDetail from '@/components/ChangeLog/ChangeLogDetail/ChangeLogDetail'
import ChangeLogList from '@/components/ChangeLog/ChangeLogList/ChangeLogList'
import { Changelogs, Embedded, ErrorDetails, PageableQueryParam, PaginationMeta, UserGroupType } from '@/object-types'
import { ApiError, ApiUtils, CommonUtils } from '@/utils'

type EmbeddedChangeLogs = Embedded<Changelogs, 'sw360:changeLogs'>

function ChangeLog({
    projectId,
    isCalledFromModerationRequestCurrentProject,
}: {
    projectId: string
    isCalledFromModerationRequestCurrentProject?: boolean
}): JSX.Element {
    const t = useTranslations('default')
    const [changelogTab, setChangelogTab] = useState('list-change')
    const [changeLogId, setChangeLogId] = useState('')
    const session = useSession()

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            void signOut()
        }
    }, [
        session,
    ])

    const [pageableQueryParam, setPageableQueryParam] = useState<PageableQueryParam>({
        page: 0,
        page_entries: 10,
        sort: '',
    })
    const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | undefined>({
        size: 0,
        totalElements: 0,
        totalPages: 0,
        number: 0,
    })
    const [changeLogList, setChangeLogList] = useState<Changelogs[]>(() => [])
    const memoizedData = useMemo(
        () => changeLogList,
        [
            changeLogList,
        ],
    )
    const [showProcessing, setShowProcessing] = useState(false)

    useEffect(() => {
        if (session.status === 'loading') return
        const controller = new AbortController()
        const signal = controller.signal

        const timeLimit = changeLogList.length !== 0 ? 700 : 0
        const timeout = setTimeout(() => {
            setShowProcessing(true)
        }, timeLimit)

        void (async () => {
            try {
                if (CommonUtils.isNullOrUndefined(session.data)) return signOut()
                const queryUrl = CommonUtils.createUrlWithParams(
                    `changelog/document/${projectId}`,
                    Object.fromEntries(
                        Object.entries(pageableQueryParam).map(([key, value]) => [
                            key,
                            String(value),
                        ]),
                    ),
                )

                const response = await ApiUtils.GET(queryUrl, session.data.user.access_token, signal)
                if (response.status !== StatusCodes.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new ApiError(err.message, {
                        status: response.status,
                    })
                }
                const responseText = await response.text()
                if (CommonUtils.isNullEmptyOrUndefinedString(responseText)) {
                    setChangeLogList([])
                    return
                } else {
                    const data = JSON.parse(responseText) as EmbeddedChangeLogs
                    setPaginationMeta(data.page)
                    setChangeLogList(
                        CommonUtils.isNullOrUndefined(data['_embedded']['sw360:changeLogs'])
                            ? []
                            : data['_embedded']['sw360:changeLogs'],
                    )
                }
            } catch (error) {
                ApiUtils.reportError(error)
            } finally {
                clearTimeout(timeout)
                setShowProcessing(false)
            }
        })()

        return () => controller.abort()
    }, [
        pageableQueryParam,
        projectId,
        session,
    ])

    return (
        <>
            <Tab.Container
                id='views-tab'
                activeKey={changelogTab}
                onSelect={(k) => setChangelogTab(k as string)}
            >
                <div
                    className='row'
                    hidden={isCalledFromModerationRequestCurrentProject}
                >
                    <div className='col ps-0'>
                        <Nav
                            variant='pills'
                            className='d-inline-flex'
                        >
                            <Nav.Item>
                                <Nav.Link eventKey='list-change'>
                                    <span className='fw-medium'>{t('Change Log')}</span>
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link
                                    eventKey='view-log'
                                    disabled={changeLogId === ''}
                                >
                                    <span className='fw-medium'>{t('Changes')}</span>
                                </Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </div>
                </div>
                <Tab.Content className='mt-3'>
                    <Tab.Pane eventKey='list-change'>
                        <ChangeLogList
                            setChangeLogId={setChangeLogId}
                            documentId={projectId}
                            setChangesLogTab={setChangelogTab}
                            changeLogList={memoizedData}
                            pageableQueryParam={pageableQueryParam}
                            setPageableQueryParam={setPageableQueryParam}
                            showProcessing={showProcessing}
                            paginationMeta={paginationMeta}
                        />
                    </Tab.Pane>
                    <Tab.Pane eventKey='view-log'>
                        <ChangeLogDetail
                            changeLogData={changeLogList.filter((d: Changelogs) => d.id === changeLogId)[0]}
                        />
                        <div
                            id='cardScreen'
                            style={{
                                padding: '0px',
                            }}
                        ></div>
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>
        </>
    )
}

// Pass notAllowedUserGroups to AccessControl to restrict access
export default AccessControl(ChangeLog, [
    UserGroupType.SECURITY_USER,
])
