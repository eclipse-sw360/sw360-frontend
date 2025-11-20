// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ColumnDef, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table'
import { StatusCodes } from 'http-status-codes'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { ClientSidePageSizeSelector, ClientSideTableFooter, SW360Table, TableSearch } from 'next-sw360'
import { Dispatch, ReactNode, SetStateAction, useEffect, useMemo, useState } from 'react'
import { Form, Spinner } from 'react-bootstrap'
import { Embedded, ErrorDetails, ReleaseLink } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'

type EmbeddedReleases = Embedded<ReleaseLink, 'sw360:releaseLinks'>

export default function MergeReleaseTable({
    release,
    setRelease,
    componentId,
    releaseId,
}: Readonly<{
    release: ReleaseLink | null
    setRelease: Dispatch<SetStateAction<null | ReleaseLink>>
    componentId: string | null
    releaseId: string | null
}>): ReactNode {
    const t = useTranslations('default')
    const session = useSession()
    const [search, setSearch] = useState<{
        name: string
        luceneSearch?: boolean
    }>({
        name: '',
    })

    const searchFunction = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.currentTarget.value === '') {
            setSearch({
                name: '',
            })
        } else {
            setSearch({
                name: event.currentTarget.value,
                luceneSearch: true,
            })
        }
    }

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            void signOut()
        }
    }, [
        session,
    ])

    const columns = useMemo<ColumnDef<ReleaseLink>[]>(
        () => [
            {
                id: 'select',
                cell: ({ row }) => (
                    <Form.Check
                        type='radio'
                        checked={release !== null && row.original.id === release.id}
                        onChange={() => {
                            setRelease(row.original)
                        }}
                    ></Form.Check>
                ),
                meta: {
                    width: '5%',
                },
            },
            {
                id: 'releaseName',
                accessorKey: 'name',
                header: t('Release Name'),
                enableSorting: true,
                cell: (info) => info.getValue(),
                meta: {
                    width: '45%',
                },
            },
            {
                id: 'version',
                header: t('Version'),
                cell: ({ row }) => <>{row.original.version ?? ''}</>,
                meta: {
                    width: '25%',
                },
            },
            {
                id: 'createdBy',
                header: t('Created by'),
                cell: ({ row }) => <>{row.original.createdBy ?? ''}</>,
                meta: {
                    width: '25%',
                },
            },
        ],
        [
            t,
            release,
        ],
    )

    const [componentReleaseData, setComponentReleaseData] = useState<ReleaseLink[]>(() => [])
    const memoizedData = useMemo(
        () => componentReleaseData,
        [
            componentReleaseData,
        ],
    )
    const [showProcessing, setShowProcessing] = useState(false)

    useEffect(() => {
        if (session.status === 'loading') return
        const controller = new AbortController()
        const signal = controller.signal

        const timeLimit = componentReleaseData.length !== 0 ? 700 : 0
        const timeout = setTimeout(() => {
            setShowProcessing(true)
        }, timeLimit)

        void (async () => {
            try {
                if (CommonUtils.isNullOrUndefined(session.data)) return signOut()
                const queryUrl = CommonUtils.createUrlWithParams(
                    `components/${componentId}/releases`,
                    Object.fromEntries(
                        Object.entries({
                            ...search,
                            allDetails: true,
                        }).map(([key, value]) => [
                            key,
                            String(value),
                        ]),
                    ),
                )
                const response = await ApiUtils.GET(queryUrl, session.data.user.access_token, signal)
                if (response.status !== StatusCodes.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new Error(err.message)
                }

                const data = (await response.json()) as EmbeddedReleases

                setComponentReleaseData(
                    CommonUtils.isNullOrUndefined(data['_embedded']['sw360:releaseLinks'])
                        ? []
                        : releaseId
                          ? data['_embedded']['sw360:releaseLinks'].filter((item) => item.id !== releaseId)
                          : [],
                )
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return
                }
                const message = error instanceof Error ? error.message : String(error)
                MessageService.error(message)
            } finally {
                clearTimeout(timeout)
                setShowProcessing(false)
            }
        })()

        return () => controller.abort()
    }, [
        session,
        search,
    ])

    const table = useReactTable({
        data: memoizedData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),

        meta: {
            rowHeightConstant: true,
        },
    })

    return (
        <div className='mb-3'>
            {table ? (
                <>
                    <div className='d-flex justify-content-end'>
                        <TableSearch searchFunction={searchFunction} />
                    </div>
                    <ClientSidePageSizeSelector table={table} />
                    <SW360Table
                        table={table}
                        showProcessing={showProcessing}
                    />
                    <ClientSideTableFooter table={table} />
                </>
            ) : (
                <div className='col-12 mt-1 text-center'>
                    <Spinner className='spinner' />
                </div>
            )}
        </div>
    )
}
