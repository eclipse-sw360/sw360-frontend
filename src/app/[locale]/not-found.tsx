'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { type JSX } from 'react'
import sw360logo from '@/assets/images/sw360-logo.svg'

function NotFound(): JSX.Element {
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
                <h1 className='display-1 fw-bold'>404</h1>
                <h2 className='mb-0 fw-bold'>{t('Page Not Found')}</h2>
                <p className='lead my-3'>{t('The page you are looking for does not exist or has been moved')}</p>
                <div className='d-flex justify-content-center gap-3'>
                    <button
                        className='btn btn-secondary px-4 py-2'
                        onClick={() => router.back()}
                    >
                        {t('Go Back')}
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

export default NotFound
