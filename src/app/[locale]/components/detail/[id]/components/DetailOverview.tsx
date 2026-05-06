// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { StatusCodes } from 'http-status-codes'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import { Col, ListGroup, Row, Spinner, Tab } from 'react-bootstrap'
import Breadcrumb from 'react-bootstrap/Breadcrumb'

import Attachments from '@/components/Attachments/Attachments'
import ChangeLogDetail from '@/components/ChangeLog/ChangeLogDetail/ChangeLogDetail'
import ChangeLogList from '@/components/ChangeLog/ChangeLogList/ChangeLogList'
import ComponentVulnerabilities from '@/components/ComponentVulnerabilities/ComponentVulnerabilities'
import { PageButtonHeader } from '@/components/sw360'
import {
    Changelogs,
    CommonTabIds,
    Component,
    DocumentTypes,
    Embedded,
    ErrorDetails,
    LinkedVulnerability,
    PageableQueryParam,
    PaginationMeta,
    User,
    UserGroupType,
} from '@/object-types'
import DownloadService from '@/services/download.service'
import { ApiError, ApiUtils, CommonUtils } from '@/utils'
import ReleaseOverview from './ReleaseOverview'
import Summary from './Summary'

type EmbeddedChangelogs = Embedded<Changelogs, 'sw360:changeLogs'>
type EmbeddedVulnerabilities = Embedded<LinkedVulnerability, 'sw360:vulnerabilityDTOes'>

interface Props {
    componentId: string
}

