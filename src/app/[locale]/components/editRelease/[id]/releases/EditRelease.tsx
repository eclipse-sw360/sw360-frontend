// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import { PageButtonHeader, SideBar } from '@/components/sw360'
import { Session } from '@/object-types/Session'
import CommonTabIds from '@/object-types/enums/CommonTabsIds'
import { useState } from 'react'
import ReleaseEditTabs from './ReleaseEditTabs'
import ReleaseEditSummary from './ReleaseEditSummary'

interface Props {
    session?: Session
    releaseId?: string
}

const EditRelease = ({ session, releaseId }: Props) => {
    const [selectedTab, setSelectedTab] = useState<string>(CommonTabIds.SUMMARY)
    const [tabList, setTabList] = useState(ReleaseEditTabs.WITH_COMMERCIAL_DETAILS)
    const headerButtons = {
        'Update Release': { link: '', type: 'primary' },
        'Delete Release': {
            link: '/releases/detail/' + releaseId,
            type: 'danger',
        },
        Cancel: { link: '/releases/detail/' + releaseId, type: 'secondary' },
    }

    return (
        <>
            {' '}
            <div className='container' style={{ maxWidth: '98vw', marginTop: '10px' }}>
                <div className='row'>
                    <div className='col-2 sidebar'>
                        <SideBar selectedTab={selectedTab} setSelectedTab={setSelectedTab} tabList={tabList} />
                    </div>
                    <div className='col'>
                        <div className='row' style={{ marginBottom: '20px' }}>
                            <PageButtonHeader buttons={headerButtons} title='releaseName'></PageButtonHeader>
                        </div>
                        <div className='row' hidden={selectedTab !== CommonTabIds.SUMMARY ? true : false}>
                            <ReleaseEditSummary />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default EditRelease
