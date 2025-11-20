// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.
// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use-client'

import { StatusCodes } from 'http-status-codes'
import Link from 'next/link'
import { getSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import React, { ReactNode, useCallback, useEffect, useState } from 'react'
import { Spinner } from 'react-bootstrap'
import { Component, Embedded, ReleaseDetail } from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils/index'
import HomeTableHeader from './HomeTableHeader'

type EmbeddedComponents = Embedded<Component, 'sw360:components'>
type EmbeddedReleases = Embedded<ReleaseDetail, 'sw360:releases'>

function MySubscriptionsWidget(): ReactNode {
    const [componentData, setComponentData] = useState<Array<Component>>([])
    const [releaseData, setReleaseData] = useState<Array<ReleaseDetail>>([])
    const t = useTranslations('default')
    const [loading, setLoading] = useState(true)
    const [reload, setReload] = useState(false)

    const fetchData = useCallback(async (url: string) => {
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) return signOut()
        const response = await ApiUtils.GET(url, session.user.access_token)
        if (response.status === StatusCodes.OK) {
            const data = (await response.json()) as EmbeddedComponents & EmbeddedReleases
            return data
        } else if (response.status === StatusCodes.UNAUTHORIZED) {
            return signOut()
        } else {
            return undefined
        }
    }, [])

    useEffect(() => {
        setLoading(true)
        fetchData('components/mySubscriptions')
            .then((components: EmbeddedComponents | undefined) => {
                if (components === undefined) return
                if (
                    !CommonUtils.isNullOrUndefined(components['_embedded']) &&
                    !CommonUtils.isNullOrUndefined(components['_embedded']['sw360:components'])
                ) {
                    setComponentData(components['_embedded']['sw360:components'])
                } else {
                    setComponentData([])
                }
            })
            .catch((err) => console.error(err))
        fetchData('releases/mySubscriptions')
            .then((releases: EmbeddedReleases | undefined) => {
                if (releases === undefined) return
                if (
                    !CommonUtils.isNullOrUndefined(releases['_embedded']) &&
                    !CommonUtils.isNullOrUndefined(releases['_embedded']['sw360:releases'])
                ) {
                    setReleaseData(releases['_embedded']['sw360:releases'])
                } else {
                    setReleaseData([])
                }
            })
            .catch((err: Error) => {
                throw new Error(err.message)
            })
            .finally(() => {
                setLoading(false)
            })
    }, [
        fetchData,
        reload,
    ])

    return (
        <div className='content-container'>
            <HomeTableHeader
                title={t('My Subscriptions')}
                setReload={setReload}
            />
            {loading === false ? (
                <>
                    {componentData.length > 0 && (
                        <>
                            <h3 className='fw-bold titleSubSideBar'>{t('Components')}</h3>
                            <ul
                                style={{
                                    listStyleType: 'disc',
                                    color: 'black',
                                }}
                            >
                                {componentData.map((item: Component) => (
                                    <li key={item.id}>
                                        <Link
                                            href={'components/detail/' + item.id}
                                            style={{
                                                color: 'orange',
                                                textDecoration: 'none',
                                            }}
                                        >
                                            {item.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                    {releaseData.length > 0 && (
                        <>
                            <h3 className='fw-bold titleSubSideBar'>{t('Releases')}</h3>
                            <ul
                                style={{
                                    listStyleType: 'disc',
                                    color: 'black',
                                }}
                            >
                                {releaseData.map((item: ReleaseDetail) => (
                                    <li key={item.id}>
                                        <Link
                                            href={'components/releases/detail/' + item.id}
                                            style={{
                                                color: 'orange',
                                                textDecoration: 'none',
                                            }}
                                        >
                                            {item.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                    {releaseData.length === 0 && componentData.length === 0 && loading === false && (
                        <>
                            <div className='subscriptionBox'>{t('No subscriptions available')}</div>
                        </>
                    )}
                </>
            ) : (
                <div className='col-12'>
                    <Spinner className='spinner' />
                </div>
            )}
        </div>
    )
}

export default MySubscriptionsWidget
