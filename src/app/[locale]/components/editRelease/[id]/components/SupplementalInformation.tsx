// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useTranslations } from 'next-intl'

import { Release } from '@/object-types'
import { signOut, useSession } from 'next-auth/react'
import { ReactNode, useEffect } from 'react'

interface Props {
    releasePayload: Release
    setReleasePayload: React.Dispatch<React.SetStateAction<Release>>
}

const SupplementalInformation = ({ releasePayload, setReleasePayload }: Props): ReactNode => {
    const t = useTranslations('default')
    const { status } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [status])

    const updateField = (e: React.ChangeEvent<HTMLInputElement>) => {
        setReleasePayload({
            ...releasePayload,
            clearingInformation: {
                ...releasePayload.clearingInformation,
                [e.target.name]: e.target.value,
            },
        })
    }

    return (
        <>
            <div
                className='col'
                style={{ padding: '0px 12px' }}
            >
                <div className='row mb-4'>
                    <div className='section-header mb-2'>
                        <span className='fw-bold'>{t('Supplemental Information')}</span>
                    </div>
                    <div className='row with-divider pt-2 pb-2'>
                        <div className='col-lg-4'>
                            <label
                                htmlFor='external_supplier_id'
                                className='form-label fw-bold'
                            >
                                {t('External Supplier ID')}
                            </label>
                            <input
                                type='text'
                                className='form-control'
                                placeholder='Enter External Supplier ID'
                                id='external_supplier_id'
                                aria-describedby='version'
                                required
                                name='externalSupplierID'
                                value={releasePayload.clearingInformation?.externalSupplierID ?? ''}
                                onChange={updateField}
                            />
                        </div>
                        <div className='col-lg-4'>
                            <label
                                htmlFor='count_security_vulnerabilities'
                                className='form-label fw-bold'
                            >
                                {t('Count of Security Vulnerabilities')}
                            </label>
                            <input
                                type='text'
                                className='form-control'
                                placeholder='Enter Count of Security Vulnerabilities'
                                id='count_security_vulnerabilities'
                                aria-describedby='version'
                                required
                                name='countOfSecurityVn'
                                value={releasePayload.clearingInformation?.countOfSecurityVn ?? ''}
                                onChange={updateField}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default SupplementalInformation
