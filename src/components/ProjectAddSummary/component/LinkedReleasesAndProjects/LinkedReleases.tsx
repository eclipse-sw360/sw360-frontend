// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'
import { type JSX, useEffect, useMemo, useState } from 'react'
import { Spinner } from 'react-bootstrap'
import { SW360Table } from '@/components/sw360'
import LinkedReleasesModal from '@/components/sw360/LinkedReleasesModal/LinkedReleasesModal'
import { ProjectPayload } from '@/object-types'

interface Props {
    projectPayload: ProjectPayload
    existingReleaseData: Map<string, LinkedReleaseData> | undefined
    setProjectPayload: React.Dispatch<React.SetStateAction<ProjectPayload>>
}

interface LinkedReleaseData {
    comment?: string
    mainlineState: string
    name: string
    releaseRelation: string
    version: string
}

export default function LinkedReleases({ projectPayload, existingReleaseData, setProjectPayload }: Props): JSX.Element {
    const t = useTranslations('default')
    const [showLinkedReleasesModal, setShowLinkedReleasesModal] = useState(false)
    const [linkedReleaseData, setLinkedReleaseData] = useState<Map<string, LinkedReleaseData>>(new Map())
    const [tableData, setTableData] = useState<
        [
            string,
            LinkedReleaseData,
        ][]
    >([])

    const updateReleaseRelation = (
        releaseId: string,
        updatedReleaseRelation: string,
        linkedReleaseData: Map<string, LinkedReleaseData>,
    ) => {
        const _linkedReleaseData = new Map(linkedReleaseData)

        const existing = _linkedReleaseData.get(releaseId)
        if (existing) {
            _linkedReleaseData.set(releaseId, {
                ...existing,
                releaseRelation: updatedReleaseRelation,
            })
        }

        setLinkedReleaseData(_linkedReleaseData)
    }

    const updateProjectMainlineState = (
        releaseId: string,
        updatedProjectMainlineState: string,
        linkedReleaseData: Map<string, LinkedReleaseData>,
    ) => {
        const _linkedReleaseData = new Map(linkedReleaseData)

        const existing = _linkedReleaseData.get(releaseId)
        if (existing) {
            _linkedReleaseData.set(releaseId, {
                ...existing,
                mainlineState: updatedProjectMainlineState,
            })
        }

        setLinkedReleaseData(_linkedReleaseData)
    }

    const handleComments = (
        releaseId: string,
        updatedComment: string,
        linkedReleaseData: Map<string, LinkedReleaseData>,
    ) => {
        const _linkedReleaseData = new Map(linkedReleaseData)

        const existing = _linkedReleaseData.get(releaseId)
        if (existing) {
            _linkedReleaseData.set(releaseId, {
                ...existing,
                comment: updatedComment,
            })
        }

        setLinkedReleaseData(_linkedReleaseData)
    }

    useEffect(() => {
        if (existingReleaseData !== undefined && linkedReleaseData.size === 0) {
            const data = [
                ...existingReleaseData,
            ]
            setTableData(data)
            setLinkedReleaseData(existingReleaseData)
        } else {
            const data = [
                ...linkedReleaseData,
            ]
            setTableData(data)
            setProjectPayload({
                ...projectPayload,
                linkedReleases: Object.fromEntries(linkedReleaseData),
            })
        }
    }, [
        existingReleaseData,
        linkedReleaseData,
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
                            value={
                                linkedReleaseData.get(row.original[0])?.releaseRelation ??
                                row.original[1].releaseRelation
                            }
                            onChange={(event) => {
                                const updatedReleaseRelationStatus = event.target.value
                                updateReleaseRelation(row.original[0], updatedReleaseRelationStatus, linkedReleaseData)
                            }}
                            required
                        >
                            <option value='UNKNOWN'>{t('Unknown')}</option>
                            <option value='CONTAINED'>{t('Contained')}</option>
                            <option value='REFERRED'>{t('Related')}</option>
                            <option value='DYNAMICALLY_LINKED'>{t('Dynamically linked')}</option>
                            <option value='STATICALLY_LINKED'>{t('Statically linked')}</option>
                            <option value='SIDE_BY_SIDE'>{t('Side by side')}</option>
                            <option value='STANDALONE'>{t('Standalone')}</option>
                            <option value='INTERNAL_USE'>{t('Internal use')}</option>
                            <option value='OPTIONAL'>{t('Optional')}</option>
                            <option value='TO_BE_REPLACED'>{t('To be replaced')}</option>
                            <option value='CODE_SNIPPET'>{t('Code snippet')}</option>
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
                            value={
                                linkedReleaseData.get(row.original[0])?.mainlineState ?? row.original[1].mainlineState
                            }
                            onChange={(event) => {
                                const updatedProjectMainlineState = event.target.value
                                updateProjectMainlineState(
                                    row.original[0],
                                    updatedProjectMainlineState,
                                    linkedReleaseData,
                                )
                            }}
                            required
                        >
                            <option value='OPEN'>{t('Open')}</option>
                            <option value='MAINLINE'>{t('Mainline')}</option>
                            <option value='SPECIFIC'>{t('Specific')}</option>
                            <option value='PHASEOUT'>{t('Phaseout')}</option>
                            <option value='DENIED'>{t('Denied')}</option>
                        </select>
                    </div>
                ),
            },
            {
                id: 'comment',
                name: t('Comments'),
                cell: ({ row }) => (
                    <div className='col-lg-9'>
                        <input
                            type='text'
                            className='form-control'
                            placeholder='Enter Comments'
                            value={linkedReleaseData.get(row.original[0])?.comment ?? row.original[1].comment}
                            onChange={(event) => {
                                const updatedComment = event.target.value
                                handleComments(row.original[0], updatedComment, linkedReleaseData)
                            }}
                        />
                    </div>
                ),
            },
        ],
        [
            t,
            linkedReleaseData,
        ],
    )

    const memoizedData = useMemo(
        () => tableData,
        [
            tableData,
        ],
    )
    const table = useReactTable({
        data: memoizedData,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <>
            <LinkedReleasesModal
                setLinkedReleaseData={setLinkedReleaseData}
                projectPayload={projectPayload}
                setProjectPayload={setProjectPayload}
                show={showLinkedReleasesModal}
                setShow={setShowLinkedReleasesModal}
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
                            {t('Link Releases')}
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
