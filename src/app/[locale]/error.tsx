// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import sw360logo from '@/assets/images/sw360-logo.svg'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { JSX } from 'react'

export default function Error({ error, reset }: { error: Error; reset: () => void }): JSX.Element {
    const t = useTranslations('default')
    const router = useRouter()

    return (
        <div className='d-flex align-items-center justify-content-center w-100'>
            <div className='text-center p-4 col col-md-6'>
                <Image
                    src={sw360logo}
                    height={80}
                    width={247}
                    alt='SW360 Logo'
                    className='my-4'
                />
                <h1 className='mb-0 fw-bold'>{t('Internal Server Error')}</h1>
                <p className='lead my-3'>{error.message}</p>
                <div className='d-flex justify-content-center gap-3'>
                    <button
                        onClick={() => reset()}
                        className='px-4 py-2 btn btn-secondary'
                    >
                        {t('Retry')}
                    </button>
                    <button
                        className='btn btn-secondary px-4 py-2'
                        onClick={() => router.push('/')}
                    >
                        {t('Return Home')}
                    </button>
                </div>
            </div>
        </div>
    )
}
