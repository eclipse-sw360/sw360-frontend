// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { type JSX, useMemo } from 'react'
import { Alert, Spinner } from 'react-bootstrap'
import { SW360Table } from '@/components/sw360'
import { Project, RestrictedResource } from '@/object-types'
import { CommonUtils } from '@/utils'

interface Props {
    projectUsings: Array<Project>
    documentName: string
    restrictedResource: RestrictedResource | null | undefined
    showProcessing: boolean
}

const ProjectsUsing = ({ projectUsings, documentName, restrictedResource, showProcessing }: Props): JSX.Element => {
    const t = useTranslations('default')

    const columns = useMemo<ColumnDef<Project>[]>(
        () => [
            {
                id: 'name',
                header: t('Project Name'),
                cell: ({ row }) => {
                    const { name, version } = row.original
                    const id = row.original['_links']['self']['href'].split('/').at(-1)
                    return (
                        <Link
                            href={`/projects/detail/${id}`}
                            className='text-link'
                        >
                            {name} {!CommonUtils.isNullEmptyOrUndefinedString(version) && `(${version})`}
                        </Link>
                    )
                },
            },
            {
                id: 'businessUnit',
                header: t('Group'),
                accessorKey: 'businessUnit',
                cell: (info) => info.getValue(),
                enableSorting: false,
            },
            {
                id: 'projectResponsible',
                header: t('Project Responsible'),
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
            },
        ],
        [
            t,
        ],
    )

    const memoizedData = useMemo(
        () => projectUsings,
        [
            projectUsings,
        ],
    )

    const table = useReactTable({
        data: memoizedData,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <>
            <Alert variant='primary'>
                {`${documentName} is used by a total of ${restrictedResource?.projects ?? 0 + projectUsings.length} (${
                    projectUsings.length
                } visible / ${restrictedResource?.projects ?? 0} restricted) projects.`}
            </Alert>
            <div className='mb-3'>
                {table ? (
                    <SW360Table
                        table={table}
                        showProcessing={showProcessing}
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

export default ProjectsUsing
