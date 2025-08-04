// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { AccessControl } from '@/components/AccessControl/AccessControl'
import { Embedded, LicensePayload, UserGroupType } from '@/object-types'
import DownloadService from '@/services/download.service'
import MessageService from '@/services/message.service'
import { CommonUtils } from '@/utils'
import { SW360_API_URL } from '@/utils/env'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { PageButtonHeader, QuickFilter, Table, _ } from 'next-sw360'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import React, { ReactNode, useEffect, useState } from 'react'
import { BsCheck2Circle, BsXCircle } from 'react-icons/bs'

function LicensePage(): ReactNode {
    const params = useSearchParams()
    const searchParams = Object.fromEntries(params)
    const t = useTranslations('default')
    const [search, setSearch] = useState({})
    const [numberLicense, setNumberLicense] = useState(0)
    const { data: session, status } = useSession()
    const deleteLicense = params.get('delete')

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [status])

    useEffect(() => {
        if (!CommonUtils.isNullEmptyOrUndefinedString(deleteLicense)) {
            MessageService.success(t('License removed successfully'))
        }
    }, [params])

    const handleExportLicense = () => {
        DownloadService.download(`reports?module=licenses`, session, `Licenses.xlsx`)
    }

    const headerButtons = {
        'Add License': { link: '/licenses/add', type: 'primary', name: t('Add License') },
        'Export Spreadsheet': {
            link: '/licenses',
            onClick: handleExportLicense,
            type: 'secondary',
            name: t('Export Spreadsheet'),
        },
    }

    const server = {
        url: CommonUtils.createUrlWithParams(`${SW360_API_URL}/resource/api/licenses`, searchParams),
        then: (data: Embedded<LicensePayload, 'sw360:licenses'>) => {
            setNumberLicense(data.page ? data.page.totalElements : 0)
            return data._embedded['sw360:licenses'].map((item: LicensePayload) => [
                item._links?.self.href.split('/').pop(),
                item.fullName,
                _(
                    <center>
                        {item.checked === true ? (
                            <BsCheck2Circle
                                color='#287d3c'
                                size='16'
                            />
                        ) : (
                            <BsXCircle color='#da1414' />
                        )}
                    </center>,
                ),
                _(<>{item.licenseType ? item.licenseType.licenseType : '--'}</>),
            ])
        },
        total: (data: Embedded<LicensePayload, 'sw360:licenses'>) => (data.page ? data.page.totalElements : 0),
        headers: { Authorization: `${status === 'authenticated' ? session.user.access_token : ''}` },
    }

    const columns = [
        {
            name: t('License Shortname'),
            formatter: (id: string) =>
                _(
                    <Link
                        href={`/licenses/detail?id=${id}`}
                        className='link'
                    >
                        {id}
                    </Link>,
                ),
            sort: true,
        },
        { name: t('License Fullname'), width: '45%', sort: true },
        { name: t('Is Checked'), width: '10%', sort: true },
        { name: t('License Type'), width: '15%', sort: true },
    ]

    const doSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
        setSearch({ keyword: event.currentTarget.value })
    }
    if (status === 'unauthenticated') {
        return signOut()
    } else {
        return (
            <div className='container page-content'>
                <div className='row'>
                    <div className='col-2 sidebar'>
                        <QuickFilter
                            id='licensefilter'
                            title={t('Quick Filter')}
                            searchFunction={doSearch}
                        />
                    </div>
                    <div className='col col-10'>
                        <div className='col'>
                            <div className='row'>
                                <PageButtonHeader
                                    buttons={headerButtons}
                                    title={`${t('Licenses')} (${numberLicense})`}
                                />
                                <Table
                                    server={server}
                                    columns={columns}
                                    search={search}
                                    selector={true}
                                />

                                <div className='row mt-2'></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
// export default LicensePage
// Pass notAllowedUserGroups to AccessControl to restrict access
export default AccessControl(LicensePage, [UserGroupType.SECURITY_USER])
