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
import { BsArrowCounterclockwise, BsArrowLeft, BsCheck2, BsCheck2Circle, BsXCircle } from 'react-icons/bs'
import { Release, ReleaseDetail } from '@/object-types'

export default function CommercialDetailAdmin({
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
                    <h6 className='border-bottom fw-bold text-uppercase text-blue border-blue mb-2'>
                        {t('Commercial Details Administration')}
                    </h6>
                    <div className='border border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('Usage Right Available')}</div>
                        <div className='d-flex row'>
                            <div className='mt-2 col text-end'>
                                {finalReleasePayload?.cotsDetails?.usageRightAvailable === true ? (
                                    <>
                                        <BsCheck2Circle color='green' />
                                        {t('Yes')}
                                    </>
                                ) : (
                                    <>
                                        <BsXCircle color='red' />
                                        {t('No')}
                                    </>
                                )}
                            </div>
                            <div className='col-12 col-md-2 mx-5 text-center'>
                                {sourceReleaseDetail?._embedded['sw360:cotsDetail']?.usageRightAvailable ===
                                targetRelease?._embedded['sw360:cotsDetail']?.usageRightAvailable ? (
                                    <BsCheck2
                                        size={20}
                                        className='green'
                                    />
                                ) : finalReleasePayload?.cotsDetails?.usageRightAvailable ===
                                  targetRelease?._embedded['sw360:cotsDetail']?.usageRightAvailable ? (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalReleasePayload({
                                                ...finalReleasePayload,
                                                cotsDetails: {
                                                    ...finalReleasePayload.cotsDetails,
                                                    usageRightAvailable:
                                                        sourceReleaseDetail?._embedded['sw360:cotsDetail']
                                                            ?.usageRightAvailable,
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
                                                cotsDetails: {
                                                    ...finalReleasePayload.cotsDetails,
                                                    usageRightAvailable:
                                                        targetRelease?._embedded['sw360:cotsDetail']
                                                            ?.usageRightAvailable,
                                                },
                                            })
                                        }
                                    >
                                        <BsArrowCounterclockwise size={20} />
                                    </button>
                                )}
                            </div>
                            <div className='mt-2 col text-start'>
                                {sourceReleaseDetail?._embedded['sw360:cotsDetail']?.usageRightAvailable === true ? (
                                    <>
                                        <BsCheck2Circle color='green' />
                                        {t('Yes')}
                                    </>
                                ) : (
                                    <>
                                        <BsXCircle color='red' />
                                        {t('No')}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className='border border-top-0 border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('COTS Responsible')}</div>
                        <div className='d-flex row'>
                            <div className='mt-2 col text-end'>{finalReleasePayload?.cotsDetails?.cotsResponsible}</div>
                            <div className='col-12 col-md-2 mx-5 text-center'>
                                {sourceReleaseDetail?._embedded['sw360:cotsDetail']?.cotsResponsible ===
                                targetRelease?._embedded['sw360:cotsDetail']?.cotsResponsible ? (
                                    <BsCheck2
                                        size={20}
                                        className='green'
                                    />
                                ) : finalReleasePayload?.cotsDetails?.cotsResponsible ===
                                  targetRelease?._embedded['sw360:cotsDetail']?.cotsResponsible ? (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalReleasePayload({
                                                ...finalReleasePayload,
                                                cotsDetails: {
                                                    ...finalReleasePayload.cotsDetails,
                                                    cotsResponsible:
                                                        sourceReleaseDetail?._embedded['sw360:cotsDetail']
                                                            ?.cotsResponsible,
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
                                                cotsDetails: {
                                                    ...finalReleasePayload.cotsDetails,
                                                    cotsResponsible:
                                                        targetRelease?._embedded['sw360:cotsDetail']?.cotsResponsible,
                                                },
                                            })
                                        }
                                    >
                                        <BsArrowCounterclockwise size={20} />
                                    </button>
                                )}
                            </div>
                            <div className='mt-2 col text-start'>
                                {sourceReleaseDetail?._embedded['sw360:cotsDetail']?.cotsResponsible}
                            </div>
                        </div>
                    </div>
                    <div className='border border-top-0 border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('COTS Clearing Deadline')}</div>
                        <div className='d-flex row'>
                            <div className='mt-2 col text-end'>
                                {finalReleasePayload?.cotsDetails?.clearingDeadline}
                            </div>
                            <div className='col-12 col-md-2 mx-5 text-center'>
                                {sourceReleaseDetail?._embedded['sw360:cotsDetail']?.clearingDeadline ===
                                targetRelease?._embedded['sw360:cotsDetail']?.clearingDeadline ? (
                                    <BsCheck2
                                        size={20}
                                        className='green'
                                    />
                                ) : finalReleasePayload?.cotsDetails?.clearingDeadline ===
                                  targetRelease?._embedded['sw360:cotsDetail']?.clearingDeadline ? (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalReleasePayload({
                                                ...finalReleasePayload,
                                                cotsDetails: {
                                                    ...finalReleasePayload.cotsDetails,
                                                    clearingDeadline:
                                                        sourceReleaseDetail?._embedded['sw360:cotsDetail']
                                                            ?.clearingDeadline,
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
                                                cotsDetails: {
                                                    ...finalReleasePayload.cotsDetails,
                                                    clearingDeadline:
                                                        targetRelease?._embedded['sw360:cotsDetail']?.clearingDeadline,
                                                },
                                            })
                                        }
                                    >
                                        <BsArrowCounterclockwise size={20} />
                                    </button>
                                )}
                            </div>
                            <div className='mt-2 col text-start'>
                                {sourceReleaseDetail?._embedded['sw360:cotsDetail']?.clearingDeadline}
                            </div>
                        </div>
                    </div>
                    <div className='border border-top-0 border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('COTS Clearing Report URL')}</div>
                        <div className='d-flex row'>
                            <div className='mt-2 col text-end'>
                                {finalReleasePayload?.cotsDetails?.licenseClearingReportURL}
                            </div>
                            <div className='col-12 col-md-2 mx-5 text-center'>
                                {sourceReleaseDetail?._embedded['sw360:cotsDetail']?.licenseClearingReportURL ===
                                targetRelease?._embedded['sw360:cotsDetail']?.licenseClearingReportURL ? (
                                    <BsCheck2
                                        size={20}
                                        className='green'
                                    />
                                ) : finalReleasePayload?.cotsDetails?.licenseClearingReportURL ===
                                  targetRelease?._embedded['sw360:cotsDetail']?.licenseClearingReportURL ? (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalReleasePayload({
                                                ...finalReleasePayload,
                                                cotsDetails: {
                                                    ...finalReleasePayload.cotsDetails,
                                                    licenseClearingReportURL:
                                                        sourceReleaseDetail?._embedded['sw360:cotsDetail']
                                                            ?.licenseClearingReportURL,
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
                                                cotsDetails: {
                                                    ...finalReleasePayload.cotsDetails,
                                                    licenseClearingReportURL:
                                                        targetRelease?._embedded['sw360:cotsDetail']
                                                            ?.licenseClearingReportURL,
                                                },
                                            })
                                        }
                                    >
                                        <BsArrowCounterclockwise size={20} />
                                    </button>
                                )}
                            </div>
                            <div className='mt-2 col text-start'>
                                {sourceReleaseDetail?._embedded['sw360:cotsDetail']?.licenseClearingReportURL}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
