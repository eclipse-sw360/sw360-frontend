// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import 'bootstrap/dist/css/bootstrap.min.css'
import 'flag-icons/css/flag-icons.min.css'

import '@/styles/auth.css'
import '@/styles/globals.css'

import { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { Footer, GlobalMessages, Navbar } from 'next-sw360'
import { type JSX, ReactNode } from 'react'
import { UiConfigProvider } from '@/contexts'
import { Providers } from '../provider'

export const metadata: Metadata = {
    title: {
        template: '%s | SW360 Frontend',
        default: 'SW360 Frontend',
    },
    description: 'SW360 Compliance Management System Graphical Interface.',
    metadataBase: new URL('https://eclipse.org/sw360/'),
}

type Props = {
    children: ReactNode
}

async function RootLayout({ children }: Props): Promise<JSX.Element> {
    const locale = await getLocale()
    const messages = await getMessages()

    return (
        <html lang={locale}>
            <body>
                <Providers>
                    <NextIntlClientProvider messages={messages}>
                        <UiConfigProvider>
                            <div
                                id='container'
                                className='d-flex flex-column min-vh-100'
                            >
                                <GlobalMessages />
                                <Navbar />
                                {children}
                                <Footer />
                            </div>
                        </UiConfigProvider>
                    </NextIntlClientProvider>
                </Providers>
            </body>
        </html>
    )
}

export default RootLayout
