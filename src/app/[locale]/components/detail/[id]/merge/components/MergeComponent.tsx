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
import styles from '../merge.module.css'
import { FaLongArrowAltLeft } from "react-icons/fa"
import { TiTick } from "react-icons/ti"
import { FaUndo } from "react-icons/fa"
import GeneralSection from "./GeneralSection"
import RolesSection from "./RolesSection"

export default function MergeComponent(
    {
        targetComponent, sourceComponent, finalComponentPayload, setFinalComponentPayload
    }: {
        targetComponent: Component | null, sourceComponent: Component | null,
        finalComponentPayload: Component | null, setFinalComponentPayload: Dispatch<SetStateAction<null | Component>>
    }): ReactNode {

    const t = useTranslations('default')
    const [externalIdsMergeList, setExternalIdsMergeList] = useState<ListFieldMerge[]>([])
    const [additionalDataMergeList, setAdditionalDataMergeList] = useState<ListFieldMerge[]>([])

    useEffect(() => {
        setFinalComponentPayload({ ...targetComponent, createdBy: targetComponent?._embedded?.createdBy?.email ?? '' } as Component)

        setExternalIdsMergeList([
            ...Object.keys(targetComponent?.externalIds ?? {})
                .filter(targetElem => Object.keys(sourceComponent?.externalIds ?? {}).filter(sourceElem => sourceElem === targetElem).length !== 0)
                .map(c => ({ value: c, presentInSource: true, presentInTarget: true, overWritten: false })),

            ...Object.keys(targetComponent?.externalIds ?? {})
                .filter(targetElem => Object.keys(sourceComponent?.externalIds ?? {}).filter(sourceElem => sourceElem === targetElem).length === 0)
                .map(c => ({ value: c, presentInSource: false, presentInTarget: true, overWritten: false })),

                ...Object.keys(sourceComponent?.externalIds ?? {})
                .filter(sourceElem => Object.keys(targetComponent?.externalIds ?? {}).filter(targetElem => sourceElem === targetElem).length === 0)
                .map(c => ({ value: c, presentInSource: true, presentInTarget: false, overWritten: false })),
        ])

        setAdditionalDataMergeList([
            ...Object.keys(targetComponent?.additionalData ?? {})
                .filter(targetElem => Object.keys(sourceComponent?.additionalData ?? {}).filter(sourceElem => sourceElem === targetElem).length !== 0)
                .map(c => ({ value: c, presentInSource: true, presentInTarget: true, overWritten: false })),

            ...Object.keys(targetComponent?.additionalData ?? {})
                .filter(targetElem => Object.keys(sourceComponent?.additionalData ?? {}).filter(sourceElem => sourceElem === targetElem).length === 0)
                .map(c => ({ value: c, presentInSource: false, presentInTarget: true, overWritten: false })),

                ...Object.keys(sourceComponent?.additionalData ?? {})
                .filter(sourceElem => Object.keys(targetComponent?.additionalData ?? {}).filter(targetElem => sourceElem === targetElem).length === 0)
                .map(c => ({ value: c, presentInSource: true, presentInTarget: false, overWritten: false })),
        ])
    }, [targetComponent, sourceComponent])

    return (
        <>
            {
                (targetComponent && sourceComponent && finalComponentPayload) &&
                <>
                    <GeneralSection 
                        targetComponent={targetComponent} sourceComponent={sourceComponent} 
                        finalComponentPayload={finalComponentPayload} setFinalComponentPayload={setFinalComponentPayload}
                    />
                    <div className='mb-3'>
                        <h6 className={`border-bottom fw-bold text-uppercase ${styles['text-blue']} ${styles['border-blue']} mb-2`}>
                            {t('External Ids')}
                        </h6>
                        {
                            externalIdsMergeList.map((id, i) =>
                                <div className={`border ${styles['border-blue']} p-2 ${i !== 0 ? 'border-top-0': ''}`} key={id.value}>
                                    <div className={`fw-bold ${styles['text-blue']}`}>{id.value}</div>
                                        {
                                            (id.presentInSource && id.presentInTarget) &&
                                            <div className="d-flex row">
                                                <div className="mt-2 col text-end">{targetComponent.externalIds?.[id.value]}</div>
                                                <div className="col-12 col-md-2 mx-5 text-center">
                                                    <TiTick size={40} className={styles['green']} />
                                                </div>
                                                <div className="mt-2 col text-start">{sourceComponent.externalIds?.[id.value]}</div>
                                            </div>
                                        }
                                        {
                                            (!id.presentInSource && id.presentInTarget) &&
                                            <div className="d-flex row">
                                                <div className="mt-2 col text-end">{finalComponentPayload.externalIds?.[id.value]}</div>
                                                <div className="col-12 col-md-2 mx-5 text-center">
                                                    {
                                                        finalComponentPayload.externalIds?.[id.value] === targetComponent.externalIds?.[id.value]
                                                        ? <button className="btn btn-secondary px-2"
                                                            onClick={() => {
                                                                const externalIds = { ...(finalComponentPayload.externalIds ?? {}) }
                                                                delete externalIds[id.value]
                                                                setFinalComponentPayload({ ...finalComponentPayload, externalIds })
                                                            }}
                                                        >
                                                            <FaLongArrowAltLeft />
                                                        </button> 
                                                        : <button className="btn btn-secondary px-2"
                                                            onClick={() => {
                                                                const externalIds = { 
                                                                    ...(finalComponentPayload.externalIds ?? {}), 
                                                                    [id.value]: targetComponent.externalIds?.[id.value] ?? ''
                                                                }
                                                                setFinalComponentPayload({ ...finalComponentPayload, externalIds })
                                                            }}
                                                        >
                                                            <FaUndo />
                                                        </button> 
                                                    }
                                                </div>
                                                <div className="mt-2 col text-start"></div>
                                            </div>
                                        }
                                        {
                                            (id.presentInSource && !id.presentInTarget) &&
                                            <div className="d-flex row">
                                                <div className="mt-2 col text-end">{finalComponentPayload.externalIds?.[id.value]}</div>
                                                <div className="col-12 col-md-2 mx-5 text-center">
                                                    {
                                                        finalComponentPayload.externalIds?.[id.value] !== sourceComponent.externalIds?.[id.value]
                                                        ? <button className="btn btn-secondary px-2"
                                                            onClick={() => {
                                                                const externalIds = { 
                                                                    ...(finalComponentPayload.externalIds ?? {}), 
                                                                    [id.value]: sourceComponent.externalIds?.[id.value] ?? ''
                                                                }
                                                                setFinalComponentPayload({ ...finalComponentPayload, externalIds })
                                                            }}
                                                        >
                                                            <FaLongArrowAltLeft />
                                                        </button> 
                                                        : <button className="btn btn-secondary px-2"
                                                            onClick={() => {
                                                                const externalIds = { ...(finalComponentPayload.externalIds ?? {}) }
                                                                delete externalIds[id.value]
                                                                setFinalComponentPayload({ ...finalComponentPayload, externalIds })
                                                            }}
                                                        >
                                                            <FaUndo />
                                                        </button> 
                                                    }
                                                </div>
                                                <div className="mt-2 col text-start">{sourceComponent.externalIds?.[id.value]}</div>
                                            </div>
                                        }
                                </div>
                            )
                        }
                    </div>
                    <div className='mb-3'>
                        <h6 className={`border-bottom fw-bold text-uppercase ${styles['text-blue']} ${styles['border-blue']} mb-2`}>
                            {t('Additional Data')}
                        </h6>
                        {
                            additionalDataMergeList.map((id, i) =>
                                <div className={`border ${styles['border-blue']} p-2 ${i !== 0 ? 'border-top-0': ''}`} key={id.value}>
                                    <div className={`fw-bold ${styles['text-blue']}`}>{id.value}</div>
                                        {
                                            (id.presentInSource && id.presentInTarget) &&
                                            <div className="d-flex row">
                                                <div className="mt-2 col text-end">{targetComponent.additionalData?.[id.value]}</div>
                                                <div className="col-12 col-md-2 mx-5 text-center">
                                                    <TiTick size={40} className={styles['green']} />
                                                </div>
                                                <div className="mt-2 col text-start">{sourceComponent.additionalData?.[id.value]}</div>
                                            </div>
                                        }
                                        {
                                            (!id.presentInSource && id.presentInTarget) &&
                                            <div className="d-flex row">
                                                <div className="mt-2 col text-end">{finalComponentPayload.additionalData?.[id.value]}</div>
                                                <div className="col-12 col-md-2 mx-5 text-center">
                                                    {
                                                        finalComponentPayload.additionalData?.[id.value] === targetComponent.additionalData?.[id.value]
                                                        ? <button className="btn btn-secondary px-2"
                                                            onClick={() => {
                                                                const additionalData = { ...(finalComponentPayload.additionalData ?? {}) }
                                                                delete additionalData[id.value]
                                                                setFinalComponentPayload({ ...finalComponentPayload, additionalData })
                                                            }}
                                                        >
                                                            <FaLongArrowAltLeft />
                                                        </button> 
                                                        : <button className="btn btn-secondary px-2"
                                                            onClick={() => {
                                                                const additionalData = { 
                                                                    ...(finalComponentPayload.additionalData ?? {}), 
                                                                    [id.value]: targetComponent.additionalData?.[id.value] ?? ''
                                                                }
                                                                setFinalComponentPayload({ ...finalComponentPayload, additionalData })
                                                            }}
                                                        >
                                                            <FaUndo />
                                                        </button> 
                                                    }
                                                </div>
                                                <div className="mt-2 col text-start"></div>
                                            </div>
                                        }
                                        {
                                            (id.presentInSource && !id.presentInTarget) &&
                                            <div className="d-flex row">
                                                <div className="mt-2 col text-end">{finalComponentPayload.additionalData?.[id.value]}</div>
                                                <div className="col-12 col-md-2 mx-5 text-center">
                                                    {
                                                        finalComponentPayload.additionalData?.[id.value] !== sourceComponent.additionalData?.[id.value]
                                                        ? <button className="btn btn-secondary px-2"
                                                            onClick={() => {
                                                                const additionalData = { 
                                                                    ...(finalComponentPayload.additionalData ?? {}), 
                                                                    [id.value]: sourceComponent.additionalData?.[id.value] ?? ''
                                                                }
                                                                setFinalComponentPayload({ ...finalComponentPayload, additionalData })
                                                            }}
                                                        >
                                                            <FaLongArrowAltLeft />
                                                        </button> 
                                                        : <button className="btn btn-secondary px-2"
                                                            onClick={() => {
                                                                const additionalData = { ...(finalComponentPayload.additionalData ?? {}) }
                                                                delete additionalData[id.value]
                                                                setFinalComponentPayload({ ...finalComponentPayload, additionalData })
                                                            }}
                                                        >
                                                            <FaUndo />
                                                        </button> 
                                                    }
                                                </div>
                                                <div className="mt-2 col text-start">{sourceComponent.additionalData?.[id.value]}</div>
                                            </div>
                                        }
                                </div>
                            )
                        }
                    </div>
                    <RolesSection 
                        targetComponent={targetComponent} sourceComponent={sourceComponent} 
                        finalComponentPayload={finalComponentPayload} setFinalComponentPayload={setFinalComponentPayload}
                    />
                </>
            }
        </>
    )
}