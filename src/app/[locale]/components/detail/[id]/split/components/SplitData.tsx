// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { Attachment, Component, ListFieldProcessComponent } from '@/object-types'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Dispatch, ReactNode, SetStateAction, useEffect, useState } from 'react'
import { FaLongArrowAltRight, FaUndo } from 'react-icons/fa'

export default function SplitComponent({
    targetComponent,
    sourceComponent,
    setSourceComponent,
    setTargetComponent,
}: {
    targetComponent: Component | null
    sourceComponent: Component | null
    setSourceComponent: Dispatch<SetStateAction<null | Component>>
    setTargetComponent: Dispatch<SetStateAction<null | Component>>
}): ReactNode {
    const t = useTranslations('default')
    const [releaseIdsSplitList, setReleaseIdsSplitList] = useState<ListFieldProcessComponent[]>([])
    const [attachmentsSplitList, setAttachmentsSplitList] = useState<ListFieldProcessComponent[]>([])
    const { status } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [status])
    useEffect(() => {
        if (!sourceComponent || !targetComponent) return
        sourceComponent.releaseIds = (sourceComponent._embedded?.['sw360:releases'] ?? []).map((rel) => rel.id ?? '')
        targetComponent.releaseIds = (targetComponent._embedded?.['sw360:releases'] ?? []).map((rel) => rel.id ?? '')
        setReleaseIdsSplitList([
            ...sourceComponent.releaseIds.map(
                (id: string): ListFieldProcessComponent => ({
                    value: id,
                    presentInSource: true,
                    presentInTarget: false,
                    overWritten: false,
                }),
            ),
            ...targetComponent.releaseIds.map(
                (id: string): ListFieldProcessComponent => ({
                    value: id,
                    presentInSource: false,
                    presentInTarget: true,
                    overWritten: false,
                }),
            ),
        ])

        sourceComponent.attachments = sourceComponent._embedded?.['sw360:attachments'] ?? []
        targetComponent.attachments = targetComponent._embedded?.['sw360:attachments'] ?? []
        setAttachmentsSplitList([
            ...sourceComponent.attachments.map(
                (att: Attachment): ListFieldProcessComponent => ({
                    value: att.attachmentContentId ?? '',
                    presentInSource: true,
                    presentInTarget: false,
                    overWritten: false,
                }),
            ),
            ...targetComponent.attachments.map(
                (att: Attachment): ListFieldProcessComponent => ({
                    value: att.attachmentContentId ?? '',
                    presentInSource: false,
                    presentInTarget: true,
                    overWritten: false,
                }),
            ),
        ])
    }, [])

    return (
        <>
            {targetComponent && sourceComponent && (
                <>
                    <div className='mb-3'>
                        <h6 className='border-bottom fw-bold text-uppercase text-blue border-blue mb-2'>
                            {t('General')}
                        </h6>
                        <div className='border border-blue p-2'>
                            <div className='fw-bold text-blue'>{t('Name')}</div>
                            <div className='d-flex row'>
                                <div className='mt-2 col text-end me-5'>{sourceComponent.name}</div>
                                <div className='mt-2 col text-start ms-5'>{targetComponent.name}</div>
                            </div>
                        </div>
                        <div className='border border-top-0 border-blue p-2'>
                            <div className='fw-bold text-blue'>{t('Created on')}</div>
                            <div className='d-flex row'>
                                <div className='mt-2 col text-end me-5'>{sourceComponent.createdOn}</div>
                                <div className='mt-2 col text-start ms-5'>{targetComponent.createdOn}</div>
                            </div>
                        </div>
                        <div className='border border-top-0 border-blue p-2'>
                            <div className='fw-bold text-blue'>{t('Created by')}</div>
                            <div className='d-flex row'>
                                <div className='mt-2 col text-end me-5'>
                                    {sourceComponent._embedded?.createdBy?.email}
                                </div>
                                <div className='mt-2 col text-start ms-5'>
                                    {targetComponent._embedded?.createdBy?.email}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='mb-3'>
                        <div className='border-bottom fw-bold text-uppercase text-blue border-blue mb-2'>
                            {t('Releases')}
                        </div>
                        {releaseIdsSplitList.map((rel) => {
                            if (!rel.presentInTarget && rel.presentInSource) {
                                const release = sourceComponent._embedded?.['sw360:releases']?.filter(
                                    (r) => r.id === rel.value,
                                )[0]
                                return (
                                    <div
                                        className='d-flex row mb-1'
                                        key={rel.value}
                                    >
                                        <div className='mt-2 col text-end'>
                                            {rel.overWritten ? '' : `${release?.name} ${release?.version}`}
                                        </div>
                                        <div className='col-12 col-md-2 mx-5 text-center'>
                                            {!rel.overWritten ? (
                                                <button
                                                    className='btn btn-secondary px-2'
                                                    onClick={() => {
                                                        const newSrcReleaseIds = (
                                                            sourceComponent.releaseIds ?? []
                                                        ).filter((r) => r !== rel.value)
                                                        setSourceComponent({
                                                            ...sourceComponent,
                                                            releaseIds: newSrcReleaseIds,
                                                        })

                                                        const newTargetReleaseIds = [
                                                            ...(targetComponent.releaseIds ?? []),
                                                            rel.value,
                                                        ]
                                                        setTargetComponent({
                                                            ...targetComponent,
                                                            releaseIds: newTargetReleaseIds,
                                                        })

                                                        const updatedReleaseIdsSplitList = releaseIdsSplitList.map(
                                                            (r) => {
                                                                if (r.value === rel.value) {
                                                                    return {
                                                                        ...r,
                                                                        overWritten: true,
                                                                    }
                                                                }
                                                                return r
                                                            },
                                                        )
                                                        setReleaseIdsSplitList(updatedReleaseIdsSplitList)
                                                    }}
                                                >
                                                    <FaLongArrowAltRight />
                                                </button>
                                            ) : (
                                                <button
                                                    className='btn btn-secondary px-2'
                                                    onClick={() => {
                                                        const newTargetReleaseIds = (
                                                            targetComponent.releaseIds ?? []
                                                        ).filter((r) => r !== rel.value)
                                                        setTargetComponent({
                                                            ...targetComponent,
                                                            releaseIds: newTargetReleaseIds,
                                                        })

                                                        const newSrcReleaseIds = [
                                                            ...(sourceComponent.releaseIds ?? []),
                                                            rel.value,
                                                        ]
                                                        setSourceComponent({
                                                            ...sourceComponent,
                                                            releaseIds: newSrcReleaseIds,
                                                        })

                                                        const updatedReleaseIdsSplitList = releaseIdsSplitList.map(
                                                            (r) => {
                                                                if (r.value === rel.value) {
                                                                    return {
                                                                        ...r,
                                                                        overWritten: false,
                                                                    }
                                                                }
                                                                return r
                                                            },
                                                        )
                                                        setReleaseIdsSplitList(updatedReleaseIdsSplitList)
                                                    }}
                                                >
                                                    <FaUndo />
                                                </button>
                                            )}
                                        </div>
                                        <div className='mt-2 col text-start'>
                                            {!rel.overWritten ? '' : `${release?.name} ${release?.version}`}
                                        </div>
                                    </div>
                                )
                            } else {
                                const release = targetComponent._embedded?.['sw360:releases']?.filter(
                                    (r) => r.id === rel.value,
                                )[0]
                                return (
                                    <div
                                        className='d-flex row mb-1'
                                        key={rel.value}
                                    >
                                        <div className='mt-2 col text-end'></div>
                                        <div className='col-12 col-md-2 mx-5 text-center'></div>
                                        <div className='mt-2 col text-start'>{`${release?.name} ${release?.version}`}</div>
                                    </div>
                                )
                            }
                        })}
                    </div>
                    <div className='mb-3'>
                        <div className='border-bottom fw-bold text-uppercase text-blue border-blue mb-2'>
                            {t('Attachments')}
                        </div>
                        {attachmentsSplitList.map((a) => {
                            if (!a.presentInTarget && a.presentInSource) {
                                const att = sourceComponent._embedded?.['sw360:attachments']?.filter(
                                    (attach) => attach.attachmentContentId === a.value,
                                )[0]
                                return (
                                    <div
                                        className='d-flex row mb-1'
                                        key={a.value}
                                    >
                                        <div className='mt-2 col text-end'>{a.overWritten ? '' : att?.filename}</div>
                                        <div className='col-12 col-md-2 mx-5 text-center'>
                                            {!a.overWritten ? (
                                                <button
                                                    className='btn btn-secondary px-2'
                                                    onClick={() => {
                                                        const newSrcAttachments = (
                                                            sourceComponent.attachments ?? []
                                                        ).filter((attach) => attach.attachmentContentId !== a.value)
                                                        setSourceComponent({
                                                            ...sourceComponent,
                                                            attachments: newSrcAttachments,
                                                        })

                                                        const newTargetAttachments = [
                                                            ...(targetComponent.attachments ?? []),
                                                            att as Attachment,
                                                        ]
                                                        setTargetComponent({
                                                            ...targetComponent,
                                                            attachments: newTargetAttachments,
                                                        })

                                                        const updatedAttachmentsSplitList = attachmentsSplitList.map(
                                                            (attach) => {
                                                                if (attach.value === a.value) {
                                                                    return {
                                                                        ...attach,
                                                                        overWritten: true,
                                                                    }
                                                                }
                                                                return attach
                                                            },
                                                        )
                                                        setAttachmentsSplitList(updatedAttachmentsSplitList)
                                                    }}
                                                >
                                                    <FaLongArrowAltRight />
                                                </button>
                                            ) : (
                                                <button
                                                    className='btn btn-secondary px-2'
                                                    onClick={() => {
                                                        const newSourceAttachments = [
                                                            ...(sourceComponent.attachments ?? []),
                                                            att as Attachment,
                                                        ]
                                                        setSourceComponent({
                                                            ...sourceComponent,
                                                            attachments: newSourceAttachments,
                                                        })

                                                        const newTargetAttachments = (
                                                            targetComponent.attachments ?? []
                                                        ).filter((attach) => attach.attachmentContentId !== a.value)
                                                        setTargetComponent({
                                                            ...targetComponent,
                                                            attachments: newTargetAttachments,
                                                        })

                                                        const updatedAttachmentsSplitList = attachmentsSplitList.map(
                                                            (attach) => {
                                                                if (attach.value === a.value) {
                                                                    return {
                                                                        ...attach,
                                                                        overWritten: false,
                                                                    }
                                                                }
                                                                return attach
                                                            },
                                                        )
                                                        setAttachmentsSplitList(updatedAttachmentsSplitList)
                                                    }}
                                                >
                                                    <FaUndo />
                                                </button>
                                            )}
                                        </div>
                                        <div className='mt-2 col text-start'>{!a.overWritten ? '' : att?.filename}</div>
                                    </div>
                                )
                            } else {
                                const att = targetComponent._embedded?.['sw360:attachments']?.filter(
                                    (attach) => attach.attachmentContentId === a.value,
                                )[0] as Attachment
                                return (
                                    <div
                                        className='d-flex row mb-1'
                                        key={a.value}
                                    >
                                        <div className='mt-2 col text-end'></div>
                                        <div className='col-12 col-md-2 mx-5 text-center'></div>
                                        <div className='mt-2 col text-start'>{att.filename}</div>
                                    </div>
                                )
                            }
                        })}
                    </div>
                </>
            )}
        </>
    )
}
