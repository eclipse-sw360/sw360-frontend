// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import { HttpStatus, LicenseDetail, LicensePayload } from '@/object-types'
import { ApiUtils } from '@/utils/index'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Dispatch, SetStateAction } from 'react'
import { Button } from 'react-bootstrap'
import styles from '../detail.module.css'
import { FiCheckCircle } from 'react-icons/fi'
import { BiXCircle } from 'react-icons/bi'
import { BsXCircle } from 'react-icons/bs'
import MessageService from '@/services/message.service'

interface Props {
    license: LicensePayload
    setLicense: Dispatch<SetStateAction<LicensePayload>>
}

const Detail = ({ license, setLicense }: Props) => {
    const t = useTranslations('default')
    const { data: session } = useSession()
    const router = useRouter()

    const hanldeExternalLicenseLink = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLicense({
            ...license,
            externalLicenseLink: e.target.value,
        })
    }

    const updateExternalLicenseLink = async () => {
        const response = await ApiUtils.PATCH(`licenses/${license.shortName}`, license, session.user.access_token)
        if (response.status == HttpStatus.OK) {
            const data = (await response.json()) as LicenseDetail
            MessageService.success(t('Update External Link Success!'))
            router.push('/licenses/detail?id=' + data.shortName)
        } else {
            MessageService.error(t('Update External Link Failed!'))
        }
    }

    return (
        <div className='col'>
            {!license.checked && (
                <div
                    className={`alert ${styles['isChecked']}`}
                >
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
                        <td>{t('Fullname')}:</td>
                        <td>{license.fullName ?? ''}</td>
                    </tr>
                    <tr>
                        <td>{t('Shortname')}:</td>
                        <td>{license.shortName ?? ''}</td>
                    </tr>
                    <tr>
                        <td>{t('Is checked')}:</td>
                        <td>
                            {' '}
                            {license && license.checked == true ? (
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
                        <td>{license.licenseType?.licenseType ?? ''}</td>
                    </tr>
                    <tr>
                        <td>{t('OSI Approved?')}:</td>
                        <td>
                            {' '}
                            {license && license.OSIApproved == 'YES' ? (
                                <span style={{ color: '#287d3c' }}>
                                    <FiCheckCircle /> {t('Yes')}
                                </span>
                            ) : (
                                <span style={{ color: 'red' }}>
                                    <BiXCircle color='red' /> {t('(n/a)')}
                                </span>
                            )}
                        </td>
                    </tr>
                    <tr>
                        <td>{t('FSF Free/Libre?')}:</td>
                        <td>
                            {' '}
                            {license && license.FSFLibre == 'YES' ? (
                                <span style={{ color: '#287d3c' }}>
                                    <FiCheckCircle /> {t('Yes')}
                                </span>
                            ) : (
                                <span style={{ color: 'red' }}>
                                    <BsXCircle color='red' /> {t('(n/a)')}
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
                                    onClick={updateExternalLicenseLink}
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
