// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { Embedded, ErrorDetails, HttpStatus, Release, Vendor } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'
import { Spinner } from 'react-bootstrap'
import VendorDetailForm from '../../../components/VendorDetailForm'

type EmbeddedReleases = Embedded<Release, 'sw360:releases'>

export default function EditVendor({ id }: { id: string }): ReactNode {
    const t = useTranslations('default')
    const router = useRouter()
    const [vendorData, setVendorData] = useState<Vendor | null>(null)
    const [releases, setReleases] = useState<Release[] | null>(null)
    const { status } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [status])

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal

        ;(async () => {
            try {
                const session = await getSession()
                if (CommonUtils.isNullOrUndefined(session)) return signOut()
                const response = await ApiUtils.GET(`vendors/${id}`, session.user.access_token, signal)

                if (response.status === HttpStatus.OK) {
                    const vendor = (await response.json()) as Vendor
                    setVendorData(vendor)

                    const releasesResponse = await ApiUtils.GET(
                        `vendors/${id}/releases`,
                        session.user.access_token,
                        signal,
                    )

                    if (releasesResponse.status === HttpStatus.OK) {
                        const releases = (await releasesResponse.json()) as EmbeddedReleases
                        setReleases(releases._embedded['sw360:releases'])
                    } else if (releasesResponse.status === HttpStatus.NO_CONTENT) {
                        setReleases([])
                    } else {
                        const err = (await releasesResponse.json()) as ErrorDetails
                        throw new Error(err.message)
                    }
                } else {
                    const err = (await response.json()) as ErrorDetails
                    throw new Error(err.message)
                }
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return
                }
                const message = error instanceof Error ? error.message : String(error)
                MessageService.error(message)
                router.push('/admin/vendors')
            }
        })()

        return () => controller.abort()
    }, [id])

    const handleCancel = () => {
        router.push('/admin/vendors')
    }

    const handleSubmit = async () => {
        try {
            const session = await getSession()
            if (CommonUtils.isNullOrUndefined(session)) return signOut()
            if (vendorData === null) return
            delete vendorData['_links']
            const response = await ApiUtils.PATCH(`vendors/${id}`, vendorData, session.user.access_token)
            if (response.status == HttpStatus.OK) {
                MessageService.success(t('Vendor is updated'))
                router.push('/admin/vendors')
            } else if (response.status === HttpStatus.UNAUTHORIZED) {
                return signOut()
            } else {
                const err = (await response.json()) as ErrorDetails
                throw new Error(err.message)
            }
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                return
            }
            const message = error instanceof Error ? error.message : String(error)
            MessageService.error(message)
        }
    }

    const handleDelete = async () => {
        try {
            const session = await getSession()
            if (CommonUtils.isNullOrUndefined(session)) return signOut()
            const response = await ApiUtils.DELETE(`vendors/${id}`, session.user.access_token)
            if (response.status == HttpStatus.OK) {
                MessageService.success(t('Vendor deleted successfully'))
                router.push('/admin/vendors')
            } else {
                const err = (await response.json()) as ErrorDetails
                throw new Error(err.message)
            }
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                return
            }
            const message = error instanceof Error ? error.message : String(error)
            MessageService.error(message)
        }
    }

    return (
        <>
            {vendorData && releases ? (
                <div className='page-content container ps-0'>
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
                            >
                                {t('Update Vendor')}
                            </button>
                            <button
                                className='btn btn-danger col-auto me-2'
                                onClick={handleDelete}
                                type='button'
                            >
                                {t('Delete Vendor')}
                            </button>
                            <button
                                className='btn btn-dark col-auto'
                                type='button'
                                onClick={handleCancel}
                            >
                                {t('Cancel')}
                            </button>
                        </div>
                        <VendorDetailForm
                            payload={vendorData}
                            setPayload={setVendorData}
                        />
                    </form>
                    <div className='mt-2'>
                        <h6 className='border-bottom fw-bold text-uppercase text-blue border-blue mb-2'>
                            {t('Used by the following releases')}
                        </h6>
                        {((releases: Release[]): ReactNode => {
                            const groupSize = 4
                            const groups: ReactNode[] = []
                            for (let i = 0; i < releases.length; i += groupSize) {
                                const group = releases.slice(i, i + 4)
                                groups.push(
                                    <div
                                        className='row my-2 mx-1'
                                        key={`${group[0].id}-div`}
                                    >
                                        {group.map((rel) => (
                                            <div
                                                className='col'
                                                key={rel.id}
                                            >
                                                <Link
                                                    className='text-link'
                                                    href={`/components/releases/detail/${rel.id}`}
                                                >
                                                    {`${rel.name} ${rel.version ?? `(${rel.version})`}`}
                                                </Link>
                                            </div>
                                        ))}
                                    </div>,
                                )
                            }
                            return groups
                        })(releases)}
                    </div>
                </div>
            ) : (
                <div className='col-12 d-flex justify-content-center align-items-center mt-3'>
                    <Spinner className='spinner' />
                </div>
            )}
        </>
    )
}
