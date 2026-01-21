// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { StatusCodes } from 'http-status-codes'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { SW360Table } from 'next-sw360'
import { type JSX, useEffect, useMemo, useState } from 'react'
import { ErrorDetails, SearchDuplicatesResponse } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'

export default function DatabaseSanitation(): JSX.Element {
    const t = useTranslations('default')
    const [duplicates, setDuplicates] = useState<SearchDuplicatesResponse | null | undefined>(undefined)
    const memoizedData = useMemo(
        () => duplicates,
        [
            duplicates,
        ],
    )
    const session = useSession()

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            void signOut()
        }
    }, [
        session,
    ])

    const searchDuplicate = async () => {
        try {
            setDuplicates(null)
            if (CommonUtils.isNullOrUndefined(session.data)) return signOut()
            const response = await ApiUtils.GET('databaseSanitation/searchDuplicate', session.data.user.access_token)
            if (response.status !== StatusCodes.OK) {
                const err = (await response.json()) as ErrorDetails
                throw new Error(err.message)
            }
            const data = (await response.json()) as SearchDuplicatesResponse
            setDuplicates(data)
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                return
            }
            const message = error instanceof Error ? error.message : String(error)
            MessageService.error(message)
        }
    }

    const duplicateReleasesColumns = useMemo<
        ColumnDef<
            [
                string,
                string[],
            ]
        >[]
    >(
        () => [
            {
                id: 'releaseName',
                header: t('Release Name'),
                cell: ({ row }) => row.original[0],
                meta: {
                    width: '30%',
                },
            },
            {
                id: 'links',
                header: t('Links'),
                cell: ({ row }) => {
                    return (
                        <>
                            {row.original[1].map((id, index) => (
                                <span key={id}>
                                    <Link
                                        className='text-link'
                                        href={`/components/releases/detail/${id}`}
                                    >
                                        {index + 1}
                                    </Link>{' '}
                                </span>
                            ))}
                        </>
                    )
                },
                meta: {
                    width: '70%',
                },
            },
        ],
        [
            t,
        ],
    )
    const duplicateReleasesTable = useReactTable({
        data: Object.entries(memoizedData?.duplicateReleases ?? []),
        columns: duplicateReleasesColumns,
        getCoreRowModel: getCoreRowModel(),
    })

    const duplicateReleaseSourcesColumns = useMemo<
        ColumnDef<
            [
                string,
                string[],
            ]
        >[]
    >(
        () => [
            {
                id: 'releaseName',
                header: t('Release Name'),
                cell: ({ row }) => row.original[0],
                meta: {
                    width: '30%',
                },
            },
            {
                id: 'sourceAttachmentsCounts',
                header: t('Source Attachments Counts'),
                cell: ({ row }) => {
                    return <>{row.original[1].length}</>
                },
                meta: {
                    width: '70%',
                },
            },
        ],
        [
            t,
        ],
    )
    const duplicateReleaseSourcesTable = useReactTable({
        data: Object.entries(memoizedData?.duplicateReleaseSources ?? []),
        columns: duplicateReleaseSourcesColumns,
        getCoreRowModel: getCoreRowModel(),
    })

    const duplicateComponentsColumns = useMemo<
        ColumnDef<
            [
                string,
                string[],
            ]
        >[]
    >(
        () => [
            {
                id: 'componentName',
                header: t('Component Name'),
                cell: ({ row }) => row.original[0],
                meta: {
                    width: '30%',
                },
            },
            {
                id: 'links',
                header: t('Links'),
                cell: ({ row }) => {
                    return (
                        <>
                            {row.original[1].map((id, index) => (
                                <span key={id}>
                                    <Link
                                        className='text-link'
                                        href={`/components/detail/${id}`}
                                    >
                                        {index + 1}
                                    </Link>{' '}
                                </span>
                            ))}
                        </>
                    )
                },
                meta: {
                    width: '70%',
                },
            },
        ],
        [
            t,
        ],
    )
    const duplicateComponentsTable = useReactTable({
        data: Object.entries(memoizedData?.duplicateComponents ?? []),
        columns: duplicateComponentsColumns,
        getCoreRowModel: getCoreRowModel(),
    })

    const duplicateProjectsColumns = useMemo<
        ColumnDef<
            [
                string,
                string[],
            ]
        >[]
    >(
        () => [
            {
                id: 'projectName',
                header: t('Project Name'),
                cell: ({ row }) => row.original[0],
                meta: {
                    width: '30%',
                },
            },
            {
                id: 'links',
                header: t('Links'),
                cell: ({ row }) => {
                    return (
                        <>
                            {row.original[1].map((id, index) => (
                                <span key={id}>
                                    <Link
                                        className='text-link'
                                        href={`/projects/detail/${id}`}
                                    >
                                        {index + 1}
                                    </Link>{' '}
                                </span>
                            ))}
                        </>
                    )
                },
                meta: {
                    width: '70%',
                },
            },
        ],
        [
            t,
        ],
    )
    const duplicateProjectsTable = useReactTable({
        data: Object.entries(memoizedData?.duplicateProjects ?? []),
        columns: duplicateProjectsColumns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <div className='mx-5 mt-3'>
            <div className='d-flex justify-content-between mb-3'>
                <div className='col col-lg-7'>
                    <button
                        type='button'
                        className='btn btn-primary col-auto'
                        onClick={() => void searchDuplicate()}
                    >
                        {t('Search duplicate identifiers')}
                    </button>
                </div>
                <div className='col col-auto text-truncate buttonheader-title me-3'>{t('DATABASE ADMINISTRATION')}</div>
            </div>
            {duplicates === null && (
                <div
                    className='alert alert-primary'
                    role='alert'
                >
                    <p>{t('Searching for duplicate identifiers')}...</p>
                    <div className='progress'>
                        <div
                            className='progress-bar progress-bar-striped progress-bar-animated bg-warning w-100'
                            role='progressbar'
                            aria-valuenow={100}
                            aria-valuemin={0}
                            aria-valuemax={100}
                        ></div>
                    </div>
                </div>
            )}
            {duplicates && (
                <>
                    <div
                        className='alert alert-warning'
                        role='alert'
                    >
                        <p>{t('The following duplicate identifiers were found')}...</p>
                    </div>
                    <div className='mb-3'>
                        <h6 className='header-underlined'>{t('RELEASES WITH THE SAME IDENTIFIER')}</h6>
                        <SW360Table
                            table={duplicateReleasesTable}
                            showProcessing={false}
                        />
                    </div>
                    <div className='mb-3'>
                        <h6 className='header-underlined'>{t('RELEASES WITH MORE THAN ONE SOURCE ATTACHMENT')}</h6>
                        <SW360Table
                            table={duplicateReleaseSourcesTable}
                            showProcessing={false}
                        />
                    </div>
                    <div className='mb-3'>
                        <h6 className='header-underlined'>{t('COMPONENTS WITH THE SAME IDENTIFIER')}</h6>
                        <SW360Table
                            table={duplicateComponentsTable}
                            showProcessing={false}
                        />
                    </div>
                    <div className='mb-3'>
                        <h6 className='header-underlined'>{t('PROJECTS WITH THE SAME IDENTIFIER')}</h6>
                        <SW360Table
                            table={duplicateProjectsTable}
                            showProcessing={false}
                        />
                    </div>
                </>
            )}
        </div>
    )
}
