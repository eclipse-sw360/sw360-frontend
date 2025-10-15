// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.
//
// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/
//
// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { StatusCodes } from 'http-status-codes'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { type JSX, useEffect, useMemo, useState } from 'react'
import { OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap'
import { FaPencilAlt } from 'react-icons/fa'
import { ClientSidePageSizeSelector, ClientSideTableFooter, SW360Table } from '@/components/sw360'
import { Embedded, ErrorDetails, LinkedPackage } from '@/object-types'
import MessageService from '@/services/message.service'
import CommonUtils from '@/utils/common.utils'
import { ApiUtils } from '@/utils/index'

interface Props {
    releaseId: string
}

type EmbeddedLinkedPackages = Embedded<LinkedPackage, 'sw360:packages'>

export default function LinkedPackagesTab({ releaseId }: Props): JSX.Element {
    const t = useTranslations('default')
    const session = useSession()

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            void signOut()
        }
    }, [
        session,
    ])

    const columns = useMemo<ColumnDef<LinkedPackage>[]>(
        () => [
            {
                id: 'vendor',
                header: t('Vendor'),
                cell: ({ row }) => (
                    <Link
                        href={`/vendors/${row.original.vendorId}`}
                        className='text-link'
                    >
                        {row.original.vendorName}
                    </Link>
                ),
                meta: {
                    width: '20%',
                },
            },
            {
                id: 'packageName',
                header: t('Package Name Version'),
                cell: ({ row }) => (
                    <Link
                        className='text-link'
                        href={`/packages/detail/${row.original.id}`}
                    >{`${row.original.name} (${row.original.version})`}</Link>
                ),
                meta: {
                    width: '25%',
                },
            },
            {
                id: 'licenses',
                header: t('Licenses'),
                cell: ({ row }) => {
                    const { licenseIds } = row.original
                    return (
                        <div>
                            {Array.isArray(licenseIds) &&
                                licenseIds.length > 0 &&
                                licenseIds.map((licenseId, idx) => (
                                    <span key={licenseId}>
                                        <Link
                                            href={`/licenses/detail?id=${licenseId}`}
                                            className='text-link'
                                        >
                                            {licenseId}
                                        </Link>
                                        {idx !== licenseIds.length - 1 && ', '}
                                    </span>
                                ))}
                        </div>
                    )
                },
                meta: {
                    width: '25%',
                },
            },
            {
                id: 'packageManager',
                header: t('Package Manager'),
                accessorKey: 'packageManager',
                enableSorting: false,
                cell: (info) => info.getValue(),
                meta: {
                    width: '20%',
                },
            },
            {
                id: 'actions',
                header: t('Actions'),
                cell: ({ row }) => {
                    const { id } = row.original
                    return (
                        <span className='d-flex justify-content-evenly'>
                            <OverlayTrigger overlay={<Tooltip>{t('Edit Package')}</Tooltip>}>
                                <Link
                                    href={`/packages/edit/${id}`}
                                    className='overlay-trigger'
                                >
                                    <FaPencilAlt className='btn-icon' />
                                </Link>
                            </OverlayTrigger>
                        </span>
                    )
                },
                meta: {
                    width: '10%',
                },
            },
        ],
        [
            t,
        ],
    )

    const [packagesData, setPackagesData] = useState<LinkedPackage[]>(() => [])
    const memoizedData = useMemo(
        () => packagesData,
        [
            packagesData,
        ],
    )
    const [showProcessing, setShowProcessing] = useState(false)

    useEffect(() => {
        if (session.status === 'loading') return
        const controller = new AbortController()
        const signal = controller.signal

        const timeLimit = packagesData.length !== 0 ? 700 : 0
        const timeout = setTimeout(() => {
            setShowProcessing(true)
        }, timeLimit)

        void (async () => {
            try {
                if (CommonUtils.isNullOrUndefined(session.data)) return signOut()
                const response = await ApiUtils.GET(`releases/${releaseId}`, session.data.user.access_token, signal)
                if (response.status !== StatusCodes.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new Error(err.message)
                }

                const data = (await response.json()) as EmbeddedLinkedPackages
                setPackagesData(
                    CommonUtils.isNullOrUndefined(data['_embedded']['sw360:packages'])
                        ? []
                        : data['_embedded']['sw360:packages'],
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
    ])

    const table = useReactTable({
        data: memoizedData,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <div className='mb-3'>
            {table ? (
                <>
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
