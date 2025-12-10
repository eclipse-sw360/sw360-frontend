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
import { ListFieldProcessComponent, ReleaseDetail, Vendor } from '@/object-types'

export default function GeneralSection({
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
    const [programmingMergeList, setProgrammingMergeList] = useState<ListFieldProcessComponent[]>([])
    const [operatingSystemMergeList, setOperatingSystemMergeList] = useState<ListFieldProcessComponent[]>([])
    const [softwarePlatformMergeList, setSoftwarePlatformMergeList] = useState<ListFieldProcessComponent[]>([])
    const [mainLicenseMergeList, setMainLicenseMergeList] = useState<ListFieldProcessComponent[]>([])
    const [moderatorMergeList, setModeratorMergeList] = useState<ListFieldProcessComponent[]>([])
    const [contributorMergeList, setContributorMergeList] = useState<ListFieldProcessComponent[]>([])
    const [subscriberMergeList, setSubscriberMergeList] = useState<ListFieldProcessComponent[]>([])
    const [vendor, setVendor] = useState<Vendor>({})
    const session = useSession()

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            signOut()
        }
    }, [
        session,
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

        setVendor(targetRelease?._embedded?.['sw360:vendors']?.[0] ?? {})

        setMainLicenseMergeList([
            ...(targetRelease?.mainLicenseIds ?? ([] as string[]))
                .filter((c) => (sourceReleaseDetail?.mainLicenseIds ?? ([] as string[])).indexOf(c) !== -1)
                .map((c) => ({
                    value: c,
                    presentInSource: true,
                    presentInTarget: true,
                    overWritten: false,
                })),

            ...(targetRelease?.mainLicenseIds ?? ([] as string[]))
                .filter((c) => (sourceReleaseDetail?.mainLicenseIds ?? ([] as string[])).indexOf(c) === -1)
                .map((c) => ({
                    value: c,
                    presentInSource: false,
                    presentInTarget: true,
                    overWritten: false,
                })),

            ...(sourceReleaseDetail?.mainLicenseIds ?? ([] as string[]))
                .filter((c) => (targetRelease?.mainLicenseIds ?? ([] as string[])).indexOf(c) === -1)
                .map((c) => ({
                    value: c,
                    presentInSource: true,
                    presentInTarget: false,
                    overWritten: false,
                })),
        ])

        setModeratorMergeList([
            ...(targetRelease?._embedded['sw360:moderators']
                ? targetRelease._embedded['sw360:moderators'].map((mod) => mod.email)
                : ([] as string[])
            )
                .filter(
                    (c) =>
                        (sourceReleaseDetail?._embedded['sw360:moderators']
                            ? sourceReleaseDetail._embedded['sw360:moderators'].map((mod) => mod.email)
                            : ([] as string[])
                        ).indexOf(c) !== -1,
                )
                .map((c) => ({
                    value: c,
                    presentInSource: true,
                    presentInTarget: true,
                    overWritten: false,
                })),

            ...(targetRelease?._embedded['sw360:moderators']
                ? targetRelease._embedded['sw360:moderators'].map((mod) => mod.email)
                : ([] as string[])
            )
                .filter(
                    (c) =>
                        (sourceReleaseDetail?._embedded['sw360:moderators']
                            ? sourceReleaseDetail._embedded['sw360:moderators'].map((mod) => mod.email)
                            : ([] as string[])
                        ).indexOf(c) === -1,
                )
                .map((c) => ({
                    value: c,
                    presentInSource: false,
                    presentInTarget: true,
                    overWritten: false,
                })),

            ...(sourceReleaseDetail?._embedded['sw360:moderators']
                ? sourceReleaseDetail._embedded['sw360:moderators'].map((mod) => mod.email)
                : ([] as string[])
            )
                .filter(
                    (c) =>
                        (targetRelease?._embedded['sw360:moderators']
                            ? targetRelease._embedded['sw360:moderators'].map((mod) => mod.email)
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

        setContributorMergeList([
            ...(targetRelease?._embedded['sw360:contributors']
                ? targetRelease._embedded['sw360:contributors'].map((con) => con.email)
                : ([] as string[])
            )
                .filter(
                    (c) =>
                        (sourceReleaseDetail?._embedded['sw360:contributors']
                            ? sourceReleaseDetail._embedded['sw360:contributors'].map((con) => con.email)
                            : ([] as string[])
                        ).indexOf(c) !== -1,
                )
                .map((c) => ({
                    value: c,
                    presentInSource: true,
                    presentInTarget: true,
                    overWritten: false,
                })),

            ...(targetRelease?._embedded['sw360:contributors']
                ? targetRelease._embedded['sw360:contributors'].map((con) => con.email)
                : ([] as string[])
            )
                .filter(
                    (c) =>
                        (sourceReleaseDetail?._embedded['sw360:contributors']
                            ? sourceReleaseDetail._embedded['sw360:contributors'].map((con) => con.email)
                            : ([] as string[])
                        ).indexOf(c) === -1,
                )
                .map((c) => ({
                    value: c,
                    presentInSource: false,
                    presentInTarget: true,
                    overWritten: false,
                })),

            ...(sourceReleaseDetail?._embedded['sw360:contributors']
                ? sourceReleaseDetail._embedded['sw360:contributors'].map((con) => con.email)
                : ([] as string[])
            )
                .filter(
                    (c) =>
                        (targetRelease?._embedded['sw360:contributors']
                            ? targetRelease._embedded['sw360:contributors'].map((con) => con.email)
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

        setSubscriberMergeList([
            ...(targetRelease?._embedded['sw360:subscribers']
                ? targetRelease._embedded['sw360:subscribers'].map((sub) => sub.email)
                : ([] as string[])
            )
                .filter(
                    (c) =>
                        (sourceReleaseDetail?._embedded['sw360:subscribers']
                            ? sourceReleaseDetail._embedded['sw360:subscribers'].map((sub) => sub.email)
                            : ([] as string[])
                        ).indexOf(c) !== -1,
                )
                .map((c) => ({
                    value: c,
                    presentInSource: true,
                    presentInTarget: true,
                    overWritten: false,
                })),

            ...(targetRelease?._embedded['sw360:subscribers']
                ? targetRelease._embedded['sw360:subscribers'].map((sub) => sub.email)
                : ([] as string[])
            )
                .filter(
                    (c) =>
                        (sourceReleaseDetail?._embedded['sw360:subscribers']
                            ? sourceReleaseDetail._embedded['sw360:subscribers'].map((sub) => sub.email)
                            : ([] as string[])
                        ).indexOf(c) === -1,
                )
                .map((c) => ({
                    value: c,
                    presentInSource: false,
                    presentInTarget: true,
                    overWritten: false,
                })),

            ...(sourceReleaseDetail?._embedded['sw360:subscribers']
                ? sourceReleaseDetail._embedded['sw360:subscribers'].map((sub) => sub.email)
                : ([] as string[])
            )
                .filter(
                    (c) =>
                        (targetRelease?._embedded['sw360:subscribers']
                            ? targetRelease._embedded['sw360:subscribers'].map((sub) => sub.email)
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

                                                        const updatedProgrammingLanguageMergeList =
                                                            programmingMergeList.map((lang) => {
                                                                if (lang.value === c.value) {
                                                                    return {
                                                                        ...lang,
                                                                        overWritten: true,
                                                                    }
                                                                }
                                                                return lang
                                                            })
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

                                                        const updatedProgrammingLanguageMergeList =
                                                            programmingMergeList.map((lang) => {
                                                                if (lang.value === c.value) {
                                                                    return {
                                                                        ...lang,
                                                                        overWritten: false,
                                                                    }
                                                                }
                                                                return lang
                                                            })
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

                                                        const updatedProgrammingLanguageMergeList =
                                                            programmingMergeList.map((lang) => {
                                                                if (lang.value === c.value) {
                                                                    return {
                                                                        ...lang,
                                                                        overWritten: true,
                                                                    }
                                                                }
                                                                return lang
                                                            })
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

                                                        const updatedProgrammingLanguageMergeList =
                                                            programmingMergeList.map((lang) => {
                                                                if (lang.value === c.value) {
                                                                    return {
                                                                        ...lang,
                                                                        overWritten: false,
                                                                    }
                                                                }
                                                                return lang
                                                            })
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

                                                        const updatedOPeratingSystemMergeList =
                                                            operatingSystemMergeList.map((os) => {
                                                                if (os.value === c.value) {
                                                                    return {
                                                                        ...os,
                                                                        overWritten: true,
                                                                    }
                                                                }
                                                                return os
                                                            })
                                                        setOperatingSystemMergeList(updatedOPeratingSystemMergeList)
                                                    }}
                                                >
                                                    <FaLongArrowAltLeft />
                                                </button>
                                            ) : (
                                                <button
                                                    className='btn btn-secondary px-2'
                                                    onClick={() => {
                                                        const operatingSystems =
                                                            finalReleasePayload.operatingSystems ?? []
                                                        operatingSystems.push(c.value)
                                                        setFinalReleasePayload({
                                                            ...finalReleasePayload,
                                                            operatingSystems: operatingSystems,
                                                        })

                                                        const updatedOperatingSystemMergeList =
                                                            operatingSystemMergeList.map((os) => {
                                                                if (os.value === c.value) {
                                                                    return {
                                                                        ...os,
                                                                        overWritten: false,
                                                                    }
                                                                }
                                                                return os
                                                            })
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
                                                        const operatingSystems =
                                                            finalReleasePayload.operatingSystems ?? []
                                                        operatingSystems.push(c.value)
                                                        setFinalReleasePayload({
                                                            ...finalReleasePayload,
                                                            operatingSystems: operatingSystems,
                                                        })

                                                        const updatedOperatingSystemsMergeList =
                                                            operatingSystemMergeList.map((os) => {
                                                                if (os.value === c.value) {
                                                                    return {
                                                                        ...os,
                                                                        overWritten: true,
                                                                    }
                                                                }
                                                                return os
                                                            })
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

                                                        const updatedOperatingSystemMergeList =
                                                            operatingSystemMergeList.map((os) => {
                                                                if (os.value === c.value) {
                                                                    return {
                                                                        ...os,
                                                                        overWritten: false,
                                                                    }
                                                                }
                                                                return os
                                                            })
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

                                                        const updatedSoftwarePlatformMergeList =
                                                            softwarePlatformMergeList.map((sp) => {
                                                                if (sp.value === c.value) {
                                                                    return {
                                                                        ...sp,
                                                                        overWritten: true,
                                                                    }
                                                                }
                                                                return sp
                                                            })
                                                        setSoftwarePlatformMergeList(updatedSoftwarePlatformMergeList)
                                                    }}
                                                >
                                                    <FaLongArrowAltLeft />
                                                </button>
                                            ) : (
                                                <button
                                                    className='btn btn-secondary px-2'
                                                    onClick={() => {
                                                        const softwarePlatforms =
                                                            finalReleasePayload.softwarePlatforms ?? []
                                                        softwarePlatforms.push(c.value)
                                                        setFinalReleasePayload({
                                                            ...finalReleasePayload,
                                                            softwarePlatforms: softwarePlatforms,
                                                        })

                                                        const updatedSoftwarePlatformMergeList =
                                                            softwarePlatformMergeList.map((sp) => {
                                                                if (sp.value === c.value) {
                                                                    return {
                                                                        ...sp,
                                                                        overWritten: false,
                                                                    }
                                                                }
                                                                return sp
                                                            })
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
                                                        const softwarePlatforms =
                                                            finalReleasePayload.softwarePlatforms ?? []
                                                        softwarePlatforms.push(c.value)
                                                        setFinalReleasePayload({
                                                            ...finalReleasePayload,
                                                            softwarePlatforms: softwarePlatforms,
                                                        })

                                                        const updatedSoftwarePlatformsMergeList =
                                                            softwarePlatformMergeList.map((sp) => {
                                                                if (sp.value === c.value) {
                                                                    return {
                                                                        ...sp,
                                                                        overWritten: true,
                                                                    }
                                                                }
                                                                return sp
                                                            })
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

                                                        const updatedSoftwarePlatformMergeList =
                                                            softwarePlatformMergeList.map((sp) => {
                                                                if (sp.value === c.value) {
                                                                    return {
                                                                        ...sp,
                                                                        overWritten: false,
                                                                    }
                                                                }
                                                                return sp
                                                            })
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
                    <div className='border border-top-0 border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('Main Licenses')}</div>
                        {mainLicenseMergeList.map((c) => {
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
                                                        const newMainLicenses = (
                                                            finalReleasePayload.mainLicenseIds ?? []
                                                        ).filter((ml) => ml !== c.value)
                                                        setFinalReleasePayload({
                                                            ...finalReleasePayload,
                                                            mainLicenseIds: newMainLicenses,
                                                        })

                                                        const updatedMainLicenseMergeList = mainLicenseMergeList.map(
                                                            (ml) => {
                                                                if (ml.value === c.value) {
                                                                    return {
                                                                        ...ml,
                                                                        overWritten: true,
                                                                    }
                                                                }
                                                                return ml
                                                            },
                                                        )
                                                        setMainLicenseMergeList(updatedMainLicenseMergeList)
                                                    }}
                                                >
                                                    <FaLongArrowAltLeft />
                                                </button>
                                            ) : (
                                                <button
                                                    className='btn btn-secondary px-2'
                                                    onClick={() => {
                                                        const mainLicenseIds = finalReleasePayload.mainLicenseIds ?? []
                                                        mainLicenseIds.push(c.value)
                                                        setFinalReleasePayload({
                                                            ...finalReleasePayload,
                                                            mainLicenseIds: mainLicenseIds,
                                                        })

                                                        const updatedMainLicenseMergeList = mainLicenseMergeList.map(
                                                            (ml) => {
                                                                if (ml.value === c.value) {
                                                                    return {
                                                                        ...ml,
                                                                        overWritten: false,
                                                                    }
                                                                }
                                                                return ml
                                                            },
                                                        )
                                                        setMainLicenseMergeList(updatedMainLicenseMergeList)
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
                                                        const mainLicenseIds = finalReleasePayload.mainLicenseIds ?? []
                                                        mainLicenseIds.push(c.value)
                                                        setFinalReleasePayload({
                                                            ...finalReleasePayload,
                                                            mainLicenseIds: mainLicenseIds,
                                                        })

                                                        const updatedMainLicenseMergeList = mainLicenseMergeList.map(
                                                            (ml) => {
                                                                if (ml.value === c.value) {
                                                                    return {
                                                                        ...ml,
                                                                        overWritten: true,
                                                                    }
                                                                }
                                                                return ml
                                                            },
                                                        )
                                                        setMainLicenseMergeList(updatedMainLicenseMergeList)
                                                    }}
                                                >
                                                    <FaLongArrowAltLeft />
                                                </button>
                                            ) : (
                                                <button
                                                    className='btn btn-secondary px-2'
                                                    onClick={() => {
                                                        const mainLicenseIds = (
                                                            finalReleasePayload.mainLicenseIds ?? []
                                                        ).filter((ml) => ml !== c.value)
                                                        setFinalReleasePayload({
                                                            ...finalReleasePayload,
                                                            mainLicenseIds: mainLicenseIds,
                                                        })

                                                        const updatedMinLicenseMergeList = mainLicenseMergeList.map(
                                                            (ml) => {
                                                                if (ml.value === c.value) {
                                                                    return {
                                                                        ...ml,
                                                                        overWritten: false,
                                                                    }
                                                                }
                                                                return ml
                                                            },
                                                        )
                                                        setMainLicenseMergeList(updatedMinLicenseMergeList)
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
                        <div className='fw-bold text-blue'>{t('Source Code Download URL')}</div>
                        <div className='d-flex row'>
                            <div className='mt-2 col text-end'>{finalReleasePayload.sourceCodeDownloadurl}</div>
                            <div className='col-12 col-md-2 mx-5 text-center'>
                                {sourceReleaseDetail.sourceCodeDownloadurl === targetRelease.sourceCodeDownloadurl ? (
                                    <TiTick
                                        size={40}
                                        className='green'
                                    />
                                ) : finalReleasePayload.sourceCodeDownloadurl ===
                                    targetRelease.sourceCodeDownloadurl ? (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalReleasePayload({
                                                ...finalReleasePayload,
                                                sourceCodeDownloadurl: sourceReleaseDetail.sourceCodeDownloadurl,
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
                                                sourceCodeDownloadurl: targetRelease.sourceCodeDownloadurl,
                                            })
                                        }
                                    >
                                        <FaUndo />
                                    </button>
                                )}
                            </div>
                            <div className='mt-2 col text-start'>{sourceReleaseDetail.sourceCodeDownloadurl}</div>
                        </div>
                    </div>
                    <div className='border border-top-0 border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('Binary Download URL')}</div>
                        <div className='d-flex row'>
                            <div className='mt-2 col text-end'>{finalReleasePayload.binaryDownloadurl}</div>
                            <div className='col-12 col-md-2 mx-5 text-center'>
                                {sourceReleaseDetail.binaryDownloadurl === targetRelease.binaryDownloadurl ? (
                                    <TiTick
                                        size={40}
                                        className='green'
                                    />
                                ) : finalReleasePayload.binaryDownloadurl === targetRelease.binaryDownloadurl ? (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalReleasePayload({
                                                ...finalReleasePayload,
                                                binaryDownloadurl: sourceReleaseDetail.binaryDownloadurl,
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
                                                binaryDownloadurl: targetRelease.binaryDownloadurl,
                                            })
                                        }
                                    >
                                        <FaUndo />
                                    </button>
                                )}
                            </div>
                            <div className='mt-2 col text-start'>{sourceReleaseDetail.binaryDownloadurl}</div>
                        </div>
                    </div>
                    <div className='border border-top-0 border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('Release Mainline State')}</div>
                        <div className='d-flex row'>
                            <div className='mt-2 col text-end'>{finalReleasePayload.mainlineState}</div>
                            <div className='col-12 col-md-2 mx-5 text-center'>
                                {sourceReleaseDetail.mainlineState === targetRelease.mainlineState ? (
                                    <TiTick
                                        size={40}
                                        className='green'
                                    />
                                ) : finalReleasePayload.mainlineState === targetRelease.mainlineState ? (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalReleasePayload({
                                                ...finalReleasePayload,
                                                mainlineState: sourceReleaseDetail.mainlineState,
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
                                                mainlineState: targetRelease.mainlineState,
                                            })
                                        }
                                    >
                                        <FaUndo />
                                    </button>
                                )}
                            </div>
                            <div className='mt-2 col text-start'>{sourceReleaseDetail.mainlineState}</div>
                        </div>
                    </div>
                    <div className='border border-top-0 border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('Vendor')}</div>
                        <div className='d-flex row'>
                            <div className='mt-2 col text-end'>
                                {vendor
                                    ? `${vendor.fullName ?? ''}
                                       ${vendor.shortName ? ` (${vendor.shortName})` : ''}
                                       ${vendor.url ? `: ${vendor.url}` : ''}`
                                    : ''}
                            </div>
                            <div className='col-12 col-md-2 mx-5 text-center'>
                                {sourceReleaseDetail._embedded['sw360:vendors']?.[0]._links?.self.href
                                    .split('/')
                                    .at(-1) ===
                                    targetRelease._embedded['sw360:vendors']?.[0]._links?.self.href.split('/').at(-1) ? (
                                    <TiTick
                                        size={25}
                                        className='green'
                                    />
                                ) : (vendor._links?.self.href.split('/').at(-1) ?? undefined) ===
                                    targetRelease._embedded['sw360:vendors']?.[0]._links?.self.href.split('/').at(-1) ? (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() => {
                                            setFinalReleasePayload({
                                                ...finalReleasePayload,
                                                vendorId: sourceReleaseDetail._embedded[
                                                    'sw360:vendors'
                                                ]?.[0]._links?.self.href
                                                    .split('/')
                                                    .at(-1),
                                                vendor: sourceReleaseDetail._embedded?.['sw360:vendors']?.[0],
                                            })
                                            setVendor(sourceReleaseDetail._embedded?.['sw360:vendors']?.[0] ?? {})
                                        }}
                                    >
                                        <FaLongArrowAltLeft />
                                    </button>
                                ) : (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() => {
                                            setFinalReleasePayload({
                                                ...finalReleasePayload,
                                                vendorId: targetRelease._embedded[
                                                    'sw360:vendors'
                                                ]?.[0]._links?.self.href
                                                    .split('/')
                                                    .at(-1),
                                                vendor: targetRelease._embedded?.['sw360:vendors']?.[0],
                                            })
                                            setVendor(targetRelease._embedded?.['sw360:vendors']?.[0] ?? {})
                                        }}
                                    >
                                        <FaUndo />
                                    </button>
                                )}
                            </div>
                            <div className='mt-2 col text-start'>
                                {sourceReleaseDetail._embedded['sw360:vendors']?.[0]
                                    ? `${sourceReleaseDetail._embedded['sw360:vendors']?.[0].fullName ?? ''}
                                       ${sourceReleaseDetail._embedded['sw360:vendors']?.[0].shortName
                                        ? ` (${sourceReleaseDetail._embedded['sw360:vendors']?.[0].shortName})`
                                        : ''
                                    }
                                       ${sourceReleaseDetail._embedded['sw360:vendors']?.[0].url
                                        ? `: ${sourceReleaseDetail._embedded['sw360:vendors']?.[0].url}`
                                        : ''
                                    }`
                                    : ''}
                            </div>
                        </div>
                    </div>
                    <div className='border border-top-0 border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('Repository')}</div>
                        <div className='d-flex row'>
                            <div className='mt-2 col text-end'>
                                {finalReleasePayload.repository
                                    ? `${finalReleasePayload.repository?.url ? finalReleasePayload.repository?.url : ''}
                                    ${finalReleasePayload.repository?.repositorytype
                                        ? `(${finalReleasePayload.repository?.repositorytype})`
                                        : ''
                                    }`
                                    : ''}
                            </div>
                            <div className='col-12 col-md-2 mx-5 text-center'>
                                {sourceReleaseDetail.repository?.url === targetRelease.repository?.url ? (
                                    <TiTick
                                        size={40}
                                        className='green'
                                    />
                                ) : finalReleasePayload.repository?.url === targetRelease.repository?.url ? (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalReleasePayload({
                                                ...finalReleasePayload,
                                                repository: sourceReleaseDetail.repository,
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
                                                repository: targetRelease.repository,
                                            })
                                        }
                                    >
                                        <FaUndo />
                                    </button>
                                )}
                            </div>
                            <div className='mt-2 col text-start'>
                                {sourceReleaseDetail.repository
                                    ? `${sourceReleaseDetail.repository?.url ? sourceReleaseDetail.repository?.url : ''}
                                    ${sourceReleaseDetail.repository?.repositorytype
                                        ? `(${sourceReleaseDetail.repository?.repositorytype})`
                                        : ''
                                    }`
                                    : ''}
                            </div>
                        </div>
                    </div>
                    <div className='border border-top-0 border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('Moderators')}</div>
                        {moderatorMergeList.map((c) => {
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
                                                        const newModeratorList = (
                                                            finalReleasePayload.moderators ?? []
                                                        ).filter((mod) => mod !== c.value)
                                                        setFinalReleasePayload({
                                                            ...finalReleasePayload,
                                                            moderators: newModeratorList,
                                                        })

                                                        const updatedModeratorMergeList = moderatorMergeList.map(
                                                            (mod) => {
                                                                if (mod.value === c.value) {
                                                                    return {
                                                                        ...mod,
                                                                        overWritten: true,
                                                                    }
                                                                }
                                                                return mod
                                                            },
                                                        )
                                                        setModeratorMergeList(updatedModeratorMergeList)
                                                    }}
                                                >
                                                    <FaLongArrowAltLeft />
                                                </button>
                                            ) : (
                                                <button
                                                    className='btn btn-secondary px-2'
                                                    onClick={() => {
                                                        const moderatorsData = finalReleasePayload.moderators ?? []
                                                        moderatorsData.push(c.value)
                                                        setFinalReleasePayload({
                                                            ...finalReleasePayload,
                                                            moderators: moderatorsData,
                                                        })

                                                        const updatedModeratorsMergeList = moderatorMergeList.map(
                                                            (mod) => {
                                                                if (mod.value === c.value) {
                                                                    return {
                                                                        ...mod,
                                                                        overWritten: false,
                                                                    }
                                                                }
                                                                return mod
                                                            },
                                                        )
                                                        setModeratorMergeList(updatedModeratorsMergeList)
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
                                                        const moderatorList = finalReleasePayload.moderators ?? []
                                                        moderatorList.push(c.value)
                                                        setFinalReleasePayload({
                                                            ...finalReleasePayload,
                                                            moderators: moderatorList,
                                                        })

                                                        const updatedModeratorsMergeList = moderatorMergeList.map(
                                                            (mod) => {
                                                                if (mod.value === c.value) {
                                                                    return {
                                                                        ...mod,
                                                                        overWritten: true,
                                                                    }
                                                                }
                                                                return mod
                                                            },
                                                        )
                                                        setModeratorMergeList(updatedModeratorsMergeList)
                                                    }}
                                                >
                                                    <FaLongArrowAltLeft />
                                                </button>
                                            ) : (
                                                <button
                                                    className='btn btn-secondary px-2'
                                                    onClick={() => {
                                                        const moderatorList = (
                                                            finalReleasePayload.moderators ?? []
                                                        ).filter((mod) => mod !== c.value)
                                                        setFinalReleasePayload({
                                                            ...finalReleasePayload,
                                                            moderators: moderatorList,
                                                        })

                                                        const updatedModeratorMergeList = moderatorMergeList.map(
                                                            (mod) => {
                                                                if (mod.value === c.value) {
                                                                    return {
                                                                        ...mod,
                                                                        overWritten: false,
                                                                    }
                                                                }
                                                                return mod
                                                            },
                                                        )
                                                        setModeratorMergeList(updatedModeratorMergeList)
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
                        <div className='fw-bold text-blue'>{t('Contributors')}</div>
                        {contributorMergeList.map((c) => {
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
                                                        const newContributorList = (
                                                            finalReleasePayload.contributors ?? []
                                                        ).filter((con) => con !== c.value)
                                                        setFinalReleasePayload({
                                                            ...finalReleasePayload,
                                                            contributors: newContributorList,
                                                        })

                                                        const updatedContributorMergeList = contributorMergeList.map(
                                                            (con) => {
                                                                if (con.value === c.value) {
                                                                    return {
                                                                        ...con,
                                                                        overWritten: true,
                                                                    }
                                                                }
                                                                return con
                                                            },
                                                        )
                                                        setContributorMergeList(updatedContributorMergeList)
                                                    }}
                                                >
                                                    <FaLongArrowAltLeft />
                                                </button>
                                            ) : (
                                                <button
                                                    className='btn btn-secondary px-2'
                                                    onClick={() => {
                                                        const contributorsData = finalReleasePayload.contributors ?? []
                                                        contributorsData.push(c.value)
                                                        setFinalReleasePayload({
                                                            ...finalReleasePayload,
                                                            contributors: contributorsData,
                                                        })

                                                        const updatedContributorsMergeList = contributorMergeList.map(
                                                            (con) => {
                                                                if (con.value === c.value) {
                                                                    return {
                                                                        ...con,
                                                                        overWritten: false,
                                                                    }
                                                                }
                                                                return con
                                                            },
                                                        )
                                                        setContributorMergeList(updatedContributorsMergeList)
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
                                                        const contributorList = finalReleasePayload.contributors ?? []
                                                        contributorList.push(c.value)
                                                        setFinalReleasePayload({
                                                            ...finalReleasePayload,
                                                            contributors: contributorList,
                                                        })

                                                        const updatedContributorsMergeList = contributorMergeList.map(
                                                            (con) => {
                                                                if (con.value === c.value) {
                                                                    return {
                                                                        ...con,
                                                                        overWritten: true,
                                                                    }
                                                                }
                                                                return con
                                                            },
                                                        )
                                                        setContributorMergeList(updatedContributorsMergeList)
                                                    }}
                                                >
                                                    <FaLongArrowAltLeft />
                                                </button>
                                            ) : (
                                                <button
                                                    className='btn btn-secondary px-2'
                                                    onClick={() => {
                                                        const contributorList = (
                                                            finalReleasePayload.contributors ?? []
                                                        ).filter((con) => con !== c.value)
                                                        setFinalReleasePayload({
                                                            ...finalReleasePayload,
                                                            contributors: contributorList,
                                                        })

                                                        const updatedContributorMergeList = contributorMergeList.map(
                                                            (con) => {
                                                                if (con.value === c.value) {
                                                                    return {
                                                                        ...con,
                                                                        overWritten: false,
                                                                    }
                                                                }
                                                                return con
                                                            },
                                                        )
                                                        setContributorMergeList(updatedContributorMergeList)
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
                        <div className='fw-bold text-blue'>{t('Subscribers')}</div>
                        {subscriberMergeList.map((c) => {
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
                                                        const newSubscriberList = (
                                                            finalReleasePayload.subscribers ?? []
                                                        ).filter((sub) => sub !== c.value)
                                                        setFinalReleasePayload({
                                                            ...finalReleasePayload,
                                                            subscribers: newSubscriberList,
                                                        })

                                                        const updatedSubscriberMergeList = subscriberMergeList.map(
                                                            (sub) => {
                                                                if (sub.value === c.value) {
                                                                    return {
                                                                        ...sub,
                                                                        overWritten: true,
                                                                    }
                                                                }
                                                                return sub
                                                            },
                                                        )
                                                        setSubscriberMergeList(updatedSubscriberMergeList)
                                                    }}
                                                >
                                                    <FaLongArrowAltLeft />
                                                </button>
                                            ) : (
                                                <button
                                                    className='btn btn-secondary px-2'
                                                    onClick={() => {
                                                        const subscribersData = finalReleasePayload.subscribers ?? []
                                                        subscribersData.push(c.value)
                                                        setFinalReleasePayload({
                                                            ...finalReleasePayload,
                                                            subscribers: subscribersData,
                                                        })

                                                        const updatedSubscribersMergeList = subscriberMergeList.map(
                                                            (sub) => {
                                                                if (sub.value === c.value) {
                                                                    return {
                                                                        ...sub,
                                                                        overWritten: false,
                                                                    }
                                                                }
                                                                return sub
                                                            },
                                                        )
                                                        setSubscriberMergeList(updatedSubscribersMergeList)
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
                                                        const subscribersList = finalReleasePayload.subscribers ?? []
                                                        subscribersList.push(c.value)
                                                        setFinalReleasePayload({
                                                            ...finalReleasePayload,
                                                            subscribers: subscribersList,
                                                        })

                                                        const updatedSubscribersMergeList = subscriberMergeList.map(
                                                            (sub) => {
                                                                if (sub.value === c.value) {
                                                                    return {
                                                                        ...sub,
                                                                        overWritten: true,
                                                                    }
                                                                }
                                                                return sub
                                                            },
                                                        )
                                                        setSubscriberMergeList(updatedSubscribersMergeList)
                                                    }}
                                                >
                                                    <FaLongArrowAltLeft />
                                                </button>
                                            ) : (
                                                <button
                                                    className='btn btn-secondary px-2'
                                                    onClick={() => {
                                                        const subscriberList = (
                                                            finalReleasePayload.subscribers ?? []
                                                        ).filter((sub) => sub !== c.value)
                                                        setFinalReleasePayload({
                                                            ...finalReleasePayload,
                                                            subscribers: subscriberList,
                                                        })

                                                        const updatedSubscriberMergeList = subscriberMergeList.map(
                                                            (sub) => {
                                                                if (sub.value === c.value) {
                                                                    return {
                                                                        ...sub,
                                                                        overWritten: false,
                                                                    }
                                                                }
                                                                return sub
                                                            },
                                                        )
                                                        setSubscriberMergeList(updatedSubscriberMergeList)
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
                </div>
            )}
        </>
    )
}
