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
import LinkProjectsModal from '@/components/sw360/LinkedProjectsModal/LinkProjectsModal'
import { LinkedProjectData, ProjectPayload } from '@/object-types'

interface Props {
    projectPayload: ProjectPayload
    setProjectPayload: React.Dispatch<React.SetStateAction<ProjectPayload>>
}

export default function LinkedProjects({ projectPayload, setProjectPayload }: Props): JSX.Element {
    const t = useTranslations('default')
    const [showLinkedProjectsModal, setShowLinkedProjectsModal] = useState(false)
    const [linkedProjectData, setLinkedProjectData] = useState<Map<string, LinkedProjectData>>(new Map())
    const [tableData, setTableData] = useState<
        [
            string,
            LinkedProjectData,
        ][]
    >([])

    const updateProjectData = (projectId: string, updatedProjectRelationship: string) => {
        const _linkedProjectData = new Map(linkedProjectData)

        const existing = _linkedProjectData.get(projectId)
        if (existing) {
            _linkedProjectData.set(projectId, {
                ...existing,
                projectRelationship: updatedProjectRelationship,
            })
        }

        setLinkedProjectData(_linkedProjectData)

        setProjectPayload({
            ...projectPayload,
            linkedProjects: Object.fromEntries(linkedProjectData),
        })
    }

    const handleEnableSvm = (projectId: string) => {
        const _linkedProjectData = new Map(linkedProjectData)

        const existing = _linkedProjectData.get(projectId)
        if (existing) {
            _linkedProjectData.set(projectId, {
                ...existing,
                enableSvm: !existing.enableSvm,
            })
        }

        setLinkedProjectData(_linkedProjectData)

        setProjectPayload({
            ...projectPayload,
            linkedProjects: Object.fromEntries(linkedProjectData),
        })
    }

    const columns = useMemo<
        ColumnDef<
            [
                string,
                LinkedProjectData,
            ]
        >[]
    >(
        () => [
            {
                id: 'name',
                header: t('Name'),
                cell: ({ row }) => <>{row.original[1].name}</>,
                meta: {
                    width: '30%',
                },
            },
            {
                id: 'version',
                header: t('Version'),
                cell: ({ row }) => <>{row.original[1].version}</>,
                meta: {
                    width: '30%',
                },
            },
            {
                id: 'projectRelationship',
                header: t('Project Relationship'),
                cell: ({ row }) => {
                    return (
                        <div className='form-dropdown'>
                            <select
                                className='form-select'
                                value={
                                    linkedProjectData.get(row.original[0])?.projectRelationship ??
                                    row.original[1].projectRelationship
                                }
                                onChange={(event) => {
                                    const updatedProjectRelationship = event.target.value
                                    updateProjectData(row.original[0], updatedProjectRelationship)
                                }}
                                required
                            >
                                <option value='UNKNOWN'>{t('Unknown')}</option>
                                <option value='REFERRED'>{t('Related')}</option>
                                <option value='CONTAINED'>{t('Is a subproject')}</option>
                                <option value='DUPLICATE'>{t('Duplicate')}</option>
                            </select>
                        </div>
                    )
                },
                meta: {
                    width: '30%',
                },
            },
            {
                id: 'enableSvm',
                header: t('Enable SVM'),
                cell: ({ row }) => {
                    return (
                        <div className='text-center'>
                            <div className='form-check'>
                                <input
                                    className='form-check-input'
                                    type='checkbox'
                                    checked={
                                        linkedProjectData.get(row.original[0])?.enableSvm ?? row.original[1].enableSvm
                                    }
                                    onChange={() => handleEnableSvm(row.original[0])}
                                />
                            </div>
                        </div>
                    )
                },
                meta: {
                    width: '10%',
                },
            },
        ],
        [
            t,
            linkedProjectData,
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

    useEffect(() => {
        if (projectPayload.linkedProjects !== undefined && linkedProjectData.size === 0) {
            const data = Object.entries(projectPayload.linkedProjects ?? {})
            setTableData(data)
        } else {
            const data = [
                ...linkedProjectData,
            ]
            setTableData(data)
        }
    }, [
        projectPayload,
        linkedProjectData,
    ])

    return (
        <>
            <LinkProjectsModal
                setLinkedProjectData={setLinkedProjectData}
                projectPayload={projectPayload}
                setProjectPayload={setProjectPayload}
                show={showLinkedProjectsModal}
                setShow={setShowLinkedProjectsModal}
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
                        {t('Linked Projects')}
                        <hr
                            className='my-2 mb-2'
                            style={{
                                color: '#5D8EA9',
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
                            onClick={() => setShowLinkedProjectsModal(true)}
                        >
                            {t('Add Projects')}
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
