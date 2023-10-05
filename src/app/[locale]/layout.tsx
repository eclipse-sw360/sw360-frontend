// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import 'bootstrap/dist/css/bootstrap.min.css'
import '@/styles/globals.css'
import '@/styles/auth.css'
import '@/styles/gridjs/sw360.css'
import { Providers } from '../provider'
import React, { ReactNode } from 'react'

import { NextIntlClientProvider } from 'next-intl'
import { notFound } from 'next/navigation'

import { Header, Footer } from 'sw360-components'

export function generateStaticParams() {
    return [{ locale: 'en' }, { locale: 'ja' }, { locale: 'vi' }, { locale: 'zh' }]
}

type Props = {
    children: ReactNode
    params: { locale: string }
}

async function RootLayout({ children, params: { locale } }: Props) {
    let messages
    try {
        messages = (await import(`@/messages/${locale}.json`)).default
    } catch (error) {
        notFound()
    }
    return (
        <html lang={locale}>
            <body>
                <Providers>
                    <NextIntlClientProvider locale={locale} messages={messages}>
                        <div id='container'>
                            <div id='content'>
                                <Header />
                                {children}
                                <Footer />
                            </div>
                        </div>
                    </NextIntlClientProvider>
                </Providers>
            </body>
        </html>
    )
}

export default RootLayout
