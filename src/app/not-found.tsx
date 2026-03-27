// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import 'bootstrap/dist/css/bootstrap.min.css'
import 'flag-icons/css/flag-icons.min.css'

import '@/styles/auth.css'
import '@/styles/globals.css'

import Image from 'next/image'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { Footer, GlobalMessages, Navbar } from 'next-sw360'
import { type JSX } from 'react'
import sw360logo from '@/assets/images/sw360-logo.svg'
import { SW360BackendConfigProvider, UiConfigProvider } from '@/contexts'
import NotFoundActions from './NotFoundActions'
import { Providers } from './provider'

async function NotFound(): Promise<JSX.Element> {
    const locale = await getLocale()
    const messages = await getMessages()

    return (
        <html lang={locale}>
            <body>
                <Providers>
                    <NextIntlClientProvider messages={messages}>
                        <SW360BackendConfigProvider>
                            <UiConfigProvider>
                                <div
                                    id='container'
                                    className='d-flex flex-column min-vh-100'
                                >
                                    <GlobalMessages />
                                    <Navbar />
                                    <div className='d-flex align-items-center justify-content-center w-100 flex-grow-1'>
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
                                            <p className='lead my-3'>
                                                The page you are looking for does not exist or has been moved.
                                            </p>
                                            <NotFoundActions />
                                        </div>
                                    </div>
                                    <Footer />
                                </div>
                            </UiConfigProvider>
                        </SW360BackendConfigProvider>
                    </NextIntlClientProvider>
                </Providers>
            </body>
        </html>
    )
}

export default NotFound
