// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { Embedded, Vendor } from '@/object-types'
import { SW360_API_URL } from '@/utils/env'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { QuickFilter, Table, _ } from 'next-sw360'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Spinner } from 'react-bootstrap'
import { FaTrashAlt } from 'react-icons/fa'
import { FiEdit2 } from 'react-icons/fi'
import { IoMdGitMerge } from 'react-icons/io'

type EmbeddedVendors = Embedded<Vendor, 'sw360:vendors'>

export default function VendorsList() {
    const t = useTranslations('default')
    const router = useRouter()
    const { data: session, status } = useSession()

    const [numVendors, setNumVendors] = useState<null | number>(null)

    const handleAddVendor = () => {
        router.push('/admin/vendors/add')
    }

    const columns = [
        {
            id: 'vendors.fullName',
            name: t('Full Name'),
            formatter: (name: string) =>
                _(
                    <>
                        <Link href='#' className='text-link'>
                            {name}
                        </Link>
                    </>
                ),
            sort: true,
        },
        {
            id: 'vendors.shortName',
            name: t('Short Name'),
            sort: true,
        },
        {
            id: 'vendors.url',
            name: t('URL'),
            sort: true,
        },
        {
            id: 'vendors.actions',
            name: t('Actions'),
            width: '8%',
            formatter: () =>
                _(
                    <div className='d-flex justify-content-between'>
                        <Link href='#' className='text-link'>
                            <FiEdit2 className='btn-icon' />
                        </Link>
                        <FaTrashAlt className='btn-icon' />
                        <IoMdGitMerge className='btn-icon' />
                    </div>
                ),
            sort: true,
        },
    ]

    const server = {
        url: `${SW360_API_URL}/resource/api/vendors`,
        then: (data: EmbeddedVendors) => {
            setNumVendors(data.page.totalElements)
            return data._embedded['sw360:vendors'].map((elem: Vendor) => [
                elem.fullName ?? '',
                elem.shortName ?? '',
                elem.url ?? '',
            ])
        },
        total: (data: EmbeddedVendors) => data.page.totalElements,
        headers: { Authorization: `${status === 'authenticated' ? session.user.access_token : ''}` },
    }

    return (
        <>
            <div className='container page-content'>
                <div className='row'>
                    <div className='col-lg-2'>
                        <QuickFilter id='vendorSearch' />
                    </div>
                    <div className='col-lg-10'>
                        <div className='row d-flex justify-content-between ms-1'>
                            <div className='col-lg-5'>
                                <button className='btn btn-primary col-auto me-2' onClick={handleAddVendor}>
                                    {t('Add Vendor')}
                                </button>
                                <button className='btn btn-secondary col-auto'>{t('Export Spreadsheet')}</button>
                            </div>
                            <div className='col-auto buttonheader-title'>{`${t('VENDORS')} (${numVendors ?? ''})`}</div>
                        </div>
                        {status === 'authenticated' ? (
                            <Table columns={columns} server={server} selector={true} sort={false} />
                        ) : (
                            <div className='col-12 d-flex justify-content-center align-items-center'>
                                <Spinner className='spinner' />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
