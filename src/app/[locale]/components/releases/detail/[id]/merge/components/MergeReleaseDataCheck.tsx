// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Dispatch, ReactNode, SetStateAction, useEffect, useState } from 'react'
import { Attachment, ListFieldProcessComponent, ReleaseDetail } from '@/object-types'
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
    const { status } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [
        status,
    ])

    useEffect(() => {
        setFinalReleasePayload({
            ...targetRelease,
            createdBy: targetRelease?._embedded?.['sw360:createdBy']?.email ?? '',
            attachments: targetRelease?._embedded?.['sw360:attachments'] ?? ([] as Attachment[])
        } as ReleaseDetail)

    }, [
        targetRelease,
        sourceRelease,
    ])

    return (
        <>
            {targetRelease && sourceRelease && finalReleasePayload && (
                <>
                    <GeneralSection
                        targetRelease={targetRelease}
                        sourceRelease={sourceRelease}
                        finalReleasePayload={finalReleasePayload}
                        setFinalReleasePayload={setFinalReleasePayload}
                    />
                </>
            )}
        </>
    )
}
