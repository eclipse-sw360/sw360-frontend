// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import { LicensePayload } from '@/object-types'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { ReactNode, useEffect } from 'react'
import styles from './LicenseDetails.module.css'

interface Props {
    inputValid: boolean
    licensePayload: LicensePayload
    setLicensePayload: React.Dispatch<React.SetStateAction<LicensePayload>>
}

const EditLicenseText = ({ licensePayload, setLicensePayload, inputValid }: Props): ReactNode => {
    const t = useTranslations('default')
    const { status } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [status])

    const updateField = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setLicensePayload({
            ...licensePayload,
            [e.target.name]: e.target.value,
        })
    }

    return (
        <div
            className='row mb-4'
            style={{ padding: '0px 12px' }}
        >
            <div
                className={`${styles['header']} mb-1`}
                style={{ paddingTop: '0.5rem', height: '45px' }}
            >
                <p
                    className='fw-bold mt-1'
                    style={{ fontSize: '0.875rem' }}
                >
                    {t('License Text')}
                </p>
            </div>
            <div style={{ backgroundColor: '#FFF', borderBottom: '1px solid #DCDCDC' }}>
                <div
                    className='row'
                    style={{ paddingBottom: '0.7rem' }}
                >
                    <div className='col-12'>
                        <textarea
                            style={{ height: '500px' }}
                            className={`form-control ${inputValid ? 'is-valid' : ''}`}
                            placeholder='Enter the license-text here...'
                            id='text'
                            aria-describedby='fullnatextme'
                            name='text'
                            value={licensePayload.text ?? ''}
                            onChange={updateField}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EditLicenseText
