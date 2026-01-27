// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { StatusCodes } from 'http-status-codes'
import { getSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { type JSX, useRef, useState } from 'react'
import { Spinner } from 'react-bootstrap'
import { BsUpload } from 'react-icons/bs'
import { ErrorDetails } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils } from '@/utils'

interface Props {
    onUploadSuccess?: () => void
}

export default function BulkUserUpload({ onUploadSuccess }: Props): JSX.Element {
    const t = useTranslations('default')
    const usersCsvFile = useRef<File | undefined>(undefined)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [selectedFileName, setSelectedFileName] = useState<string>('')
    const [uploading, setUploading] = useState(false)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.currentTarget.files

        if (!files || files.length === 0) {
            usersCsvFile.current = undefined
            setSelectedFileName('')
            return
        }

        usersCsvFile.current = files[0]
        setSelectedFileName(files[0].name)
    }

    const handleUpload = async () => {
        try {
            if (!usersCsvFile.current) {
                MessageService.error(t('Please select a file'))
                return
            }

            setUploading(true)

            const formData = new FormData()
            formData.append('usersCsv', usersCsvFile.current, usersCsvFile.current.name)

            const session = await getSession()
            if (!session) {
                return signOut()
            }

            const response = await ApiUtils.POST('importExport/usersCsv', formData, session.user.access_token)

            if (response.status === StatusCodes.UNAUTHORIZED) {
                MessageService.error(t('Session has expired'))
                return signOut()
            }

            if (response.status !== StatusCodes.OK) {
                const err = (await response.json()) as ErrorDetails
                throw new Error(err.message)
            }

            MessageService.success(t('Users uploaded successfully'))
            usersCsvFile.current = undefined
            setSelectedFileName('')
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
            onUploadSuccess?.()
        } catch (error: unknown) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                return
            }
            const message = error instanceof Error ? error.message : String(error)
            MessageService.error(message)
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className='mt-4 mb-4'>
            <h5 className='mt-3 mb-1 ms-1 header-underlined'>{t('Bulk User Upload')}</h5>
            <div className='row ms-1 mt-3'>
                <div className='col-lg-8'>
                    <div className='d-flex align-items-start justify-content-between'>
                        <div className='flex-grow-1 me-3'>
                            <input
                                type='file'
                                accept='.csv'
                                onChange={handleFileChange}
                                ref={fileInputRef}
                                className='form-control'
                            />
                            {selectedFileName && (
                                <small className='text-muted mt-1 d-block'>
                                    {t('Selected file')}: {selectedFileName}
                                </small>
                            )}
                        </div>
                        <button
                            className='btn btn-primary d-flex align-items-center gap-2 flex-shrink-0'
                            onClick={handleUpload}
                            disabled={uploading || !selectedFileName}
                        >
                            {uploading ? (
                                <Spinner
                                    size='sm'
                                    animation='border'
                                />
                            ) : (
                                <BsUpload size={16} />
                            )}
                            {t('Upload Users')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
