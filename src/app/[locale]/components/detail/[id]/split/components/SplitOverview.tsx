// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { StatusCodes } from 'http-status-codes'
import { redirect, useRouter } from 'next/navigation'
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { ReactNode, useEffect, useState } from 'react'
import { Spinner } from 'react-bootstrap'
import { AccessControl } from '@/components/AccessControl/AccessControl'
import { Component, ErrorDetails, MergeOrSplitActionType, UserGroupType } from '@/object-types'
import { ApiError, ApiUtils, CommonUtils } from '@/utils'
import ComponentTable from '../../components/ComponentTable'
import SplitComponentConfirmation from './ConfirmSplit'
import SplitComponent from './SplitData'

function GetNextState(currentState: MergeOrSplitActionType): MergeOrSplitActionType | null {
    if (currentState === MergeOrSplitActionType.CHOOSE_SOURCE) {
        return MergeOrSplitActionType.PROCESS_DATA
    } else if (currentState === MergeOrSplitActionType.PROCESS_DATA) {
        return MergeOrSplitActionType.CONFIRM
    } else {
        return null
    }
}

function GetPrevState(currentState: MergeOrSplitActionType): MergeOrSplitActionType | null {
    if (currentState === MergeOrSplitActionType.CHOOSE_SOURCE) {
        return null
    } else if (currentState === MergeOrSplitActionType.PROCESS_DATA) {
        return MergeOrSplitActionType.CHOOSE_SOURCE
    } else {
        return MergeOrSplitActionType.PROCESS_DATA
    }
}

interface SplitComponentPayload {
    srcComponent: Component
    targetComponent: Component
}

