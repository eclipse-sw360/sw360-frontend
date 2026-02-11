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

export default function ECCInformation({
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
                    <h6 className='border-bottom fw-bold text-uppercase text-blue border-blue mb-2'>{t('ECC Information')}</h6>
                    <div className='border border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('ECC Status')}</div>
                        <div className='d-flex row'>
                            <div className='mt-2 col text-end'>
                                {finalReleasePayload.eccInformation?.eccStatus}
                            </div>
                            <div className='col-12 col-md-2 mx-5 text-center'>
                                {sourceReleaseDetail?.eccInformation?.eccStatus ===
                                    targetRelease?.eccInformation?.eccStatus ? (
                                    <BsCheck2
                                        size={20}
                                        className='green'
                                    />
                                ) : finalReleasePayload?.eccInformation?.eccStatus ===
                                    targetRelease?.eccInformation?.eccStatus ? (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalReleasePayload({
                                                ...finalReleasePayload,
                                                eccInformation: {
                                                    ...finalReleasePayload.eccInformation,
                                                    eccStatus:
                                                        sourceReleaseDetail?.eccInformation?.eccStatus,
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
                                                eccInformation: {
                                                    ...finalReleasePayload.eccInformation,
                                                    eccStatus:
                                                        targetRelease?.eccInformation?.eccStatus,
                                                },
                                            })
                                        }
                                    >
                                        <BsArrowCounterclockwise size={20} />
                                    </button>
                                )}
                            </div>
                            <div className='mt-2 col text-start'>
                                {sourceReleaseDetail?.eccInformation?.eccStatus}
                            </div>
                        </div>
                    </div>
                    <div className='border border-top-0 border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('ECC Comment')}</div>
                        <div className='d-flex row'>
                            <div className='mt-2 col text-end'>
                                {finalReleasePayload.eccInformation?.eccComment}
                            </div>
                            <div className='col-12 col-md-2 mx-5 text-center'>
                                {sourceReleaseDetail?.eccInformation?.eccComment ===
                                    targetRelease?.eccInformation?.eccComment ? (
                                    <BsCheck2
                                        size={20}
                                        className='green'
                                    />
                                ) : finalReleasePayload?.eccInformation?.eccComment ===
                                    targetRelease?.eccInformation?.eccComment ? (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalReleasePayload({
                                                ...finalReleasePayload,
                                                eccInformation: {
                                                    ...finalReleasePayload.eccInformation,
                                                    eccComment:
                                                        sourceReleaseDetail?.eccInformation?.eccComment,
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
                                                eccInformation: {
                                                    ...finalReleasePayload.eccInformation,
                                                    eccComment:
                                                        targetRelease?.eccInformation?.eccComment,
                                                },
                                            })
                                        }
                                    >
                                        <BsArrowCounterclockwise size={20} />
                                    </button>
                                )}
                            </div>
                            <div className='mt-2 col text-start'>
                                {sourceReleaseDetail?.eccInformation?.eccComment}
                            </div>
                        </div>
                    </div>
                    <div className='border border-top-0 border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('AL')}</div>
                        <div className='d-flex row'>
                            <div className='mt-2 col text-end'>
                                {finalReleasePayload.eccInformation?.al}
                            </div>
                            <div className='col-12 col-md-2 mx-5 text-center'>
                                {sourceReleaseDetail?.eccInformation?.al ===
                                    targetRelease?.eccInformation?.al ? (
                                    <BsCheck2
                                        size={20}
                                        className='green'
                                    />
                                ) : finalReleasePayload?.eccInformation?.al ===
                                    targetRelease?.eccInformation?.al ? (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalReleasePayload({
                                                ...finalReleasePayload,
                                                eccInformation: {
                                                    ...finalReleasePayload.eccInformation,
                                                    al:
                                                        sourceReleaseDetail?.eccInformation?.al,
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
                                                eccInformation: {
                                                    ...finalReleasePayload.eccInformation,
                                                    al:
                                                        targetRelease?.eccInformation?.al,
                                                },
                                            })
                                        }
                                    >
                                        <BsArrowCounterclockwise size={20} />
                                    </button>
                                )}
                            </div>
                            <div className='mt-2 col text-start'>
                                {sourceReleaseDetail?.eccInformation?.al}
                            </div>
                        </div>
                    </div>
                    <div className='border border-top-0 border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('ECCN')}</div>
                        <div className='d-flex row'>
                            <div className='mt-2 col text-end'>
                                {finalReleasePayload.eccInformation?.eccn}
                            </div>
                            <div className='col-12 col-md-2 mx-5 text-center'>
                                {sourceReleaseDetail?.eccInformation?.eccn ===
                                    targetRelease?.eccInformation?.eccn ? (
                                    <BsCheck2
                                        size={20}
                                        className='green'
                                    />
                                ) : finalReleasePayload?.eccInformation?.eccn ===
                                    targetRelease?.eccInformation?.eccn ? (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalReleasePayload({
                                                ...finalReleasePayload,
                                                eccInformation: {
                                                    ...finalReleasePayload.eccInformation,
                                                    eccn:
                                                        sourceReleaseDetail?.eccInformation?.eccn,
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
                                                eccInformation: {
                                                    ...finalReleasePayload.eccInformation,
                                                    eccn:
                                                        targetRelease?.eccInformation?.eccn,
                                                },
                                            })
                                        }
                                    >
                                        <BsArrowCounterclockwise size={20} />
                                    </button>
                                )}
                            </div>
                            <div className='mt-2 col text-start'>
                                {sourceReleaseDetail?.eccInformation?.eccn}
                            </div>
                        </div>
                    </div>
                    <div className='border border-top-0 border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('Material Index Number')}</div>
                        <div className='d-flex row'>
                            <div className='mt-2 col text-end'>
                                {finalReleasePayload.eccInformation?.materialIndexNumber}
                            </div>
                            <div className='col-12 col-md-2 mx-5 text-center'>
                                {sourceReleaseDetail?.eccInformation?.materialIndexNumber ===
                                    targetRelease?.eccInformation?.materialIndexNumber ? (
                                    <BsCheck2
                                        size={20}
                                        className='green'
                                    />
                                ) : finalReleasePayload?.eccInformation?.materialIndexNumber ===
                                    targetRelease?.eccInformation?.materialIndexNumber ? (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalReleasePayload({
                                                ...finalReleasePayload,
                                                eccInformation: {
                                                    ...finalReleasePayload.eccInformation,
                                                    materialIndexNumber:
                                                        sourceReleaseDetail?.eccInformation?.materialIndexNumber,
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
                                                eccInformation: {
                                                    ...finalReleasePayload.eccInformation,
                                                    materialIndexNumber:
                                                        targetRelease?.eccInformation?.materialIndexNumber,
                                                },
                                            })
                                        }
                                    >
                                        <BsArrowCounterclockwise size={20} />
                                    </button>
                                )}
                            </div>
                            <div className='mt-2 col text-start'>
                                {sourceReleaseDetail?.eccInformation?.materialIndexNumber}
                            </div>
                        </div>
                    </div>
                    <div className='border border-top-0 border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('Assessor Contact Person')}</div>
                        <div className='d-flex row'>
                            <div className='mt-2 col text-end'>
                                {finalReleasePayload.eccInformation?.assessorContactPerson}
                            </div>
                            <div className='col-12 col-md-2 mx-5 text-center'>
                                {sourceReleaseDetail?.eccInformation?.assessorContactPerson ===
                                    targetRelease?.eccInformation?.assessorContactPerson ? (
                                    <BsCheck2
                                        size={20}
                                        className='green'
                                    />
                                ) : finalReleasePayload?.eccInformation?.assessorContactPerson ===
                                    targetRelease?.eccInformation?.assessorContactPerson ? (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalReleasePayload({
                                                ...finalReleasePayload,
                                                eccInformation: {
                                                    ...finalReleasePayload.eccInformation,
                                                    assessorContactPerson:
                                                        sourceReleaseDetail?.eccInformation?.assessorContactPerson,
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
                                                eccInformation: {
                                                    ...finalReleasePayload.eccInformation,
                                                    assessorContactPerson:
                                                        targetRelease?.eccInformation?.assessorContactPerson,
                                                },
                                            })
                                        }
                                    >
                                        <BsArrowCounterclockwise size={20} />
                                    </button>
                                )}
                            </div>
                            <div className='mt-2 col text-start'>
                                {sourceReleaseDetail?.eccInformation?.assessorContactPerson}
                            </div>
                        </div>
                    </div>
                </div >
            )
            }
        </>
    )
}
