// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.
// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'used-client'

import React, { ReactNode, useCallback, useEffect, useState, type JSX } from 'react';

import { Embedded, HttpStatus, ReleaseDetail } from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils/index'
import { getSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Spinner } from 'react-bootstrap'
import HomeTableHeader from './HomeTableHeader'

type EmbeddedReleases = Embedded<ReleaseDetail, 'sw360:releases'>

function RecentReleasesWidget() : ReactNode {
    const t = useTranslations('default')

    const [recentRelease, setRecentRelease] = useState<Array<JSX.Element[]>>([])
    const [loading, setLoading] = useState(true)
    const [reload, setReload] = useState(false)

    const fetchData = useCallback(async (url: string) => {
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) return signOut()
        const response = await ApiUtils.GET(url, session.user.access_token)
        if (response.status == HttpStatus.OK) {
            const data = (await response.json()) as EmbeddedReleases
            return data
        } else if (response.status == HttpStatus.UNAUTHORIZED) {
            return signOut()
        } else {
            notFound()
        }
    }, [])

    useEffect(() => {
        setLoading(true)
        void fetchData('releases/recentReleases').then((releases: EmbeddedReleases | undefined) => {
            if (releases === undefined) {
                return
            }

            if (
                !CommonUtils.isNullOrUndefined(releases['_embedded']) &&
                !CommonUtils.isNullOrUndefined(releases['_embedded']['sw360:releases'])
            ) {
                setRecentRelease(
                    releases['_embedded']['sw360:releases'].map((item: ReleaseDetail) => [
                        <li key={item.name}>
                            <Link
                                href={'components/releases/detail/' + item.id}
                                style={{ color: 'orange', textDecoration: 'none' }}
                            >
                                {item.name}
                            </Link>
                        </li>,
                    ]),
                )
            } else {
                setRecentRelease([])
            }
        })
        .catch((err:Error)=>{
            console.error('Error',err)
        })
        .finally(() => {
            setLoading(false)
        })
    }, [fetchData, reload])

    return (
        <div className='content-container'>
            <HomeTableHeader title={t('Recent Releases')} setReload={setReload} />
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
    )
}

export default RecentReleasesWidget
