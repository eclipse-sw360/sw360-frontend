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
import { ReleaseLink, ReleaseRelationship } from '@/object-types'
import CommonUtils from '@/utils/common.utils'

interface Props {
    setReleaseLinks: React.Dispatch<React.SetStateAction<ReleaseLink[]>>
    releaseLinks: ReleaseLink[]
    setReleaseIdToRelationshipsToReleasePayLoad: (releaseIdToRelationships: Map<string, ReleaseRelationship>) => void
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
                          releaseRelationship:
                              Object.values(ReleaseRelationship).find(
                                  (relation) => relation === updatedReleaseRelationship,
                              ) ?? ReleaseRelationship.CONTAINED,
                      }
                    : item,
            )
            setReleaseLinks(updated)

            const map = new Map<string, ReleaseRelationship>()
            updated.forEach((item) => {
                map.set(item.id, item.releaseRelationship ?? ReleaseRelationship.UNKNOWN)
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

            const map = new Map<string, ReleaseRelationship>()
            updated.forEach((item) => {
                map.set(item.id, item.releaseRelationship ?? ReleaseRelationship.UNKNOWN)
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
                            {Object.values(ReleaseRelationship).map((rel) => {
                                let tag = CommonUtils.Capitalize(rel)
                                if (rel === ReleaseRelationship.REFERRED) {
                                    tag = 'Related'
                                }

                                return (
                                    <option
                                        key={rel}
                                        value={rel}
                                        title={t(`release_relation_${rel ? rel.toLowerCase() : 'contained'}_tooltip`)}
                                    >
                                        {tag}
                                    </option>
                                )
                            })}
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

    // Always render the table. Let SW360Table show an empty state when there are
    // no releases so users see the table structure instead of nothing.

    return (
        <>
            <SW360Table
                table={table}
                showProcessing={false}
            />
        </>
    )
}
