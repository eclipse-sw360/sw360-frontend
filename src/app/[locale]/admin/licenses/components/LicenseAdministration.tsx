// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { HttpStatus, ToastData } from '@/object-types'
import DownloadService from '@/services/download.service'
import { ApiUtils } from '@/utils'
import { getSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { ToastMessage } from 'next-sw360'
import { useRef, useState } from 'react'
import { ToastContainer } from 'react-bootstrap'
import DeleteAllLicenseInformationModal from './DeleteAllLicenseInformationModal'

export default function AddVendor() {
    const t = useTranslations('default')
    const file = useRef<File | undefined>()
    const [deleteAllLicenseInformationModal, showDeleteAllLicenseInformationModal] = useState(false)

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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.currentTarget.files && e.currentTarget.files.length === 0) {
            return
        }
        file.current = e.currentTarget.files[0]
    }

    const uploadLicenses = async () => {
        try {
            if (!file.current) {
                alert(true, 'Error', t('Please select a file'), 'danger')
                return
            }
            const formData = new FormData()
            formData.append('licenseFile', file.current, file.current.name)

            const session = await getSession()
            if (!session) {
                return signOut()
            }
            const response = await ApiUtils.POST('licenses/upload', formData, session.user.access_token)
            if (response.status === HttpStatus.UNAUTHORIZED) {
                signOut()
            } else if (response.status === HttpStatus.OK) {
                alert(true, 'Success', t('Licenses uploaded successfully'), 'success')
            } else {
                const data = await response.json()
                console.log(data)
                alert(true, 'Error', t('Something went wrong'), 'danger')
            }
        } catch (err) {
            console.error(err)
        }
    }

    const downloadLicenseArchive = async () => {
        try {
            const session = await getSession()
            if (!session) return signOut()
            DownloadService.download('licenses/downloadLicenses', session, `LicensesBackup.lics`)
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <>
            <DeleteAllLicenseInformationModal
                show={deleteAllLicenseInformationModal}
                setShow={showDeleteAllLicenseInformationModal}
            />
            <div className='mt-4 mx-5'>
                <div className='row'>
                    <div className='col-lg-8'>
                        <button
                            type='button'
                            className='btn btn-primary col-auto me-2'
                            onClick={downloadLicenseArchive}
                        >
                            {t('Download License Archive')}
                        </button>
                        <button type='button' className='btn btn-primary col-auto me-2'>
                            {t('Import SPDX Information')}
                        </button>
                        <button type='button' className='btn btn-primary col-auto me-2'>
                            {t('Import OSADL Information')}
                        </button>
                        <button
                            type='button'
                            className='btn btn-danger col-auto me-2'
                            onClick={() => showDeleteAllLicenseInformationModal(true)}
                        >
                            {t('Delete all License Information')}
                        </button>
                    </div>
                    <div className='col-lg-4 d-flex justify-content-end buttonheader-title'>
                        {t('License Administration')}
                    </div>
                </div>
                <div className='mt-4'>
                    <h5 className='licadmin-upload'>{t('Upload License Archive')}</h5>
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
                    <input type='file' onChange={handleFileChange} placeholder={t('Drop a File Here')} />
                    <div className='form-check mt-3'>
                        <input
                            id='overWriteIfExternalIdsMatch'
                            type='checkbox'
                            className='form-check-input'
                            name='overWriteIfExternalIdsMatch'
                        />
                        <label className='form-check-label fw-bold fs-6' htmlFor='overWriteIfExternalIdsMatch'>
                            {t('Overwrite if external ids match')}
                        </label>
                    </div>
                    <div className='form-check'>
                        <input
                            id='overWriteIfIdsMatch'
                            type='checkbox'
                            className='form-check-input'
                            name='overWriteIfIdsMatch'
                        />
                        <label className='form-check-label fw-bold' htmlFor='overWriteIfIdsMatch'>
                            {t('Overwrite if ids match')}
                        </label>
                    </div>
                    <button type='button' className='btn btn-secondary col-auto mt-3' onClick={uploadLicenses}>
                        {t('Upload Licenses')}
                    </button>
                </div>
            </div>
        </>
    )
}
