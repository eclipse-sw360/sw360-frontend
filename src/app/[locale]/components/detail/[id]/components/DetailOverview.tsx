// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'

import Attachments from '@/components/Attachments/Attachments'
import ChangeLogDetail from '@/components/ChangeLog/ChangeLogDetail/ChangeLogDetail'
import ChangeLogList from '@/components/ChangeLog/ChangeLogList/ChangeLogList'
import ComponentVulnerabilities from '@/components/ComponentVulnerabilities/ComponentVulnerabilities'
import { PageButtonHeader, SideBar } from '@/components/sw360'
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
    User,
    UserGroupType,
} from '@/object-types'
import DownloadService from '@/services/download.service'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'
import ReleaseOverview from './ReleaseOverview'
import Summary from './Summary'

type EmbeddedChangelogs = Embedded<Changelogs, 'sw360:changeLogs'>
type EmbeddedVulnerabilities = Embedded<LinkedVulnerability, 'sw360:vulnerabilityDTOes'>

interface Props {
    componentId: string
}

const DetailOverview = ({ componentId }: Props): ReactNode => {
    const t = useTranslations('default')
    const [selectedTab, setSelectedTab] = useState<string>(CommonTabIds.SUMMARY)
    const [component, setComponent] = useState<Component | undefined>(undefined)
    const [vulnerData, setVulnerData] = useState<Array<LinkedVulnerability>>([])
    const [attachmentNumber, setAttachmentNumber] = useState<number>(0)
    const [subscribers, setSubscribers] = useState<Array<string>>([])
    const [userEmail, setUserEmail] = useState<string | undefined>(undefined)
    const [changeLogId, setChangeLogId] = useState('')
    const [changelogTab, setChangelogTab] = useState('list-change')
    const session = useSession()

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            void signOut()
        }
    }, [session])

    const fetchData = useCallback(
        async (url: string) => {
            if (CommonUtils.isNullOrUndefined(session.data)) return
            const response = await ApiUtils.GET(url, session.data.user.access_token)
            if (response.status === HttpStatus.OK) {
                const data = (await response.json()) as Component & EmbeddedVulnerabilities & EmbeddedChangelogs
                return data
            } else if (response.status === HttpStatus.UNAUTHORIZED) {
                return signOut()
            } else {
                return undefined
            }
        },
        [session],
    )

    const downloadBundle = async () => {
        if (CommonUtils.isNullOrUndefined(session)) return signOut()
        await DownloadService.download(
            `${DocumentTypes.COMPONENT}/${componentId}/attachments/download`,
            session.data,
            'AttachmentBundle.zip',
        )
    }

    const extractUserEmailFromSession = () => {
        if (CommonUtils.isNullOrUndefined(session.data)) return signOut()
        setUserEmail(session.data.user.email)
    }

    useEffect(() => {
        void extractUserEmailFromSession()
        fetchData(`components/${componentId}`)
            .then((component: Component | undefined) => {
                if (component === undefined) return
                setComponent(component)
                setSubscribers(getSubcribersEmail(component))
                if (
                    !CommonUtils.isNullOrUndefined(component['_embedded']) &&
                    !CommonUtils.isNullOrUndefined(component['_embedded']['sw360:attachments'])
                ) {
                    setAttachmentNumber(component['_embedded']['sw360:attachments'].length)
                }
            })
            .catch((err) => console.error(err))

        fetchData(`components/${componentId}/vulnerabilities`)
            .then((data: EmbeddedVulnerabilities | undefined) => {
                if (data === undefined) return

                if (!CommonUtils.isNullOrUndefined(data)) {
                    setVulnerData(data['_embedded']['sw360:vulnerabilityDTOes'])
                }
            })
            .catch((err) => console.error(err))
    }, [componentId, fetchData])

    const getSubcribersEmail = (component: Component) => {
        return component._embedded !== undefined && component._embedded['sw360:subscribers'] !== undefined
            ? Object.values(component._embedded['sw360:subscribers'].map((user: User) => user.email))
            : []
    }

    const isUserSubscribed = () => {
        if (userEmail === undefined) return false
        return subscribers.includes(userEmail)
    }

    const handleSubcriptions = async () => {
        if (CommonUtils.isNullOrUndefined(session.data)) return

        await ApiUtils.POST(`components/${componentId}/subscriptions`, {}, session.data.user.access_token)
        fetchData(`components/${componentId}`)
            .then((component: Component | undefined) => {
                if (component === undefined) return
                setComponent(component)
                setSubscribers(getSubcribersEmail(component))
            })
            .catch((e) => console.error(e))
    }

    const tabList = [
        {
            id: CommonTabIds.SUMMARY,
            name: 'Summary',
        },
        {
            id: ComponentTabIds.RELEASE_OVERVIEW,
            name: 'Release Overview',
        },
        {
            id: CommonTabIds.ATTACHMENTS,
            name: 'Attachments',
            hidden: session?.data?.user?.userGroup === UserGroupType.SECURITY_USER,
        },
        {
            id: CommonTabIds.VULNERABILITIES,
            name: 'Vulnerabilities',
        },
        {
            id: CommonTabIds.CHANGE_LOG,
            name: 'Change Log',
            hidden: session?.data?.user?.userGroup === UserGroupType.SECURITY_USER,
        },
    ]

    const headerButtons = {
        Edit: {
            link: `/components/edit/${componentId}`,
            type: 'primary',
            name: t('Edit component'),
            disable: session?.data?.user?.userGroup === UserGroupType.SECURITY_USER,
        },
        Merge: {
            link: `/components/detail/${componentId}/merge`,
            type: 'secondary',
            name: t('Merge'),
            hidden: session?.data?.user?.userGroup === UserGroupType.SECURITY_USER,
        },
        Split: {
            link: `/components/detail/${componentId}/split`,
            type: 'secondary',
            name: t('Split'),
            hidden: session?.data?.user?.userGroup === UserGroupType.SECURITY_USER,
        },
        Subscribe: {
            link: '',
            type: isUserSubscribed() ? 'outline-danger' : 'outline-success',
            name: isUserSubscribed() ? t('Unsubscribe') : t('Subscribe'),
            onClick: handleSubcriptions,
        },
    }

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

    return (
        component && (
            <div className='container page-content'>
                <div className='row'>
                    <div className='col-2 sidebar'>
                        <SideBar
                            selectedTab={selectedTab}
                            setSelectedTab={setSelectedTab}
                            tabList={tabList}
                            vulnerabilities={vulnerData}
                        />
                    </div>
                    <div className='col'>
                        <div
                            className='row'
                            style={{ marginBottom: '20px' }}
                        >
                            <PageButtonHeader
                                title={component.name}
                                buttons={headerButtons}
                            >
                                {selectedTab === CommonTabIds.ATTACHMENTS && attachmentNumber > 0 && (
                                    <div
                                        className='list-group-companion'
                                        data-belong-to='tab-Attachments'
                                    >
                                        <div
                                            className='btn-group'
                                            role='group'
                                        >
                                            <button
                                                id='downloadAttachmentBundle'
                                                type='button'
                                                className='btn btn-secondary'
                                                onClick={() => void downloadBundle()}
                                            >
                                                {t('Download Attachment Bundle')}
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {selectedTab === CommonTabIds.CHANGE_LOG && (
                                    <div
                                        className='nav nav-pills justify-content-center bg-light font-weight-bold'
                                        id='pills-tab'
                                        role='tablist'
                                    >
                                        <a
                                            className={`nav-item nav-link ${changelogTab === 'list-change' ? 'active' : ''}`}
                                            onClick={() => setChangelogTab('list-change')}
                                            style={{ color: '#F7941E', fontWeight: 'bold' }}
                                        >
                                            {t('Change Log')}
                                        </a>
                                        <a
                                            className={`nav-item nav-link ${changelogTab == 'view-log' ? 'active' : ''}`}
                                            onClick={() => {
                                                if (changeLogId !== '') {
                                                    setChangelogTab('view-log')
                                                }
                                            }}
                                            style={{ color: '#F7941E', fontWeight: 'bold' }}
                                        >
                                            {t('Changes')}
                                        </a>
                                    </div>
                                )}
                            </PageButtonHeader>
                        </div>
                        <div
                            className='row'
                            hidden={selectedTab !== CommonTabIds.SUMMARY ? true : false}
                        >
                            <Summary
                                component={component}
                                componentId={componentId}
                            />
                        </div>
                        <div
                            className='row'
                            hidden={selectedTab !== ComponentTabIds.RELEASE_OVERVIEW ? true : false}
                        >
                            <ReleaseOverview componentId={componentId} />
                        </div>
                        <div
                            className='row'
                            hidden={selectedTab !== CommonTabIds.ATTACHMENTS ? true : false}
                        >
                            <Attachments
                                documentId={componentId}
                                documentType={DocumentTypes.COMPONENT}
                            />
                        </div>
                        <div
                            className='containers'
                            hidden={selectedTab !== CommonTabIds.VULNERABILITIES ? true : false}
                        >
                            <ComponentVulnerabilities vulnerData={vulnerData} />
                        </div>
                        <div
                            className='row'
                            hidden={selectedTab !== CommonTabIds.CHANGE_LOG ? true : false}
                        >
                            <div className='col'>
                                <div
                                    className='row'
                                    hidden={changelogTab !== 'list-change' ? true : false}
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
                                    hidden={changelogTab !== 'view-log' ? true : false}
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
        )
    )
}

export default DetailOverview
