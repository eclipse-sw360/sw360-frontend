// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ColumnDef, getCoreRowModel, getSortedRowModel, SortingState, useReactTable } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'
import { type JSX, useCallback, useEffect, useMemo, useState } from 'react'
import { FaTrashAlt } from 'react-icons/fa'
import DeleteReleseLinkConfirmationModal from '@/app/[locale]/projects/components/UnlinkReleaseDialog'
import { SW360Table } from '@/components/sw360'
import SearchReleasesModal from '@/components/sw360/SearchReleasesModal'
import { LinkedReleaseData, MainlineState, ProjectPayload, ReleaseDetail, ReleaseRelationship } from '@/object-types'
import CommonUtils from '@/utils/common.utils'

interface Props {
    projectPayload: ProjectPayload
    setProjectPayload: React.Dispatch<React.SetStateAction<ProjectPayload>>
    isReleaseLoading?: boolean
}

export default function LinkedReleases({
    projectPayload,
    setProjectPayload,
    isReleaseLoading = false,
}: Props): JSX.Element {
    const t = useTranslations('default')
    const [showLinkedReleasesModal, setShowLinkedReleasesModal] = useState(false)
    const [sorting, setSorting] = useState<SortingState>([
        {
            id: 'name',
            desc: false,
        },
    ])
    const [tableData, setTableData] = useState<
        [
            string,
            LinkedReleaseData,
        ][]
    >([])
    const [releaseToBeDeleted, setReleaseToBeDeleted] = useState<
        | [
              string,
              LinkedReleaseData,
          ]
        | undefined
    >(undefined)

    const updateReleaseRelation = useCallback(
        (releaseId: string, updatedReleaseRelation: string) => {
            setProjectPayload((prev) => {
                if (!prev.linkedReleases) return prev

                return {
                    ...prev,
                    linkedReleases: {
                        ...prev.linkedReleases,
                        [releaseId]: {
                            ...prev.linkedReleases[releaseId],
                            releaseRelation:
                                Object.values(ReleaseRelationship).find(
                                    (relation) => relation === updatedReleaseRelation,
                                ) ?? ReleaseRelationship.CONTAINED,
                        },
                    },
                }
            })
        },
        [
            setProjectPayload,
        ],
    )

    const updateProjectMainlineState = useCallback(
        (releaseId: string, updatedProjectMainlineState: string) => {
            setProjectPayload((prev) => {
                if (!prev.linkedReleases) return prev

                return {
                    ...prev,
                    linkedReleases: {
                        ...prev.linkedReleases,
                        [releaseId]: {
                            ...prev.linkedReleases[releaseId],
                            mainlineState:
                                Object.values(MainlineState).find((state) => state === updatedProjectMainlineState) ??
                                MainlineState.OPEN,
                        },
                    },
                }
            })
        },
        [
            setProjectPayload,
        ],
    )

    const handleComments = useCallback(
        (releaseId: string, updatedComment: string) => {
            setProjectPayload((prev) => {
                if (!prev.linkedReleases) return prev

                return {
                    ...prev,
                    linkedReleases: {
                        ...prev.linkedReleases,
                        [releaseId]: {
                            ...prev.linkedReleases[releaseId],
                            comment: updatedComment,
                        },
                    },
                }
            })
        },
        [
            setProjectPayload,
        ],
    )

    const handleSelectReleases = useCallback(
        (selectedReleases: ReleaseDetail[]) => {
            const newLinkedReleases: Record<string, LinkedReleaseData> = {}
            selectedReleases.forEach((release) => {
                if (release.id) {
                    newLinkedReleases[release.id] = {
                        name: release.name ?? '',
                        version: release.version ?? '',
                        mainlineState: release.mainlineState ?? MainlineState.OPEN,
                        releaseRelation: ReleaseRelationship.UNKNOWN,
                        comment: '',
                    }
                }
            })

            setProjectPayload((prev) => ({
                ...prev,
                linkedReleases: {
                    ...prev.linkedReleases,
                    ...newLinkedReleases,
                },
            }))
        },
        [
            setProjectPayload,
        ],
    )

    useEffect(() => {
        const data = Object.entries(projectPayload.linkedReleases ?? {})
        setTableData(data)
    }, [
        projectPayload.linkedReleases,
    ])

    const columns = useMemo<
        ColumnDef<
            [
                string,
                LinkedReleaseData,
            ]
        >[]
    >(
        () => [
            {
                id: 'name',
                header: t('Release Name'),
                accessorFn: (row) => row[1].name,
                cell: ({ row }) => <>{row.original[1].name}</>,
            },
            {
                id: 'version',
                header: t('Release Version'),
                cell: ({ row }) => <>{row.original[1].version}</>,
            },
            {
                id: 'releaseRelation',
                header: t('Release Relation'),
                cell: ({ row }) => (
                    <div className='form-dropdown'>
                        <select
                            className='form-select'
                            value={row.original[1].releaseRelation}
                            onChange={(event) => {
                                updateReleaseRelation(row.original[0], event.target.value)
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
            },
            {
                id: 'mainlineState',
                header: t('Project Mainline State'),
                cell: ({ row }) => (
                    <div className='form-dropdown'>
                        <select
                            className='form-select'
                            value={row.original[1].mainlineState}
                            onChange={(event) => {
                                updateProjectMainlineState(row.original[0], event.target.value)
                            }}
                            required
                        >
                            {Object.values(MainlineState).map((state) => (
                                <option
                                    key={state}
                                    value={state}
                                    title={t(`mainline_state_${state ? state.toLowerCase() : 'open'}_tooltip`)}
                                >
                                    {CommonUtils.Capitalize(state)}
                                </option>
                            ))}
                        </select>
                    </div>
                ),
            },
            {
                id: 'comment',
                header: t('Comments'),
                cell: ({ row }) => (
                    <div className='d-flex align-items-center'>
                        <input
                            type='text'
                            className='form-control me-2'
                            placeholder='Enter Comments'
                            value={row.original[1].comment ?? ''}
                            onChange={(event) => {
                                handleComments(row.original[0], event.target.value)
                            }}
                        />
                        <button
                            type='button'
                            className='btn btn-secondary'
                            style={{
                                border: 'none',
                                minWidth: 'fit-content',
                            }}
                            onClick={() => setReleaseToBeDeleted(row.original)}
                            title={t('Delete')}
                            aria-label={t('Delete linked release')}
                        >
                            <FaTrashAlt />
                        </button>
                    </div>
                ),
            },
        ],
        [
            t,
            updateReleaseRelation,
            updateProjectMainlineState,
            handleComments,
        ],
    )

    const memoizedData = useMemo(
        () => tableData,
        [
            tableData,
        ],
    )
    const table = useReactTable({
        state: {
            sorting,
        },
        data: memoizedData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
    })

    return (
        <>
            <SearchReleasesModal
                show={showLinkedReleasesModal}
                setShow={setShowLinkedReleasesModal}
                onSelect={handleSelectReleases}
            />
            <DeleteReleseLinkConfirmationModal
                release={releaseToBeDeleted}
                setRelease={setReleaseToBeDeleted}
                setProjectPayload={setProjectPayload}
            />
            <div className='row mb-4'>
                <div className='row header-1'>
                    <h6
                        className='fw-medium'
                        style={{
                            color: '#5D8EA9',
                            paddingLeft: '0px',
                        }}
                    >
                        {t('LINKED RELEASES')}
                        <hr
                            className='my-2 mb-2'
                            style={{
                                color: '#5D8EA9',
                                paddingLeft: '0px',
                            }}
                        />
                    </h6>
                </div>
                <div className='mb-3'>
                    <SW360Table
                        table={table}
                        showProcessing={isReleaseLoading}
                    />
                </div>
                <div
                    className='row'
                    style={{
                        paddingLeft: '0px',
                    }}
                >
                    <div className='col-lg-4'>
                        <button
                            type='button'
                            className='btn btn-secondary'
                            onClick={() => setShowLinkedReleasesModal(true)}
                        >
                            {t('Add Releases')}
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
