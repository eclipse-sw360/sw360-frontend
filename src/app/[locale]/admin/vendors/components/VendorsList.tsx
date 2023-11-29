// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useTranslations } from 'next-intl'
import { QuickFilter } from 'next-sw360'
import { useRouter } from 'next/navigation'

export default function VendorsList() {
    const t = useTranslations('default')
    const router = useRouter()

    const handleAddVendor = () => {
        router.push('/admin/vendors/add')
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
                            <div className='col-auto buttonheader-title'>{`${t('VENDORS')} ()`}</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