function SplitOverview({
    id,
}: Readonly<{
    id: string
}>): ReactNode {
    const router = useRouter()
    const t = useTranslations('default')
    const [splitState, setSplitState] = useState<MergeOrSplitActionType>(MergeOrSplitActionType.CHOOSE_SOURCE)
    const [targetComponent, setTargetComponent] = useState<null | Component>(null)
    const [sourceComponent, setSourceComponent] = useState<null | Component>(null)
    const [err, setErr] = useState<null | string>(null)
    const [loading, setLoading] = useState(false)
    const { status } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [
        status,
    ])

    const handleSplitComponent = async () => {
        try {
            setLoading(true)
            const session = await getSession()
            if (CommonUtils.isNullOrUndefined(session)) return signOut()

            const srcPayload = {
                ...(sourceComponent ?? {}),
            } as Component
            delete srcPayload['_embedded']
            delete srcPayload['_links']

            const targetPayload = {
                ...(targetComponent ?? {}),
            } as Component
            delete targetPayload['_embedded']
            delete targetPayload['_links']

            const payload: SplitComponentPayload = {
                srcComponent: srcPayload,
                targetComponent: targetPayload,
            }

            const response = await ApiUtils.PATCH('components/splitComponents', payload, session.user.access_token)
            if (response.status !== 200) {
                const err = (await response.json()) as ErrorDetails
                throw new ApiError(err.message, {
                    status: response.status,
                })
            }
        } catch (error) {
            ApiUtils.reportError(error)
        } finally {
            setLoading(false)
            redirect(`/components/detail/${id}`)
        }
    }

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal

        ;(async () => {
            try {
                const session = await getSession()
                if (CommonUtils.isNullOrUndefined(session)) return signOut()
                const response = await ApiUtils.GET(`components/${id}`, session.user.access_token, signal)

                if (response.status === StatusCodes.UNAUTHORIZED) {
                    return signOut()
                } else if (response.status === StatusCodes.OK) {
                    const component = (await response.json()) as Component
                    setSourceComponent(component)
                } else {
                    const err = (await response.json()) as ErrorDetails
                    throw new ApiError(err.message, {
                        status: response.status,
                    })
                }
            } catch (error) {
                ApiUtils.reportError(error)
                if (error instanceof ApiError && !error.isAborted) {
                    router.push(`components/${id}`)
                }
            }
        })()

        return () => controller.abort()
    }, [
        id,
    ])
    return (
        <div className='mx-5 mt-3'>
            {sourceComponent ? (
                <>
                    <div className='col-auto buttonheader-title mb-3'>
                        {t.rich('SPLIT_INTO_COMPONENT', {
                            name: sourceComponent.name,
                        })}
                    </div>
                    <div className='d-flex justify-content-between text-center mb-3'>
                        <div
                            className={`p-2 border rounded-2 col-12 col-md ${splitState === MergeOrSplitActionType.CHOOSE_SOURCE ? 'merge-split-active' : 'merge-split'}`}
                            role='alert'
                        >
                            <h6 className='fw-bold'>1. {t('Choose target')}</h6>
                            <p>{t('Choose a component into which current one should be split')}</p>
                        </div>
                        <div
                            className={`mx-4 p-2 border rounded-2 col-12 col-md ${splitState === MergeOrSplitActionType.PROCESS_DATA ? 'merge-split-active' : 'merge-split'}`}
                            role='alert'
                        >
                            <h6 className='fw-bold'>2. {t('Split data')}</h6>
                            <p>{t('Split data from current component to target component')}</p>
                        </div>
                        <div
                            className={`p-2 border rounded-2 col-12 col-md ${splitState === MergeOrSplitActionType.CONFIRM ? 'merge-split-active' : 'merge-split'}`}
                            role='alert'
                        >
                            <h6 className='fw-bold'>3. {t('Confirm')}</h6>
                            <p>{t('Check the split version and confirm')}</p>
                        </div>
                    </div>
                    {err !== null && (
                        <div
                            className='alert alert-danger my-2'
                            role='alert'
                        >
                            {err}
                        </div>
                    )}
                    {splitState === MergeOrSplitActionType.CHOOSE_SOURCE && (
                        <ComponentTable
                            component={targetComponent}
                            setComponent={setTargetComponent}
                        />
                    )}
                    {splitState === MergeOrSplitActionType.PROCESS_DATA && (
                        <SplitComponent
                            sourceComponent={sourceComponent}
                            targetComponent={targetComponent}
                            setSourceComponent={setSourceComponent}
                            setTargetComponent={setTargetComponent}
                        />
                    )}
                    {splitState === MergeOrSplitActionType.CONFIRM && (
                        <SplitComponentConfirmation
                            sourceComponent={sourceComponent}
                            targetComponent={targetComponent}
                        />
                    )}
                    <div className='d-flex justify-content-end mb-3'>
                        <div
                            className='mt-3 btn-group col-2'
                            role='group'
                        >
                            <button
                                type='button'
                                className='btn btn-secondary'
                                disabled={GetPrevState(splitState) === null}
                                onClick={() => {
                                    if (GetPrevState(splitState) !== null) {
                                        setSplitState(GetPrevState(splitState) as MergeOrSplitActionType)
                                    }
                                }}
                            >
                                {t('Back')}
                            </button>
                            {splitState === MergeOrSplitActionType.CONFIRM ? (
                                <button
                                    type='button'
                                    className='btn btn-primary'
                                    onClick={handleSplitComponent}
                                    disabled={loading}
                                >
                                    {t('Finish')}
                                </button>
                            ) : (
                                <button
                                    type='button'
                                    className='btn btn-primary'
                                    disabled={GetNextState(splitState) === null || targetComponent === null}
                                    onClick={() => {
                                        if (GetNextState(splitState) !== null) {
                                            if (targetComponent !== null && targetComponent.id === id) {
                                                setErr(
                                                    'Please choose exactly one component, which is not the component itself!',
                                                )
                                                setTimeout(() => setErr(null), 5000)
                                            } else {
                                                setSplitState(GetNextState(splitState) as MergeOrSplitActionType)
                                            }
                                        }
                                    }}
                                >
                                    {t('Next')}
                                </button>
                            )}
                        </div>
                    </div>
                </>
            ) : (
                <div className='col-12 text-center'>
                    <Spinner className='spinner' />
                </div>
            )}
        </div>
    )
}

// Pass notAllowedUserGroups to AccessControl to restrict access
export default AccessControl(SplitOverview, [
    UserGroupType.SECURITY_USER,
])
