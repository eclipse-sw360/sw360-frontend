// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { HttpStatus, ToastData, Vendor } from '@/object-types'
import { ApiUtils } from '@/utils'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { ToastMessage } from 'next-sw360'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ToastContainer } from 'react-bootstrap'
import VendorDetailForm from './VendorDetailForm'

export default function AddVendor() {
    const t = useTranslations('default')
    const { data: session, status } = useSession()
    const router = useRouter()
    const [vendorData, setVendorData] = useState<Vendor>({
        fullName: '',
        shortName: '',
        url: '',
    })

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

    const handleCancel = () => {
        router.push('/admin/vendors')
    }

    const handleSubmit = async () => {
        try {
            const payload: Vendor = {
                fullName: vendorData.fullName,
                shortName: vendorData.shortName,
                url: vendorData.url,
            }
            const response = await ApiUtils.POST('vendors', payload, session.user.access_token)
            if (response.status == HttpStatus.CREATED) {
                alert(true, 'Success', t('Vendor is created'), 'success')
                router.push('/admin/vendors')
            } else if (response.status === HttpStatus.UNAUTHORIZED) {
                return signOut()
            } else if (response.status === HttpStatus.CONFLICT) {
                alert(true, 'Error', t('A vendor with same name already exists'), 'danger')
            } else {
                alert(true, 'Error', t('Something went wrong'), 'danger')
            }
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <>
            <div className='page-content container'>
                <form
                    action=''
                    id='add_vulnerability'
                    method='post'
                    onSubmit={(e) => {
                        e.preventDefault()
                        handleSubmit()
                    }}
                >
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
                    <div className='row mb-4'>
                        <button
                            type='submit'
                            className='btn btn-primary col-auto me-2'
                            disabled={status !== 'authenticated'}
                        >
                            {t('Create Vendor')}
                        </button>
                        <button
                            type='button'
                            id='vendor.cancel'
                            className='btn btn-dark col-auto'
                            onClick={handleCancel}
                        >
                            {t('Cancel')}
                        </button>
                    </div>
                    <VendorDetailForm payload={vendorData} setPayload={setVendorData} />
                </form>
            </div>
        </>
    )
}
