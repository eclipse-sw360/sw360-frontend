// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { ReactNode, useEffect } from 'react'
import { Vulnerability } from '@/object-types'

export default function UsingReleasesTable({ summaryData }: { summaryData: Vulnerability }): ReactNode {
    const t = useTranslations('default')
    const { status } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [
        status,
    ])

    return (
        <>
            {summaryData.releases && (
                <>
                    <h4 className='header-underlined'>
                        {`${summaryData.title}` + ' is present in the following releases'}
                    </h4>
                    <table className='table summary-table'>
                        <thead title={t('Usage overview')}>
                            <tr>
                                <th>{t('Release')}</th>
                                <th>{t('CPE ID')}</th>
                                <th>{t('Release date')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {summaryData.releases.map((release, i) => {
                                return (
                                    <tr key={i}>
                                        <td>
                                            <Link
                                                href={'/components/releases/detail/' + release.id}
                                                className='link'
                                            >
                                                {release.name} ({release.version})
                                            </Link>
                                        </td>
                                        <td>{release.cpeid}</td>
                                        <td>{release.releaseDate}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </>
            )}
        </>
    )
}
