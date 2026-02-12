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
import { Release, ReleaseDetail } from '@/object-types'

export default function RequestInformation({
    targetRelease,
    sourceReleaseDetail,
    finalReleasePayload,
    setFinalReleasePayload,
}: {
    targetRelease: ReleaseDetail | null
    sourceReleaseDetail: ReleaseDetail | null
    finalReleasePayload: Release | null
    setFinalReleasePayload: Dispatch<SetStateAction<null | Release>>
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
                    <h6 className='border-bottom fw-bold text-uppercase text-blue border-blue mb-2'>{t('Request Information')}</h6>
                    <div className='border border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('Request ID')}</div>
                        <div className='d-flex row'>
                            <div className='mt-2 col text-end'>
                                {finalReleasePayload.clearingInformation?.requestID}
                            </div>
                            <div className='col-12 col-md-2 mx-5 text-center'>
                                {sourceReleaseDetail?.clearingInformation?.requestID ===
                                    targetRelease?.clearingInformation?.requestID ? (
                                    <BsCheck2
                                        size={20}
                                        className='green'
                                    />
                                ) : finalReleasePayload?.clearingInformation?.requestID ===
                                    targetRelease?.clearingInformation?.requestID ? (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalReleasePayload({
                                                ...finalReleasePayload,
                                                clearingInformation: {
                                                    ...finalReleasePayload.clearingInformation,
                                                    requestID:
                                                        sourceReleaseDetail?.clearingInformation?.requestID,
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
                                                    requestID:
                                                        targetRelease?.clearingInformation?.requestID,
                                                },
                                            })
                                        }
                                    >
                                        <BsArrowCounterclockwise size={20} />
                                    </button>
                                )}
                            </div>
                            <div className='mt-2 col text-start'>
                                {sourceReleaseDetail?.clearingInformation?.requestID}
                            </div>
                        </div>
                    </div>
                    <div className='border border-top-0 border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('Additional request Info')}</div>
                        <div className='d-flex row'>
                            <div className='mt-2 col text-end'>
                                {finalReleasePayload.clearingInformation?.additionalRequestInfo}
                            </div>
                            <div className='col-12 col-md-2 mx-5 text-center'>
                                {sourceReleaseDetail?.clearingInformation?.additionalRequestInfo ===
                                    targetRelease?.clearingInformation?.additionalRequestInfo ? (
                                    <BsCheck2
                                        size={20}
                                        className='green'
                                    />
                                ) : finalReleasePayload?.clearingInformation?.additionalRequestInfo ===
                                    targetRelease?.clearingInformation?.additionalRequestInfo ? (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalReleasePayload({
                                                ...finalReleasePayload,
                                                clearingInformation: {
                                                    ...finalReleasePayload.clearingInformation,
                                                    additionalRequestInfo:
                                                        sourceReleaseDetail?.clearingInformation?.additionalRequestInfo,
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
                                                    additionalRequestInfo:
                                                        targetRelease?.clearingInformation?.additionalRequestInfo,
                                                },
                                            })
                                        }
                                    >
                                        <BsArrowCounterclockwise size={20} />
                                    </button>
                                )}
                            </div>
                            <div className='mt-2 col text-start'>
                                {sourceReleaseDetail?.clearingInformation?.additionalRequestInfo}
                            </div>
                        </div>
                    </div>
                    <div className='border border-top-0 border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('Evaluation Start')}</div>
                        <div className='d-flex row'>
                            <div className='mt-2 col text-end'>
                                {finalReleasePayload.clearingInformation?.procStart}
                            </div>
                            <div className='col-12 col-md-2 mx-5 text-center'>
                                {sourceReleaseDetail?.clearingInformation?.procStart ===
                                    targetRelease?.clearingInformation?.procStart ? (
                                    <BsCheck2
                                        size={20}
                                        className='green'
                                    />
                                ) : finalReleasePayload?.clearingInformation?.procStart ===
                                    targetRelease?.clearingInformation?.procStart ? (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalReleasePayload({
                                                ...finalReleasePayload,
                                                clearingInformation: {
                                                    ...finalReleasePayload.clearingInformation,
                                                    procStart:
                                                        sourceReleaseDetail?.clearingInformation?.procStart,
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
                                                    procStart:
                                                        targetRelease?.clearingInformation?.procStart,
                                                },
                                            })
                                        }
                                    >
                                        <BsArrowCounterclockwise size={20} />
                                    </button>
                                )}
                            </div>
                            <div className='mt-2 col text-start'>
                                {sourceReleaseDetail?.clearingInformation?.procStart}
                            </div>
                        </div>
                    </div>
                    <div className='border border-top-0 border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('Evaluation End')}</div>
                        <div className='d-flex row'>
                            <div className='mt-2 col text-end'>
                                {finalReleasePayload.clearingInformation?.evaluated}
                            </div>
                            <div className='col-12 col-md-2 mx-5 text-center'>
                                {sourceReleaseDetail?.clearingInformation?.evaluated ===
                                    targetRelease?.clearingInformation?.evaluated ? (
                                    <BsCheck2
                                        size={20}
                                        className='green'
                                    />
                                ) : finalReleasePayload?.clearingInformation?.evaluated ===
                                    targetRelease?.clearingInformation?.evaluated ? (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalReleasePayload({
                                                ...finalReleasePayload,
                                                clearingInformation: {
                                                    ...finalReleasePayload.clearingInformation,
                                                    evaluated:
                                                        sourceReleaseDetail?.clearingInformation?.evaluated,
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
                                                    evaluated:
                                                        targetRelease?.clearingInformation?.evaluated,
                                                },
                                            })
                                        }
                                    >
                                        <BsArrowCounterclockwise size={20} />
                                    </button>
                                )}
                            </div>
                            <div className='mt-2 col text-start'>
                                {sourceReleaseDetail?.clearingInformation?.evaluated}
                            </div>
                        </div>
                    </div>
                </div >
            )
            }
        </>
    )
}
