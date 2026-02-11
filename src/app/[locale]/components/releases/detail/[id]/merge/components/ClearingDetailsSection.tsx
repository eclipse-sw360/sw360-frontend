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
import { ReleaseDetail } from '@/object-types'

export default function ClearingDetailsSection({
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
                    <h6 className='border-bottom fw-bold text-uppercase text-blue border-blue mb-2'>{t('Clearing Details')}</h6>
                    <div className='border border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('Binaries Original from Community')}</div>
                        <div className='d-flex row'>
                            <div className='mt-2 col text-end'>
                                {finalReleasePayload.clearingInformation?.binariesOriginalFromCommunity === true ?
                                    <>
                                        <BsCheck2Circle color='green' />
                                        Yes
                                    </>
                                    :
                                    <>
                                        <BsXCircle color='red' />
                                        No
                                    </>
                                }
                            </div>
                            <div className='col-12 col-md-2 mx-5 text-center'>
                                {sourceReleaseDetail?.clearingInformation?.binariesOriginalFromCommunity ===
                                    targetRelease?.clearingInformation?.binariesOriginalFromCommunity ? (
                                    <BsCheck2
                                        size={20}
                                        className='green'
                                    />
                                ) : finalReleasePayload?.clearingInformation?.binariesOriginalFromCommunity ===
                                    targetRelease?.clearingInformation?.binariesOriginalFromCommunity ? (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalReleasePayload({
                                                ...finalReleasePayload,
                                                clearingInformation: {
                                                    ...finalReleasePayload.clearingInformation,
                                                    binariesOriginalFromCommunity:
                                                        sourceReleaseDetail?.clearingInformation?.binariesOriginalFromCommunity,
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
                                                    binariesOriginalFromCommunity:
                                                        targetRelease?.clearingInformation?.binariesOriginalFromCommunity,
                                                },
                                            })
                                        }
                                    >
                                        <BsArrowCounterclockwise size={20} />
                                    </button>
                                )}
                            </div>
                            <div className='mt-2 col text-start'>
                                {sourceReleaseDetail?.clearingInformation?.binariesOriginalFromCommunity === true ?
                                    <>
                                        <BsCheck2Circle color='green' />
                                        Yes
                                    </>
                                    :
                                    <>
                                        <BsXCircle color='red' />
                                        No
                                    </>
                                }
                            </div>
                        </div>
                    </div>
                    <div className='border border-top-0 border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('Binaries Self-Made')}</div>
                        <div className='d-flex row'>
                            <div className='mt-2 col text-end'>
                                {finalReleasePayload.clearingInformation?.binariesSelfMade === true ?
                                    <>
                                        <BsCheck2Circle color='green' />
                                        Yes
                                    </>
                                    :
                                    <>
                                        <BsXCircle color='red' />
                                        No
                                    </>
                                }
                            </div>
                            <div className='col-12 col-md-2 mx-5 text-center'>
                                {sourceReleaseDetail?.clearingInformation?.binariesSelfMade ===
                                    targetRelease?.clearingInformation?.binariesSelfMade ? (
                                    <BsCheck2
                                        size={20}
                                        className='green'
                                    />
                                ) : finalReleasePayload?.clearingInformation?.binariesSelfMade ===
                                    targetRelease?.clearingInformation?.binariesSelfMade ? (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalReleasePayload({
                                                ...finalReleasePayload,
                                                clearingInformation: {
                                                    ...finalReleasePayload.clearingInformation,
                                                    binariesSelfMade:
                                                        sourceReleaseDetail?.clearingInformation?.binariesSelfMade,
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
                                                    binariesSelfMade:
                                                        targetRelease?.clearingInformation?.binariesSelfMade,
                                                },
                                            })
                                        }
                                    >
                                        <BsArrowCounterclockwise size={20} />
                                    </button>
                                )}
                            </div>
                            <div className='mt-2 col text-start'>
                                {sourceReleaseDetail?.clearingInformation?.binariesSelfMade === true ?
                                    <>
                                        <BsCheck2Circle color='green' />
                                        Yes
                                    </>
                                    :
                                    <>
                                        <BsXCircle color='red' />
                                        No
                                    </>
                                }
                            </div>
                        </div>
                    </div>
                    <div className='border border-top-0 border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('Component License Information')}</div>
                        <div className='d-flex row'>
                            <div className='mt-2 col text-end'>
                                {finalReleasePayload.clearingInformation?.componentLicenseInformation === true ?
                                    <>
                                        <BsCheck2Circle color='green' />
                                        Yes
                                    </>
                                    :
                                    <>
                                        <BsXCircle color='red' />
                                        No
                                    </>
                                }
                            </div>
                            <div className='col-12 col-md-2 mx-5 text-center'>
                                {sourceReleaseDetail?.clearingInformation?.componentLicenseInformation ===
                                    targetRelease?.clearingInformation?.componentLicenseInformation ? (
                                    <BsCheck2
                                        size={20}
                                        className='green'
                                    />
                                ) : finalReleasePayload?.clearingInformation?.componentLicenseInformation ===
                                    targetRelease?.clearingInformation?.componentLicenseInformation ? (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalReleasePayload({
                                                ...finalReleasePayload,
                                                clearingInformation: {
                                                    ...finalReleasePayload.clearingInformation,
                                                    componentLicenseInformation:
                                                        sourceReleaseDetail?.clearingInformation?.componentLicenseInformation,
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
                                                    componentLicenseInformation:
                                                        targetRelease?.clearingInformation?.componentLicenseInformation,
                                                },
                                            })
                                        }
                                    >
                                        <BsArrowCounterclockwise size={20} />
                                    </button>
                                )}
                            </div>
                            <div className='mt-2 col text-start'>
                                {sourceReleaseDetail?.clearingInformation?.componentLicenseInformation === true ?
                                    <>
                                        <BsCheck2Circle color='green' />
                                        Yes
                                    </>
                                    :
                                    <>
                                        <BsXCircle color='red' />
                                        No
                                    </>
                                }
                            </div>
                        </div>
                    </div>
                    <div className='border border-top-0 border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('Source Code Delivery')}</div>
                        <div className='d-flex row'>
                            <div className='mt-2 col text-end'>
                                {finalReleasePayload.clearingInformation?.sourceCodeDelivery === true ?
                                    <>
                                        <BsCheck2Circle color='green' />
                                        Yes
                                    </>
                                    :
                                    <>
                                        <BsXCircle color='red' />
                                        No
                                    </>
                                }
                            </div>
                            <div className='col-12 col-md-2 mx-5 text-center'>
                                {sourceReleaseDetail?.clearingInformation?.sourceCodeDelivery ===
                                    targetRelease?.clearingInformation?.sourceCodeDelivery ? (
                                    <BsCheck2
                                        size={20}
                                        className='green'
                                    />
                                ) : finalReleasePayload?.clearingInformation?.sourceCodeDelivery ===
                                    targetRelease?.clearingInformation?.sourceCodeDelivery ? (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalReleasePayload({
                                                ...finalReleasePayload,
                                                clearingInformation: {
                                                    ...finalReleasePayload.clearingInformation,
                                                    sourceCodeDelivery:
                                                        sourceReleaseDetail?.clearingInformation?.sourceCodeDelivery,
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
                                                    sourceCodeDelivery:
                                                        targetRelease?.clearingInformation?.sourceCodeDelivery,
                                                },
                                            })
                                        }
                                    >
                                        <BsArrowCounterclockwise size={20} />
                                    </button>
                                )}
                            </div>
                            <div className='mt-2 col text-start'>
                                {sourceReleaseDetail?.clearingInformation?.sourceCodeDelivery === true ?
                                    <>
                                        <BsCheck2Circle color='green' />
                                        Yes
                                    </>
                                    :
                                    <>
                                        <BsXCircle color='red' />
                                        No
                                    </>
                                }
                            </div>
                        </div>
                    </div>
                    <div className='border border-top-0 border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('Source Code Original from Community')}</div>
                        <div className='d-flex row'>
                            <div className='mt-2 col text-end'>
                                {finalReleasePayload.clearingInformation?.sourceCodeOriginalFromCommunity === true ?
                                    <>
                                        <BsCheck2Circle color='green' />
                                        Yes
                                    </>
                                    :
                                    <>
                                        <BsXCircle color='red' />
                                        No
                                    </>
                                }
                            </div>
                            <div className='col-12 col-md-2 mx-5 text-center'>
                                {sourceReleaseDetail?.clearingInformation?.sourceCodeOriginalFromCommunity ===
                                    targetRelease?.clearingInformation?.sourceCodeOriginalFromCommunity ? (
                                    <BsCheck2
                                        size={20}
                                        className='green'
                                    />
                                ) : finalReleasePayload?.clearingInformation?.sourceCodeOriginalFromCommunity ===
                                    targetRelease?.clearingInformation?.sourceCodeOriginalFromCommunity ? (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalReleasePayload({
                                                ...finalReleasePayload,
                                                clearingInformation: {
                                                    ...finalReleasePayload.clearingInformation,
                                                    sourceCodeOriginalFromCommunity:
                                                        sourceReleaseDetail?.clearingInformation?.sourceCodeOriginalFromCommunity,
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
                                                    sourceCodeOriginalFromCommunity:
                                                        targetRelease?.clearingInformation?.sourceCodeOriginalFromCommunity,
                                                },
                                            })
                                        }
                                    >
                                        <BsArrowCounterclockwise size={20} />
                                    </button>
                                )}
                            </div>
                            <div className='mt-2 col text-start'>
                                {sourceReleaseDetail?.clearingInformation?.sourceCodeOriginalFromCommunity === true ?
                                    <>
                                        <BsCheck2Circle color='green' />
                                        Yes
                                    </>
                                    :
                                    <>
                                        <BsXCircle color='red' />
                                        No
                                    </>
                                }
                            </div>
                        </div>
                    </div>
                    <div className='border border-top-0 border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('Source Code Tool-Made')}</div>
                        <div className='d-flex row'>
                            <div className='mt-2 col text-end'>
                                {finalReleasePayload.clearingInformation?.sourceCodeToolMade === true ?
                                    <>
                                        <BsCheck2Circle color='green' />
                                        Yes
                                    </>
                                    :
                                    <>
                                        <BsXCircle color='red' />
                                        No
                                    </>
                                }
                            </div>
                            <div className='col-12 col-md-2 mx-5 text-center'>
                                {sourceReleaseDetail?.clearingInformation?.sourceCodeToolMade ===
                                    targetRelease?.clearingInformation?.sourceCodeToolMade ? (
                                    <BsCheck2
                                        size={20}
                                        className='green'
                                    />
                                ) : finalReleasePayload?.clearingInformation?.sourceCodeToolMade ===
                                    targetRelease?.clearingInformation?.sourceCodeToolMade ? (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalReleasePayload({
                                                ...finalReleasePayload,
                                                clearingInformation: {
                                                    ...finalReleasePayload.clearingInformation,
                                                    sourceCodeToolMade:
                                                        sourceReleaseDetail?.clearingInformation?.sourceCodeToolMade,
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
                                                    sourceCodeToolMade:
                                                        targetRelease?.clearingInformation?.sourceCodeToolMade,
                                                },
                                            })
                                        }
                                    >
                                        <BsArrowCounterclockwise size={20} />
                                    </button>
                                )}
                            </div>
                            <div className='mt-2 col text-start'>
                                {sourceReleaseDetail?.clearingInformation?.sourceCodeToolMade === true ?
                                    <>
                                        <BsCheck2Circle color='green' />
                                        Yes
                                    </>
                                    :
                                    <>
                                        <BsXCircle color='red' />
                                        No
                                    </>
                                }
                            </div>
                        </div>
                    </div>
                    <div className='border border-top-0 border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('Source Code Self-Made')}</div>
                        <div className='d-flex row'>
                            <div className='mt-2 col text-end'>
                                {finalReleasePayload.clearingInformation?.sourceCodeSelfMade === true ?
                                    <>
                                        <BsCheck2Circle color='green' />
                                        Yes
                                    </>
                                    :
                                    <>
                                        <BsXCircle color='red' />
                                        No
                                    </>
                                }
                            </div>
                            <div className='col-12 col-md-2 mx-5 text-center'>
                                {sourceReleaseDetail?.clearingInformation?.sourceCodeSelfMade ===
                                    targetRelease?.clearingInformation?.sourceCodeSelfMade ? (
                                    <BsCheck2
                                        size={20}
                                        className='green'
                                    />
                                ) : finalReleasePayload?.clearingInformation?.sourceCodeSelfMade ===
                                    targetRelease?.clearingInformation?.sourceCodeSelfMade ? (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalReleasePayload({
                                                ...finalReleasePayload,
                                                clearingInformation: {
                                                    ...finalReleasePayload.clearingInformation,
                                                    sourceCodeSelfMade:
                                                        sourceReleaseDetail?.clearingInformation?.sourceCodeSelfMade,
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
                                                    sourceCodeSelfMade:
                                                        targetRelease?.clearingInformation?.sourceCodeSelfMade,
                                                },
                                            })
                                        }
                                    >
                                        <BsArrowCounterclockwise size={20} />
                                    </button>
                                )}
                            </div>
                            <div className='mt-2 col text-start'>
                                {sourceReleaseDetail?.clearingInformation?.sourceCodeSelfMade === true ?
                                    <>
                                        <BsCheck2Circle color='green' />
                                        Yes
                                    </>
                                    :
                                    <>
                                        <BsXCircle color='red' />
                                        No
                                    </>
                                }
                            </div>
                        </div>
                    </div>
                    <div className='border border-top-0 border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('Screenshot of Website')}</div>
                        <div className='d-flex row'>
                            <div className='mt-2 col text-end'>
                                {finalReleasePayload.clearingInformation?.screenshotOfWebSite === true ?
                                    <>
                                        <BsCheck2Circle color='green' />
                                        Yes
                                    </>
                                    :
                                    <>
                                        <BsXCircle color='red' />
                                        No
                                    </>
                                }
                            </div>
                            <div className='col-12 col-md-2 mx-5 text-center'>
                                {sourceReleaseDetail?.clearingInformation?.screenshotOfWebSite ===
                                    targetRelease?.clearingInformation?.screenshotOfWebSite ? (
                                    <BsCheck2
                                        size={20}
                                        className='green'
                                    />
                                ) : finalReleasePayload?.clearingInformation?.screenshotOfWebSite ===
                                    targetRelease?.clearingInformation?.screenshotOfWebSite ? (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalReleasePayload({
                                                ...finalReleasePayload,
                                                clearingInformation: {
                                                    ...finalReleasePayload.clearingInformation,
                                                    screenshotOfWebSite:
                                                        sourceReleaseDetail?.clearingInformation?.screenshotOfWebSite,
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
                                                    screenshotOfWebSite:
                                                        targetRelease?.clearingInformation?.screenshotOfWebSite,
                                                },
                                            })
                                        }
                                    >
                                        <BsArrowCounterclockwise size={20} />
                                    </button>
                                )}
                            </div>
                            <div className='mt-2 col text-start'>
                                {sourceReleaseDetail?.clearingInformation?.screenshotOfWebSite === true ?
                                    <>
                                        <BsCheck2Circle color='green' />
                                        Yes
                                    </>
                                    :
                                    <>
                                        <BsXCircle color='red' />
                                        No
                                    </>
                                }
                            </div>
                        </div>
                    </div>
                    <div className='border border-top-0 border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('Finalized License Scan Report')}</div>
                        <div className='d-flex row'>
                            <div className='mt-2 col text-end'>
                                {finalReleasePayload.clearingInformation?.finalizedLicenseScanReport === true ?
                                    <>
                                        <BsCheck2Circle color='green' />
                                        Yes
                                    </>
                                    :
                                    <>
                                        <BsXCircle color='red' />
                                        No
                                    </>
                                }
                            </div>
                            <div className='col-12 col-md-2 mx-5 text-center'>
                                {sourceReleaseDetail?.clearingInformation?.finalizedLicenseScanReport ===
                                    targetRelease?.clearingInformation?.finalizedLicenseScanReport ? (
                                    <BsCheck2
                                        size={20}
                                        className='green'
                                    />
                                ) : finalReleasePayload?.clearingInformation?.finalizedLicenseScanReport ===
                                    targetRelease?.clearingInformation?.finalizedLicenseScanReport ? (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalReleasePayload({
                                                ...finalReleasePayload,
                                                clearingInformation: {
                                                    ...finalReleasePayload.clearingInformation,
                                                    finalizedLicenseScanReport:
                                                        sourceReleaseDetail?.clearingInformation?.finalizedLicenseScanReport,
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
                                                    finalizedLicenseScanReport:
                                                        targetRelease?.clearingInformation?.finalizedLicenseScanReport,
                                                },
                                            })
                                        }
                                    >
                                        <BsArrowCounterclockwise size={20} />
                                    </button>
                                )}
                            </div>
                            <div className='mt-2 col text-start'>
                                {sourceReleaseDetail?.clearingInformation?.finalizedLicenseScanReport === true ?
                                    <>
                                        <BsCheck2Circle color='green' />
                                        Yes
                                    </>
                                    :
                                    <>
                                        <BsXCircle color='red' />
                                        No
                                    </>
                                }
                            </div>
                        </div>
                    </div>
                    <div className='border border-top-0 border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('License Scan Report Result')}</div>
                        <div className='d-flex row'>
                            <div className='mt-2 col text-end'>
                                {finalReleasePayload.clearingInformation?.licenseScanReportResult === true ?
                                    <>
                                        <BsCheck2Circle color='green' />
                                        Yes
                                    </>
                                    :
                                    <>
                                        <BsXCircle color='red' />
                                        No
                                    </>
                                }
                            </div>
                            <div className='col-12 col-md-2 mx-5 text-center'>
                                {sourceReleaseDetail?.clearingInformation?.licenseScanReportResult ===
                                    targetRelease?.clearingInformation?.licenseScanReportResult ? (
                                    <BsCheck2
                                        size={20}
                                        className='green'
                                    />
                                ) : finalReleasePayload?.clearingInformation?.licenseScanReportResult ===
                                    targetRelease?.clearingInformation?.licenseScanReportResult ? (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalReleasePayload({
                                                ...finalReleasePayload,
                                                clearingInformation: {
                                                    ...finalReleasePayload.clearingInformation,
                                                    licenseScanReportResult:
                                                        sourceReleaseDetail?.clearingInformation?.licenseScanReportResult,
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
                                                    licenseScanReportResult:
                                                        targetRelease?.clearingInformation?.licenseScanReportResult,
                                                },
                                            })
                                        }
                                    >
                                        <BsArrowCounterclockwise size={20} />
                                    </button>
                                )}
                            </div>
                            <div className='mt-2 col text-start'>
                                {sourceReleaseDetail?.clearingInformation?.licenseScanReportResult === true ?
                                    <>
                                        <BsCheck2Circle color='green' />
                                        Yes
                                    </>
                                    :
                                    <>
                                        <BsXCircle color='red' />
                                        No
                                    </>
                                }
                            </div>
                        </div>
                    </div>
                    <div className='border border-top-0 border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('Legal Evaluation')}</div>
                        <div className='d-flex row'>
                            <div className='mt-2 col text-end'>
                                {finalReleasePayload.clearingInformation?.legalEvaluation === true ?
                                    <>
                                        <BsCheck2Circle color='green' />
                                        Yes
                                    </>
                                    :
                                    <>
                                        <BsXCircle color='red' />
                                        No
                                    </>
                                }
                            </div>
                            <div className='col-12 col-md-2 mx-5 text-center'>
                                {sourceReleaseDetail?.clearingInformation?.legalEvaluation ===
                                    targetRelease?.clearingInformation?.legalEvaluation ? (
                                    <BsCheck2
                                        size={20}
                                        className='green'
                                    />
                                ) : finalReleasePayload?.clearingInformation?.legalEvaluation ===
                                    targetRelease?.clearingInformation?.legalEvaluation ? (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalReleasePayload({
                                                ...finalReleasePayload,
                                                clearingInformation: {
                                                    ...finalReleasePayload.clearingInformation,
                                                    legalEvaluation:
                                                        sourceReleaseDetail?.clearingInformation?.legalEvaluation,
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
                                                    legalEvaluation:
                                                        targetRelease?.clearingInformation?.legalEvaluation,
                                                },
                                            })
                                        }
                                    >
                                        <BsArrowCounterclockwise size={20} />
                                    </button>
                                )}
                            </div>
                            <div className='mt-2 col text-start'>
                                {sourceReleaseDetail?.clearingInformation?.legalEvaluation === true ?
                                    <>
                                        <BsCheck2Circle color='green' />
                                        Yes
                                    </>
                                    :
                                    <>
                                        <BsXCircle color='red' />
                                        No
                                    </>
                                }
                            </div>
                        </div>
                    </div>
                    <div className='border border-top-0 border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('License Agreement')}</div>
                        <div className='d-flex row'>
                            <div className='mt-2 col text-end'>
                                {finalReleasePayload.clearingInformation?.licenseAgreement === true ?
                                    <>
                                        <BsCheck2Circle color='green' />
                                        Yes
                                    </>
                                    :
                                    <>
                                        <BsXCircle color='red' />
                                        No
                                    </>
                                }
                            </div>
                            <div className='col-12 col-md-2 mx-5 text-center'>
                                {sourceReleaseDetail?.clearingInformation?.licenseAgreement ===
                                    targetRelease?.clearingInformation?.licenseAgreement ? (
                                    <BsCheck2
                                        size={20}
                                        className='green'
                                    />
                                ) : finalReleasePayload?.clearingInformation?.licenseAgreement ===
                                    targetRelease?.clearingInformation?.licenseAgreement ? (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalReleasePayload({
                                                ...finalReleasePayload,
                                                clearingInformation: {
                                                    ...finalReleasePayload.clearingInformation,
                                                    licenseAgreement:
                                                        sourceReleaseDetail?.clearingInformation?.licenseAgreement,
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
                                                    licenseAgreement:
                                                        targetRelease?.clearingInformation?.licenseAgreement,
                                                },
                                            })
                                        }
                                    >
                                        <BsArrowCounterclockwise size={20} />
                                    </button>
                                )}
                            </div>
                            <div className='mt-2 col text-start'>
                                {sourceReleaseDetail?.clearingInformation?.licenseAgreement === true ?
                                    <>
                                        <BsCheck2Circle color='green' />
                                        Yes
                                    </>
                                    :
                                    <>
                                        <BsXCircle color='red' />
                                        No
                                    </>
                                }
                            </div>
                        </div>
                    </div>
                    <div className='border border-top-0 border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('Component Clearing Report')}</div>
                        <div className='d-flex row'>
                            <div className='mt-2 col text-end'>
                                {finalReleasePayload.clearingInformation?.componentClearingReport === true ?
                                    <>
                                        <BsCheck2Circle color='green' />
                                        Yes
                                    </>
                                    :
                                    <>
                                        <BsXCircle color='red' />
                                        No
                                    </>
                                }
                            </div>
                            <div className='col-12 col-md-2 mx-5 text-center'>
                                {sourceReleaseDetail?.clearingInformation?.componentClearingReport ===
                                    targetRelease?.clearingInformation?.componentClearingReport ? (
                                    <BsCheck2
                                        size={20}
                                        className='green'
                                    />
                                ) : finalReleasePayload?.clearingInformation?.componentClearingReport ===
                                    targetRelease?.clearingInformation?.componentClearingReport ? (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalReleasePayload({
                                                ...finalReleasePayload,
                                                clearingInformation: {
                                                    ...finalReleasePayload.clearingInformation,
                                                    componentClearingReport:
                                                        sourceReleaseDetail?.clearingInformation?.componentClearingReport,
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
                                                    componentClearingReport:
                                                        targetRelease?.clearingInformation?.componentClearingReport,
                                                },
                                            })
                                        }
                                    >
                                        <BsArrowCounterclockwise size={20} />
                                    </button>
                                )}
                            </div>
                            <div className='mt-2 col text-start'>
                                {sourceReleaseDetail?.clearingInformation?.componentClearingReport === true ?
                                    <>
                                        <BsCheck2Circle color='green' />
                                        Yes
                                    </>
                                    :
                                    <>
                                        <BsXCircle color='red' />
                                        No
                                    </>
                                }
                            </div>
                        </div>
                    </div>
                    <div className='border border-top-0 border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('Scanned')}</div>
                        <div className='d-flex row'>
                            <div className='mt-2 col text-end'>
                                {finalReleasePayload.clearingInformation?.scanned}
                            </div>
                            <div className='col-12 col-md-2 mx-5 text-center'>
                                {sourceReleaseDetail?.clearingInformation?.scanned ===
                                    targetRelease?.clearingInformation?.scanned ? (
                                    <BsCheck2
                                        size={20}
                                        className='green'
                                    />
                                ) : finalReleasePayload?.clearingInformation?.scanned ===
                                    targetRelease?.clearingInformation?.scanned ? (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalReleasePayload({
                                                ...finalReleasePayload,
                                                clearingInformation: {
                                                    ...finalReleasePayload.clearingInformation,
                                                    scanned:
                                                        sourceReleaseDetail?.clearingInformation?.scanned,
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
                                                    scanned:
                                                        targetRelease?.clearingInformation?.scanned,
                                                },
                                            })
                                        }
                                    >
                                        <BsArrowCounterclockwise size={20} />
                                    </button>
                                )}
                            </div>
                            <div className='mt-2 col text-start'>
                                {sourceReleaseDetail?.clearingInformation?.scanned}
                            </div>
                        </div>
                    </div>
                    <div className='border border-top-0 border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('Clearing Standard')}</div>
                        <div className='d-flex row'>
                            <div className='mt-2 col text-end'>
                                {finalReleasePayload.clearingInformation?.clearingStandard}
                            </div>
                            <div className='col-12 col-md-2 mx-5 text-center'>
                                {sourceReleaseDetail?.clearingInformation?.clearingStandard ===
                                    targetRelease?.clearingInformation?.clearingStandard ? (
                                    <BsCheck2
                                        size={20}
                                        className='green'
                                    />
                                ) : finalReleasePayload?.clearingInformation?.clearingStandard ===
                                    targetRelease?.clearingInformation?.clearingStandard ? (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalReleasePayload({
                                                ...finalReleasePayload,
                                                clearingInformation: {
                                                    ...finalReleasePayload.clearingInformation,
                                                    clearingStandard:
                                                        sourceReleaseDetail?.clearingInformation?.clearingStandard,
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
                                                    clearingStandard:
                                                        targetRelease?.clearingInformation?.clearingStandard,
                                                },
                                            })
                                        }
                                    >
                                        <BsArrowCounterclockwise size={20} />
                                    </button>
                                )}
                            </div>
                            <div className='mt-2 col text-start'>
                                {sourceReleaseDetail?.clearingInformation?.clearingStandard}
                            </div>
                        </div>
                    </div>
                    <div className='border border-top-0 border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('External URL')}</div>
                        <div className='d-flex row'>
                            <div className='mt-2 col text-end'>
                                {finalReleasePayload.clearingInformation?.externalUrl}
                            </div>
                            <div className='col-12 col-md-2 mx-5 text-center'>
                                {sourceReleaseDetail?.clearingInformation?.externalUrl ===
                                    targetRelease?.clearingInformation?.externalUrl ? (
                                    <BsCheck2
                                        size={20}
                                        className='green'
                                    />
                                ) : finalReleasePayload?.clearingInformation?.externalUrl ===
                                    targetRelease?.clearingInformation?.externalUrl ? (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalReleasePayload({
                                                ...finalReleasePayload,
                                                clearingInformation: {
                                                    ...finalReleasePayload.clearingInformation,
                                                    externalUrl:
                                                        sourceReleaseDetail?.clearingInformation?.externalUrl,
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
                                                    externalUrl:
                                                        targetRelease?.clearingInformation?.externalUrl,
                                                },
                                            })
                                        }
                                    >
                                        <BsArrowCounterclockwise size={20} />
                                    </button>
                                )}
                            </div>
                            <div className='mt-2 col text-start'>
                                {sourceReleaseDetail?.clearingInformation?.externalUrl}
                            </div>
                        </div>
                    </div>
                    <div className='border border-top-0 border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('Comment')}</div>
                        <div className='d-flex row'>
                            <div className='mt-2 col text-end'>
                                {finalReleasePayload.clearingInformation?.comment}
                            </div>
                            <div className='col-12 col-md-2 mx-5 text-center'>
                                {sourceReleaseDetail?.clearingInformation?.comment ===
                                    targetRelease?.clearingInformation?.comment ? (
                                    <BsCheck2
                                        size={20}
                                        className='green'
                                    />
                                ) : finalReleasePayload?.clearingInformation?.comment ===
                                    targetRelease?.clearingInformation?.comment ? (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalReleasePayload({
                                                ...finalReleasePayload,
                                                clearingInformation: {
                                                    ...finalReleasePayload.clearingInformation,
                                                    comment:
                                                        sourceReleaseDetail?.clearingInformation?.comment,
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
                                                    comment:
                                                        targetRelease?.clearingInformation?.comment,
                                                },
                                            })
                                        }
                                    >
                                        <BsArrowCounterclockwise size={20} />
                                    </button>
                                )}
                            </div>
                            <div className='mt-2 col text-start'>
                                {sourceReleaseDetail?.clearingInformation?.comment}
                            </div>
                        </div>
                    </div>
                </div >
            )
            }
        </>
    )
}
