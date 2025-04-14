// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useTranslations } from 'next-intl'
import { ReactNode, useState, useEffect } from 'react'
import { Component, ErrorDetails, HttpStatus, MergeActionType } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'
import { getSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Spinner } from 'react-bootstrap'
import styles from '../merge.module.css'
import ComponentTable from './ComponentTable'
import MergeComponent from './MergeComponent'

function GetNextState(currentState: MergeActionType): MergeActionType | null {
    if (currentState === MergeActionType.CHOOSE_SOURCE) {
        return MergeActionType.MERGE_DATA
    } else if (currentState === MergeActionType.MERGE_DATA) {
        return MergeActionType.CONFIRM
    } else {
        return null
    }
}

function GetPrevState(currentState: MergeActionType): MergeActionType | null {
    if (currentState === MergeActionType.CHOOSE_SOURCE) {
        return null
    } else if (currentState === MergeActionType.MERGE_DATA) {
        return MergeActionType.CHOOSE_SOURCE
    } else {
        return MergeActionType.MERGE_DATA
    }
}

export default function MergeOverview({ id }: Readonly<{ id: string }>): ReactNode {
    const router = useRouter()
    const t = useTranslations('default')
    const [mergeState, setMergeState] = useState<MergeActionType>(MergeActionType.CHOOSE_SOURCE)
    const [targetComponent, setTargetComponent] = useState<null | Component>(null)
    const [sourceComponent, setSourceComponent] = useState<null | Component>(null)
    const [finalComponentPayload, setFinalComponentPayload] = useState<null | Component>(null)
    const [err, setErr] = useState<null | string>(null)
    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal

            ; (async () => {
                try {
                    const session = await getSession()
                    if (CommonUtils.isNullOrUndefined(session))
                        return signOut()
                    const response = await ApiUtils.GET(`components/${id}`, session.user.access_token, signal)

                    if (response.status === HttpStatus.UNAUTHORIZED) {
                        return signOut()
                    } else if (response.status === HttpStatus.OK) {
                        const component = await response.json() as Component
                        setTargetComponent(component)
                    } else {
                        const err = await response.json() as ErrorDetails
                        throw new Error(err.message)
                    }
                } catch (error) {
                    if (error instanceof DOMException && error.name === "AbortError") {
                        return
                    }
                    const message = error instanceof Error ? error.message : String(error)
                    MessageService.error(message)
                    router.push(`components/${id}`)
                }
            })()

        return () => controller.abort()
    }, [id])
    return (
        <div className='mx-5 mt-3'>
            {
                targetComponent
                    ? <>
                        <div className='col-auto buttonheader-title mb-3'>
                            {
                                t.rich('MERGE_INTO_COMPONENT', {
                                    name: targetComponent.name,
                                })
                            }
                        </div>
                        <div className='d-flex justify-content-between text-center mb-3'>
                            <div className={`p-2 border rounded-2 col-12 col-md ${mergeState === MergeActionType.CHOOSE_SOURCE ? styles['merge-active'] : styles['merge']}`} role="alert">
                                <h6 className="fw-bold">1. {t('Choose source')}</h6>
                                <p>{t('Choose a component that should be merged into the current one')}</p>
                            </div>
                            <div className={`mx-4 p-2 border rounded-2 col-12 col-md ${mergeState === MergeActionType.MERGE_DATA ? styles['merge-active'] : styles['merge']}`} role="alert">
                                <h6 className="fw-bold">2. {t('Merge data')}</h6>
                                <p>{t('Merge data from source into target component')}</p>
                            </div>
                            <div className={`p-2 border rounded-2 col-12 col-md ${mergeState === MergeActionType.CONFIRM ? styles['merge-active'] : styles['merge']}`} role="alert">
                                <h6 className="fw-bold">3. {t('Confirm')}</h6>
                                <p>{t('Choose a component that should be merged into the current one')}</p>
                            </div>
                        </div>
                        {
                            err !== null &&
                            <div className="alert alert-danger my-2" role="alert">
                                {err}
                            </div>
                        }
                        {
                            mergeState === MergeActionType.CHOOSE_SOURCE && <ComponentTable component={sourceComponent} setComponent={setSourceComponent} />
                        }
                        {
                            mergeState === MergeActionType.MERGE_DATA && 
                            <MergeComponent 
                                targetComponent={targetComponent} 
                                sourceComponent={sourceComponent} 
                                finalComponentPayload={finalComponentPayload}
                                setFinalComponentPayload={setFinalComponentPayload} 
                            />
                        }
                        {
                            mergeState === MergeActionType.CONFIRM && <></>
                        }
                        <div className='d-flex justify-content-end mb-3'>
                            <div className="mt-3 btn-group col-2" role="group">
                                <button type="button" className="btn btn-secondary" disabled={GetPrevState(mergeState) === null} onClick={() => {
                                    if (GetPrevState(mergeState) !== null) {
                                        setMergeState(GetPrevState(mergeState) as MergeActionType)
                                    }
                                }}>{t('Back')}</button>
                                <button type="button" className="btn btn-primary" disabled={GetNextState(mergeState) === null || sourceComponent === null} onClick={() => {
                                    if (GetNextState(mergeState) !== null) {
                                        if(sourceComponent !== null && sourceComponent.id === id) {
                                            setErr('Please choose exactly one component, which is not the component itself!')
                                            setTimeout(() => setErr(null), 5000)
                                        } else {
                                            setMergeState(GetNextState(mergeState) as MergeActionType)
                                        }
                                    }
                                }}>{t('Next')}</button>
                            </div>
                        </div>
                    </>
                    : <div className='col-12 text-center'>
                        <Spinner className='spinner' />
                    </div>
            }
        </div>
    )
}