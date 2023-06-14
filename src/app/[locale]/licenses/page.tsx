// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import Link from 'next/link'

import { _ } from 'gridjs-react'
import { useTranslations } from 'next-intl'
import { COMMON_NAMESPACE } from '@/object-types/Constants'
import { Check2Circle, XCircle } from 'react-bootstrap-icons'

// SW360 Functions
import { sw360FetchData } from '@/utils/sw360fetchdata'

// SW360 Components
import PageButtonHeader from '@/components/sw360/PageButtonHeader/PageButtonHeader'
import QuickFilter from '@/components/sw360/QuickFilter/QuickFilter'
import SW360Table from '@/components/sw360/SW360Table/SW360Table'
import { useRef } from 'react'

interface LicenseType {
    fullName: string
    checked: boolean
    _links: { self: { href: string } }
}

const buttons = {
    'Add License': { link: '/licenses/add', type: 'primary' },
    'Export Spreadsheet': { link: '/licenses/export', type: 'secondary' },
}

async function LicensesPage() {
    const t = useTranslations(COMMON_NAMESPACE)
    const search = { keyword: '' }

    const limit = 10
    const noRecordsFound = t('No Records Found')
    const columns = [
        { name: t('License Shortname'), width: '25%' },
        { name: t('License Fullname'), width: '45%' },
        { name: t('Is Checked'), width: '10%' },
        { name: t('License Type'), width: '15%' },
    ]
    const fetchData = (await sw360FetchData('/licenses', 'licenses')) as LicenseType[]

    let data: any[] = []
    if (fetchData !== null) {
        data = fetchData.map((item) => [
            _(<Link href={item._links.self.href}>{item._links.self.href.split('/').pop()}</Link>),
            item.fullName,
            _(<center>{item.checked ? <Check2Circle color='#287d3c' size='16' /> : <XCircle color='red' />}</center>),
        ])
    }

    const doSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
        console.log(event.currentTarget.value)
        search.keyword = event.currentTarget.value
    }

    return (
        <div className='container' style={{ maxWidth: '98vw', marginTop: '10px' }}>
            <div className='row'>
                <div className='col-2 sidebar'>
                    <QuickFilter searchFunction={doSearch} />
                </div>
                <div className='col col-sm-9'>
                    <div className='col'>
                        <div className='row'>
                            <PageButtonHeader buttons={buttons} title='Licenses (0)' />
                            <div className='row mt-2'>
                                <SW360Table
                                    data={data}
                                    columns={columns}
                                    limit={limit}
                                    noRecordsFound={noRecordsFound}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LicensesPage
