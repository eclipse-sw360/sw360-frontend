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
import { SW360_API_URL } from '@/utils/env'

function Footer(): JSX.Element {
    const [versionInfo, setVersionInfo] = useState<VersionInfo>()

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal

        const fetchVersion = async () => {
            try {
                const response = await ApiUtils.GET('version', '', signal)
                if (response.status == StatusCodes.OK) {
                    const data = (await response.json()) as VersionInfo
                    setVersionInfo(data)
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
                        href={`${SW360_API_URL}/resource/swagger-ui/index.html#/`}
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
                    {versionInfo ? (
                        <>
                            Version: {versionInfo.sw360Version} | Branch: {versionInfo.gitBranch} (
                            {versionInfo.buildNumber}) | Build time: {versionInfo.buildTime} | API:{' '}
                            {versionInfo.apiVersion}
                        </>
                    ) : (
                        'No build information available.'
                    )}
                </div>
            </footer>
        </>
    )
}

export default Footer
