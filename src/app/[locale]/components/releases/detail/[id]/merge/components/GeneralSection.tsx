// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { StatusCodes } from 'http-status-codes'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Dispatch, ReactNode, SetStateAction, useEffect, useState } from 'react'
// import { BiInfoCircle } from 'react-icons/bi'
import { FaLongArrowAltLeft, FaUndo } from 'react-icons/fa'
import { TiTick } from 'react-icons/ti'
import { ErrorDetails, ListFieldProcessComponent, ReleaseDetail, Vendor } from '@/object-types'
import MessageService from '@/services/message.service'
import CommonUtils from '@/utils/common.utils'
import { ApiUtils } from '@/utils/index'

export default function GeneralSection({
    targetRelease,
    sourceRelease,
    finalReleasePayload,
    setFinalReleasePayload,
}: {
    targetRelease: ReleaseDetail | null
    sourceRelease: ReleaseDetail | null
    finalReleasePayload: ReleaseDetail | null
    setFinalReleasePayload: Dispatch<SetStateAction<null | ReleaseDetail>>
}): ReactNode {
    const t = useTranslations('default')
    const [programmingMergeList, setProgrammingMergeList] = useState<ListFieldProcessComponent[]>([])
    const [operatingSystemMergeList, setOperatingSystemMergeList] = useState<ListFieldProcessComponent[]>([])
    const [softwarePlatformMergeList, setSoftwarePlatformMergeList] = useState<ListFieldProcessComponent[]>([])
    // const [defaultVendor, setDefaultVendor] = useState<Vendor>({})
    // const [categoryMergeList, setCategoryMergeList] = useState<ListFieldProcessComponent[]>([])
    const [sourceReleaseDetail, setSourceReleaseDetail] = useState<ReleaseDetail | null>()
    const session = useSession()

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            signOut()
        }
    }, [
        session,
    ])

    useEffect(() => {
        if (session.status === 'loading') return
        const controller = new AbortController()
        const signal = controller.signal

        void (async () => {
            try {
                if (CommonUtils.isNullOrUndefined(session.data)) return signOut()
                const queryUrl = CommonUtils.createUrlWithParams(`releases/${sourceRelease?.id}`, {
                    allDetails: 'true',
                })
                const response = await ApiUtils.GET(queryUrl, session.data.user.access_token, signal)
                if (response.status !== StatusCodes.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new Error(err.message)
                }

                const data = (await response.json()) as ReleaseDetail
                console.log('data------', data)

                setSourceReleaseDetail(
                    CommonUtils.isNullOrUndefined(data)
                        ? null
                        : data
                )
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return
                }
                const message = error instanceof Error ? error.message : String(error)
                MessageService.error(message)
            }
        })()

        console.log('sourceReleaseDetail------', sourceReleaseDetail)
        return () => controller.abort()

    }, [
        session, sourceRelease?.id,
    ])

    useEffect(() => {
        setProgrammingMergeList([
            ...(targetRelease?.languages ?? ([] as string[]))
                .filter((c) => (sourceReleaseDetail?.languages ?? ([] as string[])).indexOf(c) !== -1)
                .map((c) => ({
                    value: c,
                    presentInSource: true,
                    presentInTarget: true,
                    overWritten: false,
                })),

            ...(targetRelease?.languages ?? ([] as string[]))
                .filter((c) => (sourceReleaseDetail?.languages ?? ([] as string[])).indexOf(c) === -1)
                .map((c) => ({
                    value: c,
                    presentInSource: false,
                    presentInTarget: true,
                    overWritten: false,
                })),

            ...(sourceReleaseDetail?.languages ?? ([] as string[]))
                .filter((c) => (targetRelease?.languages ?? ([] as string[])).indexOf(c) === -1)
                .map((c) => ({
                    value: c,
                    presentInSource: true,
                    presentInTarget: false,
                    overWritten: false,
                })),
        ])
    }, [
        targetRelease,
        sourceReleaseDetail,
    ])

    useEffect(() => {
        setOperatingSystemMergeList([
            ...(targetRelease?.operatingSystems ?? ([] as string[]))
                .filter((c) => (sourceReleaseDetail?.operatingSystems ?? ([] as string[])).indexOf(c) !== -1)
                .map((c) => ({
                    value: c,
                    presentInSource: true,
                    presentInTarget: true,
                    overWritten: false,
                })),

            ...(targetRelease?.operatingSystems ?? ([] as string[]))
                .filter((c) => (sourceReleaseDetail?.operatingSystems ?? ([] as string[])).indexOf(c) === -1)
                .map((c) => ({
                    value: c,
                    presentInSource: false,
                    presentInTarget: true,
                    overWritten: false,
                })),

            ...(sourceReleaseDetail?.operatingSystems ?? ([] as string[]))
                .filter((c) => (targetRelease?.operatingSystems ?? ([] as string[])).indexOf(c) === -1)
                .map((c) => ({
                    value: c,
                    presentInSource: true,
                    presentInTarget: false,
                    overWritten: false,
                })),
        ])
    }, [
        targetRelease,
        sourceReleaseDetail,
    ])

    useEffect(() => {
        setSoftwarePlatformMergeList([
            ...(targetRelease?.softwarePlatforms ?? ([] as string[]))
                .filter((c) => (sourceReleaseDetail?.softwarePlatforms ?? ([] as string[])).indexOf(c) !== -1)
                .map((c) => ({
                    value: c,
                    presentInSource: true,
                    presentInTarget: true,
                    overWritten: false,
                })),

            ...(targetRelease?.softwarePlatforms ?? ([] as string[]))
                .filter((c) => (sourceReleaseDetail?.softwarePlatforms ?? ([] as string[])).indexOf(c) === -1)
                .map((c) => ({
                    value: c,
                    presentInSource: false,
                    presentInTarget: true,
                    overWritten: false,
                })),

            ...(sourceReleaseDetail?.softwarePlatforms ?? ([] as string[]))
                .filter((c) => (targetRelease?.softwarePlatforms ?? ([] as string[])).indexOf(c) === -1)
                .map((c) => ({
                    value: c,
                    presentInSource: true,
                    presentInTarget: false,
                    overWritten: false,
                })),
        ])
    }, [
        targetRelease,
        sourceReleaseDetail,
    ])

    return (
        <>
            {targetRelease && sourceReleaseDetail && finalReleasePayload && (
                <div className='mb-3'>
                    <h6 className='border-bottom fw-bold text-uppercase text-blue border-blue mb-2'>{t('General')}</h6>
                    <div className='border border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('Name')}</div>
                        <div className='d-flex row'>
                            <div className='mt-2 col text-end'>{finalReleasePayload.name}</div>
                            <div className='col-12 col-md-2 mx-5 text-center'>
                                {sourceReleaseDetail.name === targetRelease.name ? (
                                    <TiTick
                                        size={40}
                                        className='green'
                                    />
                                ) : finalReleasePayload.name === targetRelease.name ? (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalReleasePayload({
                                                ...finalReleasePayload,
                                                name: sourceReleaseDetail.name,
                                            })
                                        }
                                    >
                                        <FaLongArrowAltLeft />
                                    </button>
                                ) : (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalReleasePayload({
                                                ...finalReleasePayload,
                                                name: targetRelease.name,
                                            })
                                        }
                                    >
                                        <FaUndo />
                                    </button>
                                )}
                            </div>
                            <div className='mt-2 col text-start'>{sourceReleaseDetail.name}</div>
                        </div>
                    </div>
                    <div className='border border-top-0 border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('Version')}</div>
                        <div className='d-flex row'>
                            <div className='mt-2 col text-end'>{finalReleasePayload.version}</div>
                            <div className='col-12 col-md-2 mx-5 text-center'>
                                {sourceReleaseDetail.version === targetRelease.version ? (
                                    <TiTick
                                        size={40}
                                        className='green'
                                    />
                                ) : finalReleasePayload.version === targetRelease.version ? (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalReleasePayload({
                                                ...finalReleasePayload,
                                                version: sourceReleaseDetail.version,
                                            })
                                        }
                                    >
                                        <FaLongArrowAltLeft />
                                    </button>
                                ) : (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalReleasePayload({
                                                ...finalReleasePayload,
                                                version: targetRelease.version,
                                            })
                                        }
                                    >
                                        <FaUndo />
                                    </button>
                                )}
                            </div>
                            <div className='mt-2 col text-start'>{sourceReleaseDetail.version}</div>
                        </div>
                    </div>
                    <div className='border border-top-0 border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('Created On')}</div>
                        <div className='d-flex row'>
                            <div className='mt-2 col text-end'>{finalReleasePayload.createdOn}</div>
                            <div className='col-12 col-md-2 mx-5 text-center'>
                                {sourceReleaseDetail.createdOn === targetRelease.createdOn ? (
                                    <TiTick
                                        size={40}
                                        className='green'
                                    />
                                ) : finalReleasePayload.createdOn === targetRelease.createdOn ? (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalReleasePayload({
                                                ...finalReleasePayload,
                                                createdOn: sourceReleaseDetail.createdOn,
                                            })
                                        }
                                    >
                                        <FaLongArrowAltLeft />
                                    </button>
                                ) : (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalReleasePayload({
                                                ...finalReleasePayload,
                                                createdOn: targetRelease.createdOn,
                                            })
                                        }
                                    >
                                        <FaUndo />
                                    </button>
                                )}
                            </div>
                            <div className='mt-2 col text-start'>{sourceReleaseDetail.createdOn}</div>
                        </div>
                    </div>
                    <div className='border border-top-0 border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('Created By')}</div>
                        <div className='d-flex row'>
                            <div className='mt-2 col text-end'>{finalReleasePayload.createdBy}</div>
                            <div className='col-12 col-md-2 mx-5 text-center'>
                                {sourceReleaseDetail.createdBy === targetRelease.createdBy ? (
                                    <TiTick
                                        size={40}
                                        className='green'
                                    />
                                ) : finalReleasePayload.createdBy === targetRelease.createdBy ? (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalReleasePayload({
                                                ...finalReleasePayload,
                                                createdBy: sourceReleaseDetail.createdBy,
                                            })
                                        }
                                    >
                                        <FaLongArrowAltLeft />
                                    </button>
                                ) : (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalReleasePayload({
                                                ...finalReleasePayload,
                                                createdBy: targetRelease.createdBy,
                                            })
                                        }
                                    >
                                        <FaUndo />
                                    </button>
                                )}
                            </div>
                            <div className='mt-2 col text-start'>{sourceReleaseDetail.createdBy}</div>
                        </div>
                    </div>
                    <div className='border border-top-0 border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('Programming Languages')}</div>
                        {programmingMergeList.map((c) => {
                            if (c.presentInSource && c.presentInTarget) {
                                return (
                                    <div
                                        className='d-flex row mb-1'
                                        key={c.value}
                                    >
                                        <div className='mt-2 col text-end'>{c.value}</div>
                                        <div className='col-12 col-md-2 mx-5 text-center'>
                                            <TiTick
                                                size={25}
                                                className='green'
                                            />
                                        </div>
                                        <div className='mt-2 col text-start'>{c.value}</div>
                                    </div>
                                )
                            } else if (c.presentInTarget) {
                                return (
                                    <div
                                        className='d-flex row mb-1'
                                        key={c.value}
                                    >
                                        <div className='mt-2 col text-end'>{c.overWritten ? '' : c.value}</div>
                                        <div className='col-12 col-md-2 mx-5 text-center'>
                                            {!c.overWritten ? (
                                                <button
                                                    className='btn btn-secondary px-2'
                                                    onClick={() => {
                                                        const newProgrammingLanguages = (
                                                            finalReleasePayload.languages ?? []
                                                        ).filter((lang) => lang !== c.value)
                                                        setFinalReleasePayload({
                                                            ...finalReleasePayload,
                                                            languages: newProgrammingLanguages,
                                                        })

                                                        const updatedProgrammingLanguageMergeList = programmingMergeList.map(
                                                            (lang) => {
                                                                if (lang.value === c.value) {
                                                                    return {
                                                                        ...lang,
                                                                        overWritten: true,
                                                                    }
                                                                }
                                                                return lang
                                                            },
                                                        )
                                                        setProgrammingMergeList(updatedProgrammingLanguageMergeList)
                                                    }}
                                                >
                                                    <FaLongArrowAltLeft />
                                                </button>
                                            ) : (
                                                <button
                                                    className='btn btn-secondary px-2'
                                                    onClick={() => {
                                                        const programmingLanguages = finalReleasePayload.languages ?? []
                                                        programmingLanguages.push(c.value)
                                                        setFinalReleasePayload({
                                                            ...finalReleasePayload,
                                                            languages: programmingLanguages,
                                                        })

                                                        const updatedProgrammingLanguageMergeList = programmingMergeList.map(
                                                            (lang) => {
                                                                if (lang.value === c.value) {
                                                                    return {
                                                                        ...lang,
                                                                        overWritten: false,
                                                                    }
                                                                }
                                                                return lang
                                                            },
                                                        )
                                                        setProgrammingMergeList(updatedProgrammingLanguageMergeList)
                                                    }}
                                                >
                                                    <FaUndo />
                                                </button>
                                            )}
                                        </div>
                                        <div className='mt-2 col text-start'></div>
                                    </div>
                                )
                            } else {
                                return (
                                    <div
                                        className='d-flex row mb-1'
                                        key={c.value}
                                    >
                                        <div className='mt-2 col text-end'>{!c.overWritten ? '' : c.value}</div>
                                        <div className='col-12 col-md-2 mx-5 text-center'>
                                            {!c.overWritten ? (
                                                <button
                                                    className='btn btn-secondary px-2'
                                                    onClick={() => {
                                                        const programmingLanguages = finalReleasePayload.languages ?? []
                                                        programmingLanguages.push(c.value)
                                                        setFinalReleasePayload({
                                                            ...finalReleasePayload,
                                                            languages: programmingLanguages,
                                                        })

                                                        const updatedProgrammingLanguageMergeList = programmingMergeList.map(
                                                            (lang) => {
                                                                if (lang.value === c.value) {
                                                                    return {
                                                                        ...lang,
                                                                        overWritten: true,
                                                                    }
                                                                }
                                                                return lang
                                                            },
                                                        )
                                                        setProgrammingMergeList(updatedProgrammingLanguageMergeList)
                                                    }}
                                                >
                                                    <FaLongArrowAltLeft />
                                                </button>
                                            ) : (
                                                <button
                                                    className='btn btn-secondary px-2'
                                                    onClick={() => {
                                                        const programmingLanguages = (
                                                            finalReleasePayload.languages ?? []
                                                        ).filter((lang) => lang !== c.value)
                                                        setFinalReleasePayload({
                                                            ...finalReleasePayload,
                                                            languages: programmingLanguages,
                                                        })

                                                        const updatedProgrammingLanguageMergeList = programmingMergeList.map(
                                                            (lang) => {
                                                                if (lang.value === c.value) {
                                                                    return {
                                                                        ...lang,
                                                                        overWritten: false,
                                                                    }
                                                                }
                                                                return lang
                                                            },
                                                        )
                                                        setProgrammingMergeList(updatedProgrammingLanguageMergeList)
                                                    }}
                                                >
                                                    <FaUndo />
                                                </button>
                                            )}
                                        </div>
                                        <div className='mt-2 col text-start'>{c.value}</div>
                                    </div>
                                )
                            }
                        })}
                    </div>
                    <div className='border border-top-0 border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('Operating Systems')}</div>
                        {operatingSystemMergeList.map((c) => {
                            if (c.presentInSource && c.presentInTarget) {
                                return (
                                    <div
                                        className='d-flex row mb-1'
                                        key={c.value}
                                    >
                                        <div className='mt-2 col text-end'>{c.value}</div>
                                        <div className='col-12 col-md-2 mx-5 text-center'>
                                            <TiTick
                                                size={25}
                                                className='green'
                                            />
                                        </div>
                                        <div className='mt-2 col text-start'>{c.value}</div>
                                    </div>
                                )
                            } else if (c.presentInTarget) {
                                return (
                                    <div
                                        className='d-flex row mb-1'
                                        key={c.value}
                                    >
                                        <div className='mt-2 col text-end'>{c.overWritten ? '' : c.value}</div>
                                        <div className='col-12 col-md-2 mx-5 text-center'>
                                            {!c.overWritten ? (
                                                <button
                                                    className='btn btn-secondary px-2'
                                                    onClick={() => {
                                                        const newOperatingSystemList = (
                                                            finalReleasePayload.operatingSystems ?? []
                                                        ).filter((os) => os !== c.value)
                                                        setFinalReleasePayload({
                                                            ...finalReleasePayload,
                                                            operatingSystems: newOperatingSystemList,
                                                        })

                                                        const updatedOPeratingSystemMergeList = operatingSystemMergeList.map(
                                                            (os) => {
                                                                if (os.value === c.value) {
                                                                    return {
                                                                        ...os,
                                                                        overWritten: true,
                                                                    }
                                                                }
                                                                return os
                                                            },
                                                        )
                                                        setOperatingSystemMergeList(updatedOPeratingSystemMergeList)
                                                    }}
                                                >
                                                    <FaLongArrowAltLeft />
                                                </button>
                                            ) : (
                                                <button
                                                    className='btn btn-secondary px-2'
                                                    onClick={() => {
                                                        const operatingSystems = finalReleasePayload.operatingSystems ?? []
                                                        operatingSystems.push(c.value)
                                                        setFinalReleasePayload({
                                                            ...finalReleasePayload,
                                                            operatingSystems: operatingSystems,
                                                        })

                                                        const updatedOperatingSystemMergeList = operatingSystemMergeList.map(
                                                            (os) => {
                                                                if (os.value === c.value) {
                                                                    return {
                                                                        ...os,
                                                                        overWritten: false,
                                                                    }
                                                                }
                                                                return os
                                                            },
                                                        )
                                                        setOperatingSystemMergeList(updatedOperatingSystemMergeList)
                                                    }}
                                                >
                                                    <FaUndo />
                                                </button>
                                            )}
                                        </div>
                                        <div className='mt-2 col text-start'></div>
                                    </div>
                                )
                            } else {
                                return (
                                    <div
                                        className='d-flex row mb-1'
                                        key={c.value}
                                    >
                                        <div className='mt-2 col text-end'>{!c.overWritten ? '' : c.value}</div>
                                        <div className='col-12 col-md-2 mx-5 text-center'>
                                            {!c.overWritten ? (
                                                <button
                                                    className='btn btn-secondary px-2'
                                                    onClick={() => {
                                                        const operatingSystems = finalReleasePayload.operatingSystems ?? []
                                                        operatingSystems.push(c.value)
                                                        setFinalReleasePayload({
                                                            ...finalReleasePayload,
                                                            operatingSystems: operatingSystems,
                                                        })

                                                        const updatedOperatingSystemsMergeList = operatingSystemMergeList.map(
                                                            (os) => {
                                                                if (os.value === c.value) {
                                                                    return {
                                                                        ...os,
                                                                        overWritten: true,
                                                                    }
                                                                }
                                                                return os
                                                            },
                                                        )
                                                        setOperatingSystemMergeList(updatedOperatingSystemsMergeList)
                                                    }}
                                                >
                                                    <FaLongArrowAltLeft />
                                                </button>
                                            ) : (
                                                <button
                                                    className='btn btn-secondary px-2'
                                                    onClick={() => {
                                                        const operatingSystems = (
                                                            finalReleasePayload.operatingSystems ?? []
                                                        ).filter((os) => os !== c.value)
                                                        setFinalReleasePayload({
                                                            ...finalReleasePayload,
                                                            operatingSystems: operatingSystems,
                                                        })

                                                        const updatedOperatingSystemMergeList = operatingSystemMergeList.map(
                                                            (os) => {
                                                                if (os.value === c.value) {
                                                                    return {
                                                                        ...os,
                                                                        overWritten: false,
                                                                    }
                                                                }
                                                                return os
                                                            },
                                                        )
                                                        setOperatingSystemMergeList(updatedOperatingSystemMergeList)
                                                    }}
                                                >
                                                    <FaUndo />
                                                </button>
                                            )}
                                        </div>
                                        <div className='mt-2 col text-start'>{c.value}</div>
                                    </div>
                                )
                            }
                        })}
                    </div>
                    <div className='border border-top-0 border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('Software Platforms')}</div>
                        {softwarePlatformMergeList.map((c) => {
                            if (c.presentInSource && c.presentInTarget) {
                                return (
                                    <div
                                        className='d-flex row mb-1'
                                        key={c.value}
                                    >
                                        <div className='mt-2 col text-end'>{c.value}</div>
                                        <div className='col-12 col-md-2 mx-5 text-center'>
                                            <TiTick
                                                size={25}
                                                className='green'
                                            />
                                        </div>
                                        <div className='mt-2 col text-start'>{c.value}</div>
                                    </div>
                                )
                            } else if (c.presentInTarget) {
                                return (
                                    <div
                                        className='d-flex row mb-1'
                                        key={c.value}
                                    >
                                        <div className='mt-2 col text-end'>{c.overWritten ? '' : c.value}</div>
                                        <div className='col-12 col-md-2 mx-5 text-center'>
                                            {!c.overWritten ? (
                                                <button
                                                    className='btn btn-secondary px-2'
                                                    onClick={() => {
                                                        const newSoftwarePlatforms = (
                                                            finalReleasePayload.softwarePlatforms ?? []
                                                        ).filter((sp) => sp !== c.value)
                                                        setFinalReleasePayload({
                                                            ...finalReleasePayload,
                                                            softwarePlatforms: newSoftwarePlatforms,
                                                        })

                                                        const updatedSoftwarePlatformMergeList = softwarePlatformMergeList.map(
                                                            (sp) => {
                                                                if (sp.value === c.value) {
                                                                    return {
                                                                        ...sp,
                                                                        overWritten: true,
                                                                    }
                                                                }
                                                                return sp
                                                            },
                                                        )
                                                        setSoftwarePlatformMergeList(updatedSoftwarePlatformMergeList)
                                                    }}
                                                >
                                                    <FaLongArrowAltLeft />
                                                </button>
                                            ) : (
                                                <button
                                                    className='btn btn-secondary px-2'
                                                    onClick={() => {
                                                        const softwarePlatforms = finalReleasePayload.softwarePlatforms ?? []
                                                        softwarePlatforms.push(c.value)
                                                        setFinalReleasePayload({
                                                            ...finalReleasePayload,
                                                            softwarePlatforms: softwarePlatforms,
                                                        })

                                                        const updatedSoftwarePlatformMergeList = softwarePlatformMergeList.map(
                                                            (sp) => {
                                                                if (sp.value === c.value) {
                                                                    return {
                                                                        ...sp,
                                                                        overWritten: false,
                                                                    }
                                                                }
                                                                return sp
                                                            },
                                                        )
                                                        setSoftwarePlatformMergeList(updatedSoftwarePlatformMergeList)
                                                    }}
                                                >
                                                    <FaUndo />
                                                </button>
                                            )}
                                        </div>
                                        <div className='mt-2 col text-start'></div>
                                    </div>
                                )
                            } else {
                                return (
                                    <div
                                        className='d-flex row mb-1'
                                        key={c.value}
                                    >
                                        <div className='mt-2 col text-end'>{!c.overWritten ? '' : c.value}</div>
                                        <div className='col-12 col-md-2 mx-5 text-center'>
                                            {!c.overWritten ? (
                                                <button
                                                    className='btn btn-secondary px-2'
                                                    onClick={() => {
                                                        const softwarePlatforms = finalReleasePayload.softwarePlatforms ?? []
                                                        softwarePlatforms.push(c.value)
                                                        setFinalReleasePayload({
                                                            ...finalReleasePayload,
                                                            softwarePlatforms: softwarePlatforms,
                                                        })

                                                        const updatedSoftwarePlatformsMergeList = softwarePlatformMergeList.map(
                                                            (sp) => {
                                                                if (sp.value === c.value) {
                                                                    return {
                                                                        ...sp,
                                                                        overWritten: true,
                                                                    }
                                                                }
                                                                return sp
                                                            },
                                                        )
                                                        setSoftwarePlatformMergeList(updatedSoftwarePlatformsMergeList)
                                                    }}
                                                >
                                                    <FaLongArrowAltLeft />
                                                </button>
                                            ) : (
                                                <button
                                                    className='btn btn-secondary px-2'
                                                    onClick={() => {
                                                        const softwarePlatforms = (
                                                            finalReleasePayload.softwarePlatforms ?? []
                                                        ).filter((sp) => sp !== c.value)
                                                        setFinalReleasePayload({
                                                            ...finalReleasePayload,
                                                            softwarePlatforms: softwarePlatforms,
                                                        })

                                                        const updatedSoftwarePlatformMergeList = softwarePlatformMergeList.map(
                                                            (sp) => {
                                                                if (sp.value === c.value) {
                                                                    return {
                                                                        ...sp,
                                                                        overWritten: false,
                                                                    }
                                                                }
                                                                return sp
                                                            },
                                                        )
                                                        setSoftwarePlatformMergeList(updatedSoftwarePlatformMergeList)
                                                    }}
                                                >
                                                    <FaUndo />
                                                </button>
                                            )}
                                        </div>
                                        <div className='mt-2 col text-start'>{c.value}</div>
                                    </div>
                                )
                            }
                        })}
                    </div>
                    <div className='border border-top-0 border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('CPE ID')}</div>
                        <div className='d-flex row'>
                            <div className='mt-2 col text-end'>{finalReleasePayload.cpeId}</div>
                            <div className='col-12 col-md-2 mx-5 text-center'>
                                {sourceReleaseDetail.cpeId === targetRelease.cpeId ? (
                                    <TiTick
                                        size={40}
                                        className='green'
                                    />
                                ) : finalReleasePayload.cpeId === targetRelease.cpeId ? (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalReleasePayload({
                                                ...finalReleasePayload,
                                                cpeId: sourceReleaseDetail.cpeId,
                                            })
                                        }
                                    >
                                        <FaLongArrowAltLeft />
                                    </button>
                                ) : (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalReleasePayload({
                                                ...finalReleasePayload,
                                                cpeId: targetRelease.cpeId,
                                            })
                                        }
                                    >
                                        <FaUndo />
                                    </button>
                                )}
                            </div>
                            <div className='mt-2 col text-start'>{sourceReleaseDetail.cpeId}</div>
                        </div>
                    </div>
                    <div className='border border-top-0 border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('Release date')}</div>
                        <div className='d-flex row'>
                            <div className='mt-2 col text-end'>{finalReleasePayload.releaseDate}</div>
                            <div className='col-12 col-md-2 mx-5 text-center'>
                                {sourceReleaseDetail.releaseDate === targetRelease.releaseDate ? (
                                    <TiTick
                                        size={40}
                                        className='green'
                                    />
                                ) : finalReleasePayload.releaseDate === targetRelease.releaseDate ? (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalReleasePayload({
                                                ...finalReleasePayload,
                                                releaseDate: sourceReleaseDetail.releaseDate,
                                            })
                                        }
                                    >
                                        <FaLongArrowAltLeft />
                                    </button>
                                ) : (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalReleasePayload({
                                                ...finalReleasePayload,
                                                releaseDate: targetRelease.releaseDate,
                                            })
                                        }
                                    >
                                        <FaUndo />
                                    </button>
                                )}
                            </div>
                            <div className='mt-2 col text-start'>{sourceReleaseDetail.releaseDate}</div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
