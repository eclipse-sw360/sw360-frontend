// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useTranslations } from 'next-intl'

import { ReleasePayload } from '@/object-types'

interface Props {
    releasePayload?: ReleasePayload
    setReleasePayload?: React.Dispatch<React.SetStateAction<ReleasePayload>>
}

const SupplementalInformation = ({ releasePayload, setReleasePayload }: Props) => {
    const t = useTranslations('default')

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
            <div className='col' style={{ padding: '0px 12px' }}>
                <div className='row mb-4'>
                    <div className='header mb-2'>
                        <p className='fw-bold mt-3'>{t('Supplemental Information')}</p>
                    </div>
                    <div className='row'>
                        <div className='col-lg-4'>
                            <label htmlFor='external_supplier_id' className='form-label fw-bold'>
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
                            <label htmlFor='count_security_vulnerabilities' className='form-label fw-bold'>
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
                    <hr className='my-2' />
                </div>
            </div>
        </>
    )
}

export default SupplementalInformation
