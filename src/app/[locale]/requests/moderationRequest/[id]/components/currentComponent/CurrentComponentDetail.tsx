// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useState, ReactNode } from 'react'
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
    HttpStatus,
    LinkedVulnerability,
} from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils'
import ReleaseOverview from '@/app/[locale]/components/detail/[id]/components/ReleaseOverview'
import Summary from '@/app/[locale]/components/detail/[id]/components/Summary'
import { notFound } from 'next/navigation'

type EmbeddedChangelogs = Embedded<Changelogs, 'sw360:changeLogs'>
type EmbeddedVulnerabilities = Embedded<LinkedVulnerability, 'sw360:vulnerabilityDTOes'>

interface Props {
    componentId: string
}

const CurrentComponentDetail = ({ componentId }: Props): ReactNode => {
    const t = useTranslations('default')
    const { data: session } = useSession()
    const [selectedTab, setSelectedTab] = useState<string>(CommonTabIds.SUMMARY)
    const [changesLogTab, setChangesLogTab] = useState('list-change')
    const [changeLogIndex, setChangeLogIndex] = useState(-1)
    const [component, setComponent] = useState<Component>()
    const [changeLogList, setChangeLogList] = useState<Array<Changelogs>>([])

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

    const fetchData = useCallback(
        async (url: string) => {
            if (CommonUtils.isNullOrUndefined(session))
                return signOut()
            const response = await ApiUtils.GET(url, session.user.access_token)
            if (response.status == HttpStatus.OK) {
                const data = (await response.json()) as Component & EmbeddedVulnerabilities & EmbeddedChangelogs
                return data
            } else if (response.status == HttpStatus.UNAUTHORIZED) {
                await signOut()
            } else {
                notFound()
            }
        },
        [session]
    )

    useEffect(() => {
        fetchData(`components/${componentId}`)
            .then((component: Component | undefined) => {
                setComponent(component)
            })
            .catch((err) => console.error(err))

        fetchData(`changelog/document/${componentId}`)
            .then((changeLogs: EmbeddedChangelogs | undefined) => {
                setChangeLogList(
                    CommonUtils.isNullOrUndefined(changeLogs?._embedded['sw360:changeLogs'])
                        ? []
                        : changeLogs._embedded['sw360:changeLogs']
                )
            })
            .catch((err) => console.error(err))
    }, [componentId, fetchData])

    return (
        component && (
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
                        <div className='row' hidden={selectedTab !== CommonTabIds.SUMMARY ? true : false}>
                            <Summary component={component} componentId={componentId} />
                        </div>
                        <div className='row' hidden={selectedTab !== ComponentTabIds.RELEASE_OVERVIEW ? true : false}>
                            <ReleaseOverview componentId={componentId} calledFromModerationRequestDetail={true} />
                        </div>
                        <div className='row' hidden={selectedTab != CommonTabIds.ATTACHMENTS ? true : false}>
                            <Attachments documentId={componentId} documentType={DocumentTypes.COMPONENT} />
                        </div>
                        <div className='row' hidden={selectedTab != CommonTabIds.CHANGE_LOG ? true : false}>
                            <div className='col'>
                                <div className='row' hidden={changesLogTab != 'list-change' ? true : false}>
                                    <ChangeLogList
                                        setChangeLogIndex={setChangeLogIndex}
                                        documentId={componentId}
                                        setChangesLogTab={setChangesLogTab}
                                        changeLogList={changeLogList}
                                    />
                                </div>
                                <div className='row' hidden={changesLogTab != 'view-log' ? true : false}>
                                    <ChangeLogDetail changeLogData={changeLogList[changeLogIndex]} />
                                    <div id='cardScreen' style={{ padding: '0px' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    )
}

export default CurrentComponentDetail
