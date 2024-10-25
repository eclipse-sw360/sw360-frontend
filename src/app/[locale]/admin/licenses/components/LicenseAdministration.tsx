// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { HttpStatus } from '@/object-types'
import DownloadService from '@/services/download.service'
import { ApiUtils } from '@/utils'
import { getSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useRef, useState, ReactNode } from 'react'
import DeleteAllLicenseInformationModal from './DeleteAllLicenseInformationModal'
import MessageService from '@/services/message.service'

export default function LicenseAdministration() : ReactNode {
    const t = useTranslations('default')
    const file = useRef<File | undefined>()
    const [deleteAllLicenseInformationModal, showDeleteAllLicenseInformationModal] = useState(false)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.currentTarget.files
        
        if (!files || files.length === 0) return
        
        file.current = files[0]
    }

    const uploadLicenses = async () => {
        try {
            if (!file.current) {
                MessageService.error(t('Please select a file'))
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
                await signOut()
            } else if (response.status === HttpStatus.OK) {
                MessageService.success(t('Licenses uploaded successfully'))
            } else {
                const data = await response.json() as object
                console.log(data)
                MessageService.error(t('Something went wrong'))
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
                            onClick={() => {downloadLicenseArchive().catch((e) => console.error(e))}}
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
                    <button type='button' className='btn btn-secondary col-auto mt-3' onClick={() => {uploadLicenses().catch((e) => console.error(e))}}>
                        {t('Upload Licenses')}
                    </button>
                </div>
            </div>
        </>
    )
}
