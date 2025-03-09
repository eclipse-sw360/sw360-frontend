// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { getSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ReactNode, useCallback, useEffect, useState, type JSX } from 'react';
import { Spinner } from 'react-bootstrap'

import { HttpStatus } from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils'
import { Table, _ } from 'next-sw360'

import { Component, Embedded } from '@/object-types'
import HomeTableHeader from './HomeTableHeader'

type EmbeddedComponents = Embedded<Component, 'sw360:components'>

function MyComponentsWidget(): ReactNode {
    const [data, setData] = useState<Array<(string | JSX.Element)[]>>([])
    const t = useTranslations('default')
    const params = useSearchParams()
    const [loading, setLoading] = useState(true)

    const fetchData = useCallback(async (queryUrl: string, signal: AbortSignal) => {
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) return signOut()
        const response = await ApiUtils.GET(queryUrl, session.user.access_token, signal)
        if (response.status === HttpStatus.OK) {
            const data = (await response.json()) as EmbeddedComponents
            return data
        } else {
            return undefined
        }
    }, [])

    useEffect(() => {
        setLoading(true)
        const searchParams = Object.fromEntries(params)
        const queryUrl = CommonUtils.createUrlWithParams('components/mycomponents', searchParams)

        const controller = new AbortController()
        const signal = controller.signal

        fetchData(queryUrl, signal)
            .then((components: EmbeddedComponents | undefined) => {
                if (components === undefined) {
                    setLoading(false)
                    return
                }

                if (
                    !CommonUtils.isNullOrUndefined(components['_embedded']) &&
                    !CommonUtils.isNullOrUndefined(components['_embedded']['sw360:components'])
                ) {
                    setData(
                        components['_embedded']['sw360:components'].map((item: Component) => [
                            _(<Link href={'components/detail/' + item.id}>{item.name}</Link>),
                            CommonUtils.truncateText(item.description ?? '', 40),
                        ]),
                    )
                    setLoading(false)
                } else {
                    setData([])
                    setLoading(false)
                }
            })
            .catch(() => {
                console.error('False to fetch components')
            })

        return () => {
            controller.abort()
        }
    }, [fetchData, params])

    const title = t('My Components')
    const columns = [t('Component Name'), t('Description')]
    const language = { noRecordsFound: t('NotOwnComponent') }

    return (
        <div>
            <HomeTableHeader title={title} />
            {loading === false ? (
                <Table
                    columns={columns}
                    data={data}
                    pagination={{ limit: 5 }}
                    selector={false}
                    language={language}
                />
            ) : (
                <div className='col-12'>
                    <Spinner className='spinner' />
                </div>
            )}
        </div>
    )
}

export default MyComponentsWidget
