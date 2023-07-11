// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import { useEffect, useState, useCallback } from 'react'
import CommonTabIds from '@/object-types/enums/CommonTabsIds'
import ApiUtils from '@/utils/api/api.util'
import { Session } from '@/object-types/Session'
import HttpStatus from '@/object-types/enums/HttpStatus'
import { signOut } from 'next-auth/react'
import { Dropdown } from 'react-bootstrap'
import CommonUtils from '@/utils/common.utils'
import { useTranslations } from 'next-intl'
import { COMMON_NAMESPACE } from '@/object-types/Constants'
import { SideBar, PageButtonHeader } from '@/components/sw360'

import ReleaseTabIds from '@/object-types/enums/ReleaseTabIds'
import DocumentTypes from '@/object-types/enums/DocumentTypes'
import { LinkedVulnerability } from '@/object-types/LinkedVulnerability'
import DownloadService from '@/services/download.service'
import Link from 'next/link'
import styles from '../detail.module.css'

import Summary from './Summary'
import ClearingDetails from './ClearingDetails'
import LinkedReleases from './LinkedReleases'
import ECCDetails from './ECCDetails'
import Attachments from '@/components/Attachments/Attachments'
import ComponentVulnerabilities from '@/components/ComponentVulnerabilities/ComponentVulnerabilities'
import ChangeLogList from '@/components/ChangeLog/ChangeLogList/ChangeLogList'
import ChangeLogDetail from '@/components/ChangeLog/ChangeLogDetail/ChangeLogDetail'

interface Props {
    session: Session
    releaseId: string
}

