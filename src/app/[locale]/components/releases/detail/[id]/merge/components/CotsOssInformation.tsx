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

export default function CotsOssInformation({
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
                        {t('COTS OSS Information')}
                    </h6>
                    <div className='border border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('Used License')}</div>
                        <div className='d-flex row'>
                            <div className='mt-2 col text-end'>{finalReleasePayload?.cotsDetails?.usedLicense}</div>
                            <div className='col-12 col-md-2 mx-5 text-center'>
                                {sourceReleaseDetail?._embedded['sw360:cotsDetail']?.usedLicense ===
                                targetRelease?._embedded['sw360:cotsDetail']?.usedLicense ? (
                                    <BsCheck2
                                        size={20}
                                        className='green'
                                    />
                                ) : finalReleasePayload?.cotsDetails?.usedLicense ===
                                  targetRelease?._embedded['sw360:cotsDetail']?.usedLicense ? (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalReleasePayload({
                                                ...finalReleasePayload,
                                                cotsDetails: {
                                                    ...finalReleasePayload.cotsDetails,
                                                    usedLicense:
                                                        sourceReleaseDetail?._embedded['sw360:cotsDetail']?.usedLicense,
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
                                                    usedLicense:
                                                        targetRelease?._embedded['sw360:cotsDetail']?.usedLicense,
                                                },
                                            })
                                        }
                                    >
                                        <BsArrowCounterclockwise size={20} />
                                    </button>
                                )}
                            </div>
                            <div className='mt-2 col text-start'>
                                {sourceReleaseDetail?._embedded['sw360:cotsDetail']?.usedLicense}
                            </div>
                        </div>
                    </div>
                    <div className='border border-top-0 border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('Contains OSS')}</div>
                        <div className='d-flex row'>
                            <div className='mt-2 col text-end'>
                                {finalReleasePayload?.cotsDetails?.containsOSS === true ? (
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
                                {sourceReleaseDetail?._embedded['sw360:cotsDetail']?.containsOSS ===
                                targetRelease?._embedded['sw360:cotsDetail']?.containsOSS ? (
                                    <BsCheck2
                                        size={20}
                                        className='green'
                                    />
                                ) : finalReleasePayload?.cotsDetails?.containsOSS ===
                                  targetRelease?._embedded['sw360:cotsDetail']?.containsOSS ? (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalReleasePayload({
                                                ...finalReleasePayload,
                                                cotsDetails: {
                                                    ...finalReleasePayload.cotsDetails,
                                                    containsOSS:
                                                        sourceReleaseDetail?._embedded['sw360:cotsDetail']?.containsOSS,
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
                                                    containsOSS:
                                                        targetRelease?._embedded['sw360:cotsDetail']?.containsOSS,
                                                },
                                            })
                                        }
                                    >
                                        <BsArrowCounterclockwise size={20} />
                                    </button>
                                )}
                            </div>
                            <div className='mt-2 col text-start'>
                                {sourceReleaseDetail?._embedded['sw360:cotsDetail']?.containsOSS === true ? (
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
                        <div className='fw-bold text-blue'>{t('OSS Contract Signed')}</div>
                        <div className='d-flex row'>
                            <div className='mt-2 col text-end'>
                                {finalReleasePayload?.cotsDetails?.ossContractSigned === true ? (
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
                                {sourceReleaseDetail?._embedded['sw360:cotsDetail']?.ossContractSigned ===
                                targetRelease?._embedded['sw360:cotsDetail']?.ossContractSigned ? (
                                    <BsCheck2
                                        size={20}
                                        className='green'
                                    />
                                ) : finalReleasePayload?.cotsDetails?.ossContractSigned ===
                                  targetRelease?._embedded['sw360:cotsDetail']?.ossContractSigned ? (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalReleasePayload({
                                                ...finalReleasePayload,
                                                cotsDetails: {
                                                    ...finalReleasePayload.cotsDetails,
                                                    ossContractSigned:
                                                        sourceReleaseDetail?._embedded['sw360:cotsDetail']
                                                            ?.ossContractSigned,
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
                                                    ossContractSigned:
                                                        targetRelease?._embedded['sw360:cotsDetail']?.ossContractSigned,
                                                },
                                            })
                                        }
                                    >
                                        <BsArrowCounterclockwise size={20} />
                                    </button>
                                )}
                            </div>
                            <div className='mt-2 col text-start'>
                                {sourceReleaseDetail?._embedded['sw360:cotsDetail']?.ossContractSigned === true ? (
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
                        <div className='fw-bold text-blue'>{t('OSS Information URL')}</div>
                        <div className='d-flex row'>
                            <div className='mt-2 col text-end'>
                                {finalReleasePayload?.cotsDetails?.ossInformationURL}
                            </div>
                            <div className='col-12 col-md-2 mx-5 text-center'>
                                {sourceReleaseDetail?._embedded['sw360:cotsDetail']?.ossInformationURL ===
                                targetRelease?._embedded['sw360:cotsDetail']?.ossInformationURL ? (
                                    <BsCheck2
                                        size={20}
                                        className='green'
                                    />
                                ) : finalReleasePayload?.cotsDetails?.ossInformationURL ===
                                  targetRelease?._embedded['sw360:cotsDetail']?.ossInformationURL ? (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalReleasePayload({
                                                ...finalReleasePayload,
                                                cotsDetails: {
                                                    ...finalReleasePayload.cotsDetails,
                                                    ossInformationURL:
                                                        sourceReleaseDetail?._embedded['sw360:cotsDetail']
                                                            ?.ossInformationURL,
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
                                                    ossInformationURL:
                                                        targetRelease?._embedded['sw360:cotsDetail']?.ossInformationURL,
                                                },
                                            })
                                        }
                                    >
                                        <BsArrowCounterclockwise size={20} />
                                    </button>
                                )}
                            </div>
                            <div className='mt-2 col text-start'>
                                {sourceReleaseDetail?._embedded['sw360:cotsDetail']?.ossInformationURL}
                            </div>
                        </div>
                    </div>
                    <div className='border border-top-0 border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('Source Code Available')}</div>
                        <div className='d-flex row'>
                            <div className='mt-2 col text-end'>
                                {finalReleasePayload?.cotsDetails?.sourceCodeAvailable === true ? (
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
                                {sourceReleaseDetail?._embedded['sw360:cotsDetail']?.sourceCodeAvailable ===
                                targetRelease?._embedded['sw360:cotsDetail']?.sourceCodeAvailable ? (
                                    <BsCheck2
                                        size={20}
                                        className='green'
                                    />
                                ) : finalReleasePayload?.cotsDetails?.sourceCodeAvailable ===
                                  targetRelease?._embedded['sw360:cotsDetail']?.sourceCodeAvailable ? (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalReleasePayload({
                                                ...finalReleasePayload,
                                                cotsDetails: {
                                                    ...finalReleasePayload.cotsDetails,
                                                    sourceCodeAvailable:
                                                        sourceReleaseDetail?._embedded['sw360:cotsDetail']
                                                            ?.sourceCodeAvailable,
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
                                                    sourceCodeAvailable:
                                                        targetRelease?._embedded['sw360:cotsDetail']
                                                            ?.sourceCodeAvailable,
                                                },
                                            })
                                        }
                                    >
                                        <BsArrowCounterclockwise size={20} />
                                    </button>
                                )}
                            </div>
                            <div className='mt-2 col text-start'>
                                {sourceReleaseDetail?._embedded['sw360:cotsDetail']?.sourceCodeAvailable === true ? (
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
                </div>
            )}
        </>
    )
}
