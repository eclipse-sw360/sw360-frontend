// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { Vendor } from '@/object-types'
import { useTranslations } from 'next-intl'
import { Dispatch, SetStateAction, type JSX } from 'react';

export default function VendorDetailForm({
    payload,
    setPayload,
}: {
    payload: Vendor
    setPayload: Dispatch<SetStateAction<Vendor | null>>
}): JSX.Element {
    const t = useTranslations('default')

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
        setPayload((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    }

    return (
        <>
            <div className='row mb-4 mx-0'>
                <div className='row header mb-2 pb-2 px-2'>
                    <h6>{t('Edit Vendor')}</h6>
                </div>
                <div className='row mb-3'>
                    <div className='col-lg-4'>
                        <label htmlFor='vendor.fullName' className='form-label fw-medium'>
                            {t('Full Name')}{' '}
                            <span className='text-red' style={{ color: '#F7941E' }}>
                                *
                            </span>
                        </label>
                        <input
                            type='text'
                            name='fullName'
                            value={payload.fullName ?? ''}
                            onChange={handleChange}
                            className='form-control'
                            id='vendor.fullName'
                            placeholder={t('Enter vendor full name')}
                            required
                        />
                    </div>
                    <div className='col-lg-4'>
                        <label htmlFor='vendor.shortName' className='form-label fw-medium'>
                            {t('Short Name')}{' '}
                            <span className='text-red' style={{ color: '#F7941E' }}>
                                *
                            </span>
                        </label>
                        <input
                            type='text'
                            name='shortName'
                            value={payload.shortName ?? ''}
                            onChange={handleChange}
                            className='form-control'
                            id='vendor.shortName'
                            placeholder={t('Enter vendor short name')}
                            required
                        />
                    </div>
                    <div className='col-lg-4'>
                        <label htmlFor='vendor.url' className='form-label fw-medium'>
                            {t('URL')}{' '}
                            <span className='text-red' style={{ color: '#F7941E' }}>
                                *
                            </span>
                        </label>
                        <input
                            type='url'
                            name='url'
                            value={payload.url ?? ''}
                            onChange={handleChange}
                            className='form-control'
                            id='vendor.url'
                            placeholder={t('Enter vendor url')}
                            required
                        />
                    </div>
                </div>
            </div>
        </>
    )
}
