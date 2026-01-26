// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import '@/styles/globals.css'
import 'bootstrap/dist/css/bootstrap.css'
import Link from 'next/link'
import { type JSX, useEffect, useState } from 'react'
import { SW360_API_URL } from '@/utils/env'

function Footer(): JSX.Element {
    const [buildVersion, setBuildVersion] = useState<string>('')
    const [apiVersion, setApiVersion] = useState<string>('')

    useEffect(() => {
        const fetchVersion = async () => {
            try {
                const response = await fetch(`${SW360_API_URL}/resource/version`)
                if (response.ok) {
                    const data = (await response.json()) as {
                        sw360BuildVersion?: string
                        sw360RestVersion?: string
                    }
                    setBuildVersion(data.sw360BuildVersion ?? '')
                    setApiVersion(data.sw360RestVersion ?? '')
                }
            } catch {
                // Silently fail - version display is non-critical
            }
        }

        void fetchVersion()
    }, [])

    return (
        <>
            <footer className='sw360-footer footer d-flex flex-column'>
                <div className='powered-by pt-3'>
                    Powered-by
                    <Link
                        className='footer-href'
                        href='http://www.github.com/eclipse/sw360'
                        rel='noopener noreferrer'
                        target='_blank'
                    >
                        {' '}
                        SW360
                    </Link>{' '}
                    |
                    <Link
                        className='footer-href'
                        href='/resource/mkdocs/index.html'
                        rel='noopener noreferrer'
                        target='_blank'
                    >
                        {' '}
                        SW360 Docs
                    </Link>{' '}
                    |
                    <Link
                        className='footer-href'
                        href='/resource/docs/api-guide.html'
                        rel='noopener noreferrer'
                        target='_blank'
                    >
                        {' '}
                        REST API Docs
                    </Link>{' '}
                    |
                    <Link
                        className='footer-href'
                        href='https://github.com/eclipse/sw360/issues'
                        rel='noopener noreferrer'
                        target='_blank'
                    >
                        {' '}
                        Public Issue Tracker
                    </Link>
                </div>
                <div className='footer-version'>
                    Version: {buildVersion ? buildVersion : '-'} - ApiVersion: {apiVersion ? apiVersion : '-'}
                </div>
            </footer>
        </>
    )
}

export default Footer
