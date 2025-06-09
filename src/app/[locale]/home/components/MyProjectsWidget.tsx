// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { getSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { notFound, useSearchParams } from 'next/navigation'
import { ReactNode, useCallback, useEffect, useState, type JSX } from 'react'
import { Spinner } from 'react-bootstrap'

import { HttpStatus } from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils'
import { Table, _ } from 'next-sw360'

import Link from 'next/link'

import { Embedded, Project } from '@/object-types'
import HomeTableHeader from './HomeTableHeader'

type EmbeddedProjects = Embedded<Project, 'sw360:projects'>

interface LicenseClearingData {
    'Release Count': number
    'Approved Count': number
}

function LicenseClearing({ projectId }: { projectId: string }) {
    const [lcData, setLcData] = useState<LicenseClearingData | null>(null)
    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal
        void (async () => {
            try {
                const session = await getSession()
                if (!session) {
                    return signOut()
                }

                const response = await ApiUtils.GET(
                    `projects/${projectId}/licenseClearingCount`,
                    session.user.access_token,
                    signal,
                )
                if (response.status === HttpStatus.UNAUTHORIZED) {
                    return signOut()
                } else if (response.status !== HttpStatus.OK) {
                    return notFound()
                }

                const data = (await response.json()) as LicenseClearingData

                setLcData(data)
            } catch (e) {
                if (e instanceof Error) {
                    throw new Error(e.message)
                } else {
                    throw new Error('Unknown error')
                }
            }
        })()
        return () => controller.abort()
    }, [])

    return (
        <>
            {lcData ? (
                <div className='text-center'>{`${lcData['Approved Count']}/${lcData['Release Count']}`}</div>
            ) : (
                <div className='col-12 text-center'>
                    <Spinner
                        className='spinner'
                        size='sm'
                    />
                </div>
            )}
        </>
    )
}

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
                            `${item.name}|${CommonUtils.getIdFromUrl(item._links.self.href)}|${CommonUtils.isNullEmptyOrUndefinedString(item.version) && `(${item.version})`}`,
                            CommonUtils.truncateText(item.description ?? '', 40),
                            item.id ?? '',
                        ]),
                    )
                }
            })
            .catch((err: Error) => {
                throw new Error(err.message)
            })
            .finally(() => {
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
                        {item[0]} {item[2]}
                    </Link>,
                )
            },
        },
        t('Description'),
        {
            id: 'License Clearing',
            name: t('License Clearing'),
            formatter: (cell: string) => {
                return _(<LicenseClearing projectId={cell} />)
            },
        },
    ]
    const language = { noRecordsFound: t('NoProjectsFound') }

    return (
        <div>
            <HomeTableHeader
                title={title}
                setReload={setReload}
            />
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
