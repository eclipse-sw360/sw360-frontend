// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { Vendor } from '@/object-types'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Dispatch, ReactNode, SetStateAction, useEffect } from 'react'
import { FaLongArrowAltLeft, FaUndo } from 'react-icons/fa'
import { TiTick } from 'react-icons/ti'

export default function MergeVendor({
    targetVendor,
    sourceVendor,
    finalVendorPayload,
    setFinalVendorPayload,
}: {
    targetVendor: Vendor | null
    sourceVendor: Vendor | null
    finalVendorPayload: Vendor | null
    setFinalVendorPayload: Dispatch<SetStateAction<null | Vendor>>
}): ReactNode {
    const t = useTranslations('default')
    const { status } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            void signOut()
        }
    }, [status])

    useEffect(() => {
        setFinalVendorPayload(targetVendor)
    }, [targetVendor])

    return (
        <>
            {targetVendor && sourceVendor && finalVendorPayload && (
                <>
                    <h6 className='border-bottom fw-bold text-uppercase text-blue border-blue mb-2'>{t('Vendor')}</h6>
                    <div className='border border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('Full Name')}</div>
                        <div className='d-flex row'>
                            <div className='mt-2 col text-end'>{finalVendorPayload.fullName}</div>
                            <div className='col-12 col-md-2 mx-5 text-center'>
                                {sourceVendor.fullName === targetVendor.fullName ? (
                                    <TiTick
                                        size={40}
                                        className='green'
                                    />
                                ) : finalVendorPayload.fullName === targetVendor.fullName ? (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalVendorPayload({
                                                ...finalVendorPayload,
                                                fullName: sourceVendor.fullName,
                                            })
                                        }
                                    >
                                        <FaLongArrowAltLeft />
                                    </button>
                                ) : (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalVendorPayload({
                                                ...finalVendorPayload,
                                                fullName: targetVendor.fullName,
                                            })
                                        }
                                    >
                                        <FaUndo />
                                    </button>
                                )}
                            </div>
                            <div className='mt-2 col text-start'>{sourceVendor.fullName}</div>
                        </div>
                    </div>
                    <div className='border border-top-0 border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('Short Name')}</div>
                        <div className='d-flex row'>
                            <div className='mt-2 col text-end'>{finalVendorPayload.shortName}</div>
                            <div className='col-12 col-md-2 mx-5 text-center'>
                                {sourceVendor.shortName === targetVendor.shortName ? (
                                    <TiTick
                                        size={40}
                                        className='green'
                                    />
                                ) : finalVendorPayload.shortName === targetVendor.shortName ? (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalVendorPayload({
                                                ...finalVendorPayload,
                                                shortName: sourceVendor.shortName,
                                            })
                                        }
                                    >
                                        <FaLongArrowAltLeft />
                                    </button>
                                ) : (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalVendorPayload({
                                                ...finalVendorPayload,
                                                shortName: targetVendor.shortName,
                                            })
                                        }
                                    >
                                        <FaUndo />
                                    </button>
                                )}
                            </div>
                            <div className='mt-2 col text-start'>{sourceVendor.shortName}</div>
                        </div>
                    </div>
                    <div className='border border-top-0 border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('URL')}</div>
                        <div className='d-flex row'>
                            <div className='mt-2 col text-end'>{finalVendorPayload.url}</div>
                            <div className='col-12 col-md-2 mx-5 text-center'>
                                {sourceVendor.url === targetVendor.url ? (
                                    <TiTick
                                        size={40}
                                        className='green'
                                    />
                                ) : finalVendorPayload.url === targetVendor.url ? (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalVendorPayload({ ...finalVendorPayload, url: sourceVendor.url })
                                        }
                                    >
                                        <FaLongArrowAltLeft />
                                    </button>
                                ) : (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalVendorPayload({ ...finalVendorPayload, url: targetVendor.url })
                                        }
                                    >
                                        <FaUndo />
                                    </button>
                                )}
                            </div>
                            <div className='mt-2 col text-start'>{sourceVendor.url}</div>
                        </div>
                    </div>
                </>
            )}
        </>
    )
}
