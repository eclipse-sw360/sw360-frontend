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
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { type Dispatch, type JSX, type SetStateAction, useCallback, useEffect, useMemo, useState } from 'react'
import { FaTrashAlt } from 'react-icons/fa'
import { SW360Table } from '@/components/sw360'
import { ActionType, Release, ReleaseDetail, ReleaseLink } from '@/object-types'
import { CommonUtils } from '@/utils'
import SearchReleasesModal from '../sw360/SearchReleasesModal'

interface Props {
    release?: ReleaseDetail
    actionType?: string
    releasePayload: Release
    setReleasePayload: Dispatch<SetStateAction<Release>>
}

const LinkedReleases = ({ release, actionType, releasePayload, setReleasePayload }: Props): JSX.Element => {
    const t = useTranslations('default')
    const [releaseLinks, setReleaseLinks] = useState<ReleaseLink[]>([])
    const [linkedReleasesDiaglog, setLinkedReleasesDiaglog] = useState(false)
    const { status } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [
        status,
    ])

    const setReleaseIdToRelationshipsToReleasePayLoad = useCallback(
        (releaseIdToRelationships: Map<string, string>) => {
            const obj = Object.fromEntries(releaseIdToRelationships)
            setReleasePayload({
                ...releasePayload,
                releaseIdToRelationship: obj,
            })
        },
        [
            releasePayload,
            setReleasePayload,
        ],
    )

    const updateReleaseRelationship = useCallback(
        (releaseId: string, updatedReleaseRelationship: string) => {
            setReleaseLinks((currentReleaseLinks) => {
                const updatedReleaseLinks = currentReleaseLinks.map((item) =>
                    item.id === releaseId
                        ? {
                              ...item,
                              releaseRelationship: updatedReleaseRelationship,
                          }
                        : item,
                )

                const mapReleaseRelationship = new Map<string, string>()
                updatedReleaseLinks.forEach((item) => {
                    mapReleaseRelationship.set(item.id, item.releaseRelationship)
                })
                setReleaseIdToRelationshipsToReleasePayLoad(mapReleaseRelationship)

                return updatedReleaseLinks
            })
        },
        [
            setReleaseIdToRelationshipsToReleasePayLoad,
        ],
    )

    const handleClickDelete = useCallback(
        (releaseId: string) => {
            setReleaseLinks((currentReleaseLinks) => {
                const updatedReleaseLinks = currentReleaseLinks.filter((item) => item.id !== releaseId)

                const mapReleaseRelationship = new Map<string, string>()
                updatedReleaseLinks.forEach((item) => {
                    mapReleaseRelationship.set(item.id, item.releaseRelationship)
                })
                setReleaseIdToRelationshipsToReleasePayLoad(mapReleaseRelationship)

                return updatedReleaseLinks
            })
        },
        [
            setReleaseIdToRelationshipsToReleasePayLoad,
        ],
    )

    const handleSelectReleases = useCallback(
        (selectedReleases: ReleaseDetail[]) => {
            const newReleaseLinks: ReleaseLink[] = selectedReleases.map((release: ReleaseDetail) => ({
                id: release.id ?? '',
                name: release.name,
                version: release.version,
                mainlineState: release.mainlineState,
                clearingState: release.clearingState,
                vendor: release.vendor ? release.vendor.fullName : '',
                releaseRelationship: 'CONTAINED',
            }))

            setReleaseLinks((currentReleaseLinks) => {
                const updatedReleaseLinks = [
                    ...currentReleaseLinks,
                    ...newReleaseLinks,
                ]

                const mapReleaseRelationship = new Map<string, string>()
                updatedReleaseLinks.forEach((item) => {
                    mapReleaseRelationship.set(item.id, item.releaseRelationship)
                })
                setReleaseIdToRelationshipsToReleasePayLoad(mapReleaseRelationship)

                return updatedReleaseLinks
            })
        },
        [
            setReleaseIdToRelationshipsToReleasePayLoad,
        ],
    )

    useEffect(() => {
        if (actionType === ActionType.EDIT && release !== undefined) {
            if (
                !CommonUtils.isNullOrUndefined(release['_embedded']) &&
                !CommonUtils.isNullOrUndefined(release['_embedded']['sw360:releaseLinks'])
            ) {
                setReleaseLinks(release['_embedded']['sw360:releaseLinks'])
            }
        }
    }, [
        actionType,
        release,
    ])

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
            handleClickDelete,
            updateReleaseRelationship,
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

    return (
        <>
            <SearchReleasesModal
                show={linkedReleasesDiaglog}
                setShow={setLinkedReleasesDiaglog}
                onSelect={handleSelectReleases}
                showExactMatch={false}
            />
            <div className='row mb-4'>
                <h6 className='header-underlined mb-2'>{t('LINKED RELEASES')}</h6>
                <div className='mb-3'>
                    {table ? (
                        <SW360Table
                            table={table}
                            showProcessing={false}
                        />
                    ) : (
                        <div className='col-12 mt-1 text-center'>
                            <div
                                className='spinner-border spinner'
                                role='status'
                            />
                        </div>
                    )}
                </div>
                <div className='row p-0'>
                    <div className='col-lg-4'>
                        <button
                            type='button'
                            className='btn btn-secondary'
                            onClick={() => setLinkedReleasesDiaglog(true)}
                        >
                            {t('Click to add Releases')}
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default LinkedReleases
