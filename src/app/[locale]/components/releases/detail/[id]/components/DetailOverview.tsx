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
import Link from 'next/link'
import styles from '../detail.module.css'

import Summary from './Summary'
import LinkedReleases from './LinkedReleases'
import ECCDetails from './ECCDetails'

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
                return release
            })
            .then((release: any) => {
                fetchData(`components/${release._links['sw360:component'].href.split('/').at(-1)}`).then((component: any) => {
                    (component) && setReleasesSameComponentt(
                        CommonUtils.isNullOrUndefined(component['_embedded']['sw360:releases'])
                            ? []
                            : component['_embedded']['sw360:releases']
                    )
                })
            })

    }, [releaseId])
    

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
                            eccStatus={release.eccInformation.eccStatus}
                        />
                    </div>
                    <div className='col'>
                        <div className='row' style={{ marginBottom: '20px' }}>
                            <PageButtonHeader title={`${release.name} ${release.version}`} buttons={headerButtons}>
                                <div style={{ marginLeft: '5px'}} className='btn-group' role='group'>
                                    <Dropdown>
                                        <Dropdown.Toggle variant='primary'>
                                            {`${t('Version')} ${release.version}`}
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            {
                                                Object.entries(releasesSameComponent).map(([index, item]: any) =>
                                                    <Dropdown.Item key={index} className={styles['dropdown-item']}>
                                                        <Link href={`components/releases/detail/${item._links.self.href.split('/').at(-1)}`}>
                                                            {`${t('Version')} ${item.version}`}
                                                        </Link>
                                                    </Dropdown.Item>)
                                            }
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>
                            </PageButtonHeader>
                        </div>
                        <div className='row' hidden={selectedTab !== CommonTabIds.SUMMARY ? true : false}>
                            <Summary release={release} releaseId={releaseId} />
                        </div>
                        <div className='row' hidden={selectedTab !== ReleaseTabIds.LINKED_RELEASES ? true : false}>
                            <LinkedReleases release={release}/>
                        </div>
                        <div className='row' hidden={selectedTab !== ReleaseTabIds.ECC_DETAILS ? true : false}>
                            <ECCDetails release={release}/>
                        </div>
                    </div>
                </div>
            </div>
        )
    )
}

export default DetailOverview
