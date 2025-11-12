// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { StatusCodes } from 'http-status-codes'
import { useRouter } from 'next/navigation'
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { ReactNode, useEffect, useState } from 'react'
import { Spinner } from 'react-bootstrap'
import { AccessControl } from '@/components/AccessControl/AccessControl'
import { ErrorDetails, MergeOrSplitActionType, ReleaseDetail, UserGroupType } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'


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

function MergeReleaseOverview({
    releaseId,
}: Readonly<{
    releaseId: string
}>): ReactNode {
    const router = useRouter()
    const t = useTranslations('default')
    const [mergeState, setMergeState] = useState<MergeOrSplitActionType>(MergeOrSplitActionType.CHOOSE_SOURCE)
    const [targetRelease, setTargetRelease] = useState<null | ReleaseDetail>(null)
    const [sourceRelease, setSourceRelease] = useState<null | ReleaseDetail>(null)
    const [componentId, setComponentId] = useState<null | string>(null)
    // const [finalReleasePayload, setFinalReleasePayload] = useState<null | ReleaseDetail>(null)
    const [error, setError] = useState<null | string>(null)
    const [loading,] = useState(false)
    const { status } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [
        status,
    ])

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal
            ; (async () => {
                try {
                    const session = await getSession()
                    if (CommonUtils.isNullOrUndefined(session)) return signOut()
                    const response = await ApiUtils.GET(`releases/${releaseId}`, session.user.access_token, signal)

                    if (response.status === StatusCodes.UNAUTHORIZED) {
                        return signOut()
                    } else if (response.status === StatusCodes.OK) {
                        const singleRelease = (await response.json()) as ReleaseDetail
                        const compId = singleRelease?._links['sw360:component']?.href.split('/').pop() ?? ''
                        if (CommonUtils.isNullOrUndefined(compId) || compId === '') {
                            MessageService.error(t('Component ID is missing for the target release'))
                            router.push(`releases/${releaseId}`)
                        }
                        setComponentId(compId)
                        setTargetRelease(singleRelease)
                    } else {
                        const err = (await response.json()) as ErrorDetails
                        throw new Error(err.message)
                    }
                } catch (error) {
                    if (error instanceof DOMException && error.name === 'AbortError') {
                        return
                    }
                    const message = error instanceof Error ? error.message : String(error)
                    MessageService.error(message)
                    router.push(`releases/${releaseId}`)
                }
            })()

        return () => controller.abort()
    }, [
        releaseId,
    ])

    return (
        <div className='mx-5 mt-3'>
            {targetRelease ? (
                <>
                    <div className='col-auto buttonheader-title mb-3'>
                        {t.rich('MERGE_INTO_TARGET', {
                            name: targetRelease.name,
                        })}
                    </div>
                    <div className='d-flex justify-content-between text-center mb-3'>
                        <div
                            className={`p-2 border rounded-2 col-12 col-md ${mergeState === MergeOrSplitActionType.CHOOSE_SOURCE ? 'merge-split-active' : 'merge-split'}`}
                            role='alert'
                        >
                            <h6 className='fw-bold'>1. {t('Choose source')}</h6>
                            <p>{t('Choose a release that should be merged into the current one')}</p>
                        </div>
                        <div
                            className={`mx-4 p-2 border rounded-2 col-12 col-md ${mergeState === MergeOrSplitActionType.PROCESS_DATA ? 'merge-split-active' : 'merge-split'}`}
                            role='alert'
                        >
                            <h6 className='fw-bold'>2. {t('Merge data')}</h6>
                            <p>{t('Merge data from source into target release')}</p>
                        </div>
                        <div
                            className={`p-2 border rounded-2 col-12 col-md ${mergeState === MergeOrSplitActionType.CONFIRM ? 'merge-split-active' : 'merge-split'}`}
                            role='alert'
                        >
                            <h6 className='fw-bold'>3. {t('Confirm')}</h6>
                            <p>{t('Check the merged version and confirm')}</p>
                        </div>
                    </div>
                    {error !== null && (
                        <div
                            className='alert alert-danger my-2'
                            role='alert'
                        >
                            {error}
                        </div>
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
                                    // onClick={handleMergeRelease}
                                    disabled={loading}
                                >
                                    {t('Finish')}
                                </button>
                            ) : (
                                <button
                                    type='button'
                                    className='btn btn-primary'
                                    disabled={GetNextState(mergeState) === null || sourceRelease === null}
                                    onClick={() => {
                                        if (GetNextState(mergeState) !== null) {
                                            if (sourceRelease !== null && sourceRelease.id === releaseId) {
                                                setError(
                                                    'Please choose exactly one release, which is not the release itself!',
                                                )
                                                setTimeout(() => setError(null), 5000)
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
export default AccessControl(MergeReleaseOverview, [
    UserGroupType.SECURITY_USER,
])
