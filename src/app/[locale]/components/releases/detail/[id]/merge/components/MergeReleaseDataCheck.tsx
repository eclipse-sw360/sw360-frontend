// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { StatusCodes } from 'http-status-codes'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Dispatch, ReactNode, SetStateAction, useEffect, useState } from 'react'
import { Attachment, ErrorDetails, ListFieldProcessComponent, ReleaseDetail } from '@/object-types'
import MessageService from '@/services/message.service'
import CommonUtils from '@/utils/common.utils'
import { ApiUtils } from '@/utils/index'
import GeneralSection from './GeneralSection'

export default function MergeReleaseDataCheck({
    targetRelease,
    sourceRelease,
    finalReleasePayload,
    setFinalReleasePayload,
}: {
    targetRelease: ReleaseDetail | null
    sourceRelease: ReleaseDetail | null
    finalReleasePayload: ReleaseDetail | null
    setFinalReleasePayload: Dispatch<SetStateAction<null | ReleaseDetail>>
}): ReactNode {
    // const t = useTranslations('default')
    const session = useSession()
    const [sourceReleaseDetail, setSourceReleaseDetail] = useState<ReleaseDetail | null>()

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            signOut()
        }
    }, [
        session,
    ])

    useEffect(() => {
        if (session.status === 'loading') return
        const controller = new AbortController()
        const signal = controller.signal

        void (async () => {
            try {
                if (CommonUtils.isNullOrUndefined(session.data)) return signOut()
                const queryUrl = CommonUtils.createUrlWithParams(`releases/${sourceRelease?.id}`, {
                    allDetails: 'true',
                })
                const response = await ApiUtils.GET(queryUrl, session.data.user.access_token, signal)
                if (response.status !== StatusCodes.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new Error(err.message)
                }

                const data = (await response.json()) as ReleaseDetail

                setSourceReleaseDetail(CommonUtils.isNullOrUndefined(data) ? null : data)
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return
                }
                const message = error instanceof Error ? error.message : String(error)
                MessageService.error(message)
            }
        })()

        return () => controller.abort()
    }, [
        session,
        sourceRelease?.id,
    ])

    useEffect(() => {
        setFinalReleasePayload({
            ...targetRelease,
            createdBy: targetRelease?._embedded?.['sw360:createdBy']?.email ?? '',
            attachments: targetRelease?._embedded?.['sw360:attachments'] ?? ([] as Attachment[]),
        } as ReleaseDetail)
    }, [
        targetRelease,
        sourceRelease,
    ])

    return (
        <>
            {targetRelease && sourceReleaseDetail && finalReleasePayload && (
                <>
                    <GeneralSection
                        targetRelease={targetRelease}
                        sourceReleaseDetail={sourceReleaseDetail}
                        finalReleasePayload={finalReleasePayload}
                        setFinalReleasePayload={setFinalReleasePayload}
                    />
                </>
            )}
        </>
    )
}
