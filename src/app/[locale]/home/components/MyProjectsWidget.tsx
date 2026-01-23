// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { StatusCodes } from 'http-status-codes'
import Link from 'next/link'
import { getSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { SW360Table, TableFooter } from 'next-sw360'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import { Button, Collapse, Form, Spinner } from 'react-bootstrap'
import { FiChevronDown, FiChevronUp } from 'react-icons/fi'

import LicenseClearing from '@/components/LicenseClearing'
import { Embedded, ErrorDetails, PageableQueryParam, PaginationMeta, Project } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'
import { ApiError, ApiUtils, CommonUtils } from '@/utils'
import HomeTableHeader from './HomeTableHeader'

type EmbeddedProjects = Embedded<Project, 'sw360:projects'>

interface ProjectFilters {
    roles: {
        creator: boolean
        moderator: boolean
        contributor: boolean
        projectOwner: boolean
        leadArchitect: boolean
        projectResponsible: boolean
        securityResponsible: boolean
    }
    clearingStates: {
        open: boolean
        closed: boolean
        inProgress: boolean
    }
}

interface ExtendedPageableQueryParam extends PageableQueryParam {
    roles?: string
    clearingStates?: string
}

const camelCaseToWords = (text: string): string => text.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())

export default function MyProjectsWidget(): ReactNode {
    const t = useTranslations('default')

    const [reload, setReload] = useState(false)
    const [showFilters, setShowFilters] = useState(false)

    const [filters, setFilters] = useState<ProjectFilters>({
        roles: {
            creator: true,
            moderator: true,
            contributor: true,
            projectOwner: true,
            leadArchitect: true,
            projectResponsible: true,
            securityResponsible: true,
        },
        clearingStates: {
            open: true,
            closed: true,
            inProgress: true,
        },
    })

    const [appliedFilters, setAppliedFilters] = useState<ProjectFilters>(filters)

    const columns = useMemo<ColumnDef<Project>[]>(
        () => [
            {
                id: 'name',
                accessorKey: 'name',
                header: t('Project Name'),
                enableSorting: true,
                cell: ({ row }) => {
                    const { name, version } = row.original
                    const id = row.original['_links']['self']['href'].split('/').at(-1)
                    return (
                        <Link
                            href={`/projects/detail/${id}`}
                            className='text-link'
                        >
                            {name}
                            {!CommonUtils.isNullEmptyOrUndefinedString(version) && ` (${version})`}
                        </Link>
                    )
                },
                meta: {
                    width: '30%',
                },
            },
            {
                id: 'description',
                header: t('Description'),
                accessorKey: 'description',
                meta: {
                    width: '50%',
                },
            },
            {
                id: 'approvedReleases',
                header: t('Approved Releases'),
                enableSorting: false,
                cell: ({ row }) => {
                    const id = row.original['_links']['self']['href'].split('/').at(-1)
                    return <>{id && <LicenseClearing projectId={id} />}</>
                },
                meta: {
                    width: '20%',
                },
            },
        ],
        [
            t,
        ],
    )

    const [pageableQueryParam, setPageableQueryParam] = useState<ExtendedPageableQueryParam>({
        page: 0,
        page_entries: 5,
        sort: '',
    })

    const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>({
        size: 0,
        totalElements: 0,
        totalPages: 0,
        number: 0,
    })

    const [projectData, setProjectData] = useState<Project[]>([])
    const memoizedData = useMemo(
        () => projectData,
        [
            projectData,
        ],
    )
    const [showProcessing, setShowProcessing] = useState(false)

    const handleRoleChange = (role: keyof ProjectFilters['roles']) => {
        setFilters((prev) => ({
            ...prev,
            roles: {
                ...prev.roles,
                [role]: !prev.roles[role],
            },
        }))
    }

    const handleClearingStateChange = (state: keyof ProjectFilters['clearingStates']) => {
        setFilters((prev) => ({
            ...prev,
            clearingStates: {
                ...prev.clearingStates,
                [state]: !prev.clearingStates[state],
            },
        }))
    }

    const handleSearch = () => {
        setAppliedFilters(filters)
        setPageableQueryParam((prev) => ({
            ...prev,
            page: 0,
        }))
        setReload((prev) => !prev)
    }

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal

        const timeout = setTimeout(() => setShowProcessing(true), projectData.length ? 400 : 0)

        void (async () => {
            try {
                const session = await getSession()
                if (CommonUtils.isNullOrUndefined(session)) return signOut()

                const queryParams: Record<string, string> = {
                    page: String(pageableQueryParam.page),
                    page_entries: String(pageableQueryParam.page_entries),
                }

                if (pageableQueryParam.sort) {
                    queryParams.sort = pageableQueryParam.sort
                }

                const roles = Object.entries(appliedFilters.roles)
                    .filter(([, v]) => v)
                    .map(([k]) => k)

                if (roles.length && roles.length !== 7) {
                    queryParams.roles = roles.map((r) => r.replace(/([A-Z])/g, '_$1').toUpperCase()).join(',')
                }

                const states = Object.entries(appliedFilters.clearingStates)
                    .filter(([, v]) => v)
                    .map(([k]) => (k === 'inProgress' ? 'IN_PROGRESS' : k.toUpperCase()))

                if (states.length && states.length !== 3) {
                    queryParams.clearingStates = states.join(',')
                }

                const url = CommonUtils.createUrlWithParams('projects/myprojects', queryParams)
                const response = await ApiUtils.GET(url, session.user.access_token, signal)

                if (response.status !== StatusCodes.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new ApiError(err.message, {
                        status: response.status,
                    })
                }

                const data = (await response.json()) as EmbeddedProjects

                setPaginationMeta(
                    data.page ?? {
                        size: 0,
                        totalElements: 0,
                        totalPages: 0,
                        number: 0,
                    },
                )

                setProjectData(data['_embedded']?.['sw360:projects'] ?? [])
            } catch (e) {
                if (!(e instanceof DOMException)) {
                    MessageService.error(e instanceof Error ? e.message : String(e))
                }
            } catch (error) {
                ApiUtils.reportError(error)
            } finally {
                clearTimeout(timeout)
                setShowProcessing(false)
            }
        })()

        return () => controller.abort()
    }, [
        pageableQueryParam,
        reload,
        appliedFilters,
    ])

    const table = useReactTable({
        data: memoizedData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        manualSorting: true,
        pageCount: paginationMeta.totalPages,
        state: {
            pagination: {
                pageIndex: pageableQueryParam.page,
                pageSize: pageableQueryParam.page_entries,
            },
            sorting: pageableQueryParam.sort
                ? [
                      {
                          id: pageableQueryParam.sort.split(',')[0],
                          desc: pageableQueryParam.sort.endsWith('desc'),
                      },
                  ]
                : [],
        },
        onSortingChange: (updater) => {
            setPageableQueryParam((prev) => {
                const next = typeof updater === 'function' ? updater([]) : updater
                return next.length
                    ? {
                          ...prev,
                          sort: `${next[0].id},${next[0].desc ? 'desc' : 'asc'}`,
                      }
                    : {
                          ...prev,
                          sort: '',
                      }
            })
        },
        onPaginationChange: (updater) => {
            const next =
                typeof updater === 'function'
                    ? updater({
                          pageIndex: pageableQueryParam.page,
                          pageSize: pageableQueryParam.page_entries,
                      })
                    : updater

            setPageableQueryParam((prev) => ({
                ...prev,
                page: next.pageIndex,
                page_entries: next.pageSize,
            }))
        },
    })

    return (
        <div>
            <div className='d-flex justify-content-between align-items-center mb-3 my-projects-header'>
                <h5 className='mb-0'>{t('MY PROJECTS')}</h5>

                <div
                    className='d-flex align-items-center my-projects-filter-toggle'
                    onClick={() => setShowFilters((prev) => !prev)}
                >
                    {showFilters ? <FiChevronUp /> : <FiChevronDown />}
                </div>

                <Collapse in={showFilters}>
                    <div className='my-projects-filter-dropdown'>
                        <h6 className='mb-2'>Role in Project</h6>
                        {Object.entries(filters.roles).map(([k, v]) => (
                            <Form.Check
                                key={k}
                                label={camelCaseToWords(k)}
                                checked={v}
                                onChange={() => handleRoleChange(k as keyof ProjectFilters['roles'])}
                            />
                        ))}

                        <hr />

                        <h6 className='mb-2'>Clearing State</h6>
                        <Form.Check
                            label='Open'
                            checked={filters.clearingStates.open}
                            onChange={() => handleClearingStateChange('open')}
                        />
                        <Form.Check
                            label='Closed'
                            checked={filters.clearingStates.closed}
                            onChange={() => handleClearingStateChange('closed')}
                        />
                        <Form.Check
                            label='In Progress'
                            checked={filters.clearingStates.inProgress}
                            onChange={() => handleClearingStateChange('inProgress')}
                        />

                        <div className='text-center mt-3'>
                            <Button
                                variant='warning'
                                onClick={() => {
                                    handleSearch()
                                    setShowFilters(false)
                                }}
                            >
                                Search
                            </Button>
                        </div>
                    </div>
                </Collapse>
            </div>

            {table ? (
                <>
                    <SW360Table
                        table={table}
                        showProcessing={showProcessing}
                        noRecordsFoundMessage={t('NoProjectsFound')}
                    />
                    <TableFooter
                        pageableQueryParam={pageableQueryParam}
                        setPageableQueryParam={setPageableQueryParam}
                        paginationMeta={paginationMeta}
                    />
                </>
            ) : (
                <div className='text-center'>
                    <Spinner />
                </div>
            )}
        </div>
    )
}
