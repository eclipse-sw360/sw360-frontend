// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import ReleaseOverview from '@/app/[locale]/components/detail/[id]/components/ReleaseOverview'
import Summary from '@/app/[locale]/components/detail/[id]/components/Summary'
import Attachments from '@/components/Attachments/Attachments'
import ChangeLogDetail from '@/components/ChangeLog/ChangeLogDetail/ChangeLogDetail'
import ChangeLogList from '@/components/ChangeLog/ChangeLogList/ChangeLogList'
import { SideBar } from '@/components/sw360'
import {
    Changelogs,
    CommonTabIds,
    Component,
    ComponentTabIds,
    DocumentTypes,
    Embedded,
    ErrorDetails,
    HttpStatus,
    LinkedVulnerability,
    PageableQueryParam,
    PaginationMeta,
} from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { notFound } from 'next/navigation'
import { ReactNode, useEffect, useMemo, useState } from 'react'

type EmbeddedChangelogs = Embedded<Changelogs, 'sw360:changeLogs'>
type EmbeddedVulnerabilities = Embedded<LinkedVulnerability, 'sw360:vulnerabilityDTOes'>

interface Props {
    componentId: string
}

const CurrentComponentDetail = ({ componentId }: Props): ReactNode => {
    const t = useTranslations('default')
    const [selectedTab, setSelectedTab] = useState<string>(CommonTabIds.SUMMARY)
    const [component, setComponent] = useState<Component>()
    const [changelogTab, setChangelogTab] = useState('list-change')
    const [changeLogId, setChangeLogId] = useState('')
    const session = useSession()

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            void signOut()
        }
    }, [session])

    const tabList = [
        {
            id: CommonTabIds.SUMMARY,
            name: t('Summary'),
        },
        {
            id: ComponentTabIds.RELEASE_OVERVIEW,
            name: t('Release Overview'),
        },
        {
            id: CommonTabIds.ATTACHMENTS,
            name: t('Attachments'),
        },
        {
            id: CommonTabIds.CHANGE_LOG,
            name: t('Change Log'),
        },
    ]

    const fetchData = async (url: string) => {
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) return
        const response = await ApiUtils.GET(url, session.user.access_token)
        if (response.status == HttpStatus.OK) {
            const data = (await response.json()) as Component & EmbeddedVulnerabilities & EmbeddedChangelogs
            return data
        } else if (response.status == HttpStatus.UNAUTHORIZED) {
            await signOut()
        } else {
            notFound()
        }
    }

    useEffect(() => {
        fetchData(`components/${componentId}`)
            .then((component: Component | undefined) => {
                setComponent(component)
            })
            .catch((err) => console.error(err))
    }, [componentId, fetchData])

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
    const memoizedData = useMemo(() => changeLogList, [changeLogList])
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
                    `changelog/document/${componentId}`,
                    Object.fromEntries(Object.entries(pageableQueryParam).map(([key, value]) => [key, String(value)])),
                )

                const response = await ApiUtils.GET(queryUrl, session.data.user.access_token, signal)
                if (response.status !== HttpStatus.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new Error(err.message)
                }
                const responseText = await response.text()
                if (CommonUtils.isNullEmptyOrUndefinedString(responseText)) {
                    setChangeLogList([])
                    return
                } else {
                    const data = JSON.parse(responseText) as EmbeddedChangelogs
                    setPaginationMeta(data.page)
                    setChangeLogList(
                        CommonUtils.isNullOrUndefined(data['_embedded']['sw360:changeLogs'])
                            ? []
                            : data['_embedded']['sw360:changeLogs'],
                    )
                }
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return
                }
                const message = error instanceof Error ? error.message : String(error)
                MessageService.error(message)
            } finally {
                clearTimeout(timeout)
                setShowProcessing(false)
            }
        })()

        return () => controller.abort()
    }, [pageableQueryParam, componentId, session])

    return component ? (
        <div className='container page-content'>
            <div className='row'>
                <div className='col-2 sidebar'>
                    <SideBar
                        selectedTab={selectedTab}
                        setSelectedTab={setSelectedTab}
                        tabList={tabList}
                    />
                </div>
                <div className='col'>
                    <div
                        className='row'
                        hidden={selectedTab !== CommonTabIds.SUMMARY}
                    >
                        <Summary
                            component={component}
                            componentId={componentId}
                        />
                    </div>
                    <div
                        className='row'
                        hidden={selectedTab !== ComponentTabIds.RELEASE_OVERVIEW}
                    >
                        <ReleaseOverview
                            componentId={componentId}
                            calledFromModerationRequestDetail={true}
                        />
                    </div>
                    <div
                        className='row'
                        hidden={selectedTab != CommonTabIds.ATTACHMENTS}
                    >
                        <Attachments
                            documentId={componentId}
                            documentType={DocumentTypes.COMPONENT}
                        />
                    </div>
                    <div
                        className='row'
                        hidden={selectedTab != CommonTabIds.CHANGE_LOG}
                    >
                        <div className='col'>
                            <div
                                className='row'
                                hidden={changelogTab !== 'list-change'}
                            >
                                <ChangeLogList
                                    setChangeLogId={setChangeLogId}
                                    documentId={componentId}
                                    setChangesLogTab={setChangelogTab}
                                    changeLogList={memoizedData}
                                    pageableQueryParam={pageableQueryParam}
                                    setPageableQueryParam={setPageableQueryParam}
                                    showProcessing={showProcessing}
                                    paginationMeta={paginationMeta}
                                />
                            </div>
                            <div
                                className='row'
                                hidden={changelogTab != 'view-log'}
                            >
                                <ChangeLogDetail
                                    changeLogData={changeLogList.filter((d: Changelogs) => d.id === changeLogId)[0]}
                                />
                                <div
                                    id='cardScreen'
                                    style={{ padding: '0px' }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    ) : (
        <></>
    )
}

export default CurrentComponentDetail
