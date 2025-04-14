// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { Component } from "@/object-types"
import { useTranslations } from "next-intl"
import { ReactNode, SetStateAction, Dispatch, useEffect } from "react"
import styles from '../merge.module.css'
import { FaLongArrowAltLeft } from "react-icons/fa"
import { TiTick } from "react-icons/ti"
import { FaUndo } from "react-icons/fa"
import { BiInfoCircle } from 'react-icons/bi'

export default function MergeComponent(
    {
        targetComponent, sourceComponent, finalComponentPayload, setFinalComponentPayload
    }: {
        targetComponent: Component | null, sourceComponent: Component | null,
        finalComponentPayload: Component | null, setFinalComponentPayload: Dispatch<SetStateAction<null | Component>>
    }): ReactNode {

    const t = useTranslations('default')

    useEffect(() => {
        setFinalComponentPayload(targetComponent)
    }, [])

    return (
        <>
            {
                (targetComponent && sourceComponent && finalComponentPayload) &&
                <div className='mb-3'>
                    <h6 className={`border-bottom fw-bold text-uppercase ${styles['text-blue']} ${styles['border-blue']} mb-2`}>
                        {t('General')}
                    </h6>
                    <div className={`border ${styles['border-blue']} p-2`}>
                        <div className={`fw-bold ${styles['text-blue']}`}>{t('Name')}</div>
                        <div className="d-flex row">
                            <div className="mt-2 col text-end">{finalComponentPayload.name}</div>
                            <div className="col-12 col-md-2 mx-5 text-center">
                                {
                                    (sourceComponent.name === targetComponent.name)
                                        ? <TiTick size={40} className={styles['green']} />
                                        : (finalComponentPayload.name === targetComponent.name)
                                            ? <button className="btn btn-secondary px-2"
                                                onClick={() => setFinalComponentPayload({ ...finalComponentPayload, name: sourceComponent.name })}
                                            >
                                                <FaLongArrowAltLeft />
                                            </button>
                                            : <button className="btn btn-secondary px-2"
                                                onClick={() => setFinalComponentPayload({ ...finalComponentPayload, name: targetComponent.name })}
                                            >
                                                <FaUndo />
                                            </button>

                                }
                            </div>
                            <div className="mt-2 col text-start">{sourceComponent.name}</div>
                        </div>
                    </div>
                    <div className={`border border-top-0 ${styles['border-blue']} p-2`}>
                        <div className={`fw-bold ${styles['text-blue']}`}>{t('Created on')}</div>
                        <div className="d-flex row">
                            <div className="mt-2 col text-end">{finalComponentPayload.createdOn}</div>
                            <div className="col-12 col-md-2 mx-5 text-center">
                                {
                                    (sourceComponent.createdOn === targetComponent.createdOn)
                                        ? <TiTick size={25} className={styles['green']} />
                                        : (finalComponentPayload.createdOn === targetComponent.createdOn)
                                            ? <button className="btn btn-secondary px-2"
                                                onClick={() => setFinalComponentPayload({ ...finalComponentPayload, createdOn: sourceComponent.createdOn })}
                                            >
                                                <FaLongArrowAltLeft />
                                            </button>
                                            : <button className="btn btn-secondary px-2"
                                                onClick={() => setFinalComponentPayload({ ...finalComponentPayload, createdOn: targetComponent.createdOn })}
                                            >
                                                <FaUndo />
                                            </button>

                                }
                            </div>
                            <div className="mt-2 col text-start">{sourceComponent.createdOn}</div>
                        </div>
                    </div>
                    <div className={`border border-top-0 ${styles['border-blue']} p-2`}>
                        <div className={`fw-bold ${styles['text-blue']}`}>{t('Created by')}</div>
                        <div className="d-flex row">
                            <div className="mt-2 col text-end">{finalComponentPayload._embedded?.createdBy?.email}</div>
                            <div className="col-12 col-md-2 mx-5 text-center">
                                {
                                    (sourceComponent._embedded?.createdBy?.email === targetComponent._embedded?.createdBy?.email)
                                        ? <TiTick size={25} className={styles['green']} />
                                        : (finalComponentPayload._embedded?.createdBy?.email === targetComponent._embedded?.createdBy?.email)
                                            ? <button className="btn btn-secondary px-2"
                                                onClick={() => {
                                                    if(sourceComponent._embedded?.createdBy?.email === undefined) {
                                                        return
                                                    }
                                                    const moderators = finalComponentPayload.moderators ?? []
                                                    moderators.push(sourceComponent._embedded.createdBy.email)
                                                    setFinalComponentPayload({ ...finalComponentPayload, moderators })
                                                }}
                                            >
                                                <FaLongArrowAltLeft />
                                            </button>
                                            : <button className="btn btn-secondary px-2"
                                                onClick={() => {
                                                    setFinalComponentPayload({ ...finalComponentPayload, moderators: targetComponent.moderators })
                                                }}
                                            >
                                                <FaUndo />
                                            </button>
                                }
                            </div>
                            <div className="mt-2 col text-start">{sourceComponent._embedded?.createdBy?.email}</div>
                            {
                                (sourceComponent._embedded?.createdBy?.email !== targetComponent._embedded?.createdBy?.email) &&
                                <div className='mt-2 text-center fw-medium text-secondary'><BiInfoCircle/> {t.rich('MADE_MODERATOR', {email: sourceComponent._embedded?.createdBy?.email ?? ''})}.</div>
                            }
                        </div>
                    </div>
                </div>
            }
        </>
    )
}