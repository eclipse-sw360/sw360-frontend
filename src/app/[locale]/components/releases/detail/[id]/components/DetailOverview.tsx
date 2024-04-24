// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { Dropdown } from 'react-bootstrap'

import Attachments from '@/components/Attachments/Attachments'
import ChangeLogDetail from '@/components/ChangeLog/ChangeLogDetail/ChangeLogDetail'
import ChangeLogList from '@/components/ChangeLog/ChangeLogList/ChangeLogList'
import ComponentVulnerabilities from '@/components/ComponentVulnerabilities/ComponentVulnerabilities'
import LinkReleaseToProjectModal from '@/components/LinkReleaseToProjectModal/LinkReleaseToProjectModal'
import { PageButtonHeader, SideBar } from '@/components/sw360'
import {
    Attachment,
    Changelogs,
    CommonTabIds,
    DocumentTypes,
    Embedded,
    HttpStatus,
    LinkedVulnerability,
    ReleaseDetail,
    ReleaseLink,
    ReleaseTabIds,
} from '@/object-types'
import DownloadService from '@/services/download.service'
import { ApiUtils, CommonUtils } from '@/utils'
import { SPDX_ENABLE } from '@/utils/env'
import styles from '../detail.module.css'
import ClearingDetails from './ClearingDetails'
import CommercialDetails from './CommercialDetails'
import ECCDetails from './ECCDetails'
import LinkedReleases from './LinkedReleases'
import ReleaseDetailTabs from './ReleaseDetailTabs'
import Summary from './Summary'
import SPDXDocument from './spdx/SPDXDocument'

type EmbeddedChangelogs = Embedded<Changelogs, 'sw360:changeLogs'>
type EmbeddedVulnerabilities = Embedded<LinkedVulnerability, 'sw360:vulnerabilityDTOes'>
type EmbeddedReleaseLinks = Embedded<ReleaseLink, 'sw360:releaseLinks'>

interface Props {
    releaseId: string
}

