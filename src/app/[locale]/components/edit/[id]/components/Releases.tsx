// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { StatusCodes } from 'http-status-codes'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import { Spinner } from 'react-bootstrap'
import { SW360Table } from '@/components/sw360'
import { Embedded, ErrorDetails, LinkedRelease, ReleaseLink } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'

interface Props {
    componentId: string
}

type EmbeddedLinkedReleases = Embedded<LinkedRelease, 'sw360:releaseLinks'>

const Releases = ({ componentId }: Props): ReactNode => {
    const t = useTranslations('default')
    const router = useRouter()
    const session = useSession()

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
                id: 'name',
                header: t('Name'),
                accessorKey: 'name',
                enableSorting: false,
                cell: (info) => info.getValue(),
                meta: {
                    width: '50%',
                },
            },
            {
                id: 'version',
                header: t('Version'),
                cell: ({ row }) => {
                    const { version, id } = row.original
                    return (
                        <Link
                            href={'/components/releases/detail/' + id}
                            className='link'
                        >
                            {version}
                        </Link>
                    )
                },
                meta: {
                    width: '50%',
                },
            },
        ],
        [
            t,
        ],
    )

    const [releaseData, setReleaseData] = useState<ReleaseLink[]>(() => [])
    const memoizedData = useMemo(
        () => releaseData,
        [
            releaseData,
        ],
    )
    const [showProcessing, setShowProcessing] = useState(false)

    useEffect(() => {
        if (session.status === 'loading') return
        const controller = new AbortController()
        const signal = controller.signal

        const timeLimit = releaseData.length !== 0 ? 700 : 0
        const timeout = setTimeout(() => {
            setShowProcessing(true)
        }, timeLimit)

        void (async () => {
            try {
                if (CommonUtils.isNullOrUndefined(session.data)) return signOut()
                const response = await ApiUtils.GET(
                    `components/${componentId}/releases`,
                    session.data.user.access_token,
                    signal,
                )
                if (response.status !== StatusCodes.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new Error(err.message)
                }

                const data = (await response.json()) as EmbeddedLinkedReleases
                setReleaseData(
                    CommonUtils.isNullOrUndefined(data['_embedded']['sw360:releaseLinks'])
                        ? []
                        : data['_embedded']['sw360:releaseLinks'],
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
        componentId,
    ])

    const table = useReactTable({
        data: memoizedData,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    const handleAddReleaseClick = () => {
        router.push(`/components/edit/${componentId}/release/add`)
    }

    return (
        <>
            <div className='mb-3'>
                {table ? (
                    <>
                        <SW360Table
                            table={table}
                            showProcessing={showProcessing}
                        />
                    </>
                ) : (
                    <div className='col-12 mt-1 text-center'>
                        <Spinner className='spinner' />
                    </div>
                )}
            </div>
            <div>
                <button
                    type='button'
                    onClick={() => handleAddReleaseClick()}
                    className={`fw-bold btn btn-secondary`}
                >
                    {t('Add Release')}
                </button>
            </div>
        </>
    )
}

export default Releases
