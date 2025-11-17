// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { type JSX, ReactNode, useMemo } from 'react'
import { Spinner } from 'react-bootstrap'
import { Component } from '@/object-types'
import { SW360Table } from '../sw360'
import styles from './ResourceUsing.module.css'

interface Props {
    componentsUsing: Array<Component>
    documentName: string
    showProcessing: boolean
}

const ComponentsUsing = ({ componentsUsing, documentName, showProcessing }: Props): JSX.Element => {
    const t = useTranslations('default')

    const columns = useMemo<ColumnDef<Component>[]>(
        () => [
            {
                id: 'vendor',
                header: t('Vendor'),
                accessorKey: 'vendor',
                cell: (info) => info.getValue(),
                enableSorting: false,
                meta: {
                    width: '20%',
                },
            },
            {
                id: 'name',
                header: t('Component Name'),
                cell: ({ row }) => {
                    const { name, id } = row.original
                    return (
                        <Link
                            href={`/components/detail/${id}`}
                            className='text-link'
                        >
                            {name}
                        </Link>
                    )
                },
                meta: {
                    width: '30%',
                },
            },
            {
                id: 'mainLicenses',
                header: t('Main licenses'),
                cell: ({ row }) => {
                    return (
                        <>
                            {row.original.mainLicenseIds?.map(
                                (lic, i): ReactNode => (
                                    <>
                                        <Link
                                            key={lic}
                                            className='link'
                                            href={`/licenses/detail/?id=${lic}`}
                                        >
                                            {lic}
                                        </Link>
                                        {i !== (row.original.mainLicenseIds?.length ?? 0) - 1 && ', '}
                                    </>
                                ),
                            )}
                        </>
                    )
                },
                meta: {
                    width: '25%',
                },
            },
            {
                id: 'type',
                header: t('Component Type'),
                cell: ({ row }) => <>{row.original.componentType}</>,
                meta: {
                    width: '25%',
                },
            },
        ],
        [
            t,
        ],
    )

    const memoizedData = useMemo(
        () => componentsUsing,
        [
            componentsUsing,
        ],
    )

    const table = useReactTable({
        data: memoizedData,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <>
            <h5 id={styles['upper-case-title']}>{`${documentName} ${t('IS USED BY THE FOLLOWING COMPONENTS')}`}</h5>
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
        </>
    )
}

export default ComponentsUsing
