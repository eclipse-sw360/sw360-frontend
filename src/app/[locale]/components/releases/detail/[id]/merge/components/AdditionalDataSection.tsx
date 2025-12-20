// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Dispatch, ReactNode, SetStateAction, useEffect, useState } from 'react'
import { FaLongArrowAltLeft, FaUndo } from 'react-icons/fa'
import { TiTick } from 'react-icons/ti'
import { ListFieldProcessComponent, ReleaseDetail } from '@/object-types'

export default function AdditionalDataSection({
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
    const [additionalDataMergeList, setAdditionalDataMergeList] = useState<ListFieldProcessComponent[]>([])

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            signOut()
        }
    }, [
        session,
    ])

    useEffect(() => {
        setAdditionalDataMergeList([
            ...Object.keys(targetRelease?.additionalData ?? {})
                .filter(
                    (targetElem) =>
                        Object.keys(sourceReleaseDetail?.additionalData ?? {}).filter(
                            (sourceElem) => sourceElem === targetElem,
                        ).length !== 0,
                )
                .map((c) => ({
                    value: c,
                    presentInSource: true,
                    presentInTarget: true,
                    overWritten: false,
                })),

            ...Object.keys(targetRelease?.additionalData ?? {})
                .filter(
                    (targetElem) =>
                        Object.keys(sourceReleaseDetail?.additionalData ?? {}).filter(
                            (sourceElem) => sourceElem === targetElem,
                        ).length === 0,
                )
                .map((c) => ({
                    value: c,
                    presentInSource: false,
                    presentInTarget: true,
                    overWritten: false,
                })),

            ...Object.keys(sourceReleaseDetail?.additionalData ?? {})
                .filter(
                    (sourceElem) =>
                        Object.keys(targetRelease?.additionalData ?? {}).filter(
                            (targetElem) => sourceElem === targetElem,
                        ).length === 0,
                )
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
                    <h6 className='border-bottom fw-bold text-uppercase text-blue border-blue mb-2'>
                        {t('Additional Data')}
                    </h6>
                    {additionalDataMergeList.map((id, i) => (
                        <div
                            className={`border border-blue p-2 ${i !== 0 ? 'border-top-0' : ''}`}
                            key={id.value}
                        >
                            <div className='fw-bold text-blue'>{id.value}</div>
                            {id.presentInSource && id.presentInTarget && (
                                <div className='d-flex row'>
                                    <div className='mt-2 col text-end'>{targetRelease.additionalData?.[id.value]}</div>
                                    <div className='col-12 col-md-2 mx-5 text-center'>
                                        <TiTick
                                            size={40}
                                            className='green'
                                        />
                                    </div>
                                    <div className='mt-2 col text-start'>
                                        {sourceReleaseDetail.additionalData?.[id.value]}
                                    </div>
                                </div>
                            )}
                            {!id.presentInSource && id.presentInTarget && (
                                <div className='d-flex row'>
                                    <div className='mt-2 col text-end'>
                                        {finalReleasePayload.additionalData?.[id.value]}
                                    </div>
                                    <div className='col-12 col-md-2 mx-5 text-center'>
                                        {finalReleasePayload.additionalData?.[id.value] ===
                                        targetRelease.additionalData?.[id.value] ? (
                                            <button
                                                className='btn btn-secondary px-2'
                                                onClick={() => {
                                                    const additionalData = {
                                                        ...(finalReleasePayload.additionalData ?? {}),
                                                    }
                                                    delete additionalData[id.value]
                                                    setFinalReleasePayload({
                                                        ...finalReleasePayload,
                                                        additionalData,
                                                    })
                                                }}
                                            >
                                                <FaLongArrowAltLeft />
                                            </button>
                                        ) : (
                                            <button
                                                className='btn btn-secondary px-2'
                                                onClick={() => {
                                                    const additionalData = {
                                                        ...(finalReleasePayload.additionalData ?? {}),
                                                        [id.value]: targetRelease.additionalData?.[id.value] ?? '',
                                                    }
                                                    setFinalReleasePayload({
                                                        ...finalReleasePayload,
                                                        additionalData,
                                                    })
                                                }}
                                            >
                                                <FaUndo />
                                            </button>
                                        )}
                                    </div>
                                    <div className='mt-2 col text-start'></div>
                                </div>
                            )}
                            {id.presentInSource && !id.presentInTarget && (
                                <div className='d-flex row'>
                                    <div className='mt-2 col text-end'>
                                        {finalReleasePayload.additionalData?.[id.value]}
                                    </div>
                                    <div className='col-12 col-md-2 mx-5 text-center'>
                                        {finalReleasePayload.additionalData?.[id.value] !==
                                        sourceReleaseDetail.additionalData?.[id.value] ? (
                                            <button
                                                className='btn btn-secondary px-2'
                                                onClick={() => {
                                                    const additionalData = {
                                                        ...(finalReleasePayload.additionalData ?? {}),
                                                        [id.value]:
                                                            sourceReleaseDetail.additionalData?.[id.value] ?? '',
                                                    }
                                                    setFinalReleasePayload({
                                                        ...finalReleasePayload,
                                                        additionalData,
                                                    })
                                                }}
                                            >
                                                <FaLongArrowAltLeft />
                                            </button>
                                        ) : (
                                            <button
                                                className='btn btn-secondary px-2'
                                                onClick={() => {
                                                    const additionalData = {
                                                        ...(finalReleasePayload.additionalData ?? {}),
                                                    }
                                                    delete additionalData[id.value]
                                                    setFinalReleasePayload({
                                                        ...finalReleasePayload,
                                                        additionalData,
                                                    })
                                                }}
                                            >
                                                <FaUndo />
                                            </button>
                                        )}
                                    </div>
                                    <div className='mt-2 col text-start'>
                                        {sourceReleaseDetail.additionalData?.[id.value]}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </>
    )
}
