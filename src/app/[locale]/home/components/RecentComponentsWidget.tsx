// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.
// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use-client'

import React, { ReactNode, useCallback, useEffect, useState, type JSX } from 'react';

import { Component, Embedded, HttpStatus } from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils/index'
import { getSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Spinner } from 'react-bootstrap'
import HomeTableHeader from './HomeTableHeader'

type EmbeddedComponents = Embedded<Component, 'sw360:components'>

function RecentComponentsWidget(): ReactNode {
    const [recentComponent, setRecentComponent] = useState<Array<(string | JSX.Element)[]>>([])
    const t = useTranslations('default')
    const [loading, setLoading] = useState(true)
    const [reload, setReload] = useState(false)
    const fetchData = useCallback(async (url: string) => {
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) return signOut()
        const response = await ApiUtils.GET(url, session.user.access_token)
        if (response.status == HttpStatus.OK) {
            const data = (await response.json()) as EmbeddedComponents
            return data
        } else if (response.status == HttpStatus.UNAUTHORIZED) {
            return signOut()
        } else {
            notFound()
        }
    }, [])

    useEffect(() => {
        setLoading(true)
        void fetchData('components/recentComponents').then((components: EmbeddedComponents | undefined) => {
            if (components === undefined) {
                return
            }

            if (
                !CommonUtils.isNullOrUndefined(components['_embedded']) &&
                !CommonUtils.isNullOrUndefined(components['_embedded']['sw360:components'])
            ) {
                setRecentComponent(
                    components['_embedded']['sw360:components'].map((item: Component) => [
                        <li key={item.name}>
                            <Link
                                href={'components/detail/' + item.id}
                                style={{ color: 'orange', textDecoration: 'none' }}
                            >
                                {item.name}
                            </Link>
                        </li>,
                    ]),
                )
            } else {
                setRecentComponent([])
            }
        })
        .catch(() => {
            console.error('False to fetch components')
        })
        .finally(() => {
            setLoading(false)
        })
    }, [fetchData, reload])

    return (
        <div className='content-container'>
            <HomeTableHeader title={t('Recent Components')} setReload={setReload} />
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

export default RecentComponentsWidget
