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
import { notFound, useParams, useRouter, useSearchParams } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { Col, Dropdown, ListGroup, Row, Tab } from 'react-bootstrap'
import Breadcrumb from 'react-bootstrap/Breadcrumb'

import LinkedPackagesTab from '@/app/[locale]/components/releases/detail/[id]/components/LinkedPackagesTab'
import Attachments from '@/components/Attachments/Attachments'
import ChangeLogDetail from '@/components/ChangeLog/ChangeLogDetail/ChangeLogDetail'
import ChangeLogList from '@/components/ChangeLog/ChangeLogList/ChangeLogList'
import ComponentVulnerabilities from '@/components/ComponentVulnerabilities/ComponentVulnerabilities'
import LinkReleaseToProjectModal from '@/components/LinkReleaseToProjectModal/LinkReleaseToProjectModal'
import { PageButtonHeader } from '@/components/sw360'
import {
    Attachment,
    Changelogs,
    CommonTabIds,
    DocumentTypes,
    Embedded,
    ErrorDetails,
    LinkedVulnerability,
    PageableQueryParam,
    PaginationMeta,
    ReleaseDetail,
    ReleaseLink,
    ReleaseTabIds,
    User,
    UserGroupType,
    VulnerabilitiesVerificationState,
} from '@/object-types'
import DownloadService from '@/services/download.service'
import { ApiError, ApiUtils, CommonUtils } from '@/utils'
import ClearingDetails from './ClearingDetails'
import CommercialDetails from './CommercialDetails'
import ECCDetails from './ECCDetails'
import LinkedReleases from './LinkedReleases'
import Summary from './Summary'
import SPDXDocumentTab from './spdx/SPDXDocumentTab'

type EmbeddedChangelogs = Embedded<Changelogs, 'sw360:changeLogs'>
type EmbeddedVulnerabilities = Embedded<LinkedVulnerability, 'sw360:vulnerabilityDTOes'>
type EmbeddedReleaseLinks = Embedded<ReleaseLink, 'sw360:releaseLinks'>

interface Props {
    releaseId: string
    isSPDXFeatureEnabled: boolean
}

