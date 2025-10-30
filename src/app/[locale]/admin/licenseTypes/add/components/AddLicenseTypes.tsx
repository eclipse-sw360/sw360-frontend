// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { StatusCodes } from 'http-status-codes'
import { useRouter } from 'next/navigation'
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { type JSX, useEffect, useRef } from 'react'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'

export default function AddLicenseTypes(): JSX.Element {
    const router = useRouter()
    const { status } = useSession()
    const t = useTranslations('default')
    const searchValueRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [
        status,
    ])

    const handleAddLicenseType = async ({ addLicenseTypeTitle }: { addLicenseTypeTitle: string }) => {
        try {
            const session = await getSession()
            if (CommonUtils.isNullOrUndefined(session)) return signOut()
            const url = CommonUtils.createUrlWithParams('licenses/addLicenseType', {
                licenseType: addLicenseTypeTitle,
            })
            const response = await ApiUtils.POST(url, {}, session.user.access_token)
            if (response.status == StatusCodes.OK) {
                MessageService.success(t('License Type is created successfully'))
                router.push('/admin/licenseTypes')
            } else if (response.status === StatusCodes.UNAUTHORIZED) {
                MessageService.error(t('Unauthorized request'))
                return
            } else if (response.status === StatusCodes.CONFLICT) {
                MessageService.error(t('A License Type with same title already exists'))
            } else {
                MessageService.error(t('Something went wrong'))
            }
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                return
            }
            const message = error instanceof Error ? error.message : String(error)
            MessageService.error(message)
        }
    }

    const handleCancel = () => {
        router.push('/admin/licenseTypes')
    }

    return (
        <>
            <div className='page-content container'>
                <form
                    action=''
                    id='add_license_type'
                    method='post'
                    onSubmit={(e) => {
                        e.preventDefault()
                        void handleAddLicenseType({
                            addLicenseTypeTitle: searchValueRef.current?.value ?? '',
                        })
                    }}
                >
                    <div className='row mb-4'>
                        <button
                            type='submit'
                            id='add_license_type.submit'
                            className='btn btn-primary col-auto me-2'
                            disabled={status !== 'authenticated'}
                        >
                            {t('Create License Type')}
                        </button>
                        <button
                            type='button'
                            id='add_license_type.cancel'
                            className='btn btn-dark col-auto'
                            onClick={() => handleCancel()}
                        >
                            {t('Cancel')}
                        </button>
                    </div>
                    <div className='row header mb-2 pb-2 px-2'>
                        <h6>{t('Add License Type')}</h6>
                    </div>
                    <div className='row'>
                        <div className='col-lg'>
                            <label
                                htmlFor='add_license_type.title'
                                className='form-label fw-medium'
                            >
                                {t('Title')}{' '}
                                <span
                                    className='text-red'
                                    style={{
                                        color: '#F7941E',
                                    }}
                                >
                                    *
                                </span>
                            </label>
                            <input
                                type='text'
                                name='addLicenseTypeTitle'
                                className='form-control'
                                id='add_license_type.title'
                                placeholder={t('Enter Title')}
                                ref={searchValueRef}
                                required
                            />
                        </div>
                    </div>
                </form>
            </div>
        </>
    )
}
