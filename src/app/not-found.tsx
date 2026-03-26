// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { type JSX } from 'react'
import sw360logo from '@/assets/images/sw360-logo.svg'
import 'bootstrap/dist/css/bootstrap.min.css'

function NotFound(): JSX.Element {
    const router = useRouter()

    return (
        <html>
            <body>
                <div className='d-flex align-items-center justify-content-center w-100 min-vh-100'>
                    <div className='text-center p-4 col col-md-6'>
                        <Image
                            src={sw360logo}
                            height={80}
                            width={247}
                            alt='SW360 Logo'
                            className='my-4'
                        />
                        <h1 className='display-1 fw-bold'>404</h1>
                        <h2 className='mb-0 fw-bold'>Page Not Found</h2>
                        <p className='lead my-3'>The page you are looking for does not exist or has been moved.</p>
                        <div className='d-flex justify-content-center gap-3'>
                            <button
                                className='btn btn-secondary px-4 py-2'
                                onClick={() => router.back()}
                            >
                                Go Back
                            </button>
                            <button
                                className='btn btn-secondary px-4 py-2'
                                onClick={() => router.push('/')}
                            >
                                Return Home
                            </button>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    )
}

export default NotFound
