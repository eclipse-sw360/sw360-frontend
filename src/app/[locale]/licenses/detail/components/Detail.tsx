// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import { HttpStatus, LicenseDetail } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils/index'
import { getSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Dispatch, ReactNode, SetStateAction } from 'react'
import { Button } from 'react-bootstrap'
import { BiXCircle } from 'react-icons/bi'
import { FiCheckCircle } from 'react-icons/fi'
import styles from '../detail.module.css'

interface Props {
    license: LicenseDetail
    setLicense: Dispatch<SetStateAction<LicenseDetail | undefined>>
}

const Detail = ({ license, setLicense }: Props): ReactNode => {
    const t = useTranslations('default')
    const router = useRouter()

    const hanldeExternalLicenseLink = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLicense({
            ...license,
            externalLicenseLink: e.target.value,
        })
    }

    const updateExternalLicenseLink = async () => {
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) {
            MessageService.error(t('Session has expired'))
            return
        }
        const response = await ApiUtils.PATCH(`licenses/${license.shortName}`, license, session.user.access_token)
        if (response.status === HttpStatus.OK) {
            const data = (await response.json()) as LicenseDetail
            MessageService.success(t('Update external link success'))
            router.push('/licenses/detail?id=' + data.shortName)
        } else {
            MessageService.error(t('Update external link failed'))
        }
    }

    return (
        <div className='col'>
            {license.checked === false && (
                <div className={`alert ${styles['isChecked']}`}>
                    {t('This license is')} <b>UNCHECKED</b>
                </div>
            )}
            <table className='table summary-table'>
                <thead>
                    <tr>
                        <th colSpan={2}>{t('License Details')}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{t('Full Name')}:</td>
                        <td>{license.fullName ?? ''}</td>
                    </tr>
                    <tr>
                        <td>{t('Short Name')}:</td>
                        <td>{license.shortName ?? ''}</td>
                    </tr>
                    <tr>
                        <td>{t('Is Checked')}:</td>
                        <td>
                            {' '}
                            {license.checked === true ? (
                                <span style={{ color: '#287d3c' }}>
                                    <FiCheckCircle />
                                </span>
                            ) : (
                                <span style={{ color: 'red' }}>
                                    <BiXCircle color='red' />
                                </span>
                            )}
                        </td>
                    </tr>
                    <tr>
                        <td>{t('Type')}:</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td>{t('OSI Approved')}:</td>
                        <td>
                            {' '}
                            {license.OSIApproved === 'YES' ? (
                                <span style={{ color: '#287d3c' }}>
                                    <FiCheckCircle /> {t('Yes')}
                                </span>
                            ) : (
                                <span style={{ color: 'red' }}>
                                    <BiXCircle color='red' /> {t('NA')}
                                </span>
                            )}
                        </td>
                    </tr>
                    <tr>
                        <td>{t('FSF Free Libre')}:</td>
                        <td>
                            {' '}
                            {license.FSFLibre === 'YES' ? (
                                <span style={{ color: '#287d3c' }}>
                                    <FiCheckCircle /> {t('Yes')}
                                </span>
                            ) : (
                                <span style={{ color: 'red' }}>
                                    <BiXCircle color='red' /> {t('NA')}
                                </span>
                            )}
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <p style={{ marginTop: '0.5rem' }}>{t('External link for more information')}:</p>
                        </td>
                        <td>
                            <div style={{ display: 'flex' }}>
                                <input
                                    style={{ width: 'auto' }}
                                    type='text'
                                    className='form-control'
                                    id='name'
                                    name='externalLicenseLink'
                                    aria-describedby='name'
                                    value={license.externalLicenseLink ?? ''}
                                    onChange={hanldeExternalLicenseLink}
                                />
                                <Button
                                    variant='secondary'
                                    className={`${styles['button-save']}`}
                                    type='submit'
                                    onClick={() => void updateExternalLicenseLink()}
                                >
                                    {t('Save')}
                                </Button>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>{t('Note')}:</td>
                        <td>{license.note ?? ''}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}

export default Detail
