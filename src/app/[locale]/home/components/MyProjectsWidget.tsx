// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { getSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { ReactNode, useCallback, useEffect, useState, type JSX } from 'react';
import { Spinner } from 'react-bootstrap'

import { HttpStatus } from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils'
import { Table, _ } from 'next-sw360'

import Link from 'next/link'

import { Embedded, Project } from '@/object-types'
import HomeTableHeader from './HomeTableHeader'

type EmbeddedProjects = Embedded<Project, 'sw360:projects'>

function MyProjectsWidget(): ReactNode {
    const [data, setData] = useState<Array<(string | JSX.Element)[]>>([])
    const t = useTranslations('default')
    const params = useSearchParams()
    const [loading, setLoading] = useState(true)
    const [reload, setReload] = useState(false)

    const fetchData = useCallback(async (queryUrl: string, signal: AbortSignal) => {
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) return signOut()
        const response = await ApiUtils.GET(queryUrl, session.user.access_token, signal)
        if (response.status === HttpStatus.OK) {
            const myprojects = (await response.json()) as EmbeddedProjects
            return myprojects
        } else {
            return undefined
        }
    }, [])

    useEffect(() => {
        setLoading(true)
        const searchParams = Object.fromEntries(params)
        const queryUrl = CommonUtils.createUrlWithParams('projects/myprojects', searchParams)

        const controller = new AbortController()
        const signal = controller.signal

        fetchData(queryUrl, signal)
            .then((projects: EmbeddedProjects | undefined) => {
                if (projects === undefined) {
                    return
                }

                if (!CommonUtils.isNullOrUndefined(projects['_embedded']['sw360:projects'])) {
                    setData(
                        projects['_embedded']['sw360:projects'].map((item: Project) => [
                            `${item.name }|${CommonUtils.getIdFromUrl(item._links.self.href)}|${CommonUtils.isNullEmptyOrUndefinedString(item.version) && `(${item.version})`}`,
                            CommonUtils.truncateText(item.description ?? '', 40),
                            item.version ?? '',
                        ]),
                    )
                }
            })
            .catch((err:Error) => {
                throw new Error(err.message)
            })
            .finally(()=>{
                setLoading(false)
            })

        return () => {
            controller.abort()
        }
    }, [fetchData, params, reload])

    const title = t('My Projects')
    const columns = [
        {
            id: 'Project Name',
            name: t('Project Name'),
            formatter: (cell: string) => {
                const item = cell.split('|')
                return _(
                    <Link href={'projects/detail/' + item[1]}>
                        {item[0]} {" "}
                        {item[2]}
                    </Link>
                );
            },
        },
        t('Description'),
        t('Version'),
    ]
    const language = { noRecordsFound: t('NoProjectsFound') }

    return (
        <div>
            <HomeTableHeader title={title} setReload={setReload} />
            {loading == false ? (
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

export default MyProjectsWidget
