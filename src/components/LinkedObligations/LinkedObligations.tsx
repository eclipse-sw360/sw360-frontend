// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import { ColumnDef, getCoreRowModel, getExpandedRowModel, useReactTable } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'
import { PaddedCell, SW360Table } from 'next-sw360'
import { type JSX, useMemo, useState } from 'react'
import { Spinner } from 'react-bootstrap'
import { BsFillTrashFill } from 'react-icons/bs'
import { LicensePayload, NestedRows, Obligation } from '@/object-types'
import DeleteObligationDialog from './TableLinkedObligations/DeleteObligationDialog'

interface Props {
    licensePayload: LicensePayload
    setLicensePayload: React.Dispatch<React.SetStateAction<LicensePayload>>
}

const Capitalize = (text: string) =>
    text.split('_').reduce((s, c) => s + ' ' + (c.charAt(0) + c.substring(1).toLocaleLowerCase()), '')

const LinkedObligations = ({ licensePayload, setLicensePayload }: Props): JSX.Element => {
    const t = useTranslations('default')
    const [obligationToBeRemoved, setObligationToBeRemoved] = useState<Obligation | undefined>()
    const columns = useMemo<ColumnDef<NestedRows<Obligation>>[]>(
        () => [
            {
                id: 'expand',
                cell: ({ row }) => {
                    if (row.depth > 0) {
                        return <p>{row.original.node?.text ?? ''}</p>
                    } else {
                        return <PaddedCell row={row}></PaddedCell>
                    }
                },
                meta: {
                    width: '3%',
                },
            },
            {
                id: 'title',
                header: t('Obligation Title'),
                cell: ({ row }) => <>{row.original.node?.title ?? ''}</>,
            },
            {
                id: 'type',
                header: t('Obligation Type'),
                cell: ({ row }) => <>{Capitalize(row.original.node?.obligationType ?? '')}</>,
            },
            {
                id: 'actions',
                header: t('Actions'),
                cell: ({ row }) => {
                    return (
                        <span className='d-flex justify-content-evenly'>
                            <span className='d-inline-block'>
                                <BsFillTrashFill
                                    className='btn-icon'
                                    size={20}
                                    onClick={() => setObligationToBeRemoved(row.original.node)}
                                />
                            </span>
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

    const data = useMemo(
        () =>
            (licensePayload.obligations ?? []).map(
                (ob) =>
                    ({
                        node: ob,
                        children: [
                            {
                                node: ob,
                            },
                        ],
                    }) as NestedRows<Obligation>,
            ),
        [
            licensePayload.obligations,
        ],
    )

    const table = useReactTable({
        data,
        columns: columns,
        getCoreRowModel: getCoreRowModel(),

        // expand config
        getExpandedRowModel: getExpandedRowModel(),
        getSubRows: (row) => row.children ?? [],
        getRowCanExpand: (row) => {
            if (row.depth === 1) {
                row.meta = {
                    isFullSpanRow: true,
                }
            }
            return row.depth === 0
        },
    })

    table.getRowModel().rows.forEach((row) => {
        if (row.depth === 1) {
            row.meta = {
                isFullSpanRow: true,
            }
        }
    })

    return (
        <>
            <DeleteObligationDialog
                obligation={obligationToBeRemoved}
                setObligationToBeRemoved={setObligationToBeRemoved}
                setLicensePayload={setLicensePayload}
                licensePayload={licensePayload}
            />
            <div className='mb-3'>
                {table ? (
                    <SW360Table
                        table={table}
                        showProcessing={false}
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

export default LinkedObligations
