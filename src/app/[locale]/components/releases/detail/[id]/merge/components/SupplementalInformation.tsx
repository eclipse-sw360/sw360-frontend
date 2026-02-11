// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Dispatch, ReactNode, SetStateAction, useEffect } from 'react'
import { BsArrowCounterclockwise, BsArrowLeft, BsCheck2 } from 'react-icons/bs'
import { ReleaseDetail } from '@/object-types'

export default function SupplementalInformation({
    targetRelease,
    sourceReleaseDetail,
    finalReleasePayload,
    setFinalReleasePayload,
}: {
    targetRelease: ReleaseDetail | null
    sourceReleaseDetail: ReleaseDetail | null
    finalReleasePayload: ReleaseDetail | null
    setFinalReleasePayload: Dispatch<SetStateAction<null | ReleaseDetail>>
}): ReactNode {
    const t = useTranslations('default')
    const session = useSession()

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            signOut()
        }
    }, [
        session,
    ])

    return (
        <>
            {targetRelease && sourceReleaseDetail && finalReleasePayload && (
                <div className='mb-3'>
                    <h6 className='border-bottom fw-bold text-uppercase text-blue border-blue mb-2'>{t('Supplemental Information')}</h6>
                    <div className='border border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('External Supplier ID')}</div>
                        <div className='d-flex row'>
                            <div className='mt-2 col text-end'>
                                {finalReleasePayload.clearingInformation?.externalSupplierID}
                            </div>
                            <div className='col-12 col-md-2 mx-5 text-center'>
                                {sourceReleaseDetail?.clearingInformation?.externalSupplierID ===
                                    targetRelease?.clearingInformation?.externalSupplierID ? (
                                    <BsCheck2
                                        size={20}
                                        className='green'
                                    />
                                ) : finalReleasePayload?.clearingInformation?.externalSupplierID ===
                                    targetRelease?.clearingInformation?.externalSupplierID ? (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalReleasePayload({
                                                ...finalReleasePayload,
                                                clearingInformation: {
                                                    ...finalReleasePayload.clearingInformation,
                                                    externalSupplierID:
                                                        sourceReleaseDetail?.clearingInformation?.externalSupplierID,
                                                },
                                            })
                                        }
                                    >
                                        <BsArrowLeft size={20} />
                                    </button>
                                ) : (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalReleasePayload({
                                                ...finalReleasePayload,
                                                clearingInformation: {
                                                    ...finalReleasePayload.clearingInformation,
                                                    externalSupplierID:
                                                        targetRelease?.clearingInformation?.externalSupplierID,
                                                },
                                            })
                                        }
                                    >
                                        <BsArrowCounterclockwise size={20} />
                                    </button>
                                )}
                            </div>
                            <div className='mt-2 col text-start'>
                                {sourceReleaseDetail?.clearingInformation?.externalSupplierID}
                            </div>
                        </div>
                    </div>
                    <div className='border border-top-0 border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('Count of Security Vulnerabilities')}</div>
                        <div className='d-flex row'>
                            <div className='mt-2 col text-end'>
                                {finalReleasePayload.clearingInformation?.countOfSecurityVn}
                            </div>
                            <div className='col-12 col-md-2 mx-5 text-center'>
                                {sourceReleaseDetail?.clearingInformation?.countOfSecurityVn ===
                                    targetRelease?.clearingInformation?.countOfSecurityVn ? (
                                    <BsCheck2
                                        size={20}
                                        className='green'
                                    />
                                ) : finalReleasePayload?.clearingInformation?.countOfSecurityVn ===
                                    targetRelease?.clearingInformation?.countOfSecurityVn ? (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalReleasePayload({
                                                ...finalReleasePayload,
                                                clearingInformation: {
                                                    ...finalReleasePayload.clearingInformation,
                                                    countOfSecurityVn:
                                                        sourceReleaseDetail?.clearingInformation?.countOfSecurityVn,
                                                },
                                            })
                                        }
                                    >
                                        <BsArrowLeft size={20} />
                                    </button>
                                ) : (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalReleasePayload({
                                                ...finalReleasePayload,
                                                clearingInformation: {
                                                    ...finalReleasePayload.clearingInformation,
                                                    countOfSecurityVn:
                                                        targetRelease?.clearingInformation?.countOfSecurityVn,
                                                },
                                            })
                                        }
                                    >
                                        <BsArrowCounterclockwise size={20} />
                                    </button>
                                )}
                            </div>
                            <div className='mt-2 col text-start'>
                                {sourceReleaseDetail?.clearingInformation?.countOfSecurityVn}
                            </div>
                        </div>
                    </div>
                </div >
            )
            }
        </>
    )
}
