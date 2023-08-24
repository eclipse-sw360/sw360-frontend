// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import { useCallback, useEffect, useState } from 'react'

import CommonTabIds from '@/object-types/enums/CommonTabsIds'
import { Session } from '@/object-types/Session'
import { SideBar, PageButtonHeader } from '@/components/sw360'
import ReleaseTabIds from '@/object-types/enums/ReleaseTabIds'
import { notFound } from 'next/navigation'
import ApiUtils from '@/utils/api/api.util'
import HttpStatus from '@/object-types/enums/HttpStatus'
import { signOut } from 'next-auth/react'
import ReleaseAddSummary from './ReleaseAddSummary'
import ReleaseAddTabs from './ReleaseAddTab'
import AddCommercialDetails from '@/components/CommercialDetails/AddCommercialDetails'
import LinkedReleases from '@/components/LinkedReleases/LinkedRelesaes'

interface Props {
    session?: Session
    componentId?: string
}

const AddRelease = ({ session, componentId }: Props) => {
    const [selectedTab, setSelectedTab] = useState<string>(CommonTabIds.SUMMARY)
    const [tabList, setTabList] = useState(ReleaseAddTabs.WITHOUT_COMMERCIAL_DETAILS)

    const fetchData: any = useCallback(
        async (url: string) => {
            const response = await ApiUtils.GET(url, session.user.access_token)
            if (response.status == HttpStatus.OK) {
                const data = await response.json()
                return data
            } else if (response.status == HttpStatus.UNAUTHORIZED) {
                signOut()
            } else {
                notFound()
            }
        },
        [session.user.access_token]
    )

    useEffect(() => {
        fetchData(`components/${componentId}`).then((component: any) => {
            if (component.componentType === 'COTS') {
                setTabList(ReleaseAddTabs.WITH_COMMERCIAL_DETAILS)
            }
        })
    }, [componentId, fetchData])

    const headerButtons = {
        'Create Release': { link: '', type: 'primary' },
        Cancel: { link: '/components/detail/' + componentId, type: 'secondary' },
    }

    return (
        <>
            <div className='container' style={{ maxWidth: '98vw', marginTop: '10px' }}>
                <div className='row'>
                    <div className='col-2 sidebar'>
                        <SideBar selectedTab={selectedTab} setSelectedTab={setSelectedTab} tabList={tabList} />
                    </div>
                    <div className='col'>
                        <div className='row' style={{ marginBottom: '20px' }}>
                            <PageButtonHeader buttons={headerButtons}></PageButtonHeader>
                        </div>
                        <div className='row' hidden={selectedTab !== CommonTabIds.SUMMARY ? true : false}>
                            <ReleaseAddSummary />
                        </div>
                        <div className='row' hidden={selectedTab != ReleaseTabIds.LINKED_RELEASES ? true : false}>
                            <LinkedReleases session={session} />
                        </div>
                        <div className='row' hidden={selectedTab != ReleaseTabIds.COMMERCIAL_DETAILS ? true : false}>
                            <AddCommercialDetails session={session} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AddRelease
