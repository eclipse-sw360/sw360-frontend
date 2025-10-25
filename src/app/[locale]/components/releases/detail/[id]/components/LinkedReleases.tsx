// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ColumnDef, ExpandedState, getCoreRowModel, getExpandedRowModel, useReactTable } from '@tanstack/react-table'
import { StatusCodes } from 'http-status-codes'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import { Spinner } from 'react-bootstrap'
import { PaddedCell, SW360Table } from '@/components/sw360'
import { Embedded, ErrorDetails, NestedRows, ReleaseLink } from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils'

type EmbeddedReleaseLinks = Embedded<ReleaseLink, 'sw360:releaseLinks'>
interface Props {
    releaseId: string
}

const Capitalize = (text: string) =>
    text.split('_').reduce((s, c) => s + ' ' + (c.charAt(0) + c.substring(1).toLocaleLowerCase()), '')

const LinkedReleases = ({ releaseId }: Props): ReactNode => {
    const t = useTranslations('default')
    const session = useSession()

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            void signOut()
        }
    }, [
        session,
    ])

    const [data, setData] = useState<NestedRows<ReleaseLink>[]>(() => [])
    const [showProcessing, setShowProcessing] = useState(false)
    const memoizedData = useMemo(
        () => data,
        [
            data,
        ],
    )

    const convertNodeData = (children: ReleaseLink[]): NestedRows<ReleaseLink>[] => {
        const convertedTreeData: NestedRows<ReleaseLink>[] = []
        children.forEach((r: ReleaseLink) => {
            const convertedNode: NestedRows<ReleaseLink> = {
                node: r,
                children: r._embedded ? convertNodeData(r._embedded['sw360:releaseLinks']) : [],
            }
            convertedTreeData.push(convertedNode)
        })
        return convertedTreeData
    }

    useEffect(() => {
        if (session.status !== 'authenticated') return
        const controller = new AbortController()
        const signal = controller.signal

        const timeLimit = data.length !== 0 ? 700 : 0
        const timeout = setTimeout(() => {
            setShowProcessing(true)
        }, timeLimit)

        void (async () => {
            try {
                const response = await ApiUtils.GET(
                    `releases/${releaseId}/releases?transitive=true`,
                    session.data.user.access_token,
                    signal,
                )

                if (response.status !== StatusCodes.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new Error(err.message)
                }

                const releaseData = (await response.json()) as EmbeddedReleaseLinks

                const convertedTreeData: NestedRows<ReleaseLink>[] = []
                releaseData._embedded['sw360:releaseLinks'].forEach((r: ReleaseLink) => {
                    const convertedNode: NestedRows<ReleaseLink> = {
                        node: r,
                        children: r._embedded ? convertNodeData(r._embedded['sw360:releaseLinks']) : [],
                    }
                    convertedTreeData.push(convertedNode)
                })
                setData(convertedTreeData)
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return
                }
                const message = error instanceof Error ? error.message : String(error)
                throw new Error(message)
            } finally {
                clearTimeout(timeout)
                setShowProcessing(false)
            }
        })()

        return () => controller.abort()
    }, [
        releaseId,
        session,
    ])

    const columns = useMemo<ColumnDef<NestedRows<ReleaseLink>>[]>(
        () => [
            {
                id: 'name',
                header: t('Name'),
                cell: ({ row }) => {
                    const { name, version, id } = row.original.node
                    if (row.depth === 0) {
                        return (
                            <PaddedCell row={row}>
                                <Link
                                    className='text-link'
                                    href={`components/releases/detail/${id}`}
                                >
                                    {`${name} ${version}`}
                                </Link>
                            </PaddedCell>
                        )
                    } else {
                        return (
                            <Link
                                className='text-link'
                                href={`components/releases/detail/${id}`}
                            >
                                {`${name} ${version}`}
                            </Link>
                        )
                    }
                },
                meta: {
                    width: '35%',
                },
            },
            {
                id: 'releaseRelation',
                header: t('Release Relation'),
                cell: ({ row }) => {
                    const { releaseRelationship } = row.original.node
                    return <>{Capitalize(releaseRelationship ?? '')}</>
                },
                meta: {
                    width: '20%',
                },
            },
            {
                id: 'licenseNames',
                header: t('Licence names'),
                cell: ({ row }) => {
                    const { licenseIds } = row.original.node
                    return <>{CommonUtils.isNullEmptyOrUndefinedArray(licenseIds) ? '' : licenseIds.join(', ')}</>
                },
                meta: {
                    width: '25%',
                },
            },
            {
                id: 'clearingState',
                header: t('Clearing State'),
                cell: ({ row }) => {
                    const { clearingState } = row.original.node
                    return <>{Capitalize(clearingState ?? '')}</>
                },
                meta: {
                    width: '20%',
                },
            },
        ],
        [
            t,
        ],
    )

    const [expandedState, setExpandedState] = useState<ExpandedState>({})
    const table = useReactTable({
        // table state config
        state: {
            expanded: expandedState,
        },

        data: memoizedData,
        columns,
        getCoreRowModel: getCoreRowModel(),

        // expand config
        getExpandedRowModel: getExpandedRowModel(),
        getSubRows: (row) => row.children ?? [],
        getRowCanExpand: (row) => row.original.children !== undefined && row.original.children.length !== 0,
        onExpandedChange: setExpandedState,
    })

    return (
        <div className='mb-3'>
            {table ? (
                <SW360Table
                    table={table}
                    showProcessing={showProcessing}
                />
            ) : (
                <div className='col-12 mt-1 text-center'>
                    <Spinner className='spinner' />
                </div>
            )}
        </div>
    )
}

export default LinkedReleases
