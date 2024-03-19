// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.
// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use-client'

import React, { useCallback, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

import HomeTableHeader from './HomeTableHeader'
import { signOut, useSession } from 'next-auth/react'
import { ApiUtils, CommonUtils } from '@/utils/index'
import { HttpStatus, Component, Embedded, ReleaseDetail } from '@/object-types'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Spinner } from 'react-bootstrap'

type EmbeddedComponent = Embedded<Component, 'sw360:components'>
type EmbeddedRelease = Embedded<ReleaseDetail, 'sw360:releases'>
interface MyEmptyComponentSubscription {
    _embedded: {
        'sw360:components': []
    }
}
interface MyEmptyReleaseSubscription {
    _embedded: {
        'sw360:releases': []
    }
}


function MySubscriptionsWidget() {
    const [componentData, setComponentData] = useState([])
    const [releaseData, setReleaseData] = useState([])
    const t = useTranslations('default')
    const [loading, setLoading] = useState(true)
    const { data: session, status } = useSession()

    const fetchData = useCallback(
        async (url: string) => {
            const response = await ApiUtils.GET(url, session.user.access_token)
            if (response.status == HttpStatus.OK) {
                const data = await response.json()
                return data
            } else if (response.status == HttpStatus.NO_CONTENT) {
                if (url.includes('component')){
                    const interimData: MyEmptyComponentSubscription = {
                        '_embedded': {
                            'sw360:components': []
                        }
                    }
                    return interimData
                }
                else if (url.includes('release')){
                    const interimData: MyEmptyReleaseSubscription = {
                        '_embedded': {
                            'sw360:releases': []
                        }
                    }
                    return interimData
                }

            } else if (response.status == HttpStatus.UNAUTHORIZED) {
                return signOut()
            } else {
                notFound()
            }
        },[session]
    )

    useEffect(() => {
        setLoading(true)
        fetchData('components/mySubscriptions').then((components: EmbeddedComponent) => {
            if (
                !CommonUtils.isNullOrUndefined(components['_embedded']) &&
                !CommonUtils.isNullOrUndefined(components['_embedded']['sw360:components'])
            ) {
                setComponentData(components['_embedded']['sw360:components'])
            } else {
                setComponentData([])
            }
        })
        fetchData('releases/mySubscriptions').then((releases: EmbeddedRelease) => {
            if (
                !CommonUtils.isNullOrUndefined(releases['_embedded']) &&
                !CommonUtils.isNullOrUndefined(releases['_embedded']['sw360:releases'])
            ) {
                setReleaseData(releases['_embedded']['sw360:releases'])
            } else {
                setReleaseData([])
            }
        })
        setLoading(false)
    }, [fetchData, session])

    if (status === 'unauthenticated') {
        signOut()
    } else {
        return (
            <div className='content-container'>
                <HomeTableHeader title={t('My Subscriptions')} />
                { loading === false ? (
                    <>
                        { componentData.length > 0 && (
                            <>
                                <h3 className='fw-bold titleSubSideBar'>
                                    {t('Components')}
                                </h3>
                                <ul style={{ listStyleType: 'disc', color: 'black' }}>
                                    {componentData.map((item:Component) => (
                                        <li key={item.id}>
                                            <Link href={'components/detail/' + item.id}
                                                style={{ color: 'orange',
                                                        textDecoration: 'none' }}
                                            >
                                                {item.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                        { releaseData.length > 0 && (
                            <>
                                <h3 className='fw-bold titleSubSideBar'>
                                    {t('Releases')}
                                </h3>
                                <ul style={{ listStyleType: 'disc', color: 'black' }}>
                                    {releaseData.map((item:ReleaseDetail) => (
                                        <li key={item.id}>
                                            <Link href={'components/releases/detail/' + item.id}
                                                style={{ color: 'orange',
                                                            textDecoration: 'none' }}
                                            >
                                                {item.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                        {releaseData.length === 0 && componentData.length === 0 && (
                            <>
                                <div className='subscriptionBox'>
                                    {t('No subscriptions available')}
                                </div>
                            </>
                        )}
                    </>
                    ) : (
                            <div className='col-12'>
                                <Spinner className='spinner' />
                            </div>
                        )
                }
            </div>
        )
    }
}

// We need use this to override typescript issue
// Reference: https://github.com/vercel/next.js/issues/42292
export default MySubscriptionsWidget as unknown as () => JSX.Element
