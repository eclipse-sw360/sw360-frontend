// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2023,2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import '@/styles/globals.css'
import 'bootstrap/dist/css/bootstrap.css'
import { StatusCodes } from 'http-status-codes'
import Link from 'next/link'
import { type JSX, useEffect, useState } from 'react'
import { VersionInfo } from '@/object-types'
import { ApiUtils } from '@/utils'

// Compile-time constants injected by next.config.ts `env` block.
const frontendVersionInfo: VersionInfo = {
    sw360FrontendVersion: process.env.NEXT_PUBLIC_APP_VERSION ?? 'unknown',
    gitBranch: process.env.NEXT_PUBLIC_APP_GIT_BRANCH ?? 'unknown',
    buildNumber: process.env.NEXT_PUBLIC_APP_GIT_COMMIT ?? 'unknown',
}

function Footer(): JSX.Element {
    const [backendVersionInfo, setBackendVersionInfo] = useState<VersionInfo>()

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal

        const fetchVersion = async () => {
            try {
                const response = await ApiUtils.GET('version', '', signal)
                if (response.status == StatusCodes.OK) {
                    const data = (await response.json()) as VersionInfo
                    setBackendVersionInfo(data)
                }
            } catch {
                // Silently fail - version display is non-critical
            }
        }

        void fetchVersion()
        return () => controller.abort()
    }, [])

    return (
        <>
            <footer className='sw360footer footer d-flex justify-content-center align-items-center flex-column'>
                <div className='poweredBy pt-3'>
                    Powered-by
                    <Link
                        className='text-link'
                        href='http://www.github.com/eclipse/sw360'
                        rel='noopener noreferrer'
                        target='_blank'
                    >
                        {' '}
                        SW360
                    </Link>{' '}
                    |
                    <Link
                        className='text-link'
                        href='https://www.eclipse.org/sw360/docs/'
                        rel='noopener noreferrer'
                        target='_blank'
                    >
                        {' '}
                        SW360 Docs
                    </Link>{' '}
                    |
                    <Link
                        className='text-link'
                        href={`${process.env.NEXT_PUBLIC_SW360_API_URL}/resource/swagger-ui/index.html#/`}
                        rel='noopener noreferrer'
                        target='_blank'
                    >
                        {' '}
                        REST API Docs
                    </Link>{' '}
                    |
                    <Link
                        className='text-link'
                        href='https://github.com/eclipse/sw360/issues'
                        rel='noopener noreferrer'
                        target='_blank'
                    >
                        {' '}
                        Public Issue Tracker
                    </Link>
                </div>
                <div className='footerVersion'>
                    {frontendVersionInfo ? (
                        <>
                            Frontend: {frontendVersionInfo.sw360FrontendVersion} | Branch:{' '}
                            {frontendVersionInfo.gitBranch} ({frontendVersionInfo.buildNumber}) |&nbsp;
                        </>
                    ) : (
                        'No frontend build information available.'
                    )}
                    {backendVersionInfo ? (
                        <>
                            Backend: {backendVersionInfo.sw360Version} | Branch: {backendVersionInfo.gitBranch} (
                            {backendVersionInfo.buildNumber}) | API: {backendVersionInfo.apiVersion}
                        </>
                    ) : (
                        'No backend build information available.'
                    )}
                </div>
            </footer>
        </>
    )
}

export default Footer
