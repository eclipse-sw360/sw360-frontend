// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import ClearingDetails from '@/app/[locale]/components/releases/detail/[id]/components/ClearingDetails'
import ECCDetails from '@/app/[locale]/components/releases/detail/[id]/components/ECCDetails'
import LinkedReleases from '@/app/[locale]/components/releases/detail/[id]/components/LinkedReleases'
import ReleaseDetailTabs from '@/app/[locale]/components/releases/detail/[id]/components/ReleaseDetailTabs'
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
    HttpStatus,
    ReleaseDetail,
    ReleaseTabIds,
} from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils'
import { signOut, getSession } from 'next-auth/react'
import { useEffect, useState, ReactNode } from 'react'

type EmbeddedChangelogs = Embedded<Changelogs, 'sw360:changeLogs'>

interface Props {
    releaseId: string
}

const CurrentReleaseDetail = ({ releaseId }: Props): ReactNode => {
    const [selectedTab, setSelectedTab] = useState<string>(CommonTabIds.SUMMARY)
    const [release, setRelease] = useState<ReleaseDetail>()
    const [embeddedAttachments, setEmbeddedAttachments] = useState<Array<Attachment>>([])
    const [changesLogTab, setChangesLogTab] = useState('list-change')
    const [changeLogIndex, setChangeLogIndex] = useState(-1)
    const [changeLogList, setChangeLogList] = useState<Array<Changelogs>>([])
    const [linkProjectModalShow, setLinkProjectModalShow] = useState<boolean>(false)
    const [tabList] = useState(ReleaseDetailTabs.MODERATION_REQUEST)

    const fetchData = async (url: string, signal: AbortSignal) => {
        try {
            const session = await getSession()
            if (CommonUtils.isNullOrUndefined(session)) return signOut()
                const response = await ApiUtils.GET(url, session.user.access_token, signal)
                if (response.status == HttpStatus.OK) {
                    const data = await response.json() as ReleaseDetail & EmbeddedChangelogs
                    return data
                } else if (response.status == HttpStatus.UNAUTHORIZED) {
                    void signOut()
                }
        } catch(e) {
            console.error(e)
        }
    }

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal

        fetchData(`releases/${releaseId}`, signal)
            .then((release: ReleaseDetail | undefined) => {
                setRelease(release)
                if (
                    !CommonUtils.isNullOrUndefined(release?._embedded) &&
                    !CommonUtils.isNullOrUndefined(release._embedded['sw360:attachments'])
                ) {
                    setEmbeddedAttachments(release._embedded['sw360:attachments'])
                }
                return release
            })
            .catch((err) => console.error(err))

        fetchData(`changelog/document/${releaseId}`, signal)
            .then((changeLogs: EmbeddedChangelogs | undefined) => {
                changeLogs &&
                    setChangeLogList(
                        CommonUtils.isNullOrUndefined(changeLogs._embedded['sw360:changeLogs'])
                            ? []
                            : changeLogs._embedded['sw360:changeLogs'],
                    )
            })
            .catch((err) => console.error(err))

        return () => controller.abort()
    }, [releaseId])

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
                                hidden={changesLogTab != 'list-change'}
                            >
                                <ChangeLogList
                                    setChangeLogIndex={setChangeLogIndex}
                                    documentId={releaseId}
                                    setChangesLogTab={setChangesLogTab}
                                    changeLogList={changeLogList}
                                />
                            </div>
                            <div
                                className='row'
                                hidden={changesLogTab != 'view-log'}
                            >
                                <ChangeLogDetail changeLogData={changeLogList[changeLogIndex]} />
                                <div
                                    id='cardScreen'
                                    style={{ padding: '0px' }}
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
