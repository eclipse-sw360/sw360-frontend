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
import { SW360BackendConfigProvider, UiConfigProvider } from '@/contexts'
import { Providers } from '../provider'

export const metadata: Metadata = {
    title: {
        template: '%s | SW360',
        default: 'SW360',
    },
    description: 'SW360 Compliance Management System Graphical Interface.',
    metadataBase: new URL('https://eclipse.org/sw360/'),
}

type Props = {
    children: ReactNode
}

const DEFAULT_SESSION_REFETCH_INTERVAL_SECONDS = 5 * 60

const getSessionRefetchIntervalSeconds = (): number => {
    const parsed = Number(process.env.SW360_SESSION_REFETCH_INTERVAL_SECONDS)
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return DEFAULT_SESSION_REFETCH_INTERVAL_SECONDS
    }

    return Math.floor(parsed)
}

async function RootLayout({ children }: Props): Promise<JSX.Element> {
    const locale = await getLocale()
    const messages = await getMessages()
    const sessionRefetchIntervalSeconds = getSessionRefetchIntervalSeconds()

    return (
        <html lang={locale}>
            <body>
                <Providers refetchIntervalSeconds={sessionRefetchIntervalSeconds}>
                    <NextIntlClientProvider messages={messages}>
                        <SW360BackendConfigProvider>
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
                        </SW360BackendConfigProvider>
                    </NextIntlClientProvider>
                </Providers>
            </body>
        </html>
    )
}

export default RootLayout
