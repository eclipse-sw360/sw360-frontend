// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'
import { type JSX, useCallback, useEffect, useMemo, useState } from 'react'
import { Spinner } from 'react-bootstrap'
import { FaTrashAlt } from 'react-icons/fa'
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
    const [tableData, setTableData] = useState<
        [
            string,
            LinkedProjectData,
        ][]
    >([])

    const updateProjectData = useCallback(
        (projectId: string, updatedProjectRelationship: string) => {
            setProjectPayload((prev) => {
                if (!prev.linkedProjects) return prev

                return {
                    ...prev,
                    linkedProjects: {
                        ...prev.linkedProjects,
                        [projectId]: {
                            ...prev.linkedProjects[projectId],
                            projectRelationship: updatedProjectRelationship,
                        },
                    },
                }
            })
        },
        [
            setProjectPayload,
        ],
    )

    const handleEnableSvm = useCallback(
        (projectId: string) => {
            setProjectPayload((prev) => {
                if (!prev.linkedProjects) return prev

                return {
                    ...prev,
                    linkedProjects: {
                        ...prev.linkedProjects,
                        [projectId]: {
                            ...prev.linkedProjects[projectId],
                            enableSvm: !prev.linkedProjects[projectId].enableSvm,
                        },
                    },
                }
            })
        },
        [
            setProjectPayload,
        ],
    )

    const handleClickDelete = useCallback(
        (projectId: string) => {
            setProjectPayload((prev) => {
                if (!prev.linkedProjects) return prev

                const { [projectId]: _, ...remainingProjects } = prev.linkedProjects

                return {
                    ...prev,
                    linkedProjects: remainingProjects,
                }
            })
        },
        [
            setProjectPayload,
        ],
    )

    useEffect(() => {
        const data = Object.entries(projectPayload.linkedProjects ?? {})
        setTableData(data)
    }, [
        projectPayload.linkedProjects,
    ])

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
                    width: '25%',
                },
            },
            {
                id: 'version',
                header: t('Version'),
                cell: ({ row }) => <>{row.original[1].version}</>,
                meta: {
                    width: '20%',
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
                                value={row.original[1].projectRelationship}
                                onChange={(event) => {
                                    updateProjectData(row.original[0], event.target.value)
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
                    width: '25%',
                },
            },
            {
                id: 'enableSvm',
                header: t('Enable SVM'),
                cell: ({ row }) => {
                    return (
                        <div className='text-center'>
                            <div className='form-check d-flex justify-content-center'>
                                <input
                                    className='form-check-input'
                                    type='checkbox'
                                    checked={row.original[1].enableSvm ?? false}
                                    onChange={() => handleEnableSvm(row.original[0])}
                                />
                            </div>
                        </div>
                    )
                },
                meta: {
                    width: '15%',
                },
            },
            {
                id: 'actions',
                header: '',
                cell: ({ row }) => (
                    <div className='d-flex justify-content-center'>
                        <button
                            type='button'
                            className='btn btn-secondary'
                            style={{
                                border: 'none',
                                minWidth: 'fit-content',
                            }}
                            onClick={() => handleClickDelete(row.original[0])}
                            title={t('Delete')}
                            aria-label={t('Delete')}
                        >
                            <FaTrashAlt />
                        </button>
                    </div>
                ),
                meta: {
                    width: '15%',
                },
            },
        ],
        [
            t,
            updateProjectData,
            handleEnableSvm,
            handleClickDelete,
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
            <LinkProjectsModal
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
