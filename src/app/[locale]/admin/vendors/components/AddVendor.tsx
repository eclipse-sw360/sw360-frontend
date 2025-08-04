// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { HttpStatus, Vendor } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useEffect, useState, type JSX } from 'react'
import VendorDetailForm from './VendorDetailForm'

export default function AddVendor(): JSX.Element {
    const t = useTranslations('default')
    const { status } = useSession()
    const router = useRouter()
    const [vendorData, setVendorData] = useState<Vendor | null>({
        fullName: '',
        shortName: '',
        url: '',
    })

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [status])

    const handleCancel = () => {
        router.push('/admin/vendors')
    }

    const handleSubmit = async () => {
        try {
            const session = await getSession()
            if (CommonUtils.isNullOrUndefined(session)) return signOut()
            if (vendorData === null) return
            delete vendorData['_links']
            const response = await ApiUtils.POST('vendors', vendorData, session.user.access_token)
            if (response.status == HttpStatus.CREATED) {
                MessageService.success(t('Vendor is created'))
                router.push('/admin/vendors')
            } else if (response.status === HttpStatus.UNAUTHORIZED) {
                return signOut()
            } else if (response.status === HttpStatus.CONFLICT) {
                MessageService.error(t('A vendor with same name already exists'))
            } else {
                MessageService.error(t('Something went wrong'))
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
                        void handleSubmit()
                    }}
                >
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
                    <VendorDetailForm
                        payload={vendorData as Vendor}
                        setPayload={setVendorData}
                    />
                </form>
            </div>
        </>
    )
}
