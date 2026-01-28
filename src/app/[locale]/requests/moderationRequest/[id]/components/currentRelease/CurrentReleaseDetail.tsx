// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { StatusCodes } from 'http-status-codes'
import { getSession, signOut, useSession } from 'next-auth/react'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import ClearingDetails from '@/app/[locale]/components/releases/detail/[id]/components/ClearingDetails'
import ECCDetails from '@/app/[locale]/components/releases/detail/[id]/components/ECCDetails'
import LinkedReleases from '@/app/[locale]/components/releases/detail/[id]/components/LinkedReleases'
import { ReleaseDetailTabs } from '@/app/[locale]/components/releases/detail/[id]/components/ReleaseDetailTabs'
import Summary from '@/app/[locale]/components/releases/detail/[id]/components/Summary'
import Attachments from '@/components/Attachments/Attachments'
import ChangeLogDetail from '@/components/ChangeLog/ChangeLogDetail/ChangeLogDetail'
import ChangeLogList from '@/components/ChangeLog/ChangeLogList/ChangeLogList'
import LinkReleaseToProjectModal from '@/components/LinkReleaseToProjectModal/LinkReleaseToProjectModal'
import { SideBar } from '@/components/sw360'
import {
    Attachment,
    Changelogs,
    CommonTabIds,
    DocumentTypes,
    Embedded,
    ErrorDetails,
    PageableQueryParam,
    PaginationMeta,
    ReleaseDetail,
    ReleaseTabIds,
} from '@/object-types'
import { ApiError, ApiUtils, CommonUtils } from '@/utils'

type EmbeddedChangelogs = Embedded<Changelogs, 'sw360:changeLogs'>

interface Props {
    releaseId: string
}

const CurrentReleaseDetail = ({ releaseId }: Props): ReactNode => {
    const [selectedTab, setSelectedTab] = useState<string>(CommonTabIds.SUMMARY)
    const [release, setRelease] = useState<ReleaseDetail>()
    const [embeddedAttachments, setEmbeddedAttachments] = useState<Array<Attachment>>([])
    const [linkProjectModalShow, setLinkProjectModalShow] = useState<boolean>(false)
    const { MODERATION_REQUEST } = ReleaseDetailTabs()
    const [tabList] = useState(MODERATION_REQUEST)
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

    const fetchData = async (url: string, signal: AbortSignal) => {
        try {
            const session = await getSession()
            if (CommonUtils.isNullOrUndefined(session)) return
            const response = await ApiUtils.GET(url, session.user.access_token, signal)
            if (response.status == StatusCodes.OK) {
                const data = (await response.json()) as ReleaseDetail & EmbeddedChangelogs
                return data
            } else if (response.status == StatusCodes.UNAUTHORIZED) {
                void signOut()
            }
        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal

        const load = async () => {
            try {
                const release = await fetchData(`releases/${releaseId}`, signal)
                setRelease(release)
                if (
                    !CommonUtils.isNullOrUndefined(release?._embedded) &&
                    !CommonUtils.isNullOrUndefined(release._embedded['sw360:attachments'])
                ) {
                    setEmbeddedAttachments(release._embedded['sw360:attachments'])
                }
            } catch (err) {
                console.error(err)
            }
        }
        void load()
        return () => controller.abort()
    }, [
        releaseId,
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

    return release ? (
        <div className='container page-content'>
            <div className='row'>
                <div className='col-2 sidebar'>
                    <SideBar
                        selectedTab={selectedTab}
                        setSelectedTab={setSelectedTab}
                        tabList={tabList}
                        eccStatus={release.eccInformation?.eccStatus}
                    />
                </div>
                <div className='col'>
                    <div
                        className='row'
                        hidden={selectedTab !== CommonTabIds.SUMMARY}
                    >
                        <Summary
                            release={release}
                            releaseId={releaseId}
                        />
                    </div>
                    <div
                        className='row'
                        hidden={selectedTab !== ReleaseTabIds.LINKED_RELEASES}
                    >
                        <LinkedReleases releaseId={releaseId} />
                    </div>
                    <div
                        className='row'
                        hidden={selectedTab !== ReleaseTabIds.CLEARING_DETAILS}
                    >
                        <ClearingDetails
                            release={release}
                            releaseId={releaseId}
                            embeddedAttachments={embeddedAttachments}
                        />
                    </div>
                    <div
                        className='row'
                        hidden={selectedTab !== ReleaseTabIds.ECC_DETAILS}
                    >
                        <ECCDetails release={release} />
                    </div>
                    <div
                        className='row'
                        hidden={selectedTab != CommonTabIds.ATTACHMENTS}
                    >
                        <Attachments
                            documentId={releaseId}
                            documentType={DocumentTypes.RELEASE}
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
                                hidden={changelogTab != 'view-log'}
                            >
                                <ChangeLogDetail
                                    changeLogData={changeLogList.filter((d: Changelogs) => d.id === changeLogId)[0]}
                                />
                                <div
                                    id='cardScreen'
                                    style={{
                                        padding: '0px',
                                    }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <LinkReleaseToProjectModal
                show={linkProjectModalShow}
                setShow={setLinkProjectModalShow}
                releaseId={releaseId}
            />
        </div>
    ) : (
        <></>
    )
}

export default CurrentReleaseDetail
