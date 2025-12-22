// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { type JSX, useEffect, useMemo, useState } from 'react'
import { OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap'
import { FaTrashAlt } from 'react-icons/fa'
import { SW360Table } from '@/components/sw360'
import LinkPackagesModal from '@/components/sw360/LinkedPackagesModal/LinkPackagesModal'
import { LinkedPackageData, ProjectPayload } from '@/object-types'

interface Props {
    projectId?: string
    projectPayload: ProjectPayload
    setProjectPayload: React.Dispatch<React.SetStateAction<ProjectPayload>>
}

export default function LinkedPackages({ projectPayload, setProjectPayload }: Props): JSX.Element {
    const t = useTranslations('default')
    const [showLinkedPackagesModal, setShowLinkedPackagesModal] = useState(false)
    const [tableData, setTableData] = useState<
        [
            string,
            LinkedPackageData,
        ][]
    >([])

    const handleComments = (packageId: string, updatedComment: string) => {
        const _newLinkedPackageData: {
            [key: string]: LinkedPackageData
        } = {}

        for (const [pid, p] of Object.entries(projectPayload.packageIds ?? {})) {
            if (pid === packageId) {
                _newLinkedPackageData[pid] = {
                    ...p,
                    comment: updatedComment,
                }
            } else {
                _newLinkedPackageData[pid] = {
                    ...p,
                }
            }
        }
        setProjectPayload({
            ...projectPayload,
            packageIds: _newLinkedPackageData,
        })
    }

    const columns = useMemo<
        ColumnDef<
            [
                string,
                LinkedPackageData,
            ]
        >[]
    >(
        () => [
            {
                id: 'name',
                header: t('Name'),
                cell: ({ row }) => {
                    const { packageId, name } = row.original[1]
                    return (
                        <Link
                            href={`/packages/detail/${packageId}`}
                            className='text-link'
                        >
                            {name}
                        </Link>
                    )
                },
            },
            {
                id: 'version',
                header: t('Version'),
                cell: ({ row }) => <>{row.original[1].version}</>,
            },
            {
                id: 'license',
                header: t('License'),
                cell: ({ row }) => {
                    const licenseIds = row.original[1].licenseIds ?? []
                    return (
                        <div>
                            {licenseIds.map((licenseId, index) => (
                                <span key={index}>
                                    <Link
                                        className='text-link'
                                        href={`/licenses/detail?id=${licenseId}`}
                                    >
                                        {licenseId}
                                    </Link>
                                    {index !== licenseIds.length - 1 && ', '}
                                </span>
                            ))}
                        </div>
                    )
                },
            },
            {
                id: 'packageManager',
                header: t('Package Manager'),
                cell: ({ row }) => <>{row.original[1].packageManager}</>,
            },
            {
                id: 'comment',
                header: t('Comments'),
                cell: ({ row }) => (
                    <div className='col-lg-9'>
                        <input
                            type='text'
                            className='form-control'
                            value={row.original[1]?.comment ?? ''}
                            onChange={(event) => {
                                const updatedComment = event.target.value
                                handleComments(row.original[0], updatedComment)
                            }}
                        />
                    </div>
                ),
            },
            {
                id: 'deleteLinkedPackage',
                header: t('Actions'),
                cell: ({ row }) => (
                    <OverlayTrigger overlay={<Tooltip>{t('Delete')}</Tooltip>}>
                        <span className='d-inline-block'>
                            <FaTrashAlt
                                className='btn-icon'
                                onClick={() => handleDeletePackage(row.original[0])}
                                style={{
                                    color: 'gray',
                                    fontSize: '18px',
                                }}
                            />
                        </span>
                    </OverlayTrigger>
                ),
            },
        ],
        [
            t,
            projectPayload,
        ],
    )

    const handleDeletePackage = (packageId: string) => {
        const _newLinkedPackageData: {
            [key: string]: LinkedPackageData
        } = {}

        for (const [pid, p] of Object.entries(projectPayload.packageIds ?? {})) {
            if (pid !== packageId) {
                _newLinkedPackageData[pid] = p
            }
        }
        setProjectPayload({
            ...projectPayload,
            packageIds: _newLinkedPackageData,
        })
    }

    useEffect(() => {
        const data = Object.entries(projectPayload.packageIds ?? {})
        setTableData(data)
    }, [
        projectPayload,
    ])

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
            <LinkPackagesModal
                projectPayload={projectPayload}
                setProjectPayload={setProjectPayload}
                show={showLinkedPackagesModal}
                setShow={setShowLinkedPackagesModal}
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
                        {t('LINKED PACKAGES')}
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
                            onClick={() => setShowLinkedPackagesModal(true)}
                        >
                            {t('Add Packages')}
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
