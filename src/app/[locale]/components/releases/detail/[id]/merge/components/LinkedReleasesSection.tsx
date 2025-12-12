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
import { BsArrowCounterclockwise, BsArrowLeft, BsCheck2 } from 'react-icons/bs'
import { ListFieldProcessComponent, ReleaseDetail } from '@/object-types'

export default function LinkedReleasesSection({
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
    const [linkedReleaseMergeList, setLinkedReleaseMergeList] = useState<ListFieldProcessComponent[]>([])
    const session = useSession()
    const sourceLinkedReleases = sourceReleaseDetail?._embedded['sw360:releaseLinks'] || []
    const targetLinkedReleases = targetRelease?._embedded['sw360:releaseLinks'] || []

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            signOut()
        }
    }, [
        session,
    ])

    useEffect(() => {

        setLinkedReleaseMergeList([
            ...(targetRelease?._embedded['sw360:releaseLinks']
                ? targetRelease._embedded['sw360:releaseLinks'].map(
                    (lr) => `${lr.id}`)
                : ([] as string[])
            )
                .filter(
                    (c) =>
                        (sourceReleaseDetail?._embedded['sw360:releaseLinks']
                            ? sourceReleaseDetail._embedded['sw360:releaseLinks'].map(
                                (lr) => `${lr.id}`)
                            : ([] as string[])
                        ).indexOf(c) !== -1,
                )
                .map((c) => ({
                    value: c,
                    presentInSource: true,
                    presentInTarget: true,
                    overWritten: false,
                })),

            ...(targetRelease?._embedded['sw360:releaseLinks']
                ? targetRelease._embedded['sw360:releaseLinks'].map(
                    (lr) => `${lr.id}`)
                : ([] as string[])
            )
                .filter(
                    (c) =>
                        (sourceReleaseDetail?._embedded['sw360:releaseLinks']
                            ? sourceReleaseDetail._embedded['sw360:releaseLinks'].map(
                                (lr) => `${lr.id}`)
                            : ([] as string[])
                        ).indexOf(c) === -1,
                )
                .map((c) => ({
                    value: c,
                    presentInSource: false,
                    presentInTarget: true,
                    overWritten: false,
                })),

            ...(sourceReleaseDetail?._embedded['sw360:releaseLinks']
                ? sourceReleaseDetail._embedded['sw360:releaseLinks'].map(
                    (lr) => `${lr.id}`)
                : ([] as string[])
            )
                .filter(
                    (c) =>
                        (targetRelease?._embedded['sw360:releaseLinks']
                            ? targetRelease._embedded['sw360:releaseLinks'].map(
                                (lr) => `${lr.id}`)
                            : ([] as string[])
                        ).indexOf(c) === -1,
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
                        {t('Linked Releases')}
                    </h6>
                    <div className='border border-top-0 border-blue p-2'>
                        {linkedReleaseMergeList.map((c) => {
                            if (c.presentInSource && c.presentInTarget) {
                                return (
                                    <div
                                        className='d-flex row mb-1'
                                        key={c.value}
                                    >
                                        <div className='mt-2 col text-end'>
                                            {
                                                `${targetLinkedReleases.find(
                                                    lr => lr.id === c.value)?.name}`
                                            }{
                                                ` (${targetLinkedReleases.find(
                                                    lr => lr.id === c.value)?.version})`
                                            }
                                        </div>
                                        <div className='col-12 col-md-2 mx-5 text-center'>
                                            <BsCheck2
                                                size={25}
                                                className='green'
                                            />
                                        </div>
                                        <div className='mt-2 col text-start'>
                                            {
                                                `${sourceLinkedReleases.find(
                                                    lr => lr.id === c.value)?.name}`
                                            }{
                                                ` (${targetLinkedReleases.find(
                                                    lr => lr.id === c.value)?.version})`
                                            }
                                        </div>
                                    </div>
                                )
                            } else if (c.presentInTarget) {
                                return (
                                    <div
                                        className='d-flex row mb-1'
                                        key={c.value}
                                    >
                                        <div className='mt-2 col text-end'>
                                            {
                                                c.overWritten ? '' :
                                                    `${targetLinkedReleases.find(
                                                        lr => lr.id === c.value)?.name} (
                                                    ${targetLinkedReleases.find(
                                                            lr => lr.id === c.value)?.version})`
                                            }
                                        </div>
                                        <div className='col-12 col-md-2 mx-5 text-center'>
                                            {!c.overWritten ? (
                                                <button
                                                    className='btn btn-secondary px-2'
                                                    onClick={() => {
                                                        const newRelationshipsObject = Object.fromEntries(
                                                            Object.entries(finalReleasePayload.releaseIdToRelationship ?? {})
                                                                .filter(([releaseId, _]) => releaseId !== c.value)
                                                        )
                                                        setFinalReleasePayload({
                                                            ...finalReleasePayload,
                                                            releaseIdToRelationship: newRelationshipsObject,
                                                        })
                                                        const updatedLinkedReleaseMergeList = linkedReleaseMergeList.map(
                                                            (lr) => {
                                                                if (lr.value === c.value) {
                                                                    return {
                                                                        ...lr,
                                                                        overWritten: true,
                                                                    }
                                                                }
                                                                return lr
                                                            },
                                                        )
                                                        setLinkedReleaseMergeList(updatedLinkedReleaseMergeList)
                                                    }}
                                                >
                                                    <BsArrowLeft size={20} />
                                                </button>
                                            ) : (
                                                <button
                                                    className='btn btn-secondary px-2'
                                                    onClick={() => {
                                                        const currentRelationships = finalReleasePayload.releaseIdToRelationship ?? {}
                                                        const newRelationshipsObject = {
                                                            ...currentRelationships,
                                                            [c.value]: targetLinkedReleases.find(
                                                                (release) =>
                                                                    release.id === c.value)?.releaseRelationship ?? ''
                                                        }
                                                        setFinalReleasePayload({
                                                            ...finalReleasePayload,
                                                            releaseIdToRelationship: newRelationshipsObject,
                                                        })

                                                        const updatedLinkedReleaseMergeList = linkedReleaseMergeList.map(
                                                            (lr) => {
                                                                if (lr.value === c.value) {
                                                                    return {
                                                                        ...lr,
                                                                        overWritten: false,
                                                                    }
                                                                }
                                                                return lr
                                                            },
                                                        )
                                                        setLinkedReleaseMergeList(updatedLinkedReleaseMergeList)
                                                    }}
                                                >
                                                    <BsArrowCounterclockwise />
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
                                        <div className='mt-2 col text-end'>
                                            {!c.overWritten ? '' : `${sourceLinkedReleases.find(
                                                lr => lr.id === c.value)?.name} (
                                                ${sourceLinkedReleases.find(
                                                    lr => lr.id === c.value)?.version})`
                                            }
                                        </div>
                                        <div className='col-12 col-md-2 mx-5 text-center'>
                                            {!c.overWritten ? (
                                                <button
                                                    className='btn btn-secondary px-2'
                                                    onClick={() => {
                                                        const currentRelationships = finalReleasePayload.releaseIdToRelationship ?? {}
                                                        const newRelationshipsObject = {
                                                            ...currentRelationships,
                                                            [c.value]: sourceLinkedReleases.find(
                                                                (release) => release.id === c.value)?.releaseRelationship ?? ''
                                                        }
                                                        setFinalReleasePayload({
                                                            ...finalReleasePayload,
                                                            releaseIdToRelationship: newRelationshipsObject,
                                                        })

                                                        const updatedLinkedReleaseMergeList = linkedReleaseMergeList.map(
                                                            (lr) => {
                                                                if (lr.value === c.value) {
                                                                    return {
                                                                        ...lr,
                                                                        overWritten: true,
                                                                    }
                                                                }
                                                                return lr
                                                            },
                                                        )
                                                        setLinkedReleaseMergeList(updatedLinkedReleaseMergeList)
                                                    }}
                                                >
                                                    <BsArrowLeft size={20} />
                                                </button>
                                            ) : (
                                                <button
                                                    className='btn btn-secondary px-2'
                                                    onClick={() => {
                                                        const newRelationshipsObject = Object.fromEntries(
                                                            Object.entries(finalReleasePayload.releaseIdToRelationship ?? {})
                                                                .filter(([releaseId, _]) => releaseId !== c.value)
                                                        )
                                                        setFinalReleasePayload({
                                                            ...finalReleasePayload,
                                                            releaseIdToRelationship: newRelationshipsObject,
                                                        })

                                                        const updatedLinkedReleaseMergeList = linkedReleaseMergeList.map(
                                                            (lr) => {
                                                                if (lr.value === c.value) {
                                                                    return {
                                                                        ...lr,
                                                                        overWritten: false,
                                                                    }
                                                                }
                                                                return lr
                                                            },
                                                        )
                                                        setLinkedReleaseMergeList(updatedLinkedReleaseMergeList)
                                                    }}
                                                >
                                                    <BsArrowCounterclockwise />
                                                </button>
                                            )}
                                        </div>
                                        <div className='mt-2 col text-start'>
                                            {`${sourceLinkedReleases.find(
                                                lr => lr.id === c.value)?.name}`
                                            }{` (${sourceLinkedReleases.find(
                                                lr => lr.id === c.value)?.version})`
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
