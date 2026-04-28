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
import { useTranslations } from 'next-intl'
import { type JSX, useCallback, useMemo } from 'react'
import { FaTrashAlt } from 'react-icons/fa'
import { SW360Table } from '@/components/sw360'
import { ReleaseLink } from '@/object-types'

interface Props {
    setReleaseLinks: React.Dispatch<React.SetStateAction<ReleaseLink[]>>
    releaseLinks: ReleaseLink[]
    setReleaseIdToRelationshipsToReleasePayLoad: (releaseIdToRelationships: Map<string, string>) => void
}

export default function TableLinkedReleases({
    releaseLinks,
    setReleaseLinks,
    setReleaseIdToRelationshipsToReleasePayLoad,
}: Props): JSX.Element {
    const t = useTranslations('default')

    const updateReleaseRelationship = useCallback(
        (releaseId: string, updatedReleaseRelationship: string) => {
            const updated = releaseLinks.map((item) =>
                item.id === releaseId
                    ? {
                          ...item,
                          releaseRelationship: updatedReleaseRelationship,
                      }
                    : item,
            )
            setReleaseLinks(updated)

            const map = new Map<string, string>()
            updated.forEach((item) => {
                map.set(item.id, item.releaseRelationship)
            })
            setReleaseIdToRelationshipsToReleasePayLoad(map)
        },
        [
            releaseLinks,
            setReleaseLinks,
            setReleaseIdToRelationshipsToReleasePayLoad,
        ],
    )

    const handleClickDelete = useCallback(
        (releaseId: string) => {
            const updated = releaseLinks.filter((item) => item.id !== releaseId)
            setReleaseLinks(updated)

            const map = new Map<string, string>()
            updated.forEach((item) => {
                map.set(item.id, item.releaseRelationship)
            })
            setReleaseIdToRelationshipsToReleasePayLoad(map)
        },
        [
            releaseLinks,
            setReleaseLinks,
            setReleaseIdToRelationshipsToReleasePayLoad,
        ],
    )

    const columns = useMemo<ColumnDef<ReleaseLink>[]>(
        () => [
            {
                id: 'vendor',
                header: t('Vendor'),
                cell: ({ row }) => <>{row.original.vendor}</>,
                meta: {
                    width: '23%',
                },
            },
            {
                id: 'name',
                header: t('Name'),
                cell: ({ row }) => <>{row.original.name}</>,
                meta: {
                    width: '23%',
                },
            },
            {
                id: 'version',
                header: t('Version'),
                cell: ({ row }) => <>{row.original.version}</>,
                meta: {
                    width: '23%',
                },
            },
            {
                id: 'releaseRelationship',
                header: t('Release Relation'),
                cell: ({ row }) => (
                    <div className='form-dropdown'>
                        <select
                            className='form-select'
                            value={row.original.releaseRelationship}
                            onChange={(event) => {
                                updateReleaseRelationship(row.original.id, event.target.value)
                            }}
                            required
                        >
                            <option value='CONTAINED'>{t('CONTAINED')}</option>
                            <option value='REFERRED'>{t('REFERRED')}</option>
                            <option value='UNKNOWN'>{t('UNKNOWN')}</option>
                            <option value='DYNAMICALLY_LINKED'>{t('DYNAMICALLY_LINKED')}</option>
                            <option value='STATICALLY_LINKED'>{t('STATICALLY_LINKED')}</option>
                            <option value='SIDE_BY_SIDE'>{t('SIDE_BY_SIDE')}</option>
                            <option value='STANDALONE'>{t('STANDALONE')}</option>
                            <option value='INTERNAL_USE'>{t('INTERNAL_USE')}</option>
                            <option value='OPTIONAL'>{t('OPTIONAL')}</option>
                            <option value='TO_BE_REPLACED'>{t('TO_BE_REPLACED')}</option>
                            <option value='CODE_SNIPPET'>{t('CODE_SNIPPET')}</option>
                        </select>
                    </div>
                ),
                meta: {
                    width: '23%',
                },
            },
            {
                id: 'actions',
                header: t('Actions'),
                cell: ({ row }) => (
                    <button
                        type='button'
                        className='btn btn-secondary p-0 border-0 d-inline-flex align-items-center justify-content-center'
                        onClick={() => handleClickDelete(row.original.id)}
                        title={t('Delete')}
                        aria-label={t('Delete linked release')}
                    >
                        <FaTrashAlt />
                    </button>
                ),
                meta: {
                    width: '8%',
                },
            },
        ],
        [
            t,
            updateReleaseRelationship,
            handleClickDelete,
        ],
    )

    const memoizedData = useMemo(
        () => releaseLinks,
        [
            releaseLinks,
        ],
    )

    const table = useReactTable({
        data: memoizedData,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    if (releaseLinks.length === 0) {
        return <></>
    }

    return (
        <>
            <SW360Table
                table={table}
                showProcessing={false}
            />
        </>
    )
}
