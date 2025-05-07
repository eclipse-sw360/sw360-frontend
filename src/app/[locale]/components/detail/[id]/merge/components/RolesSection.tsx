// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { Component, ListFieldMerge } from "@/object-types"
import { useTranslations } from "next-intl"
import { ReactNode, SetStateAction, Dispatch, useEffect, useState } from "react"
import { FaLongArrowAltLeft } from "react-icons/fa"
import { TiTick } from "react-icons/ti"
import { FaUndo } from "react-icons/fa"

export default function RolesSection(
    {
        targetComponent, sourceComponent, finalComponentPayload, setFinalComponentPayload
    }: {
        targetComponent: Component | null, sourceComponent: Component | null,
        finalComponentPayload: Component | null, setFinalComponentPayload: Dispatch<SetStateAction<null | Component>>
    }): ReactNode {

    const t = useTranslations('default')
    const [moderatorsMergeList, setModeratorsMergeList] = useState<ListFieldMerge[]>([])

    useEffect(() => {
        setModeratorsMergeList([
            ...(targetComponent?.moderators ?? ([] as string[]))
                .filter(c => (sourceComponent?.moderators ?? ([] as string[])).indexOf(c) !== -1)
                .map(c => ({ value: c, presentInSource: true, presentInTarget: true, overWritten: false })),

            ...(targetComponent?.moderators ?? ([] as string[]))
                .filter(c => (sourceComponent?.moderators ?? ([] as string[])).indexOf(c) === -1)
                .map(c => ({ value: c, presentInSource: false, presentInTarget: true, overWritten: false })),

            ...(sourceComponent?.moderators ?? ([] as string[]))
                .filter(c => (targetComponent?.moderators ?? ([] as string[])).indexOf(c) === -1)
                .map(c => ({ value: c, presentInSource: true, presentInTarget: false, overWritten: false }))
        ])
    }, [targetComponent, sourceComponent])

    return (
        <>
            {
                (targetComponent && sourceComponent && finalComponentPayload) &&
                <div className='mb-3'>
                    <h6 className="border-bottom fw-bold text-uppercase text-blue border-blue mb-2">
                        {t('Roles')}
                    </h6>
                    <div className="border border-blue p-2">
                        <div className="fw-bold text-blue">{t('Component Owner')}</div>
                        <div className="d-flex row">
                            <div className="mt-2 col text-end">{finalComponentPayload.componentOwner}</div>
                            <div className="col-12 col-md-2 mx-5 text-center">
                                {
                                    (sourceComponent.componentOwner === targetComponent.componentOwner)
                                        ? <TiTick size={25} className="green" />
                                        : (finalComponentPayload.componentOwner === targetComponent.componentOwner)
                                            ? <button className="btn btn-secondary px-2"
                                                onClick={() => setFinalComponentPayload({ ...finalComponentPayload, componentOwner: sourceComponent.componentOwner })}
                                            >
                                                <FaLongArrowAltLeft />
                                            </button>
                                            : <button className="btn btn-secondary px-2"
                                                onClick={() => setFinalComponentPayload({ ...finalComponentPayload, componentOwner: targetComponent.componentOwner })}
                                            >
                                                <FaUndo />
                                            </button>

                                }
                            </div>
                            <div className="mt-2 col text-start">{sourceComponent.componentOwner}</div>
                        </div>
                    </div>
                    <div className="border border-top-0 border-blue p-2">
                        <div className="fw-bold text-blue">{t('Owner Accounting Unit')}</div>
                        <div className="d-flex row">
                            <div className="mt-2 col text-end">{finalComponentPayload.ownerAccountingUnit}</div>
                            <div className="col-12 col-md-2 mx-5 text-center">
                                {
                                    (sourceComponent.ownerAccountingUnit === targetComponent.ownerAccountingUnit)
                                        ? <TiTick size={25} className="green" />
                                        : (finalComponentPayload.ownerAccountingUnit === targetComponent.ownerAccountingUnit)
                                            ? <button className="btn btn-secondary px-2"
                                                onClick={() => setFinalComponentPayload({ ...finalComponentPayload, ownerAccountingUnit: sourceComponent.ownerAccountingUnit })}
                                            >
                                                <FaLongArrowAltLeft />
                                            </button>
                                            : <button className="btn btn-secondary px-2"
                                                onClick={() => setFinalComponentPayload({ ...finalComponentPayload, ownerAccountingUnit: targetComponent.ownerAccountingUnit })}
                                            >
                                                <FaUndo />
                                            </button>

                                }
                            </div>
                            <div className="mt-2 col text-start">{sourceComponent.ownerAccountingUnit}</div>
                        </div>
                    </div>
                    <div className="border border-top-0 border-blue p-2">
                        <div className="fw-bold text-blue">{t('Owner Billing Group')}</div>
                        <div className="d-flex row">
                            <div className="mt-2 col text-end">{finalComponentPayload.ownerGroup}</div>
                            <div className="col-12 col-md-2 mx-5 text-center">
                                {
                                    (sourceComponent.ownerGroup === targetComponent.ownerGroup)
                                        ? <TiTick size={25} className="green" />
                                        : (finalComponentPayload.ownerGroup === targetComponent.ownerGroup)
                                            ? <button className="btn btn-secondary px-2"
                                                onClick={() => setFinalComponentPayload({ ...finalComponentPayload, ownerGroup: sourceComponent.ownerGroup })}
                                            >
                                                <FaLongArrowAltLeft />
                                            </button>
                                            : <button className="btn btn-secondary px-2"
                                                onClick={() => setFinalComponentPayload({ ...finalComponentPayload, ownerGroup: targetComponent.ownerGroup })}
                                            >
                                                <FaUndo />
                                            </button>

                                }
                            </div>
                            <div className="mt-2 col text-start">{sourceComponent.ownerGroup}</div>
                        </div>
                    </div>
                    <div className="border border-top-0 border-blue p-2">
                        <div className="fw-bold text-blue">{t('Owner Country')}</div>
                        <div className="d-flex row">
                            <div className="mt-2 col text-end">{finalComponentPayload.ownerCountry}</div>
                            <div className="col-12 col-md-2 mx-5 text-center">
                                {
                                    (sourceComponent.ownerCountry === targetComponent.ownerCountry)
                                        ? <TiTick size={25} className="green" />
                                        : (finalComponentPayload.ownerCountry === targetComponent.ownerCountry)
                                            ? <button className="btn btn-secondary px-2"
                                                onClick={() => setFinalComponentPayload({ ...finalComponentPayload, ownerCountry: sourceComponent.ownerCountry })}
                                            >
                                                <FaLongArrowAltLeft />
                                            </button>
                                            : <button className="btn btn-secondary px-2"
                                                onClick={() => setFinalComponentPayload({ ...finalComponentPayload, ownerCountry: targetComponent.ownerCountry })}
                                            >
                                                <FaUndo />
                                            </button>

                                }
                            </div>
                            <div className="mt-2 col text-start">{sourceComponent.ownerCountry}</div>
                        </div>
                    </div>
                    <div className="border border-top-0 border-blue p-2">
                        <div className="fw-bold text-blue">{t('Moderators')}</div>
                        {
                            moderatorsMergeList.map(c => {
                                if (c.presentInSource && c.presentInTarget) {
                                    return (
                                        <div className="d-flex row mb-1" key={c.value}>
                                            <div className="mt-2 col text-end">{c.value}</div>
                                            <div className="col-12 col-md-2 mx-5 text-center">
                                                <TiTick size={25} className="green" />
                                            </div>
                                            <div className="mt-2 col text-start">{c.value}</div>
                                        </div>
                                    )
                                } else if (c.presentInTarget) {
                                    return (
                                        <div className="d-flex row mb-1" key={c.value}>
                                            <div className="mt-2 col text-end">{c.overWritten ? '' : c.value}</div>
                                            <div className="col-12 col-md-2 mx-5 text-center">
                                                {
                                                    !c.overWritten
                                                        ? <button className="btn btn-secondary px-2"
                                                            onClick={() => {
                                                                const moderators = (finalComponentPayload.moderators ?? []).filter(mod => mod !== c.value)
                                                                setFinalComponentPayload({ ...finalComponentPayload, moderators })

                                                                const updatedModeratorsMergeList = moderatorsMergeList.map(mod => {
                                                                    if (mod.value === c.value) {
                                                                        return {
                                                                            ...mod,
                                                                            overWritten: true
                                                                        }
                                                                    }
                                                                    return mod
                                                                })
                                                                setModeratorsMergeList(updatedModeratorsMergeList)
                                                            }}
                                                        >
                                                            <FaLongArrowAltLeft />
                                                        </button>
                                                        : <button className="btn btn-secondary px-2"
                                                            onClick={() => {
                                                                const moderators = finalComponentPayload.moderators ?? []
                                                                moderators.push(c.value)
                                                                setFinalComponentPayload({ ...finalComponentPayload, moderators })

                                                                const updatedModeratorsMergeList = moderatorsMergeList.map(mod => {
                                                                    if (mod.value === c.value) {
                                                                        return {
                                                                            ...mod,
                                                                            overWritten: false
                                                                        }
                                                                    }
                                                                    return mod
                                                                })
                                                                setModeratorsMergeList(updatedModeratorsMergeList)
                                                            }}
                                                        >
                                                            <FaUndo />
                                                        </button>
                                                }
                                            </div>
                                            <div className="mt-2 col text-start"></div>
                                        </div>
                                    )
                                } else {
                                    return (
                                        <div className="d-flex row mb-1" key={c.value}>
                                            <div className="mt-2 col text-end">{!c.overWritten ? '' : c.value}</div>
                                            <div className="col-12 col-md-2 mx-5 text-center">
                                                {
                                                    !c.overWritten
                                                        ? <button className="btn btn-secondary px-2"
                                                            onClick={() => {
                                                                const moderators = finalComponentPayload.moderators ?? []
                                                                moderators.push(c.value)
                                                                setFinalComponentPayload({ ...finalComponentPayload, moderators })

                                                                const updatedModeratorsMergeList = moderatorsMergeList.map(mod => {
                                                                    if (mod.value === c.value) {
                                                                        return {
                                                                            ...mod,
                                                                            overWritten: true
                                                                        }
                                                                    }
                                                                    return mod
                                                                })
                                                                setModeratorsMergeList(updatedModeratorsMergeList)
                                                            }}
                                                        >
                                                            <FaLongArrowAltLeft />
                                                        </button>
                                                        : <button className="btn btn-secondary px-2"
                                                            onClick={() => {
                                                                const moderators = (finalComponentPayload.moderators ?? []).filter(mod => mod !== c.value)
                                                                setFinalComponentPayload({ ...finalComponentPayload, moderators })

                                                                const updatedModeratorsMergeList = moderatorsMergeList.map(mod => {
                                                                    if (mod.value === c.value) {
                                                                        return {
                                                                            ...mod,
                                                                            overWritten: false
                                                                        }
                                                                    }
                                                                    return mod
                                                                })
                                                                setModeratorsMergeList(updatedModeratorsMergeList)
                                                            }}
                                                        >
                                                            <FaUndo />
                                                        </button>
                                                }
                                            </div>
                                            <div className="mt-2 col text-start">{c.value}</div>
                                        </div>
                                    )
                                }
                            })
                        }
                    </div>
                </div>
            }
        </>
    )
}