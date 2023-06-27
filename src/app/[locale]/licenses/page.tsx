// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import React, { useEffect, useState, useRef } from 'react'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { COMMON_NAMESPACE } from '@/object-types/Constants'
import { Check2Circle, XCircle } from 'react-bootstrap-icons'

// SW360 Functions
import { sw360FetchData } from '@/utils/sw360fetchdata'

// SW360 Components
import { _, PageButtonHeader, QuickFilter, Table } from '@/components/sw360'
import { UrlObject } from 'url'

const buttons = {
    'Add License': { link: '/licenses/add', type: 'primary' },
    'Export Spreadsheet': { link: '/licenses/export', type: 'secondary' },
}

function LicensesPage() {
    const [data, setData] = useState([])
    const [search, setSearch] = useState({})

    useEffect(() => {
        const fetchData = async () => {
            const data = await sw360FetchData('/licenses', 'licenses')
            setData(
                data.map((item: { _links: { self: { href: string } }; fullName: string; checked: boolean }) => [
                    _(<Link href={item._links.self.href}>{item._links.self.href.split('/').pop()}</Link>),
                    item.fullName,
                    _(
                        <center>
                            {item.checked ? <Check2Circle color='#287d3c' size='16' /> : <XCircle color='red' />}
                        </center>
                    ),
                ])
            )
        }
        fetchData()
    }, [])

    const t = useTranslations(COMMON_NAMESPACE)

    const columns = [
        { name: t('License Shortname'), width: '25%' },
        { name: t('License Fullname'), width: '45%' },
        { name: t('Is Checked'), width: '10%' },
        { name: t('License Type'), width: '15%' },
    ]

    const doSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
        setSearch({ keyword: event.currentTarget.value })
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
                            <PageButtonHeader buttons={buttons} title={`${t('Licenses')} (${data.length})`} />
                            <div className='row mt-2'>
                                <Table
                                    data={data}
                                    columns={columns}
                                    sort={true}
                                    search={search}
                                    selector={true}
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
