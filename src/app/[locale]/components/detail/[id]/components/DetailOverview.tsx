// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { getSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { ReactNode, useCallback, useEffect, useState } from 'react'

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
    HttpStatus,
    LinkedVulnerability,
} from '@/object-types'
import DownloadService from '@/services/download.service'
import { ApiUtils, CommonUtils } from '@/utils'
import ReleaseOverview from './ReleaseOverview'
import Summary from './Summary'

type EmbeddedChangelogs = Embedded<Changelogs, 'sw360:changeLogs'>
type EmbeddedVulnerabilities = Embedded<LinkedVulnerability, 'sw360:vulnerabilityDTOes'>

interface Props {
    componentId: string
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
    },
    {
        id: CommonTabIds.VULNERABILITIES,
        name: 'Vulnerabilities',
    },
    {
        id: CommonTabIds.CHANGE_LOG,
        name: 'Change Log',
    },
]

const DetailOverview = ({ componentId }: Props) : ReactNode => {
    const t = useTranslations('default')
    const [selectedTab, setSelectedTab] = useState<string>(CommonTabIds.SUMMARY)
    const [changesLogTab, setChangesLogTab] = useState('list-change')
    const [changeLogIndex, setChangeLogIndex] = useState(-1)
    const [component, setComponent] = useState<Component | undefined>(undefined)
    const [changeLogList, setChangeLogList] = useState<Array<Changelogs>>([])
    const [vulnerData, setVulnerData] = useState<Array<LinkedVulnerability>>([])
    const [attachmentNumber, setAttachmentNumber] = useState<number>(0)

    const fetchData = useCallback(
        async (url: string) => {
            const session = await getSession()
            if (CommonUtils.isNullOrUndefined(session))
                return signOut()
            const response = await ApiUtils.GET(url, session.user.access_token)
            if (response.status === HttpStatus.OK) {
                const data = (await response.json()) as Component & EmbeddedVulnerabilities & EmbeddedChangelogs
                return data
            } else if (response.status === HttpStatus.UNAUTHORIZED) {
                return signOut()
            } else {
                return undefined
            }
        },
        []
    )

    const downloadBundle = async () => {
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session))
            return
        DownloadService.download(
            `${DocumentTypes.COMPONENT}/${componentId}/attachments/download`,
            session,
            'AttachmentBundle.zip'
        )
    }

    useEffect(() => {
        fetchData(`components/${componentId}`)
            .then((component: Component | undefined) => {
                if (component === undefined) return
                setComponent(component)
                if (
                    !CommonUtils.isNullOrUndefined(component['_embedded']) &&
                    !CommonUtils.isNullOrUndefined(component['_embedded']['sw360:attachments'])
                ) {
                    setAttachmentNumber(component['_embedded']['sw360:attachments'].length)
                }
            })
            .catch((err) => console.error(err))

        fetchData(`changelog/document/${componentId}`)
            .then((changeLogs: EmbeddedChangelogs | undefined) => {
                if (changeLogs === undefined) return
                setChangeLogList(
                    CommonUtils.isNullOrUndefined(changeLogs['_embedded']['sw360:changeLogs'])
                        ? []
                        : changeLogs['_embedded']['sw360:changeLogs']
                )
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

    const headerButtons = {
        Edit: { link: `/components/edit/${componentId}`, type: 'primary', name: t('Edit component') },
        Merge: { link: '', type: 'secondary', name: t('Merge') },
        Split: { link: '', type: 'secondary', name: t('Split') },
        Subscribe: { link: '', type: 'outline-success', name: t('Subscribe') },
    }

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
                        <div className='row' style={{ marginBottom: '20px' }}>
                            <PageButtonHeader title={component.name} buttons={headerButtons}>
                                {selectedTab === CommonTabIds.ATTACHMENTS && attachmentNumber > 0 && (
                                    <div className='list-group-companion' data-belong-to='tab-Attachments'>
                                        <div className='btn-group' role='group'>
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
                                            className={`nav-item nav-link ${
                                                changesLogTab == 'list-change' ? 'active' : ''
                                            }`}
                                            onClick={() => setChangesLogTab('list-change')}
                                            style={{ color: '#F7941E', fontWeight: 'bold' }}
                                        >
                                            {t('Change Log')}
                                        </a>
                                        <a
                                            className={`nav-item nav-link ${
                                                changesLogTab == 'view-log' ? 'active' : ''
                                            }`}
                                            onClick={() => {
                                                changeLogIndex !== -1 && setChangesLogTab('view-log')
                                            }}
                                            style={{ color: '#F7941E', fontWeight: 'bold' }}
                                        >
                                            {t('Changes')}
                                        </a>
                                    </div>
                                )}
                            </PageButtonHeader>
                        </div>
                        <div className='row' hidden={selectedTab !== CommonTabIds.SUMMARY ? true : false}>
                            <Summary component={component} componentId={componentId} />
                        </div>
                        <div className='row' hidden={selectedTab !== ComponentTabIds.RELEASE_OVERVIEW ? true : false}>
                            <ReleaseOverview componentId={componentId} />
                        </div>
                        <div className='row' hidden={selectedTab !== CommonTabIds.ATTACHMENTS ? true : false}>
                            <Attachments documentId={componentId} documentType={DocumentTypes.COMPONENT} />
                        </div>
                        <div className='containers' hidden={selectedTab !== CommonTabIds.VULNERABILITIES ? true : false}>
                            <ComponentVulnerabilities vulnerData={vulnerData} />
                        </div>
                        <div className='row' hidden={selectedTab !== CommonTabIds.CHANGE_LOG ? true : false}>
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

export default DetailOverview
