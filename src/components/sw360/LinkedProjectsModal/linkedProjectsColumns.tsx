// Copyright (C) SW360 Frontend Authors (see <https://github.com/eclipse-sw360/sw360-frontend/blob/main/NOTICE>)

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ColumnDef } from '@tanstack/react-table'
import Link from 'next/link'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import { Project } from '@/object-types'
import { CommonUtils } from '@/utils'

const capitalize = (text: string) =>
    text.split('_').reduce((s, c) => s + ' ' + (c.charAt(0) + c.substring(1).toLocaleLowerCase()), '')

export interface LinkedProjectsColumnsConfig {
    t: (key: string) => string
    selectedProjectIds: Set<string>
    onToggleProject: (project: Project) => void
    getProjectId: (project: Project) => string
    nameHeader?: string
    combineNameAndVersion?: boolean
}

export const createLinkedProjectsColumns = ({
    t,
    selectedProjectIds,
    onToggleProject,
    getProjectId,
    nameHeader = 'Name',
    combineNameAndVersion = false,
}: LinkedProjectsColumnsConfig): ColumnDef<Project>[] => [
    {
        id: 'selectProjectCheckbox',
        cell: ({ row }) => (
            <input
                className='form-check-input'
                type='checkbox'
                checked={selectedProjectIds.has(getProjectId(row.original))}
                onChange={() => onToggleProject(row.original)}
            />
        ),
        meta: {
            width: '7%',
        },
    },
    {
        id: 'name',
        header: t(nameHeader),
        accessorKey: 'name',
        cell: ({ row, getValue }) => {
            if (!combineNameAndVersion) {
                return getValue()
            }
            const { name, version } = row.original
            return (
                <p>
                    {name} {!CommonUtils.isNullEmptyOrUndefinedString(version) && `(${version})`}
                </p>
            )
        },
        meta: {
            width: '15%',
        },
    },
    {
        id: 'version',
        header: t('Version'),
        accessorKey: 'version',
        cell: (info) => info.getValue(),
        meta: {
            width: '15%',
        },
    },
    {
        id: 'state',
        header: t('State'),
        accessorKey: 'state',
        cell: ({ row }) => {
            const { state, clearingState } = row.original
            return (
                <>
                    {state && clearingState && (
                        <div className='text-center'>
                            <OverlayTrigger
                                overlay={<Tooltip>{`${t('Project State')}: ${capitalize(state)}`}</Tooltip>}
                            >
                                {state === 'ACTIVE' ? (
                                    <span className='badge bg-success capsule-left overlay-badge'>{'PS'}</span>
                                ) : (
                                    <span className='badge bg-secondary capsule-left overlay-badge'>{'PS'}</span>
                                )}
                            </OverlayTrigger>
                            <OverlayTrigger
                                overlay={
                                    <Tooltip>{`${t('Project Clearing State')}: ${capitalize(clearingState)}`}</Tooltip>
                                }
                            >
                                {clearingState === 'OPEN' ? (
                                    <span className='badge bg-danger capsule-right overlay-badge'>{'CS'}</span>
                                ) : clearingState === 'IN_PROGRESS' ? (
                                    <span className='badge bg-warning capsule-right overlay-badge'>{'CS'}</span>
                                ) : (
                                    <span className='badge bg-success capsule-right overlay-badge'>{'CS'}</span>
                                )}
                            </OverlayTrigger>
                        </div>
                    )}
                </>
            )
        },
        meta: {
            width: '10%',
        },
    },
    {
        id: 'projectResponsible',
        header: t('Project Responsible'),
        accessorKey: 'projectResponsible',
        cell: ({ row }) => {
            const { projectResponsible } = row.original
            return (
                <>
                    {projectResponsible && (
                        <Link
                            href={`mailto:${projectResponsible}`}
                            className='text-link'
                        >
                            {projectResponsible}
                        </Link>
                    )}
                </>
            )
        },
        meta: {
            width: '13%',
        },
    },
    {
        id: 'description',
        header: t('Description'),
        accessorKey: 'description',
        cell: (info) => info.getValue(),
        meta: {
            width: '40%',
        },
    },
]
