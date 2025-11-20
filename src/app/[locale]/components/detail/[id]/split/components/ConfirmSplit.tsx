// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { ReactNode, useEffect } from 'react'
import { Component } from '@/object-types'

export default function SplitComponentConfirmation({
    targetComponent,
    sourceComponent,
}: {
    targetComponent: Component | null
    sourceComponent: Component | null
}): ReactNode {
    const t = useTranslations('default')
    const { status } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [
        status,
    ])

    return (
        <>
            {targetComponent && sourceComponent && (
                <>
                    <div className='mb-3'>
                        <h6 className='border-bottom fw-bold text-uppercase text-blue border-blue mb-2'>
                            {t('General')}
                        </h6>
                        <div className='border border-blue p-2'>
                            <div className='fw-bold text-blue'>{t('Name')}</div>
                            <div className='d-flex row'>
                                <div className='mt-2 col text-end me-5'>{sourceComponent.name}</div>
                                <div className='mt-2 col text-start ms-5'>{targetComponent.name}</div>
                            </div>
                        </div>
                        <div className='border border-top-0 border-blue p-2'>
                            <div className='fw-bold text-blue'>{t('Created on')}</div>
                            <div className='d-flex row'>
                                <div className='mt-2 col text-end me-5'>{sourceComponent.createdOn}</div>
                                <div className='mt-2 col text-start ms-5'>{targetComponent.createdOn}</div>
                            </div>
                        </div>
                        <div className='border border-top-0 border-blue p-2'>
                            <div className='fw-bold text-blue'>{t('Created by')}</div>
                            <div className='d-flex row'>
                                <div className='mt-2 col text-end me-5'>
                                    {sourceComponent._embedded?.createdBy?.email}
                                </div>
                                <div className='mt-2 col text-start ms-5'>
                                    {targetComponent._embedded?.createdBy?.email}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='mb-3'>
                        <div className='border-bottom fw-bold text-uppercase text-blue border-blue mb-2'>
                            {t('Releases')}
                        </div>
                        {(sourceComponent.releaseIds ?? []).map((rel) => {
                            const release = sourceComponent._embedded?.['sw360:releases']?.filter(
                                (r) => r.id === rel,
                            )[0]
                            return (
                                <div
                                    className='d-flex row mb-1'
                                    key={rel}
                                >
                                    <div className='mt-2 col text-end me-5'>{`${release?.name} ${release?.version}`}</div>
                                    <div className='mt-2 col text-start ms-5'></div>
                                </div>
                            )
                        })}
                        {(targetComponent.releaseIds ?? []).map((rel) => {
                            let release = sourceComponent._embedded?.['sw360:releases']?.filter((r) => r.id === rel)[0]
                            if (release === undefined) {
                                release = targetComponent._embedded?.['sw360:releases']?.filter((r) => r.id === rel)[0]
                            }
                            return (
                                <div
                                    className='d-flex row mb-1'
                                    key={rel}
                                >
                                    <div className='mt-2 col text-end me-5'></div>
                                    <div className='mt-2 col text-start ms-5'>{`${release?.name} ${release?.version}`}</div>
                                </div>
                            )
                        })}
                    </div>
                    <div className='mb-3'>
                        <div className='border-bottom fw-bold text-uppercase text-blue border-blue mb-2'>
                            {t('Attachments')}
                        </div>
                        {(sourceComponent.attachments ?? []).map((att) => {
                            return (
                                <div
                                    className='d-flex row mb-1'
                                    key={att.attachmentContentId}
                                >
                                    <div className='mt-2 col text-end me-5'>{att.filename}</div>
                                    <div className='mt-2 col text-start ms-5'></div>
                                </div>
                            )
                        })}
                        {(targetComponent.attachments ?? []).map((att) => {
                            return (
                                <div
                                    className='d-flex row mb-1'
                                    key={att.attachmentContentId}
                                >
                                    <div className='mt-2 col text-end me-5'></div>
                                    <div className='mt-2 col text-start ms-5'>{att.filename}</div>
                                </div>
                            )
                        })}
                    </div>
                </>
            )}
        </>
    )
}
