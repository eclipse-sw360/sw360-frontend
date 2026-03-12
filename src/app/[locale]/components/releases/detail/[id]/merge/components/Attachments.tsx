// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Dispatch, ReactNode, SetStateAction, useEffect, useState } from 'react'
import { BsArrowCounterclockwise, BsArrowLeft, BsCheck2, BsInfoCircle } from 'react-icons/bs'
import { Attachment, ListFieldProcessComponent, Release, ReleaseDetail } from '@/object-types'

export default function Attachments({
    targetRelease,
    sourceReleaseDetail,
    targetAttachments,
    sourceAttachments,
    finalReleasePayload,
    setFinalReleasePayload,
}: {
    targetRelease: ReleaseDetail | null
    sourceReleaseDetail: ReleaseDetail | null
    targetAttachments: Attachment[]
    sourceAttachments: Attachment[]
    finalReleasePayload: Release | null
    setFinalReleasePayload: Dispatch<SetStateAction<null | Release>>
}): ReactNode {
    const session = useSession()
    const t = useTranslations('default')
    const [otherAttachmentMergeList, setOtherAttachmentMergeList] = useState<ListFieldProcessComponent[]>([])
    const [matchingSourceAttachmentMergeList, setMatchingSourceAttachmentMergeList] = useState<ListFieldProcessComponent[]>([])

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            signOut()
        }
    }, [
        session,
    ])


    useEffect(() => {

        // Setup for 'SOURCE' attachments
        const targetSourceAttachmentFileIds = targetAttachments
            ?.filter(a => a.attachmentType === 'SOURCE')
            .map(a => `${a.sha1}`) ?? []

        const sourceSourceAttachmentFileIds = sourceAttachments
            ?.filter(a => a.attachmentType === 'SOURCE')
            .map(a => `${a.sha1}`) ?? []

        const targetSourceAttachmentSet = new Set(targetSourceAttachmentFileIds)
        const sourceSourceAttachmentSet = new Set(sourceSourceAttachmentFileIds)

        // Setup for non-'SOURCE' attachments 
        const targetOtherAttachmentFileIds = targetAttachments
            ?.filter(a => a.attachmentType !== 'SOURCE')
            .map(a => `${a.sha1}`) ?? []

        const sourceOtherAttachmentFileIds = sourceAttachments
            ?.filter(a => a.attachmentType !== 'SOURCE')
            .map(a => `${a.sha1}`) ?? []

        const targetOtherAttachmentSet = new Set(targetOtherAttachmentFileIds)
        const sourceOtherAttachmentSet = new Set(sourceOtherAttachmentFileIds)

        const sourceAttachmentResult = [
            // Present in BOTH Source and Target
            ...targetSourceAttachmentFileIds
                .filter(id => sourceSourceAttachmentSet.has(id))
                .map(id => ({
                    value: id,
                    presentInSource: true,
                    presentInTarget: true,
                    overWritten: false,
                })),

            // Present ONLY in Target
            ...targetSourceAttachmentFileIds
                .filter(id => !sourceSourceAttachmentSet.has(id))
                .map(id => ({
                    value: id,
                    presentInSource: false,
                    presentInTarget: true,
                    overWritten: false,
                })),

            // Present ONLY in Source
            ...sourceSourceAttachmentFileIds
                .filter(id => !targetSourceAttachmentSet.has(id))
                .map(id => ({
                    value: id,
                    presentInSource: true,
                    presentInTarget: false,
                    overWritten: false,
                })),
        ]

        setMatchingSourceAttachmentMergeList(sourceAttachmentResult)

        const otherTargetAttachmentsResult = [
            // Condition 1: attachmentType is 'SOURCE', but ONLY present in Target
            ...targetSourceAttachmentFileIds
                .filter(id => !sourceSourceAttachmentSet.has(id))
                .map(id => ({
                    value: id,
                    presentInSource: false,
                    presentInTarget: true,
                    overWritten: false,
                })),

            // Condition 2: All data from targetAttachments where attachmentType !== 'SOURCE'
            ...targetOtherAttachmentFileIds
                .map(id => ({
                    value: id,
                    presentInSource: sourceOtherAttachmentSet.has(id),
                    presentInTarget: true,
                    overWritten: false,
                })),

            // Condition 3 (NEW): Data from sourceAttachments where
            // attachmentType !== 'SOURCE' AND NOT in Target
            ...sourceOtherAttachmentFileIds
                .filter(id => !targetOtherAttachmentSet.has(id))
                .map(id => ({
                    value: id,
                    presentInSource: true,
                    presentInTarget: false,
                    overWritten: false,
                })),
        ]
        setOtherAttachmentMergeList(otherTargetAttachmentsResult)

    }, [targetAttachments, sourceAttachments])


    useEffect(() => {
        if (!sourceReleaseDetail?._embedded?.['sw360:attachments']) return;

        const bothIds = matchingSourceAttachmentMergeList
            .filter(d => d.presentInSource && d.presentInTarget)
            .map(d => d.value);

        if (bothIds.length === 0) {
            setFinalReleasePayload(prev => ({
                ...prev,
                attachments: prev?.attachments ?? []
            }));
            return;
        }

        const sourceAttachmentsData = sourceAttachments
            .filter(a => a.attachmentType === 'SOURCE')
            .filter(a => a.sha1 && bothIds.includes(a.sha1))

        setFinalReleasePayload(prev => {
            const existingAttachments = prev?.attachments ?? []
            const allAttachments = [...existingAttachments, ...sourceAttachmentsData]
            const uniqueMap = new Map(
                allAttachments.map(item => [item.sha1, item])
            )

            return {
                ...prev,
                attachments: Array.from(uniqueMap.values())
            }
        })
    }, [sourceReleaseDetail, matchingSourceAttachmentMergeList])


    return (
        <>
            {targetRelease && sourceReleaseDetail &&
                finalReleasePayload && targetAttachments && sourceAttachments && (
                    <div className='mb-3'>
                        <h6 className='border-bottom fw-bold text-uppercase text-blue border-blue mb-2'>
                            {t('Attachments')}
                        </h6>
                        <div className='border border-blue p-2'>
                            <div className='fw-bold text-blue'>{t('Matching Source Attachments')}</div>
                            {matchingSourceAttachmentMergeList.length > 0 &&
                                matchingSourceAttachmentMergeList.map((data) => {
                                    if (data.presentInSource && data.presentInTarget) {
                                        return (
                                            <div
                                                className='d-flex row mb-1'
                                                key={data.value}
                                            >
                                                <div className='mt-2 col text-end'>
                                                    {
                                                        `${targetAttachments.find(
                                                            attachmentData =>
                                                                attachmentData.sha1 === data.value)?.filename}`
                                                    } {`(${t('SOURCE')})`}
                                                </div>
                                                <div className='col-12 col-md-2 mx-5 text-center'>
                                                    <BsCheck2
                                                        size={25}
                                                        className='green'
                                                        aria-disabled={true}
                                                    />
                                                </div>
                                                <div className='mt-2 col text-start'>
                                                    {
                                                        `${sourceAttachments.find(
                                                            attachmentData =>
                                                                attachmentData.sha1 === data.value)?.filename}`
                                                    } {`(${t('SOURCE')})`}
                                                </div>
                                            </div>
                                        )
                                    }
                                })
                            }
                            <div
                                className='form-text text-center'
                                id='addProjects.visibility.HelpBlock'>
                                <span className='d-inline-block'>
                                    <BsInfoCircle size={15} />
                                    {`${t('Attachment merge with same source code')}`}
                                </span>
                            </div>
                        </div>
                        <div className='border border-top-0 border-blue p-2'>
                            <div className='fw-bold text-blue'>{t('Other Attachments')}</div>
                            {otherAttachmentMergeList.map((data) => {
                                if (data.presentInSource && data.presentInTarget) {
                                    return (
                                        <div
                                            className='d-flex row mb-1'
                                            key={data.value}
                                        >
                                            <div className='mt-2 col text-end'>
                                                {
                                                    `${targetAttachments.find(
                                                        attachmentData =>
                                                            attachmentData.sha1 === data.value)?.filename}`
                                                }
                                            </div>
                                            <div className='col-12 col-md-2 mx-5 text-center'>
                                                <BsCheck2
                                                    size={20}
                                                    className='green'
                                                />
                                            </div>
                                            <div className='mt-2 col text-start'>
                                                {
                                                    `${sourceAttachments.find(
                                                        attachmentData =>
                                                            attachmentData.sha1 === data.value)?.filename}`
                                                }
                                            </div>
                                        </div>
                                    )
                                } else if (data.presentInTarget) {
                                    return (
                                        <div
                                            className='d-flex row mb-1'
                                            key={data.value}
                                        >
                                            <div className='mt-2 col text-end'>
                                                {data.overWritten
                                                    ? ''
                                                    : `${targetAttachments.find(
                                                        attachmentData =>
                                                            attachmentData.sha1 === data.value)?.filename}`
                                                }
                                            </div>
                                            <div className='col-12 col-md-2 mx-5 text-center'>
                                                {!data.overWritten ? (
                                                    <button
                                                        className='btn btn-secondary px-2'
                                                        onClick={() => {
                                                            const newOtherAttachments = (
                                                                finalReleasePayload.attachments ?? []
                                                            ).filter((attach) => attach.sha1 !== data.value)
                                                            setFinalReleasePayload({
                                                                ...finalReleasePayload,
                                                                attachments: newOtherAttachments,
                                                            })

                                                            const updatedOtherAttachmentsMergeList =
                                                                otherAttachmentMergeList.map((attach) => {
                                                                    if (attach.value === data.value) {
                                                                        return {
                                                                            ...attach,
                                                                            overWritten: true,
                                                                        }
                                                                    }
                                                                    return attach
                                                                })
                                                            setOtherAttachmentMergeList(updatedOtherAttachmentsMergeList)
                                                        }}
                                                    >
                                                        <BsArrowLeft size={20} />
                                                    </button>
                                                ) : (
                                                    <button
                                                        className='btn btn-secondary px-2'
                                                        onClick={() => {
                                                            const otherAttachments = finalReleasePayload.attachments ?? []
                                                            otherAttachments.push(
                                                                targetAttachments.find(attachmentData =>
                                                                    attachmentData.sha1 === data.value) as Attachment
                                                            )
                                                            setFinalReleasePayload({
                                                                ...finalReleasePayload,
                                                                attachments: otherAttachments,
                                                            })

                                                            const updatedOtherAttachmentsMergeList =
                                                                otherAttachmentMergeList.map((attach) => {
                                                                    if (attach.value === data.value) {
                                                                        return {
                                                                            ...attach,
                                                                            overWritten: false,
                                                                        }
                                                                    }
                                                                    return attach
                                                                })
                                                            setOtherAttachmentMergeList(updatedOtherAttachmentsMergeList)
                                                        }}
                                                    >
                                                        <BsArrowCounterclockwise size={20} />
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
                                            key={data.value}
                                        >
                                            <div className='mt-2 col text-end'>
                                                {
                                                    !data.overWritten
                                                        ? ''
                                                        : `${sourceAttachments.find(
                                                            attachmentData =>
                                                                attachmentData.sha1 === data.value)?.filename}`
                                                }
                                            </div>
                                            <div className='col-12 col-md-2 mx-5 text-center'>
                                                {!data.overWritten ? (
                                                    <button
                                                        className='btn btn-secondary px-2'
                                                        onClick={() => {
                                                            const attachmentData = finalReleasePayload.attachments ?? []
                                                            attachmentData.push(
                                                                sourceAttachments.find(attachmentData =>
                                                                    attachmentData.sha1 === data.value) as Attachment
                                                            )
                                                            setFinalReleasePayload({
                                                                ...finalReleasePayload,
                                                                attachments: attachmentData,
                                                            })

                                                            const updatedOtherAttachementsMergeList =
                                                                otherAttachmentMergeList.map((attach) => {
                                                                    if (attach.value === data.value) {
                                                                        return {
                                                                            ...attach,
                                                                            overWritten: true,
                                                                        }
                                                                    }
                                                                    return attach
                                                                })
                                                            setOtherAttachmentMergeList(updatedOtherAttachementsMergeList)
                                                        }}
                                                    >
                                                        <BsArrowLeft size={20} />
                                                    </button>
                                                ) : (
                                                    <button
                                                        className='btn btn-secondary px-2'
                                                        onClick={() => {
                                                            const otherAttachement = (
                                                                finalReleasePayload.attachments ?? []
                                                            ).filter((attach) => attach.sha1 !== data.value)
                                                            setFinalReleasePayload({
                                                                ...finalReleasePayload,
                                                                attachments: otherAttachement,
                                                            })

                                                            const updatedOtherAttachmentsMergeList =
                                                                otherAttachmentMergeList.map((attach) => {
                                                                    if (attach.value === data.value) {
                                                                        return {
                                                                            ...attach,
                                                                            overWritten: false,
                                                                        }
                                                                    }
                                                                    return attach
                                                                })
                                                            setOtherAttachmentMergeList(updatedOtherAttachmentsMergeList)
                                                        }}
                                                    >
                                                        <BsArrowCounterclockwise size={20} />
                                                    </button>
                                                )}
                                            </div>
                                            <div className='mt-2 col text-start'>
                                                {
                                                    `${sourceAttachments.find(
                                                        attachmentData =>
                                                            attachmentData.sha1 === data.value)?.filename}`
                                                }
                                            </div>
                                        </div>
                                    )
                                }
                            })}
                        </div>
                    </div>
                )}
        </>
    )
}
