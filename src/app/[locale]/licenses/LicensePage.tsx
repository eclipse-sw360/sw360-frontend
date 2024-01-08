// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'
import { Spinner } from 'react-bootstrap'
import { BsCheck2Circle, BsXCircle } from 'react-icons/bs'

import { Embedded, HttpStatus, Licenses } from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils'
import { PageButtonHeader, QuickFilter, Table, _ } from 'next-sw360'

type EmbeddedLicenses = Embedded<Licenses, 'sw360:licenses'>

function LicensesPage() {
    const params = useSearchParams()
    const t = useTranslations('default')
    const [search, setSearch] = useState({})
    const [loading, setLoading] = useState(true)
    const [licenseData, setLicenseData] = useState([])
    const { data: session } = useSession()

    const headerButtons = {
        'Add License': { link: '/licenses/add', type: 'primary', name: t('Add License') },
        'Export Spreadsheet': { link: '/licenses/export', type: 'secondary', name: t('Export Spreadsheet') },
    }

    const fetchData: any = useCallback(
        async (queryUrl: string, signal: unknown) => {
            const licensesResponse = await ApiUtils.GET(queryUrl, session.user.access_token, signal)
            if (licensesResponse.status == HttpStatus.OK) {
                const licenses = await licensesResponse.json()
                return licenses
            } else if (licensesResponse.status == HttpStatus.UNAUTHORIZED) {
                signOut()
            } else {
                return []
            }
        },
        [session]
    )

    useEffect(() => {
        setLoading(true)
        const searchParams = Object.fromEntries(params)
        const queryUrl = CommonUtils.createUrlWithParams('licenses', searchParams)
        const controller = new AbortController()
        const signal = controller.signal

        fetchData(queryUrl, signal).then((licenses: EmbeddedLicenses) => {
            if (!CommonUtils.isNullOrUndefined(licenses['_embedded']['sw360:licenses'])) {
                setLicenseData(
                    licenses['_embedded']['sw360:licenses'].map((item: Licenses) => [
                        _(<Link href={item._links.self.href}>{item._links.self.href.split('/').pop()}</Link>),
                        item.fullName,
                        _(
                            <center>
                                {item.checked ? (
                                    <BsCheck2Circle color='#287d3c' size='16' />
                                ) : (
                                    <BsXCircle color='red' />
                                )}
                            </center>
                        ),
                    ])
                )
                // setNumberOfComponent(data.length)
                setLoading(false)
            }
        })

        return () => {
            controller.abort()
        }
    }, [fetchData, params])

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
        <div className='container page-content'>
            <div className='row'>
                <div className='col-2 sidebar'>
                    <QuickFilter id='licensefilter' title={t('Quick Filter')} searchFunction={doSearch} />
                </div>
                <div className='col'>
                    <div className='row'>
                        <PageButtonHeader buttons={headerButtons} title={`${t('Licenses')} (${licenseData.length})`} />
                        {loading == false ? (
                            <Table data={licenseData} columns={columns} sort={true} search={search} selector={true} />
                        ) : (
                            <div className='col-12d-flex justify-content-center align-items-center'>
                                <Spinner className='spinner' />
                            </div>
                        )}
                        <div className='row mt-2'></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LicensesPage