const tabList = [
    {
        id: CommonTabIds.SUMMARY,
        name: 'Summary',
    },
    {
        id: ReleaseTabIds.LINKED_RELEASES,
        name: 'Linked Releases',
    },
    {
        id: ReleaseTabIds.CLEARING_DETAILS,
        name: 'Clearing Details',
    },
    {
        id: ReleaseTabIds.ECC_DETAILS,
        name: 'ECC Details',
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

const DetailOverview = ({ session, releaseId }: Props) => {
    const t = useTranslations(COMMON_NAMESPACE)
    const [selectedTab, setSelectedTab] = useState<string>(CommonTabIds.SUMMARY)
    const [release, setRelease] = useState<any>(undefined)
    const [releasesSameComponent, setReleasesSameComponentt] = useState<Array<any>>([])
    const [attachmentNumber, setAttachmentNumber] = useState<number>(0)
    const [vulnerData, setVulnerData] = useState<Array<LinkedVulnerability>>([])
    const [changesLogTab, setChangesLogTab] = useState('list-change')
    const [changeLogIndex, setChangeLogIndex] = useState(-1)
    const [changeLogList, setChangeLogList] = useState<Array<any>>([])

    const fetchData: any = useCallback(
        async (url: string) => {
            const response = await ApiUtils.GET(url, session.user.access_token)
            if (response.status == HttpStatus.OK) {
                const data = await response.json()
                return data
            } else if (response.status == HttpStatus.UNAUTHORIZED) {
                signOut()
            } else {
                return null
            }
        },
        [session.user.access_token]
    )

    useEffect(() => {
        fetchData(`releases/${releaseId}`)
            .then((release: any) => {
                setRelease(release)
                if (
                    !CommonUtils.isNullOrUndefined(release['_embedded']) &&
                    !CommonUtils.isNullOrUndefined(release['_embedded']['sw360:attachments'])
                ) {
                    setAttachmentNumber(release['_embedded']['sw360:attachments'].length)
                }
                return release
            })
            .then((release: any) => {
                fetchData(`components/${release._links['sw360:component'].href.split('/').at(-1)}/releases`).then((component: any) => {
                    (component) && setReleasesSameComponentt(component['_embedded']['sw360:releaseLinks'])
                })
            })

        fetchData(`releases/${releaseId}/vulnerabilities`).then((vulnerabilities: any) => {
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

        fetchData(`changelog/document/${releaseId}`).then((changeLogs: any) => {
            (changeLogs) && setChangeLogList(
                CommonUtils.isNullOrUndefined(changeLogs['_embedded']['sw360:changeLogs'])
                    ? []
                    : changeLogs['_embedded']['sw360:changeLogs']
            )
        })
    }, [releaseId])

    const downloadBundle = () => {
        DownloadService.download(
            `${DocumentTypes.RELEASE}/${releaseId}/attachments/download`, session, 'AttachmentBundle.zip')
    }

    const headerButtons = {
        'Edit release': { link: '', type: 'primary' },
        Merge: { link: '', type: 'secondary' },
        Subscribe: { link: '', type: 'outline-success' },
    }

    return (
        release && (
            <div className='container' style={{ maxWidth: '98vw', marginTop: '10px' }}>
                <div className='row'>
                    <div className='col-2 sidebar'>
                        <SideBar
                            selectedTab={selectedTab}
                            setSelectedTab={setSelectedTab}
                            tabList={tabList}
                            vulnerabilities={vulnerData}
                            eccStatus={release.eccInformation.eccStatus}
                        />
                    </div>
                    <div className='col'>
                        <div className='row' style={{ marginBottom: '20px' }}>
                            <PageButtonHeader title={`${release.name} ${release.version}`} buttons={headerButtons}>
                                <div style={{ marginLeft: '5px'}} className='btn-group' role='group'>
                                    <Dropdown>
                                        <Dropdown.Toggle variant='primary'>
                                            <span className={`${styles['badge-circle']} ${styles[release.clearingState]}`}></span>
                                            {`${t('Version')} ${release.version}`}
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            {
                                                Object.entries(releasesSameComponent).map(([index, item]: any) =>
                                                    <Dropdown.Item key={index} className={styles['dropdown-item']}>
                                                        <span className={`${styles['badge-circle']} ${styles[item.clearingState]}`}></span>
                                                        <Link href={`components/releases/detail/${item.id}`}>
                                                            {`${t('Version')} ${item.version}`}
                                                        </Link>
                                                    </Dropdown.Item>)
                                            }
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>
                                {selectedTab === CommonTabIds.ATTACHMENTS && attachmentNumber > 0 && (
                                    <div className='list-group-companion' data-belong-to='tab-Attachments'>
                                        <div className='btn-group' role='group'>
                                            <button
                                                id='downloadAttachmentBundle'
                                                type='button'
                                                className='btn btn-secondary'
                                                onClick={downloadBundle}
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
                            <Summary release={release} releaseId={releaseId} />
                        </div>
                        <div className='row' hidden={selectedTab !== ReleaseTabIds.LINKED_RELEASES ? true : false}>
                            <LinkedReleases release={release}/>
                        </div>
                        <div className='row' hidden={selectedTab !== ReleaseTabIds.CLEARING_DETAILS ? true : false}>
                            <ClearingDetails release={release} releaseId={releaseId} session={session}/>
                        </div>
                        <div className='row' hidden={selectedTab !== ReleaseTabIds.ECC_DETAILS ? true : false}>
                            <ECCDetails release={release}/>
                        </div>
                        <div className='row' hidden={selectedTab != CommonTabIds.ATTACHMENTS ? true : false}>
                            <Attachments session={session} documentId={releaseId} documentType={DocumentTypes.RELEASE} />
                        </div>
                        <div className='containers' hidden={selectedTab != CommonTabIds.VULNERABILITIES ? true : false}>
                            <ComponentVulnerabilities vulnerData={vulnerData} session={session} />
                        </div>
                        <div className='row' hidden={selectedTab != CommonTabIds.CHANGE_LOG ? true : false}>
                            <div className='col'>
                                <div className='row' hidden={changesLogTab != 'list-change' ? true : false}>
                                    <ChangeLogList
                                        setChangeLogIndex={setChangeLogIndex}
                                        documentId={releaseId}
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
