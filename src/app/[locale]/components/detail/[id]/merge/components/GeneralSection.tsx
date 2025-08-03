// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { Component, ListFieldProcessComponent, Vendor } from '@/object-types'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Dispatch, ReactNode, SetStateAction, useEffect, useState } from 'react'
import { BiInfoCircle } from 'react-icons/bi'
import { FaLongArrowAltLeft, FaUndo } from 'react-icons/fa'
import { TiTick } from 'react-icons/ti'

export default function GeneralSection({
    targetComponent,
    sourceComponent,
    finalComponentPayload,
    setFinalComponentPayload,
}: {
    targetComponent: Component | null
    sourceComponent: Component | null
    finalComponentPayload: Component | null
    setFinalComponentPayload: Dispatch<SetStateAction<null | Component>>
}): ReactNode {
    const t = useTranslations('default')
    const [defaultVendor, setDefaultVendor] = useState<Vendor>({})
    const [categoryMergeList, setCategoryMergeList] = useState<ListFieldProcessComponent[]>([])
    const { status } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [status])

    useEffect(() => {
        setDefaultVendor(targetComponent?._embedded?.defaultVendor ?? {})

        setCategoryMergeList([
            ...(targetComponent?.categories ?? ([] as string[]))
                .filter((c) => (sourceComponent?.categories ?? ([] as string[])).indexOf(c) !== -1)
                .map((c) => ({ value: c, presentInSource: true, presentInTarget: true, overWritten: false })),

            ...(targetComponent?.categories ?? ([] as string[]))
                .filter((c) => (sourceComponent?.categories ?? ([] as string[])).indexOf(c) === -1)
                .map((c) => ({ value: c, presentInSource: false, presentInTarget: true, overWritten: false })),

            ...(sourceComponent?.categories ?? ([] as string[]))
                .filter((c) => (targetComponent?.categories ?? ([] as string[])).indexOf(c) === -1)
                .map((c) => ({ value: c, presentInSource: true, presentInTarget: false, overWritten: false })),
        ])
    }, [targetComponent, sourceComponent])

    return (
        <>
            {targetComponent && sourceComponent && finalComponentPayload && (
                <div className='mb-3'>
                    <h6 className='border-bottom fw-bold text-uppercase text-blue border-blue mb-2'>{t('General')}</h6>
                    <div className='border border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('Name')}</div>
                        <div className='d-flex row'>
                            <div className='mt-2 col text-end'>{finalComponentPayload.name}</div>
                            <div className='col-12 col-md-2 mx-5 text-center'>
                                {sourceComponent.name === targetComponent.name ? (
                                    <TiTick
                                        size={40}
                                        className='green'
                                    />
                                ) : finalComponentPayload.name === targetComponent.name ? (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalComponentPayload({
                                                ...finalComponentPayload,
                                                name: sourceComponent.name,
                                            })
                                        }
                                    >
                                        <FaLongArrowAltLeft />
                                    </button>
                                ) : (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalComponentPayload({
                                                ...finalComponentPayload,
                                                name: targetComponent.name,
                                            })
                                        }
                                    >
                                        <FaUndo />
                                    </button>
                                )}
                            </div>
                            <div className='mt-2 col text-start'>{sourceComponent.name}</div>
                        </div>
                    </div>
                    <div className='border border-top-0 border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('Created on')}</div>
                        <div className='d-flex row'>
                            <div className='mt-2 col text-end'>{finalComponentPayload.createdOn}</div>
                            <div className='col-12 col-md-2 mx-5 text-center'>
                                {sourceComponent.createdOn === targetComponent.createdOn ? (
                                    <TiTick
                                        size={25}
                                        className='green'
                                    />
                                ) : finalComponentPayload.createdOn === targetComponent.createdOn ? (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalComponentPayload({
                                                ...finalComponentPayload,
                                                createdOn: sourceComponent.createdOn,
                                            })
                                        }
                                    >
                                        <FaLongArrowAltLeft />
                                    </button>
                                ) : (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalComponentPayload({
                                                ...finalComponentPayload,
                                                createdOn: targetComponent.createdOn,
                                            })
                                        }
                                    >
                                        <FaUndo />
                                    </button>
                                )}
                            </div>
                            <div className='mt-2 col text-start'>{sourceComponent.createdOn}</div>
                        </div>
                    </div>
                    <div className='border border-top-0 border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('Created by')}</div>
                        <div className='d-flex row'>
                            <div className='mt-2 col text-end'>{finalComponentPayload.createdBy}</div>
                            <div className='col-12 col-md-2 mx-5 text-center'>
                                {sourceComponent._embedded?.createdBy?.email ===
                                targetComponent._embedded?.createdBy?.email ? (
                                    <TiTick
                                        size={25}
                                        className='green'
                                    />
                                ) : finalComponentPayload.createdBy === targetComponent._embedded?.createdBy?.email ? (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalComponentPayload({
                                                ...finalComponentPayload,
                                                createdBy: sourceComponent._embedded?.createdBy?.email,
                                            })
                                        }
                                    >
                                        <FaLongArrowAltLeft />
                                    </button>
                                ) : (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalComponentPayload({
                                                ...finalComponentPayload,
                                                createdBy: targetComponent._embedded?.createdBy?.email,
                                            })
                                        }
                                    >
                                        <FaUndo />
                                    </button>
                                )}
                            </div>
                            <div className='mt-2 col text-start'>{sourceComponent._embedded?.createdBy?.email}</div>
                            {sourceComponent._embedded?.createdBy?.email !==
                                targetComponent._embedded?.createdBy?.email && (
                                <div className='mt-2 text-center fw-medium text-secondary'>
                                    <BiInfoCircle />{' '}
                                    {t.rich('MADE_MODERATOR', {
                                        email: sourceComponent._embedded?.createdBy?.email ?? '',
                                    })}
                                    .
                                </div>
                            )}
                        </div>
                    </div>
                    <div className='border border-top-0 border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('Categories')}</div>
                        {categoryMergeList.map((c) => {
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
                                                        const newCategories = (
                                                            finalComponentPayload.categories ?? []
                                                        ).filter((cat) => cat !== c.value)
                                                        setFinalComponentPayload({
                                                            ...finalComponentPayload,
                                                            categories: newCategories,
                                                        })

                                                        const updatedCategoryMergeList = categoryMergeList.map(
                                                            (cat) => {
                                                                if (cat.value === c.value) {
                                                                    return {
                                                                        ...cat,
                                                                        overWritten: true,
                                                                    }
                                                                }
                                                                return cat
                                                            },
                                                        )
                                                        setCategoryMergeList(updatedCategoryMergeList)
                                                    }}
                                                >
                                                    <FaLongArrowAltLeft />
                                                </button>
                                            ) : (
                                                <button
                                                    className='btn btn-secondary px-2'
                                                    onClick={() => {
                                                        const categories = finalComponentPayload.categories ?? []
                                                        categories.push(c.value)
                                                        setFinalComponentPayload({
                                                            ...finalComponentPayload,
                                                            categories,
                                                        })

                                                        const updatedCategoryMergeList = categoryMergeList.map(
                                                            (cat) => {
                                                                if (cat.value === c.value) {
                                                                    return {
                                                                        ...cat,
                                                                        overWritten: false,
                                                                    }
                                                                }
                                                                return cat
                                                            },
                                                        )
                                                        setCategoryMergeList(updatedCategoryMergeList)
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
                                                        const categories = finalComponentPayload.categories ?? []
                                                        categories.push(c.value)
                                                        setFinalComponentPayload({
                                                            ...finalComponentPayload,
                                                            categories,
                                                        })

                                                        const updatedCategoryMergeList = categoryMergeList.map(
                                                            (cat) => {
                                                                if (cat.value === c.value) {
                                                                    return {
                                                                        ...cat,
                                                                        overWritten: true,
                                                                    }
                                                                }
                                                                return cat
                                                            },
                                                        )
                                                        setCategoryMergeList(updatedCategoryMergeList)
                                                    }}
                                                >
                                                    <FaLongArrowAltLeft />
                                                </button>
                                            ) : (
                                                <button
                                                    className='btn btn-secondary px-2'
                                                    onClick={() => {
                                                        const categories = (
                                                            finalComponentPayload.categories ?? []
                                                        ).filter((cat) => cat !== c.value)
                                                        setFinalComponentPayload({
                                                            ...finalComponentPayload,
                                                            categories,
                                                        })

                                                        const updatedCategoryMergeList = categoryMergeList.map(
                                                            (cat) => {
                                                                if (cat.value === c.value) {
                                                                    return {
                                                                        ...cat,
                                                                        overWritten: false,
                                                                    }
                                                                }
                                                                return cat
                                                            },
                                                        )
                                                        setCategoryMergeList(updatedCategoryMergeList)
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
                        <div className='fw-bold text-blue'>{t('Component Type')}</div>
                        <div className='d-flex row'>
                            <div className='mt-2 col text-end'>{finalComponentPayload.componentType}</div>
                            <div className='col-12 col-md-2 mx-5 text-center'>
                                {sourceComponent.componentType === targetComponent.componentType ? (
                                    <TiTick
                                        size={25}
                                        className='green'
                                    />
                                ) : finalComponentPayload.componentType === targetComponent.componentType ? (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalComponentPayload({
                                                ...finalComponentPayload,
                                                componentType: sourceComponent.componentType,
                                            })
                                        }
                                    >
                                        <FaLongArrowAltLeft />
                                    </button>
                                ) : (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalComponentPayload({
                                                ...finalComponentPayload,
                                                componentType: targetComponent.componentType,
                                            })
                                        }
                                    >
                                        <FaUndo />
                                    </button>
                                )}
                            </div>
                            <div className='mt-2 col text-start'>{sourceComponent.componentType}</div>
                        </div>
                    </div>
                    <div className='border border-top-0 border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('Default vendor')}</div>
                        <div className='d-flex row'>
                            <div className='mt-2 col text-end'>{defaultVendor.fullName}</div>
                            <div className='col-12 col-md-2 mx-5 text-center'>
                                {sourceComponent.defaultVendorId === targetComponent.defaultVendorId ? (
                                    <TiTick
                                        size={25}
                                        className='green'
                                    />
                                ) : (defaultVendor._links?.self.href.split('/').at(-1) ?? undefined) ===
                                  targetComponent.defaultVendorId ? (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() => {
                                            setFinalComponentPayload({
                                                ...finalComponentPayload,
                                                defaultVendorId: sourceComponent.defaultVendorId,
                                                defaultVendor: sourceComponent._embedded?.defaultVendor,
                                            })
                                            setDefaultVendor(sourceComponent._embedded?.defaultVendor ?? {})
                                        }}
                                    >
                                        <FaLongArrowAltLeft />
                                    </button>
                                ) : (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() => {
                                            setFinalComponentPayload({
                                                ...finalComponentPayload,
                                                defaultVendorId: targetComponent.defaultVendorId,
                                                defaultVendor: targetComponent._embedded?.defaultVendor,
                                            })
                                            setDefaultVendor(targetComponent._embedded?.defaultVendor ?? {})
                                        }}
                                    >
                                        <FaUndo />
                                    </button>
                                )}
                            </div>
                            <div className='mt-2 col text-start'>
                                {sourceComponent._embedded?.defaultVendor?.fullName}
                            </div>
                        </div>
                    </div>
                    <div className='border border-top-0 border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('Homepage')}</div>
                        <div className='d-flex row'>
                            <div className='mt-2 col text-end'>{finalComponentPayload.homepage}</div>
                            <div className='col-12 col-md-2 mx-5 text-center'>
                                {sourceComponent.homepage === targetComponent.homepage ? (
                                    <TiTick
                                        size={25}
                                        className='green'
                                    />
                                ) : finalComponentPayload.homepage === targetComponent.homepage ? (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalComponentPayload({
                                                ...finalComponentPayload,
                                                homepage: sourceComponent.homepage,
                                            })
                                        }
                                    >
                                        <FaLongArrowAltLeft />
                                    </button>
                                ) : (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalComponentPayload({
                                                ...finalComponentPayload,
                                                homepage: targetComponent.homepage,
                                            })
                                        }
                                    >
                                        <FaUndo />
                                    </button>
                                )}
                            </div>
                            <div className='mt-2 col text-start'>{sourceComponent.homepage}</div>
                        </div>
                    </div>
                    <div className='border border-top-0 border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('Blog')}</div>
                        <div className='d-flex row'>
                            <div className='mt-2 col text-end'>{finalComponentPayload.blog}</div>
                            <div className='col-12 col-md-2 mx-5 text-center'>
                                {sourceComponent.blog === targetComponent.blog ? (
                                    <TiTick
                                        size={25}
                                        className='green'
                                    />
                                ) : finalComponentPayload.blog === targetComponent.blog ? (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalComponentPayload({
                                                ...finalComponentPayload,
                                                blog: sourceComponent.blog,
                                            })
                                        }
                                    >
                                        <FaLongArrowAltLeft />
                                    </button>
                                ) : (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalComponentPayload({
                                                ...finalComponentPayload,
                                                blog: targetComponent.blog,
                                            })
                                        }
                                    >
                                        <FaUndo />
                                    </button>
                                )}
                            </div>
                            <div className='mt-2 col text-start'>{sourceComponent.blog}</div>
                        </div>
                    </div>
                    <div className='border border-top-0 border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('Wiki')}</div>
                        <div className='d-flex row'>
                            <div className='mt-2 col text-end'>{finalComponentPayload.wiki}</div>
                            <div className='col-12 col-md-2 mx-5 text-center'>
                                {sourceComponent.wiki === targetComponent.wiki ? (
                                    <TiTick
                                        size={25}
                                        className='green'
                                    />
                                ) : finalComponentPayload.wiki === targetComponent.wiki ? (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalComponentPayload({
                                                ...finalComponentPayload,
                                                wiki: sourceComponent.wiki,
                                            })
                                        }
                                    >
                                        <FaLongArrowAltLeft />
                                    </button>
                                ) : (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalComponentPayload({
                                                ...finalComponentPayload,
                                                wiki: targetComponent.wiki,
                                            })
                                        }
                                    >
                                        <FaUndo />
                                    </button>
                                )}
                            </div>
                            <div className='mt-2 col text-start'>{sourceComponent.wiki}</div>
                        </div>
                    </div>
                    <div className='border border-top-0 border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('Mailing list')}</div>
                        <div className='d-flex row'>
                            <div className='mt-2 col text-end'>{finalComponentPayload.mailinglist}</div>
                            <div className='col-12 col-md-2 mx-5 text-center'>
                                {sourceComponent.mailinglist === targetComponent.mailinglist ? (
                                    <TiTick
                                        size={25}
                                        className='green'
                                    />
                                ) : finalComponentPayload.mailinglist === targetComponent.mailinglist ? (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalComponentPayload({
                                                ...finalComponentPayload,
                                                mailinglist: sourceComponent.mailinglist,
                                            })
                                        }
                                    >
                                        <FaLongArrowAltLeft />
                                    </button>
                                ) : (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalComponentPayload({
                                                ...finalComponentPayload,
                                                mailinglist: targetComponent.mailinglist,
                                            })
                                        }
                                    >
                                        <FaUndo />
                                    </button>
                                )}
                            </div>
                            <div className='mt-2 col text-start'>{sourceComponent.mailinglist}</div>
                        </div>
                    </div>
                    <div className='border border-top-0 border-blue p-2'>
                        <div className='fw-bold text-blue'>{t('Description')}</div>
                        <div className='d-flex row'>
                            <div className='mt-2 col text-end'>{finalComponentPayload.description}</div>
                            <div className='col-12 col-md-2 mx-5 text-center'>
                                {sourceComponent.description === targetComponent.description ? (
                                    <TiTick
                                        size={25}
                                        className='green'
                                    />
                                ) : finalComponentPayload.description === targetComponent.description ? (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalComponentPayload({
                                                ...finalComponentPayload,
                                                description: sourceComponent.description,
                                            })
                                        }
                                    >
                                        <FaLongArrowAltLeft />
                                    </button>
                                ) : (
                                    <button
                                        className='btn btn-secondary px-2'
                                        onClick={() =>
                                            setFinalComponentPayload({
                                                ...finalComponentPayload,
                                                description: targetComponent.description,
                                            })
                                        }
                                    >
                                        <FaUndo />
                                    </button>
                                )}
                            </div>
                            <div className='mt-2 col text-start'>{sourceComponent.description}</div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
