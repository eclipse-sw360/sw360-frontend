// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.
// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/
// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE
import { ColumnDef, getCoreRowModel, SortingState, useReactTable } from '@tanstack/react-table'
import { StatusCodes } from 'http-status-codes'
import Link from 'next/link'
import { getSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { SW360Table, TableFooter } from 'next-sw360'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import { Button, Card, Collapse, Form, Spinner } from 'react-bootstrap'
import { FiChevronDown, FiChevronUp } from 'react-icons/fi'
import LicenseClearing from '@/components/LicenseClearing'
import { Embedded, ErrorDetails, PageableQueryParam, PaginationMeta, Project } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'
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
                            {name} {!CommonUtils.isNullEmptyOrUndefinedString(version) && `(${version})`}
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
                cell: (info) => info.getValue(),
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
    const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | undefined>({
        size: 0,
        totalElements: 0,
        totalPages: 0,
        number: 0,
    })
    const [projectData, setProjectData] = useState<Project[]>(() => [])
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
        const timeLimit = projectData.length !== 0 ? 400 : 0
        const timeout = setTimeout(() => {
            setShowProcessing(true)
        }, timeLimit)

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

                const selectedRoles = Object.entries(appliedFilters.roles)
                    .filter(([_, isSelected]) => isSelected)
                    .map(([role]) => role)

                const allRolesSelected = selectedRoles.length === 7
                if (!allRolesSelected && selectedRoles.length > 0) {
                    const roleParams = selectedRoles.map((role) => {
                        return role.replace(/([A-Z])/g, '_$1').toUpperCase()
                    })
                    queryParams.roles = roleParams.join(',')
                }

                const selectedStates = Object.entries(appliedFilters.clearingStates)
                    .filter(([_, isSelected]) => isSelected)
                    .map(([state]) => state)

                const allStatesSelected = selectedStates.length === 3
                if (!allStatesSelected && selectedStates.length > 0) {
                    const stateParams = selectedStates.map((state) => {
                        if (state === 'inProgress') return 'IN_PROGRESS'
                        return state.toUpperCase()
                    })
                    queryParams.clearingStates = stateParams.join(',')
                }

                const queryUrl = CommonUtils.createUrlWithParams('projects/myprojects', queryParams)
                const response = await ApiUtils.GET(queryUrl, session.user.access_token, signal)

                if (response.status !== StatusCodes.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new Error(err.message)
                }

                const data = (await response.json()) as EmbeddedProjects
                setPaginationMeta(data.page)
                setProjectData(
                    CommonUtils.isNullOrUndefined(data['_embedded']['sw360:projects'])
                        ? []
                        : data['_embedded']['sw360:projects'],
                )
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return
                }
                const message = error instanceof Error ? error.message : String(error)
                MessageService.error(message)
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
        state: {
            pagination: {
                pageIndex: pageableQueryParam.page,
                pageSize: pageableQueryParam.page_entries,
            },
            sorting: [
                {
                    id: pageableQueryParam.sort.split(',')[0] || '',
                    desc: pageableQueryParam.sort.split(',')[1] === 'desc',
                },
            ],
        },
        manualSorting: true,
        onSortingChange: (updater) => {
            setPageableQueryParam((prev) => {
                const prevSorting: SortingState = [
                    {
                        id: prev.sort.split(',')[0] || '',
                        desc: prev.sort.split(',')[1] === 'desc',
                    },
                ]
                const nextSorting = typeof updater === 'function' ? updater(prevSorting) : updater
                if (nextSorting.length > 0) {
                    const { id, desc } = nextSorting[0]
                    return {
                        ...prev,
                        sort: `${id},${desc ? 'desc' : 'asc'}`,
                    }
                }
                return {
                    ...prev,
                    sort: '',
                }
            })
        },
        manualPagination: true,
        pageCount: paginationMeta?.totalPages ?? 1,
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
        meta: {
            rowHeightConstant: true,
        },
    })

    return (
        <div>
            <HomeTableHeader
                title={t('My Projects')}
                setReload={setReload}
            />
            <Card className='mb-3 border-0 shadow-sm'>
                <Card.Body className='p-0'>
                    <div
                        onClick={() => setShowFilters(!showFilters)}
                        className='d-flex justify-content-between align-items-center px-3 py-2 filter-toggle-section'
                        style={{
                            cursor: 'pointer',
                            userSelect: 'none',
                        }}
                    >
                        <span className='fw-bold'>{t('Filter')}</span>
                        {showFilters ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                    </div>
                    <Collapse in={showFilters}>
                        <div className='p-3 border-top'>
                            <div className='row'>
                                <div className='col-md-6 mb-3'>
                                    <h6 className='mb-3'>{t('Role In Project')}</h6>
                                    <div className='d-flex flex-column gap-2'>
                                        <Form.Check
                                            type='checkbox'
                                            id='filter-creator'
                                            label={t('Creator')}
                                            checked={filters.roles.creator}
                                            onChange={() => handleRoleChange('creator')}
                                        />
                                        <Form.Check
                                            type='checkbox'
                                            id='filter-moderator'
                                            label={t('Moderator')}
                                            checked={filters.roles.moderator}
                                            onChange={() => handleRoleChange('moderator')}
                                        />
                                        <Form.Check
                                            type='checkbox'
                                            id='filter-contributor'
                                            label={t('Contributor')}
                                            checked={filters.roles.contributor}
                                            onChange={() => handleRoleChange('contributor')}
                                        />
                                        <Form.Check
                                            type='checkbox'
                                            id='filter-project-owner'
                                            label={t('Project Owner')}
                                            checked={filters.roles.projectOwner}
                                            onChange={() => handleRoleChange('projectOwner')}
                                        />
                                        <Form.Check
                                            type='checkbox'
                                            id='filter-lead-architect'
                                            label={t('Lead Architect')}
                                            checked={filters.roles.leadArchitect}
                                            onChange={() => handleRoleChange('leadArchitect')}
                                        />
                                        <Form.Check
                                            type='checkbox'
                                            id='filter-project-responsible'
                                            label={t('Project Responsible')}
                                            checked={filters.roles.projectResponsible}
                                            onChange={() => handleRoleChange('projectResponsible')}
                                        />
                                        <Form.Check
                                            type='checkbox'
                                            id='filter-security-responsible'
                                            label={t('Security Responsible')}
                                            checked={filters.roles.securityResponsible}
                                            onChange={() => handleRoleChange('securityResponsible')}
                                        />
                                    </div>
                                </div>
                                <div className='col-md-6 mb-3'>
                                    <h6 className='mb-3'>{t('Clearing State')}</h6>
                                    <div className='d-flex flex-column gap-2'>
                                        <Form.Check
                                            type='checkbox'
                                            id='filter-open'
                                            label={t('Open')}
                                            checked={filters.clearingStates.open}
                                            onChange={() => handleClearingStateChange('open')}
                                        />
                                        <Form.Check
                                            type='checkbox'
                                            id='filter-closed'
                                            label={t('Closed')}
                                            checked={filters.clearingStates.closed}
                                            onChange={() => handleClearingStateChange('closed')}
                                        />
                                        <Form.Check
                                            type='checkbox'
                                            id='filter-in-progress'
                                            label={t('In Progress')}
                                            checked={filters.clearingStates.inProgress}
                                            onChange={() => handleClearingStateChange('inProgress')}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className='d-flex justify-content-center mt-3'>
                                <Button
                                    variant='warning'
                                    onClick={handleSearch}
                                    className='px-5 search-button-warning'
                                >
                                    {t('Search')}
                                </Button>
                            </div>
                        </div>
                    </Collapse>
                </Card.Body>
            </Card>
            <div className='mb-3'>
                {pageableQueryParam && table && paginationMeta ? (
                    <>
                        <SW360Table
                            table={table}
                            showProcessing={showProcessing}
                            noRecordsFoundMessage={t('No Projects Found')}
                        />
                        <TableFooter
                            pageableQueryParam={pageableQueryParam}
                            setPageableQueryParam={setPageableQueryParam}
                            paginationMeta={paginationMeta}
                        />
                    </>
                ) : (
                    <div className='col-12 mt-1 text-center'>
                        <Spinner className='spinner' />
                    </div>
                )}
            </div>
        </div>
    )
}
