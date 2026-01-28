// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { StatusCodes } from 'http-status-codes'
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { ReactNode, RefObject, useEffect, useRef } from 'react'
import { BsDownload, BsUpload } from 'react-icons/bs'
import { ErrorDetails } from '@/object-types'
import DownloadService from '@/services/download.service'
import MessageService from '@/services/message.service'
import { ApiError, ApiUtils } from '@/utils'

export default function ImportExportComponent(): ReactNode {
    const t = useTranslations('default')
    const componentCsvFile = useRef<File | undefined>(undefined)
    const componentsAttachmentFile = useRef<File | undefined>(undefined)
    const releaseLinksFile = useRef<File | undefined>(undefined)
    const licenseArchiveFile = useRef<File | undefined>(undefined)
    const { status } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [
        status,
    ])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, file: RefObject<File | undefined>) => {
        const files = e.currentTarget.files

        if (!files || files.length === 0) return

        file.current = files[0]
    }

    const handleDownload = async (
        url: string,
        filename: string,
        headers: {
            [key: string]: string
        },
    ) => {
        try {
            const session = await getSession()
            await DownloadService.download(url, session, filename, headers)
        } catch (error) {
            ApiUtils.reportError(error)
        }
    }

    const handleUpload = async (url: string, formDataField: string, file: RefObject<File | undefined>) => {
        try {
            if (!file.current) {
                MessageService.error(t('Please select a file'))
                return
            }
            const formData = new FormData()
            formData.append(formDataField, file.current, file.current.name)

            const session = await getSession()
            if (!session) {
                return signOut()
            }
            const response = await ApiUtils.POST(url, formData, session.user.access_token)
            if (response.status !== StatusCodes.OK) {
                const err = (await response.json()) as ErrorDetails
                throw new ApiError(err.message, {
                    status: response.status,
                })
            }
            MessageService.success(t('File uploaded successfully'))
        } catch (error: unknown) {
            ApiUtils.reportError(error)
        }
    }

    return (
        <div className='mx-5 my-3'>
            <div className='col-auto buttonheader-title'>{t('Import Export')}</div>
            <div className='row'>
                <div className='col'>
                    <h6 className='border-bottom fw-bold text-uppercase text-blue border-blue mb-2'>{t('Export')}</h6>
                    <div className='mb-2'>
                        <button
                            className='btn btn-secondary w-50 text-start'
                            onClick={() =>
                                handleDownload('importExport/downloadComponent', 'components.csv', {
                                    Accept: 'text/plain',
                                })
                            }
                        >
                            <BsDownload size={20} /> {t('Download Component CSV')}
                        </button>
                    </div>
                    <div className='mb-2'>
                        <button
                            className='btn btn-secondary w-50 text-start'
                            onClick={() =>
                                handleDownload('importExport/downloadComponentTemplate', 'component_template.csv', {
                                    Accept: 'text/plain',
                                })
                            }
                        >
                            <BsDownload size={20} /> {t('Download CSV template for Component upload')}
                        </button>
                    </div>
                    <div className='mb-2'>
                        <button
                            className='btn btn-secondary w-50 text-start'
                            onClick={() =>
                                handleDownload('importExport/downloadAttachmentSample', 'attachment_sample_info.csv', {
                                    Accept: 'text/plain',
                                })
                            }
                        >
                            <BsDownload size={20} /> {t('Download Attachment sample information')}
                        </button>
                    </div>
                    <div className='mb-2'>
                        <button
                            className='btn btn-secondary w-50 text-start'
                            onClick={() =>
                                handleDownload('importExport/downloadAttachmentInfo', 'attachment_info.csv', {
                                    Accept: 'text/plain',
                                })
                            }
                        >
                            <BsDownload size={20} /> {t('Download Attachment information')}
                        </button>
                    </div>
                    <div className='mb-2'>
                        <button
                            className='btn btn-secondary w-50 text-start'
                            onClick={() =>
                                handleDownload('importExport/downloadReleaseSample', 'release_link_sample_info.csv', {
                                    Accept: 'text/plain',
                                })
                            }
                        >
                            <BsDownload size={20} /> {t('Download Release Link sample information')}
                        </button>
                    </div>
                    <div className='mb-2'>
                        <button
                            className='btn btn-secondary w-50 text-start'
                            onClick={() =>
                                handleDownload('importExport/downloadReleaseLink', 'release_link_info.csv', {
                                    Accept: 'text/plain',
                                })
                            }
                        >
                            <BsDownload size={20} /> {t('Download Release Link information')}
                        </button>
                    </div>
                    <div className='mb-2'>
                        <button
                            className='btn btn-secondary w-50 text-start'
                            onClick={() =>
                                handleDownload('licenses/downloadLicenses', 'LicensesBackup.lics', {
                                    Accept: 'application/zip',
                                })
                            }
                        >
                            <BsDownload size={20} /> {t('Download License Archive')}
                        </button>
                    </div>
                </div>
                <div className='col'>
                    <h6 className='border-bottom fw-bold text-uppercase text-blue border-blue mb-2'>{t('Import')}</h6>
                    <div className='mb-2 d-flex justify-content-between'>
                        <input
                            type='file'
                            onChange={(e) => handleFileChange(e, componentCsvFile)}
                        />
                        <button
                            className='btn btn-secondary w-50 text-start'
                            onClick={() =>
                                handleUpload('importExport/uploadComponent', 'componentFile', componentCsvFile)
                            }
                        >
                            <BsUpload size={20} /> {t('Upload Component CSV')}
                        </button>
                    </div>
                    <div className='mb-2 d-flex justify-content-between'>
                        <input
                            type='file'
                            onChange={(e) => handleFileChange(e, componentsAttachmentFile)}
                        />
                        <button
                            className='btn btn-secondary w-50 text-start'
                            onClick={() =>
                                handleUpload(
                                    'importExport/componentAttachment',
                                    'attachmentFile',
                                    componentsAttachmentFile,
                                )
                            }
                        >
                            <BsUpload size={20} /> {t('Upload Component Attachments')}
                        </button>
                    </div>
                    <div className='mb-2 d-flex justify-content-between'>
                        <input
                            type='file'
                            onChange={(e) => handleFileChange(e, releaseLinksFile)}
                        />
                        <button
                            className='btn btn-secondary w-50 text-start'
                            onClick={() => handleUpload('importExport/uploadRelease', 'releaseFile', releaseLinksFile)}
                        >
                            <BsUpload size={20} /> {t('Upload Release Links')}
                        </button>
                    </div>
                    <div className='mb-2 d-flex justify-content-between'>
                        <input
                            type='file'
                            onChange={(e) => handleFileChange(e, licenseArchiveFile)}
                        />
                        <button
                            className='btn btn-secondary w-50 text-start'
                            onClick={() => handleUpload('licenses/upload', 'licenseFile', licenseArchiveFile)}
                        >
                            <BsUpload size={20} /> {t('Upload License Archive')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
