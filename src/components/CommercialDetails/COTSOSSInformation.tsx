// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import { useTranslations } from 'next-intl'
import styles from './CommercialDetails.module.css'
import { COMMON_NAMESPACE } from '@/object-types/Constants'

const COTSOSSInformation = () => {
    const t = useTranslations(COMMON_NAMESPACE)

    return (
        <>
            <div className='col' style={{ padding: '0px 12px' }}>
                <div className='row mb-4'>
                    <div className={`${styles['header']} mb-2`}>
                        <p className='fw-bold mt-3'>{t('COTS OSS Information')}</p>
                    </div>
                    <div className='row'>
                        <div className='col-lg-4'>
                            <label htmlFor='used_license' className='form-label fw-bold'>
                                {t('Used License')}
                            </label>
                            <input
                                type='text'
                                className='form-control'
                                placeholder='Enter used license'
                                id='used_license'
                                aria-describedby='used_license'
                                name='usedLicense'
                            />
                        </div>
                        <div className='col-lg-4'>
                            <div className='form-check'>
                                <input
                                    id='contains_OSS'
                                    type='checkbox'
                                    className='form-check-input'
                                    name='containsOSS'
                                />
                                <label className='form-label fw-bold' htmlFor='contains_OSS'>
                                    {t('Contains OSS')}
                                </label>
                            </div>
                        </div>
                        <div className='col-lg-4'>
                            <div className='form-check'>
                                <input
                                    id='OSS_contract_signed'
                                    type='checkbox'
                                    className='form-check-input'
                                    name='ossContractSigned'
                                />
                                <label className='form-label fw-bold' htmlFor='OSS_contract_signed'>
                                    {t('OSS Contract Signed')}
                                </label>
                            </div>
                        </div>
                    </div>
                    <hr className='my-2' />
                    <div className='row'>
                        <div className='col-lg-4'>
                            <label htmlFor='ossInformationURL' className='form-label fw-bold'>
                                {t('OSS Information URL')}
                            </label>
                            <input
                                type='text'
                                className='form-control'
                                placeholder='Enter URL'
                                id='ossInformationURL'
                                aria-describedby='ossInformationURL'
                                name='ossInformationURL'
                            />
                        </div>
                        <div className='col-lg-4'>
                            <div className='form-check'>
                                <input
                                    id='sourceCodeAvailable'
                                    type='checkbox'
                                    className='form-check-input'
                                    name='sourceCodeAvailable'
                                />
                                <label className='form-label fw-bold' htmlFor='sourceCodeAvailable'>
                                    {t('Source Code Available')}
                                </label>
                            </div>
                        </div>
                    </div>
                    <hr className='my-2' />
                </div>
            </div>
        </>
    )
}

export default COTSOSSInformation