const DetailOverview = ({ releaseId }: Props) => {
    const t = useTranslations('default')
    const { data: session } = useSession()
    const [selectedTab, setSelectedTab] = useState<string>(CommonTabIds.SUMMARY)
    const [release, setRelease] = useState<ReleaseDetail>()
    const [releasesSameComponent, setReleasesSameComponent] = useState<Array<ReleaseLink>>([])
    const [embeddedAttachments, setEmbeddedAttachments] = useState<Array<Attachment>>([])
    const [vulnerData, setVulnerData] = useState<Array<LinkedVulnerability>>([])
    const [changesLogTab, setChangesLogTab] = useState('list-change')
    const [changeLogIndex, setChangeLogIndex] = useState(-1)
    const [changeLogList, setChangeLogList] = useState<Array<Changelogs>>([])
    const [linkProjectModalShow, setLinkProjectModalShow] = useState<boolean>(false)

    const [tabList, setTabList] = useState(ReleaseDetailTabs.WITHOUT_COMMERCIAL_DETAILS_AND_SPDX)

    const fetchData = useCallback(
        async (url: string) => {
            const response = await ApiUtils.GET(url, session.user.access_token)
            if (response.status == HttpStatus.OK) {
                const data = (await response.json()) as ReleaseDetail &
                    EmbeddedVulnerabilities &
                    EmbeddedChangelogs &
                    EmbeddedReleaseLinks
                return data
            } else if (response.status == HttpStatus.UNAUTHORIZED) {
                return signOut()
            } else {
                return null
            }
        },
        [session]
    )

    useEffect(() => {
        fetchData(`releases/${releaseId}`)
            .then((release: ReleaseDetail) => {
                setRelease(release)

                if (
                    !CommonUtils.isNullOrUndefined(release._embedded) &&
                    !CommonUtils.isNullOrUndefined(release._embedded['sw360:attachments'])
                ) {
                    setEmbeddedAttachments(release._embedded['sw360:attachments'])
                }

                if (release.componentType === 'COTS' && SPDX_ENABLE !== 'true') {
                    setTabList(ReleaseDetailTabs.WITH_COMMERCIAL_DETAILS)
                }

                if (release.componentType === 'COTS' && SPDX_ENABLE === 'true') {
                    setTabList(ReleaseDetailTabs.WITH_COMMERCIAL_DETAILS_AND_SPDX)
                }

                if (release.componentType !== 'COTS' && SPDX_ENABLE === 'true') {
                    setTabList(ReleaseDetailTabs.WITH_SPDX)
                }
                return release
            })
            .then((release: ReleaseDetail) => {
                fetchData(`components/${release._links['sw360:component'].href.split('/').at(-1)}/releases`)
                    .then((embeddedReleaseLinks: EmbeddedReleaseLinks) => {
                        embeddedReleaseLinks &&
                            setReleasesSameComponent(embeddedReleaseLinks['_embedded']['sw360:releaseLinks'])
                    })
                    .catch((err) => console.error(err))
            })
            .catch((err) => console.error(err))

        fetchData(`releases/${releaseId}/vulnerabilities`)
            .then((vulnerabilities: EmbeddedVulnerabilities) => {
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

        fetchData(`changelog/document/${releaseId}`)
            .then((changeLogs: EmbeddedChangelogs) => {
                changeLogs &&
                    setChangeLogList(
                        CommonUtils.isNullOrUndefined(changeLogs._embedded['sw360:changeLogs'])
                            ? []
                            : changeLogs._embedded['sw360:changeLogs']
                    )
            })
            .catch((err) => console.error(err))
    }, [fetchData, releaseId])

    const downloadBundle = () => {
        DownloadService.download(
            `${DocumentTypes.RELEASE}/${releaseId}/attachments/download`,
            session,
            'AttachmentBundle.zip'
        )
    }

    const headerButtons = {
        'Edit release': { link: `/components/editRelease/${releaseId}`, type: 'primary', name: t('Edit release') },
        'Link To Project': {
            link: '',
            type: 'secondary',
            onClick: () => {
                setLinkProjectModalShow(true)
            },
            name: t('Link To Project'),
        },
        Merge: { link: '', type: 'secondary', name: t('Merge') },
        Subscribe: { link: '', type: 'outline-success', name: t('Subscribe') },
    }

    return (
        release && (
            <div className='container page-content'>
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
                                <div style={{ marginLeft: '5px' }} className='btn-group' role='group'>
                                    <Dropdown>
                                        <Dropdown.Toggle variant='primary'>
                                            <span
                                                className={`${styles['badge-circle']} ${styles[release.clearingState]}`}
                                            ></span>
                                            {`${t('Version')} ${release.version}`}
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            {releasesSameComponent &&
                                                Object.entries(releasesSameComponent).map(
                                                    ([index, item]: [string, ReleaseLink]) => (
                                                        <Dropdown.Item key={index} className={styles['dropdown-item']}>
                                                            <span
                                                                className={`${styles['badge-circle']} ${
                                                                    styles[item.clearingState]
                                                                }`}
                                                            ></span>
                                                            <Link href={`/components/releases/detail/${item.id}`}>
                                                                {`${t('Version')} ${item.version}`}
                                                            </Link>
                                                        </Dropdown.Item>
                                                    )
                                                )}
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>
                                {selectedTab === CommonTabIds.ATTACHMENTS && embeddedAttachments.length > 0 && (
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
                        <div className='row' hidden={selectedTab !== ReleaseTabIds.SPDX_DOCUMENT ? true : false}>
                            <SPDXDocument releaseId={releaseId} />
                        </div>
                        <div className='row' hidden={selectedTab !== ReleaseTabIds.LINKED_RELEASES ? true : false}>
                            <LinkedReleases releaseId={releaseId} />
                        </div>
                        <div className='row' hidden={selectedTab !== ReleaseTabIds.CLEARING_DETAILS ? true : false}>
                            <ClearingDetails
                                release={release}
                                releaseId={releaseId}
                                embeddedAttachments={embeddedAttachments}
                            />
                        </div>
                        <div className='row' hidden={selectedTab !== ReleaseTabIds.ECC_DETAILS ? true : false}>
                            <ECCDetails release={release} />
                        </div>
                        <div className='row' hidden={selectedTab != CommonTabIds.ATTACHMENTS ? true : false}>
                            <Attachments documentId={releaseId} documentType={DocumentTypes.RELEASE} />
                        </div>
                        <div className='row' hidden={selectedTab != ReleaseTabIds.COMMERCIAL_DETAILS ? true : false}>
                            <CommercialDetails
                                costDetails={
                                    release._embedded['sw360:cotsDetail'] && release._embedded['sw360:cotsDetail']
                                }
                            />
                        </div>
                        <div className='containers' hidden={selectedTab != CommonTabIds.VULNERABILITIES ? true : false}>
                            <ComponentVulnerabilities vulnerData={vulnerData} />
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
                <LinkReleaseToProjectModal
                    show={linkProjectModalShow}
                    setShow={setLinkProjectModalShow}
                    releaseId={releaseId}
                />
            </div>
        )
    )
}

export default DetailOverview
