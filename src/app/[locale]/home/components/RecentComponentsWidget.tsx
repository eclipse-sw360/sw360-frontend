// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.
// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use-client'

import React, { useCallback, useEffect, useState } from 'react'

import HomeTableHeader from './HomeTableHeader'
import { useTranslations } from 'next-intl'
import { ApiUtils, CommonUtils } from '@/utils/index'
import { signOut, useSession } from 'next-auth/react'
import { notFound } from 'next/navigation'
import { Component, HttpStatus, Embedded } from '@/object-types'
import { Spinner } from 'react-bootstrap'
import Link from 'next/link'

type EmbeddedComponent = Embedded<Component, 'sw360:components'>


function RecentComponentsWidget() {
    const [recentComponent, setRecentComponent] = useState([])
    const t = useTranslations('default')
    const [loading, setLoading] = useState(true)
    const { data: session, status } = useSession()

    const fetchData = useCallback(
        async (url: string) => {
            const response = await ApiUtils.GET(url, session.user.access_token)
            if (response.status == HttpStatus.OK) {
                const data = await response.json() as EmbeddedComponent
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
        void fetchData('components/recentComponents').then((components: EmbeddedComponent) => {
            if (!CommonUtils.isNullOrUndefined(components['_embedded']['sw360:components'])) {
                setRecentComponent(
                    components['_embedded']['sw360:components'].map((item: Component) => [
                        <li key={item.name}>
                            <Link href={'components/detail/' + item.id}
                                  style={{ color: 'orange', textDecoration: 'none' }}
                                >
                                {item.name}
                            </Link>
                        </li>,
                        ])
                    )
                    setLoading(false)
                }})
    }, [fetchData, session])

    if (status === 'unauthenticated') {
        signOut()
    } else {
    return (
        <div className='content-container'>
            <HomeTableHeader title={t('Recent Components')} />
            {loading == false ? (
                <ul style={{ listStyleType: 'disc', color: 'black' }}>{recentComponent}</ul>
            ) : (
                <div className='col-12'>
                    <Spinner className='spinner' />
                </div>
            )}
            {recentComponent.length === 0 && (
                <>
                    <div className='subscriptionBox'>{t('No recent components available')}</div>
                </>
            )}
        </div>
        )
    }
}

// We need use this to override typescript issue
// Reference: https://github.com/vercel/next.js/issues/42292
export default RecentComponentsWidget as unknown as () => JSX.Element
