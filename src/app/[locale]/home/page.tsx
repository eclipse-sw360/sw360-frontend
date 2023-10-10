// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useSession } from 'next-auth/react'

import MyProjectsWidget from './components/MyProjectsWidget'
import MyComponentsWidget from './components/MyComponentsWidget'
import MyTaskAssignmentsWidget from './components/MyTaskAssignmentsWidget'
import MyTaskSubmissionsWidget from './components/MyTaskSubmissionsWidget'
import MySubscriptionsWidget from './components/MySubscriptionsWidget'
import RecentComponentsWidget from './components/RecentComponentsWidget'
import RecentReleasesWidget from './components/RecentReleasesWidget'

function HomePage() {
    const { status } = useSession()

    if (status === 'unauthenticated') {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        }
    }

    return (
        <div className='content-container container-fluid homePage'>
            <div className='row'>
                <div className='col col-md-10'>
                    <div className='row'>
                        <div className='col-sm' id='sw360_table_col'>
                            <MyProjectsWidget />
                        </div>
                        <div className='col-sm' id='sw360_table_col'>
                            <MyComponentsWidget />
                        </div>
                    </div>
                    <div className='row'>
                        <div className='col-sm' id='sw360_table_col'>
                            <MyTaskAssignmentsWidget />
                        </div>
                        <div className='col-sm' id='sw360_table_col'>
                            <MyTaskSubmissionsWidget />
                        </div>
                    </div>
                </div>
                <div className='col col-md-2'>
                    <div className='col-sm' id='sw360_table_col'>
                        <MySubscriptionsWidget />
                    </div>
                    <div className='col-sm' id='sw360_table_col'>
                        <RecentComponentsWidget />
                    </div>
                    <div className='col-sm' id='sw360_table_col'>
                        <RecentReleasesWidget />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HomePage