const DetailOverview = ({ releaseId, isSPDXFeatureEnabled }: Props): ReactNode => {
    const t = useTranslations('default')
    const [activeKey, setActiveKey] = useState(CommonTabIds.SUMMARY)
    const searchParams = useSearchParams()
    const router = useRouter()
    const [release, setRelease] = useState<ReleaseDetail>()
    const [releasesSameComponent, setReleasesSameComponent] = useState<Array<ReleaseLink>>([])
    const [embeddedAttachments, setEmbeddedAttachments] = useState<Array<Attachment>>([])
    const [vulnerData, setVulnerData] = useState<Array<LinkedVulnerability>>([])
    const [linkProjectModalShow, setLinkProjectModalShow] = useState<boolean>(false)
    const [subscribers, setSubscribers] = useState<Array<string>>([])
    const [userEmail, setUserEmail] = useState<string | undefined>(undefined)
    const [changeLogId, setChangeLogId] = useState('')
    const [changelogTab, setChangelogTab] = useState('list-change')
    const session = useSession()
    const [vulInfo, setVulInfo] = useState([
        0,
        0,
    ])

    useEffect(() => {
        if (!CommonUtils.isNullEmptyOrUndefinedArray(vulnerData)) {
            let numberOfCheckOrUnchecked = 0
            let numberOfIncorrect = 0
            vulnerData.forEach((vulnerability: LinkedVulnerability) => {
                const verificationState =
                    vulnerability.releaseVulnerabilityRelation.verificationStateInfo?.at(-1)?.verificationState
                if (
                    verificationState == VulnerabilitiesVerificationState.CHECKED ||
                    verificationState == VulnerabilitiesVerificationState.NOT_CHECKED
                ) {
                    numberOfCheckOrUnchecked++
                } else {
                    numberOfIncorrect++
                }
            })
            setVulInfo([
                numberOfCheckOrUnchecked,
                numberOfIncorrect,
            ])
        }
    }, [
        vulnerData,
    ])

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

    const fetchData = useCallback(
        async (url: string) => {
            if (CommonUtils.isNullOrUndefined(session.data)) return
            const response = await ApiUtils.GET(url, session.data.user.access_token)
            if (response.status === StatusCodes.OK) {
                const data = (await response.json()) as ReleaseDetail &
                    EmbeddedReleaseLinks &
                    EmbeddedVulnerabilities &
                    EmbeddedChangelogs
                return data
            } else if (response.status === StatusCodes.UNAUTHORIZED) {
                return signOut()
            } else {
                return undefined
            }
        },
        [
            session,
        ],
    )

    const getSubcribersEmail = (release: ReleaseDetail) => {
        return release._embedded['sw360:subscribers']
            ? Object.values(release._embedded['sw360:subscribers'].map((user: User) => user.email))
            : []
    }

    const extractUserEmail = () => {
        if (CommonUtils.isNullOrUndefined(session.data)) return signOut()
        setUserEmail(session.data.user.email)
    }

    useEffect(() => {
        if (session.status === 'loading') return

        void extractUserEmail()

        fetchData(`releases/${releaseId}`)
            .then((release: ReleaseDetail | undefined) => {
                if (CommonUtils.isNullOrUndefined(release)) {
                    notFound()
                }

                setRelease(release)

                setSubscribers(getSubcribersEmail(release))

                if (
                    !CommonUtils.isNullOrUndefined(release._embedded) &&
                    !CommonUtils.isNullOrUndefined(release._embedded['sw360:attachments'])
                ) {
                    setEmbeddedAttachments(release._embedded['sw360:attachments'])
                }

                return release
            })
            .then((release: ReleaseDetail) => {
                fetchData(`components/${release._links['sw360:component'].href.split('/').at(-1)}/releases`)
                    .then((embeddedReleaseLinks: EmbeddedReleaseLinks | undefined) => {
                        if (embeddedReleaseLinks) {
                            setReleasesSameComponent(embeddedReleaseLinks['_embedded']['sw360:releaseLinks'])
                        }
                    })
                    .catch((err) => console.error(err))
            })
            .catch((err) => console.error(err))

        fetchData(`releases/${releaseId}/vulnerabilities`)
            .then((vulnerabilities: EmbeddedVulnerabilities | undefined) => {
                if (
                    vulnerabilities &&
                    !CommonUtils.isNullOrUndefined(vulnerabilities['_embedded']) &&
                    !CommonUtils.isNullOrUndefined(vulnerabilities['_embedded']['sw360:vulnerabilityDTOes'])
                ) {
                    setVulnerData(vulnerabilities['_embedded']['sw360:vulnerabilityDTOes'])
                } else {
                    setVulnerData([])
                }
            })
            .catch((err) => console.error(err))
    }, [
        fetchData,
        releaseId,
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
                    `changelog/document/${releaseId}`,
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
        releaseId,
        session,
    ])

    const downloadBundle = async () => {
        if (CommonUtils.isNullOrUndefined(session)) return signOut()
        await DownloadService.download(
            `${DocumentTypes.RELEASE}/${releaseId}/attachments/download`,
            session.data,
            'AttachmentBundle.zip',
        )
    }

    const handleSubcriptions = async () => {
        if (CommonUtils.isNullOrUndefined(session.data)) return

        await ApiUtils.POST(`releases/${releaseId}/subscriptions`, {}, session.data.user.access_token)
        fetchData(`releases/${releaseId}`)
            .then((release: ReleaseDetail | undefined) => {
                if (release === undefined) return
                setRelease(release)
                setSubscribers(getSubcribersEmail(release))
            })
            .catch((e) => console.error(e))
    }

    const isUserSubscribed = () => {
        if (userEmail === undefined) return false
        return subscribers.includes(userEmail)
    }

    const headerButtons = {
        'Edit release': {
            link: `/components/editRelease/${releaseId}`,
            type: 'primary',
            name: t('Edit release'),
            disable: session?.data?.user?.userGroup === UserGroupType.SECURITY_USER,
        },
        'Link To Project': {
            link: '',
            type: 'secondary',
            onClick: () => {
                setLinkProjectModalShow(true)
            },
            name: t('Link To Project'),
            disable: session?.data?.user?.userGroup === UserGroupType.SECURITY_USER,
        },
        Merge: {
            link: `/components/releases/detail/${releaseId}/merge`,
            type: 'secondary',
            name: t('Merge'),
            hidden:
                session?.data?.user?.userGroup === UserGroupType.SECURITY_USER ||
                session?.data?.user?.userGroup === UserGroupType.USER,
        },
        Subscribe: {
            link: '',
            type: isUserSubscribed() ? 'outline-danger' : 'outline-success',
            name: isUserSubscribed() ? t('Unsubscribe') : t('Subscribe'),
            onClick: handleSubcriptions,
        },
    }

    const param = useParams()
    const locale = (param.locale as string) || 'en'
    const componentsPath = `/${locale}/components`
    const componentName = release?.name ?? ''

    return (
        release && (
            <>
                <LinkReleaseToProjectModal
                    show={linkProjectModalShow}
                    setShow={setLinkProjectModalShow}
                    releaseId={releaseId}
                />
                <Breadcrumb className='container page-content'>
                    <Breadcrumb.Item
                        linkAs={Link}
                        href={componentsPath}
                    >
                        {t('Components')}
                    </Breadcrumb.Item>
                    <Breadcrumb.Item
                        linkAs={Link}
                        href={`${componentsPath}/detail/${release._links['sw360:component'].href.split('/').at(-1)}`}
                    >
                        {componentName}
                    </Breadcrumb.Item>
                    <Breadcrumb.Item active>{`${release.name} (${release.version})`}</Breadcrumb.Item>
                </Breadcrumb>
                <div className='container page-content'>
                    <Tab.Container
                        activeKey={activeKey}
                        onSelect={(k) => handleSelect(k)}
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
                                    {isSPDXFeatureEnabled && (
                                        <ListGroup.Item
                                            action
                                            eventKey={ReleaseTabIds.SPDX_DOCUMENT}
                                        >
                                            <div className='my-2'>{t('SPDX Document')}</div>
                                        </ListGroup.Item>
                                    )}
                                    <ListGroup.Item
                                        action
                                        eventKey={ReleaseTabIds.LINKED_RELEASES}
                                    >
                                        <div className='my-2'>{t('Linked Releases')}</div>
                                    </ListGroup.Item>
                                    <ListGroup.Item
                                        action
                                        eventKey={ReleaseTabIds.LINKED_PACKAGES}
                                    >
                                        <div className='my-2'>{t('Linked Packages')}</div>
                                    </ListGroup.Item>
                                    <ListGroup.Item
                                        action
                                        eventKey={ReleaseTabIds.CLEARING_DETAILS}
                                    >
                                        <div className='my-2'>{t('Clearing Details')}</div>
                                    </ListGroup.Item>
                                    <ListGroup.Item
                                        action
                                        eventKey={ReleaseTabIds.ECC_DETAILS}
                                    >
                                        <div className='my-2'>
                                            {t('ECC Details')}{' '}
                                            <span className={release.eccInformation?.eccStatus ?? ''}></span>
                                        </div>
                                    </ListGroup.Item>
                                    <ListGroup.Item
                                        action
                                        eventKey={CommonTabIds.ATTACHMENTS}
                                    >
                                        <div className='my-2'>{t('Attachments')}</div>
                                    </ListGroup.Item>
                                    {release.componentType === 'COTS' && (
                                        <ListGroup.Item
                                            action
                                            eventKey={ReleaseTabIds.COMMERCIAL_DETAILS}
                                        >
                                            <div className='my-2'>{t('Commercial Details')}</div>
                                        </ListGroup.Item>
                                    )}
                                    <ListGroup.Item
                                        action
                                        eventKey={CommonTabIds.VULNERABILITIES}
                                    >
                                        <div className='my-2'>
                                            {t('Vulnerabilities')}{' '}
                                            <span
                                                id='numberOfVulnerabilitiesDiv'
                                                className='badge badge-light'
                                            >
                                                {`${vulInfo?.[0] ?? 0} + ${vulInfo?.[1] ?? 0}`}
                                            </span>
                                        </div>
                                    </ListGroup.Item>
                                    <ListGroup.Item
                                        action
                                        eventKey={CommonTabIds.CHANGE_LOG}
                                    >
                                        <div className='my-2'>{t('Change Log')}</div>
                                    </ListGroup.Item>
                                </ListGroup>
                            </Col>
                            <Col className='me-3 ms-2'>
                                <Row>
                                    <Col
                                        className='col-auto ps-0 btn-group'
                                        role='group'
                                    >
                                        <Dropdown>
                                            <Dropdown.Toggle variant='primary'>
                                                <span
                                                    className={`badge-circle ${release.clearingState ?? 'NEW'}`}
                                                ></span>
                                                {`${t('Version')} ${release.version}`}
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                {Object.entries(releasesSameComponent).map(
                                                    ([index, item]: [
                                                        string,
                                                        ReleaseLink,
                                                    ]) => (
                                                        <Dropdown.Item
                                                            key={index}
                                                            href={`/components/releases/detail/${item.id}`}
                                                        >
                                                            <span
                                                                className={`badge-circle ${item.clearingState ?? 'NEW'}`}
                                                            ></span>
                                                            {`${t('Version')} ${item.version}`}
                                                        </Dropdown.Item>
                                                    ),
                                                )}
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </Col>
                                    <Col>
                                        <PageButtonHeader
                                            title={`${release.name} ${release.version}`}
                                            buttons={headerButtons}
                                        >
                                            {activeKey === CommonTabIds.ATTACHMENTS &&
                                                embeddedAttachments.length > 0 && (
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
                                                        className={`nav-item nav-link ${changelogTab === 'view-log' ? 'active' : ''}`}
                                                        onClick={() => {
                                                            if (changelogTab !== '') {
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
                                    </Col>
                                </Row>
                                <Row>
                                    <Tab.Content>
                                        <Tab.Pane eventKey={CommonTabIds.SUMMARY}>
                                            <Summary
                                                release={release}
                                                releaseId={releaseId}
                                            />
                                        </Tab.Pane>
                                        {isSPDXFeatureEnabled && (
                                            <Tab.Pane eventKey={ReleaseTabIds.SPDX_DOCUMENT}>
                                                <SPDXDocumentTab releaseId={releaseId} />
                                            </Tab.Pane>
                                        )}
                                        <Tab.Pane eventKey={ReleaseTabIds.LINKED_RELEASES}>
                                            <LinkedReleases releaseId={releaseId} />
                                        </Tab.Pane>
                                        <Tab.Pane eventKey={ReleaseTabIds.LINKED_PACKAGES}>
                                            <LinkedPackagesTab releaseId={releaseId} />
                                        </Tab.Pane>
                                        <Tab.Pane eventKey={ReleaseTabIds.CLEARING_DETAILS}>
                                            <ClearingDetails
                                                release={release}
                                                releaseId={releaseId}
                                                embeddedAttachments={embeddedAttachments}
                                            />
                                        </Tab.Pane>
                                        <Tab.Pane eventKey={ReleaseTabIds.ECC_DETAILS}>
                                            <ECCDetails release={release} />
                                        </Tab.Pane>
                                        <Tab.Pane eventKey={CommonTabIds.ATTACHMENTS}>
                                            <Attachments
                                                documentId={releaseId}
                                                documentType={DocumentTypes.RELEASE}
                                            />
                                        </Tab.Pane>
                                        {release.componentType === 'COTS' && (
                                            <Tab.Pane eventKey={ReleaseTabIds.COMMERCIAL_DETAILS}>
                                                <CommercialDetails
                                                    costDetails={release._embedded['sw360:cotsDetail']}
                                                />
                                            </Tab.Pane>
                                        )}
                                        <Tab.Pane eventKey={CommonTabIds.VULNERABILITIES}>
                                            <ComponentVulnerabilities vulnerData={vulnerData} />
                                        </Tab.Pane>
                                        <Tab.Pane eventKey={CommonTabIds.CHANGE_LOG}>
                                            <div className='col'>
                                                <div
                                                    className='row'
                                                    hidden={changelogTab != 'list-change' ? true : false}
                                                >
                                                    <ChangeLogList
                                                        setChangeLogId={setChangeLogId}
                                                        documentId={releaseId}
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
                                                            changeLogList.filter(
                                                                (d: Changelogs) => d.id === changeLogId,
                                                            )[0]
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
    )
}

export default DetailOverview
