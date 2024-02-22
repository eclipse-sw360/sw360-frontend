// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import { HttpStatus, LicenseDetail, LicensePayload, ToastData } from '@/object-types'
import { ApiUtils } from '@/utils/index'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { ToastMessage } from 'next-sw360'
import { useRouter } from 'next/navigation'
import { Dispatch, SetStateAction, useState } from 'react'
import { Button, ToastContainer } from 'react-bootstrap'
import styles from '../detail.module.css'
import { FiCheckCircle } from 'react-icons/fi'
import { BiXCircle } from 'react-icons/bi'
import { BsXCircle } from 'react-icons/bs'

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

    const [toastData, setToastData] = useState<ToastData>({
        show: false,
        type: '',
        message: '',
        contextual: '',
    })

    const alert = (show_data: boolean, status_type: string, message: string, contextual: string) => {
        setToastData({
            show: show_data,
            type: status_type,
            message: message,
            contextual: contextual,
        })
    }

    const updateExternalLicenseLink = async () => {
        const response = await ApiUtils.PATCH(`licenses/${license.shortName}`, license, session.user.access_token)
        if (response.status == HttpStatus.OK) {
            const data = (await response.json()) as LicenseDetail
            alert(true, 'Success', t('Update External Link Success!'), 'success')
            router.push('/licenses/detail?id=' + data.shortName)
        } else {
            alert(true, 'Fail', t('Update External Link Failed!'), 'danger')
        }
    }

    return (
        <div className='col'>
            <ToastContainer position='top-start'>
                <ToastMessage
                    show={toastData.show}
                    type={toastData.type}
                    message={toastData.message}
                    contextual={toastData.contextual}
                    onClose={() => setToastData({ ...toastData, show: false })}
                    setShowToast={setToastData}
                />
            </ToastContainer>
            {!license.checked && (
                <div
                    className='alert'
                    style={{ backgroundColor: '#feefef', borderColor: '#f48989', color: '#da1414', fontSize: '14px' }}
                >
                    {t('This license is')} <b>UNCHECKED</b>
                </div>
            )}
            <table className={`table label-value-table ${styles['summary-table']}`}>
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
                                    style={{ marginLeft: '20px', backgroundColor: 'white' }}
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
