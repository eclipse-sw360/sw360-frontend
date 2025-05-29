// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useTranslations } from 'next-intl'
import { ReactNode, useState, useEffect } from 'react'
import { ErrorDetails, HttpStatus, MergeOrSplitActionType, Vendor } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'
import { getSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Spinner } from 'react-bootstrap'
import VendorTable from './VendorsTable'
import MergeVendor from './MergeData'

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

export default function MergeOverview({ id }: Readonly<{ id: string }>): ReactNode {
    const router = useRouter()
    const t = useTranslations('default')
    const [mergeState, setMergeState] = useState<MergeOrSplitActionType>(MergeOrSplitActionType.CHOOSE_SOURCE)
    const [targetVendor, setTargetVendor] = useState<null | Vendor>(null)
    const [sourceVendor, setSourceVendor] = useState<null | Vendor>(null)
    const [finalVendorPayload, setFinalVendorPayload] = useState<null | Vendor>(null)
    const [err, setErr] = useState<null | string>(null)
    const [loading, setLoading] = useState(false)

    const handleMergeVendor = async () => {
        try {
            setLoading(true)
            const session = await getSession()
            if (CommonUtils.isNullOrUndefined(session))
                return signOut()
            const response = await ApiUtils.PATCH(
                `vendors/mergeVendors?mergeTargetId=${targetVendor?._links?.self.href.split('/').at(-1)
                    }&mergeSourceId=${sourceVendor?._links?.self.href.split('/').at(-1)}`,
                finalVendorPayload ?? {},
                session.user.access_token
            )
            if(response.status === HttpStatus.OK) {
                setLoading(false)
                router.push(`/admin/vendors`)
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
        }
    }

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal

            ; (async () => {
                try {
                    const session = await getSession()
                    if (CommonUtils.isNullOrUndefined(session))
                        return signOut()
                    const response = await ApiUtils.GET(`vendors/${id}`, session.user.access_token, signal)

                    if (response.status === HttpStatus.UNAUTHORIZED) {
                        return signOut()
                    } else if (response.status === HttpStatus.OK) {
                        const vendor = await response.json() as Vendor
                        setTargetVendor(vendor)
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
                    router.push(`/admin/vendors`)
                }
            })()

        return () => controller.abort()
    }, [id])
    return (
        <div className='mx-5 mt-3'>
            {
                targetVendor
                    ? <>
                        <div className='col-auto buttonheader-title mb-3'>
                            {
                                t.rich('MERGE_INTO_TARGET', {
                                    name: targetVendor.fullName ?? '',
                                })
                            }
                        </div>
                        <div className='d-flex justify-content-between text-center mb-3'>
                            <div className={`p-2 border rounded-2 col-12 col-md ${mergeState === MergeOrSplitActionType.CHOOSE_SOURCE ? 'merge-split-active' : 'merge-split'}`} role="alert">
                                <h6 className="fw-bold">1. {t('Choose source')}</h6>
                                <p>{t('Choose a vendor that should be merged into the current one')}</p>
                            </div>
                            <div className={`mx-4 p-2 border rounded-2 col-12 col-md ${mergeState === MergeOrSplitActionType.PROCESS_DATA ? 'merge-split-active' : 'merge-split'}`} role="alert">
                                <h6 className="fw-bold">2. {t('Merge data')}</h6>
                                <p>{t('Merge data from source into target vendor')}</p>
                            </div>
                            <div className={`p-2 border rounded-2 col-12 col-md ${mergeState === MergeOrSplitActionType.CONFIRM ? 'merge-split-active' : 'merge-split'}`} role="alert">
                                <h6 className="fw-bold">3. {t('Confirm')}</h6>
                                <p>{t('Check the merged version and confirm')}</p>
                            </div>
                        </div>
                        {
                            err !== null &&
                            <div className="alert alert-danger my-2" role="alert">
                                {err}
                            </div>
                        }
                        {
                            mergeState === MergeOrSplitActionType.CHOOSE_SOURCE && <VendorTable vendor={sourceVendor} setVendor={setSourceVendor} />
                        }
                        {
                            mergeState === MergeOrSplitActionType.PROCESS_DATA &&
                            <MergeVendor
                                targetVendor={targetVendor}
                                sourceVendor={sourceVendor}
                                finalVendorPayload={finalVendorPayload}
                                setFinalVendorPayload={setFinalVendorPayload}
                            />
                        }
                        {
                            mergeState === MergeOrSplitActionType.CONFIRM && <>
                                {
                                    finalVendorPayload &&
                                    <>
                                        <h6 className="border-bottom fw-bold text-uppercase text-blue border-blue mb-2">
                                            {t('Vendor')}
                                        </h6>
                                        <div className="border border-blue p-2">
                                            <div className="fw-bold text-blue">{t('Full Name')}</div>
                                            <div className="mt-2">{finalVendorPayload.fullName}</div>
                                        </div>
                                        <div className="border border-top-0 border-blue p-2">
                                            <div className="fw-bold text-blue">{t('Short Name')}</div>
                                            <div className="mt-2">{finalVendorPayload.shortName}</div>
                                        </div>
                                        <div className="border border-top-0 border-blue p-2">
                                            <div className="fw-bold text-blue">{t('URL')}</div>
                                            <div className="mt-2">{finalVendorPayload.url}</div>
                                        </div>
                                    </>
                                }
                            </>
                        }
                        <div className='d-flex justify-content-end mb-3'>
                            <div className="mt-3 btn-group col-2" role="group">
                                <button type="button" className="btn btn-secondary" disabled={GetPrevState(mergeState) === null} onClick={() => {
                                    if (GetPrevState(mergeState) !== null) {
                                        setMergeState(GetPrevState(mergeState) as MergeOrSplitActionType)
                                    }
                                }}>{t('Back')}</button>
                                {
                                    mergeState === MergeOrSplitActionType.CONFIRM
                                        ? <button type="button" className="btn btn-primary" disabled={loading} onClick={handleMergeVendor}>{t('Finish')}</button>
                                        : <button type="button" className="btn btn-primary" disabled={GetNextState(mergeState) === null || sourceVendor === null} onClick={() => {
                                            if (GetNextState(mergeState) !== null) {
                                                if (sourceVendor !== null && sourceVendor._links?.self.href.split('/').at(-1) === id) {
                                                    setErr('Please choose exactly one vendor, which is not the vendor itself!')
                                                    setTimeout(() => setErr(null), 5000)
                                                } else {
                                                    setMergeState(GetNextState(mergeState) as MergeOrSplitActionType)
                                                }
                                            }
                                        }}>{t('Next')}</button>
                                }
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