const DetailOverview = ({ componentId }: Props): ReactNode => {
    const t = useTranslations('default')
    const [activeKey, setActiveKey] = useState(CommonTabIds.SUMMARY)
    const searchParams = useSearchParams()
    const router = useRouter()
    const [component, setComponent] = useState<Component | undefined>(undefined)
    const [vulnerData, setVulnerData] = useState<Array<LinkedVulnerability>>([])
    const [attachmentNumber, setAttachmentNumber] = useState<number>(0)
    const [subscribers, setSubscribers] = useState<Array<string>>([])
    const [userEmail, setUserEmail] = useState<string | undefined>(undefined)
    const [changeLogId, setChangeLogId] = useState('')
    const [changelogTab, setChangelogTab] = useState('list-change')
    const [refreshSubscriptions, setRefreshSubscriptions] = useState(false)
    const session = useSession()

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            void signOut()
        }
    }, [
        session,
    ])

    useEffect(() => {
        const fragment = searchParams.get('tab') ?? CommonTabIds.SUMMARY
        setActiveKey(fragment)
    }, [
        searchParams,
    ])

    const handleSelect = (key: string | null) => {
        setActiveKey(key ?? CommonTabIds.SUMMARY)
        router.push(`?tab=${key}`)
    }

    const downloadBundle = async () => {
        if (CommonUtils.isNullOrUndefined(session)) return signOut()
        await DownloadService.download(
            `${DocumentTypes.COMPONENT}/${componentId}/attachments/download`,
            session.data,
            'AttachmentBundle.zip',
        )
    }

    const extractUserEmailFromSession = () => {
        if (CommonUtils.isNullOrUndefined(session.data)) return
        setUserEmail(session.data.user.email)
    }

    useEffect(() => {
        if (session.status === 'loading') return
        const controller = new AbortController()
        const signal = controller.signal

        void extractUserEmailFromSession()

        void (async () => {
            try {
                if (CommonUtils.isNullOrUndefined(session.data)) return signOut()
                const response = await ApiUtils.GET(`components/${componentId}`, session.data.user.access_token, signal)
                if (response.status !== StatusCodes.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new ApiError(err.message, {
                        status: response.status,
                    })
                }

                const component = (await response.json()) as Component
                setComponent(component)
                setSubscribers(getSubcribersEmail(component))
                setAttachmentNumber(component['_embedded']?.['sw360:attachments']?.length ?? 0)
            } catch (error) {
                ApiUtils.reportError(error)
            }
        })()

        return () => controller.abort()
    }, [
        componentId,
        session,
    ])

    useEffect(() => {
        if (session.status === 'loading') return
        const controller = new AbortController()
        const signal = controller.signal

        void (async () => {
            try {
                if (CommonUtils.isNullOrUndefined(session.data)) return signOut()
                const response = await ApiUtils.GET(
                    `components/${componentId}/vulnerabilities`,
                    session.data.user.access_token,
                    signal,
                )
                if (response.status !== StatusCodes.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new ApiError(err.message, {
                        status: response.status,
                    })
                }

                const data = (await response.json()) as EmbeddedVulnerabilities
                setVulnerData(data['_embedded']?.['sw360:vulnerabilityDTOes'] ?? [])
            } catch (error) {
                ApiUtils.reportError(error)
            }
        })()

        return () => controller.abort()
    }, [
        componentId,
        session,
    ])

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
        try {
            await ApiUtils.POST(`components/${componentId}/subscriptions`, {}, session.data.user.access_token)
            setRefreshSubscriptions(!refreshSubscriptions)
        } catch (error) {
            ApiUtils.reportError(error)
        }
    }

    const headerButtons = {
        Edit: {
            link: `/components/edit/${componentId}`,
            type: 'primary',
            name: t('Edit component'),
            disable:
                session?.data?.user?.userGroup === UserGroupType.SECURITY_USER ||
                session?.data?.user?.userGroup === UserGroupType.VIEWER,
        },
        Merge: {
            link: `/components/detail/${componentId}/merge`,
            type: 'secondary',
            name: t('Merge'),
            hidden:
                session?.data?.user?.userGroup === UserGroupType.SECURITY_USER ||
                session?.data?.user?.userGroup === UserGroupType.VIEWER,
        },
        Split: {
            link: `/components/detail/${componentId}/split`,
            type: 'secondary',
            name: t('Split'),
            hidden:
                session?.data?.user?.userGroup === UserGroupType.SECURITY_USER ||
                session?.data?.user?.userGroup === UserGroupType.VIEWER,
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
        sort: 'changeTimestamp,desc',
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
                    `changelog/document/${componentId}`,
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
                    const data = JSON.parse(responseText) as EmbeddedChangelogs
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
        componentId,
        session,
    ])

    const param = useParams()
    const locale = (param.locale as string) || 'en'
    const componentsPath = `/${locale}/components`

    // Early return for loading state
    if (!component) {
        return (
            <div className='container page-content'>
                <div className='col-12 mt-5 text-center'>
                    <Spinner className='spinner' />
                </div>
            </div>
        )
    }

    // Normal render when component data is available
    return (
        <>
            <Breadcrumb className='container page-content'>
                <Breadcrumb.Item
                    linkAs={Link}
                    href={componentsPath}
                >
                    {t('Components')}
                </Breadcrumb.Item>
                <Breadcrumb.Item active>{component.name}</Breadcrumb.Item>
            </Breadcrumb>
            <div className='container page-content'>
                <Tab.Container
                    activeKey={activeKey}
                    onSelect={(k) => handleSelect(k)}
                    mountOnEnter={true}
                    unmountOnExit={true}
                >
                    <Row>
                        <Col
                            sm={2}
                            className='me-3'
                        >
                            <ListGroup>
                                <ListGroup.Item
                                    action
                                    eventKey={CommonTabIds.SUMMARY}
                                >
                                    <div className='my-2'>{t('Summary')}</div>
                                </ListGroup.Item>
                                <ListGroup.Item
                                    action
                                    eventKey={CommonTabIds.RELEASES}
                                >
                                    <div className='my-2'>{t('Release Overview')}</div>
                                </ListGroup.Item>
                                <ListGroup.Item
                                    action
                                    eventKey={CommonTabIds.ATTACHMENTS}
                                >
                                    <div className='my-2'>{t('Attachments')}</div>
                                </ListGroup.Item>
                                <ListGroup.Item
                                    action
                                    eventKey={CommonTabIds.VULNERABILITIES}
                                >
                                    <div className='my-2'>{t('Vulnerabilities')}</div>
                                </ListGroup.Item>
                                <ListGroup.Item
                                    action
                                    eventKey={CommonTabIds.CHANGE_LOG}
                                >
                                    <div className='my-2'>{t('Change Log')}</div>
                                </ListGroup.Item>
                            </ListGroup>
                        </Col>
                        <Col className='me-3'>
                            <PageButtonHeader
                                title={component.name}
                                buttons={headerButtons}
                            >
                                {activeKey === CommonTabIds.ATTACHMENTS && attachmentNumber > 0 && (
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
                                {activeKey === CommonTabIds.CHANGE_LOG && (
                                    <div
                                        className='nav nav-pills justify-content-center bg-light font-weight-bold'
                                        id='pills-tab'
                                        role='tablist'
                                    >
                                        <a
                                            className={`nav-item nav-link ${changelogTab === 'list-change' ? 'active' : ''}`}
                                            onClick={() => setChangelogTab('list-change')}
                                            style={{
                                                color: '#F7941E',
                                                fontWeight: 'bold',
                                            }}
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
                                            style={{
                                                color: '#F7941E',
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            {t('Changes')}
                                        </a>
                                    </div>
                                )}
                            </PageButtonHeader>
                            <Row>
                                <Tab.Content>
                                    <Tab.Pane eventKey={CommonTabIds.SUMMARY}>
                                        <Summary
                                            component={component}
                                            componentId={componentId}
                                        />
                                    </Tab.Pane>
                                    <Tab.Pane eventKey={CommonTabIds.RELEASES}>
                                        <ReleaseOverview componentId={componentId} />
                                    </Tab.Pane>
                                    <Tab.Pane eventKey={CommonTabIds.ATTACHMENTS}>
                                        <Attachments
                                            documentId={componentId}
                                            documentType={DocumentTypes.COMPONENT}
                                        />
                                    </Tab.Pane>
                                    <Tab.Pane eventKey={CommonTabIds.VULNERABILITIES}>
                                        <ComponentVulnerabilities vulnerData={vulnerData} />
                                    </Tab.Pane>
                                    <Tab.Pane eventKey={CommonTabIds.CHANGE_LOG}>
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
                                                    changeLogData={
                                                        changeLogList.filter((d: Changelogs) => d.id === changeLogId)[0]
                                                    }
                                                />
                                                <div
                                                    id='cardScreen'
                                                    style={{
                                                        padding: '0px',
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    </Tab.Pane>
                                </Tab.Content>
                            </Row>
                        </Col>
                    </Row>
                </Tab.Container>
            </div>
        </>
    )
}

export default DetailOverview
