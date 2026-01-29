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
import MergeComponent from './MergeComponent'
import MergeComponentConfirmation from './MergeConfirmation'

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

function MergeOverview({
    id,
}: Readonly<{
    id: string
}>): ReactNode {
    const router = useRouter()
    const t = useTranslations('default')
    const [mergeState, setMergeState] = useState<MergeOrSplitActionType>(MergeOrSplitActionType.CHOOSE_SOURCE)
    const [targetComponent, setTargetComponent] = useState<null | Component>(null)
    const [sourceComponent, setSourceComponent] = useState<null | Component>(null)
    const [finalComponentPayload, setFinalComponentPayload] = useState<null | Component>(null)
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

    const handleMergeComponent = async () => {
        try {
            setLoading(true)
            const session = await getSession()
            if (CommonUtils.isNullOrUndefined(session)) return signOut()
            const payload = {
                ...(finalComponentPayload ?? {}),
            }
            delete payload['_embedded']
            delete payload['_links']
            const response = await ApiUtils.PATCH(
                `components/mergecomponents?mergeTargetId=${targetComponent?.id}&mergeSourceId=${sourceComponent?.id}`,
                payload,
                session.user.access_token,
            )
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
                    setTargetComponent(component)
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
            {targetComponent ? (
                <>
                    <div className='col-auto buttonheader-title mb-3'>
                        {t.rich('MERGE_INTO', {
                            name: targetComponent.name,
                        })}
                    </div>
                    <div className='d-flex justify-content-between text-center mb-3'>
                        <div
                            className={`p-2 border rounded-2 col-12 col-md ${mergeState === MergeOrSplitActionType.CHOOSE_SOURCE ? 'merge-split-active' : 'merge-split'}`}
                            role='alert'
                        >
                            <h6 className='fw-bold'>1. {t('Choose source')}</h6>
                            <p>{t('Choose a component that should be merged into the current one')}</p>
                        </div>
                        <div
                            className={`mx-4 p-2 border rounded-2 col-12 col-md ${mergeState === MergeOrSplitActionType.PROCESS_DATA ? 'merge-split-active' : 'merge-split'}`}
                            role='alert'
                        >
                            <h6 className='fw-bold'>2. {t('Merge data')}</h6>
                            <p>{t('Merge data from source into target component')}</p>
                        </div>
                        <div
                            className={`p-2 border rounded-2 col-12 col-md ${mergeState === MergeOrSplitActionType.CONFIRM ? 'merge-split-active' : 'merge-split'}`}
                            role='alert'
                        >
                            <h6 className='fw-bold'>3. {t('Confirm')}</h6>
                            <p>{t('Check the merged version and confirm')}</p>
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
                    {mergeState === MergeOrSplitActionType.CHOOSE_SOURCE && (
                        <ComponentTable
                            component={sourceComponent}
                            setComponent={setSourceComponent}
                        />
                    )}
                    {mergeState === MergeOrSplitActionType.PROCESS_DATA && (
                        <MergeComponent
                            targetComponent={targetComponent}
                            sourceComponent={sourceComponent}
                            finalComponentPayload={finalComponentPayload}
                            setFinalComponentPayload={setFinalComponentPayload}
                        />
                    )}
                    {mergeState === MergeOrSplitActionType.CONFIRM && (
                        <MergeComponentConfirmation
                            targetComponent={targetComponent}
                            sourceComponent={sourceComponent}
                            finalComponentPayload={finalComponentPayload}
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
                                disabled={GetPrevState(mergeState) === null}
                                onClick={() => {
                                    if (GetPrevState(mergeState) !== null) {
                                        setMergeState(GetPrevState(mergeState) as MergeOrSplitActionType)
                                    }
                                }}
                            >
                                {t('Back')}
                            </button>
                            {mergeState === MergeOrSplitActionType.CONFIRM ? (
                                <button
                                    type='button'
                                    className='btn btn-primary'
                                    onClick={handleMergeComponent}
                                    disabled={loading}
                                >
                                    {t('Finish')}
                                </button>
                            ) : (
                                <button
                                    type='button'
                                    className='btn btn-primary'
                                    disabled={GetNextState(mergeState) === null || sourceComponent === null}
                                    onClick={() => {
                                        if (GetNextState(mergeState) !== null) {
                                            if (sourceComponent !== null && sourceComponent.id === id) {
                                                setErr(
                                                    'Please choose exactly one component, which is not the component itself!',
                                                )
                                                setTimeout(() => setErr(null), 5000)
                                            } else {
                                                setMergeState(GetNextState(mergeState) as MergeOrSplitActionType)
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
export default AccessControl(MergeOverview, [
    UserGroupType.SECURITY_USER,
])
