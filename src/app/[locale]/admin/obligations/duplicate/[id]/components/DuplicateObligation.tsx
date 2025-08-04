// Copyright (C) TOSHIBA CORPORATION, 2025. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2025. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import { HttpStatus, Obligation } from '@/object-types'
import MessageService from '@/services/message.service'
import CommonUtils from '@/utils/common.utils'
import { ApiUtils } from '@/utils/index'
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { PageButtonHeader } from 'next-sw360'
import { notFound, useRouter } from 'next/navigation'
import React, { ReactNode, useEffect, useState } from 'react'
import ObligationForm from '../../../components/AddOrEditObligation'

interface props {
    obligationId: string
}

function DuplicateObligation({ obligationId }: props): ReactNode {
    const t = useTranslations('default')
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [obligation, setObligation] = useState<Obligation>({
        title: '',
        text: '',
        obligationLevel: '',
        obligationType: '',
    } as Obligation)
    const [originalTitle, setOriginalTitle] = useState<string | undefined>('')
    const { status } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [status])

    useEffect(() => {
        void (async () => {
            try {
                setIsLoading(true)
                const session = await getSession()
                if (CommonUtils.isNullOrUndefined(session)) return signOut()

                const response = await ApiUtils.GET(`obligations/${obligationId}`, session.user.access_token)
                if (response.status === HttpStatus.OK) {
                    const data = (await response.json()) as Obligation
                    if (Object.keys(data).length > 0) {
                        setObligation({
                            title: data.title,
                            text: data.text,
                            obligationLevel: data.obligationLevel,
                            obligationType: data.obligationType,
                        })
                        setOriginalTitle(data.title)
                    } else {
                        MessageService.error(t('Failed to load obligation data'))
                    }
                } else {
                    notFound()
                }
            } catch {
                MessageService.error(t('Failed to load obligation data'))
            } finally {
                setIsLoading(false)
            }
        })()
    }, [obligationId, t])

    const isFieldValid = (field: string | null | undefined): boolean =>
        field !== null && field !== undefined && field.trim() !== ''

    const submitObligation = async () => {
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) return signOut()

        if (
            !isFieldValid(obligation.title) ||
            !isFieldValid(obligation.text) ||
            !isFieldValid(obligation.obligationLevel) ||
            !isFieldValid(obligation.obligationType)
        ) {
            MessageService.error(`${t('Please fill in all fields before submitting')}.`)
            return
        }

        if (obligation.title == originalTitle) {
            MessageService.error(`${t('Obligation text has already taken')}.`)
            return
        }

        const response = await ApiUtils.POST('obligations', obligation, session.user.access_token)
        if (response.status == HttpStatus.CREATED) {
            MessageService.success(t('Obligation added successfully'))
            router.push('/admin/obligations')
        } else {
            MessageService.error(t('Create obligation failed'))
        }
    }

    const headerButtons = {
        'Create Obligation': {
            type: 'primary',
            link: `/admin/obligations/duplicate/detail?id=${obligationId}`,
            name: t('Add Obligation'),
            onClick: submitObligation,
        },
        Cancel: {
            type: 'secondary',
            link: '/admin/obligations',
            name: t('Cancel'),
        },
    }

    return (
        <div className='container page-content'>
            <div className='row'>
                <div className='col-12'>
                    <div className='row mb-3'>
                        <PageButtonHeader buttons={headerButtons} />
                    </div>

                    {isLoading ? (
                        <div>Fetching data...</div>
                    ) : (
                        <ObligationForm
                            obligation={obligation}
                            setObligation={setObligation}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}

export default DuplicateObligation
