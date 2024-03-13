// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.
// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'used-client'

import React, { useState, useEffect, useCallback } from 'react'

import HomeTableHeader from './HomeTableHeader'
import { useTranslations } from 'next-intl'
import { ReleaseDetail, Embedded, HttpStatus } from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils/index'
import { signOut, useSession } from 'next-auth/react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Spinner } from 'react-bootstrap'

type EmbeddedRelease = Embedded<ReleaseDetail, 'sw360:releases'>

function RecentReleasesWidget() {
    const [recentRelease, setRecentRelease] = useState([])
    const t = useTranslations('default')
    const [loading, setLoading] = useState(true)
    const { data: session, status } = useSession()

    const fetchData = useCallback(
        async (url: string) => {
            const response = await ApiUtils.GET(url, session.user.access_token)
            if (response.status == HttpStatus.OK) {
                const data = await response.json() as EmbeddedRelease
                return data
            } else if (response.status == HttpStatus.UNAUTHORIZED) {
                return signOut()
            } else {
                notFound()
            }
        },[session]
    )

    useEffect(() => {
        setLoading(true)
        void fetchData('releases/recentReleases').then((releases: EmbeddedRelease) => {
            if (
                !CommonUtils.isNullOrUndefined(releases['_embedded']) &&
                !CommonUtils.isNullOrUndefined(releases['_embedded']['sw360:releases'])
            ) {
                setRecentRelease(
                    releases['_embedded']['sw360:releases'].map((item: ReleaseDetail) => [
                        <li key={item.name}>
                            <Link href={'releases/detail/' + item.id}
                                style={{ color: 'orange', textDecoration: 'none' }}
                            >
                                {item.name}
                            </Link>
                        </li>,
                    ])
                )
                setLoading(false)
            } else {
                setRecentRelease([])
                setLoading(false)
            }
        })
    }, [fetchData, session])

    if (status === 'unauthenticated') {
        signOut()
    } else {
    return (
        <div className='content-container'>
            <HomeTableHeader title={t('Recent Releases')} />
                {loading == false ? (
                    <ul style={{ listStyleType: 'disc', color: 'black' }}>{recentRelease}</ul>
                ) : (
                    <div className='col-12'>
                        <Spinner className='spinner' />
                    </div>
                )}
                {recentRelease.length === 0 && (
                    <>
                        <div className='subscriptionBox'>{t('No recent releases available')}</div>
                    </>
                )}
        </div>
    )}
}

// We need use this to override typescript issue
// Reference: https://github.com/vercel/next.js/issues/42292
export default RecentReleasesWidget as unknown as () => JSX.Element
