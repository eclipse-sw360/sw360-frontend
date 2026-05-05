// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ColumnDef, getCoreRowModel, getSortedRowModel, SortingState, useReactTable } from '@tanstack/react-table'
import { StatusCodes } from 'http-status-codes'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { PageSizeSelector, SW360Table, TableFooter } from 'next-sw360'
import { type JSX, useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Button, Col, Form, Modal, OverlayTrigger, Row, Spinner, Tooltip } from 'react-bootstrap'
import { BsInfoCircle } from 'react-icons/bs'
import { Embedded, ErrorDetails, PageableQueryParam, PaginationMeta, Project, SearchResult } from '@/object-types'
import { ApiError, ApiUtils, CommonUtils } from '@/utils'

type EmbeddedProjects = Embedded<Project, 'sw360:projects'>
type EmbeddedSearchResults = Embedded<SearchResult, 'sw360:searchResults'>

const Capitalize = (text: string) =>
    text.split('_').reduce((s, c) => s + ' ' + (c.charAt(0) + c.substring(1).toLocaleLowerCase()), '')

interface AlertData {
    variant: string
    message: JSX.Element
}

export default function LinkProjects({
    projectId,
    show,
    setShow,
}: {
    projectId: string
    show: boolean
    setShow: (show: boolean) => void
}): JSX.Element {
    const t = useTranslations('default')
    const [linkProjects, setLinkProjects] = useState<Map<string, object>>(new Map())
    const [alert, setAlert] = useState<AlertData | null>(null)
    const [exactMatch, setExactMatch] = useState(false)
    const [searchText, setSearchText] = useState<string | undefined>(undefined)
    const [byNameOnly, setByNameOnly] = useState(true)
    const topRef = useRef<HTMLDivElement | null>(null)
    const [linking, setLinking] = useState(false)
    const session = useSession()

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            signOut()
        }
    }, [
        session,
    ])

    const scrollToTop = () => {
        topRef.current?.scrollTo({
            top: 0,
            left: 0,
        })
    }

    const columns = useMemo<ColumnDef<Project>[]>(
        () => [
            {
                id: 'selectProjectCheckbox',
                cell: ({ row }) => (
                    <input
                        className='form-check-input'
                        type='checkbox'
                        checked={linkProjects.has(row.original.id ?? '')}
                        onChange={() => handleCheckboxes(row.original.id ?? '')}
                    />
                ),
                meta: {
                    width: '5%',
                },
            },
            {
                id: 'name',
                header: t('Project Name'),
                cell: ({ row }) => {
                    const { name, version } = row.original
                    return (
                        <p>
                            {name} {!CommonUtils.isNullEmptyOrUndefinedString(version) && `(${version})`}
                        </p>
                    )
                },
                accessorKey: 'name',
                enableSorting: true,
                meta: {
                    width: '17.5%',
                },
            },
            {
                id: 'version',
                header: t('Version'),
                accessorKey: 'version',
                cell: (info) => info.getValue(),
                meta: {
                    width: '12%',
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
                                        overlay={<Tooltip>{`${t('Project State')}: ${Capitalize(state)}`}</Tooltip>}
                                    >
                                        {state === 'ACTIVE' ? (
                                            <span className='badge bg-success capsule-left overlay-badge'>{'PS'}</span>
                                        ) : (
                                            <span className='badge bg-secondary capsule-left overlay-badge'>
                                                {'PS'}
                                            </span>
                                        )}
                                    </OverlayTrigger>
                                    <OverlayTrigger
                                        overlay={
                                            <Tooltip>{`${t('Project Clearing State')}: ${Capitalize(clearingState)}`}</Tooltip>
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
                    width: '17.5%',
                },
            },
            {
                id: 'description',
                header: t('Description'),
                accessorKey: 'description',
                cell: (info) => info.getValue(),
                meta: {
                    width: '32.5%',
                },
            },
        ],
        [
            t,
            linkProjects,
        ],
    )
    const [pageableQueryParam, setPageableQueryParam] = useState<PageableQueryParam>({
        page: 0,
        page_entries: 10,
        sort: 'name,asc',
    })
    const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | undefined>({
        size: 0,
        totalElements: 0,
        totalPages: 0,
        number: 0,
    })
    const [projectData, setProjectData] = useState<Project[] | undefined>(() => undefined)
    const memoizedData = useMemo(
        () => projectData,
        [
            projectData,
        ],
    )
    const [showProcessing, setShowProcessing] = useState(false)

    const table = useReactTable({
        data: memoizedData ?? [],
        columns,
        getCoreRowModel: getCoreRowModel(),

        // table state config
        state: {
            pagination: {
                pageIndex: pageableQueryParam.page,
                pageSize: pageableQueryParam.page_entries,
            },
            sorting: [
                {
                    id: pageableQueryParam.sort.split(',')[0],
                    desc: pageableQueryParam.sort.split(',')[1] === 'desc',
                },
            ],
        },

        // server side sorting config
        manualSorting: true,
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: (updater) => {
            setPageableQueryParam((prev) => {
                const prevSorting: SortingState = [
                    {
                        id: prev.sort.split(',')[0],
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
                    sort: 'name,asc',
                }
            })
        },

        // server side pagination config
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
                page: next.pageIndex + 1,
                page_entries: next.pageSize,
            }))
        },

        meta: {
            rowHeightConstant: true,
        },
    })

    useEffect(() => {
        if (session.status === 'loading' || searchText === undefined) return
        const controller = new AbortController()
        const signal = controller.signal
        handleSearch(signal)
        return () => controller.abort()
    }, [
        pageableQueryParam,
        session,
    ])

    const handleCheckboxes = (projectId: string) => {
        const m = new Map(linkProjects)
        if (linkProjects.has(projectId)) {
            m.delete(projectId)
        } else {
            m.set(projectId, {
                enableSvm: true,
                projectRelationship: 'CONTAINED',
            })
        }
        setLinkProjects(m)
    }

    const handleSearch = async (signal?: AbortSignal) => {
        try {
            setShowProcessing(true)
            if (CommonUtils.isNullOrUndefined(session.data)) return signOut()

            if (byNameOnly || CommonUtils.isNullEmptyOrUndefinedString(searchText)) {
                // Search by name only using /projects endpoint
                const queryUrl = CommonUtils.createUrlWithParams(
                    `projects`,
                    Object.fromEntries(
                        Object.entries({
                            ...pageableQueryParam,
                            ...(searchText && searchText !== ''
                                ? {
                                      name: searchText,
                                      luceneSearch: !exactMatch,
                                  }
                                : {}),
                            allDetails: true,
                        }).map(([key, value]) => [
                            key,
                            String(value),
                        ]),
                    ),
                )
                const response = await ApiUtils.GET(queryUrl, session.data.user.access_token, signal)
                if (response.status !== StatusCodes.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new ApiError(err.message, {
                        status: response.status,
                    })
                }

                const data = (await response.json()) as EmbeddedProjects
                setPaginationMeta(data.page)
                setProjectData(
                    CommonUtils.isNullOrUndefined(data['_embedded']['sw360:projects'])
                        ? []
                        : data['_embedded']['sw360:projects'],
                )
            } else {
                // Full-text search using /search endpoint
                const params = new URLSearchParams()
                if (searchText && searchText !== '') {
                    params.append('searchText', searchText)
                }
                params.append('typeMasks', 'project')
                if (!exactMatch) {
                    params.append('typeMasks', 'document')
                }
                Object.entries(pageableQueryParam)
                    .filter(([k]) => k !== 'sort')
                    .forEach(([key, value]) => params.append(key, String(value)))

                const response = await ApiUtils.GET(
                    `search?${params.toString()}`,
                    session.data.user.access_token,
                    signal,
                )
                if (response.status !== StatusCodes.OK && response.status !== StatusCodes.NO_CONTENT) {
                    const err = (await response.json()) as ErrorDetails
                    throw new ApiError(err.message, {
                        status: response.status,
                    })
                }

                const data = (await response.json()) as EmbeddedSearchResults
                setPaginationMeta(data.page)

                // Fetch full project details for search results
                const searchResults = data['_embedded']?.['sw360:searchResults'] ?? []
                const projectIds = searchResults.filter((r) => r.type === 'project').map((r) => r.id)

                if (projectIds.length === 0) {
                    setProjectData([])
                    return
                }

                // Fetch full details for each project
                const accessToken = session.data?.user.access_token
                if (!accessToken) return

                const projectPromises = projectIds.map((id) =>
                    ApiUtils.GET(`projects/${id}`, accessToken, signal)
                        .then((res) => (res.status === StatusCodes.OK ? res.json() : null))
                        .catch(() => null),
                )
                const projects = (await Promise.all(projectPromises)).filter((p): p is Project => p !== null)
                setProjectData(projects)
            }
        } catch (error) {
            ApiUtils.reportError(error)
        } finally {
            setShowProcessing(false)
        }
    }

    const handleLinkProjects = async ({ projectId }: { projectId: string }) => {
        setLinking(true)
        try {
            const data = {
                linkedProjects: Object.fromEntries(linkProjects),
            }
            if (CommonUtils.isNullOrUndefined(session.data)) return signOut()

            const response = await ApiUtils.PATCH(`projects/${projectId}`, data, session.data.user.access_token)
            if (response.status !== StatusCodes.OK) {
                const err = (await response.json()) as ErrorDetails
                throw new ApiError(err.message, {
                    status: response.status,
                })
            }
            const res = (await response.json()) as Project
            setAlert({
                variant: 'success',
                message: (
                    <>
                        <p>
                            {`${t('The projects have been successfully linked to project')} `}
                            <span className='fw-bold'>{res.name}</span>.{' '}
                        </p>
                        <p>
                            {t('Click')}{' '}
                            <Link
                                href={`/projects/edit/${projectId}?tab=linkedProjectsAndReleases`}
                                className='text-link'
                            >
                                {t('here')}
                            </Link>{' '}
                            {t('to edit the project relation')}.
                        </p>
                    </>
                ),
            })
        } catch (error) {
            if (error instanceof ApiError && error.isAborted) {
                return
            }
            const message =
                error instanceof ApiError ? error.message : error instanceof Error ? error.message : String(error)
            setAlert({
                variant: 'danger',
                message: (
                    <>
                        <p>{message}</p>
                    </>
                ),
            })
        } finally {
            setLinking(false)
        }
    }

    const cleanup = () => {
        setShow(false)
        setProjectData(undefined)
        setPageableQueryParam({
            page: 0,
            page_entries: 10,
            sort: '',
        })
        setPaginationMeta({
            size: 0,
            totalElements: 0,
            totalPages: 0,
            number: 0,
        })
        setAlert(null)
        setLinkProjects(new Map())
        setExactMatch(false)
    }

    return (
        <>
            <Modal
                size='lg'
                centered
                show={show}
                onHide={cleanup}
                scrollable
            >
                <Modal.Header closeButton>
                    <Modal.Title id='linked-projects-modal'>{t('Link Projects')}</Modal.Title>
                </Modal.Header>
                <Modal.Body ref={topRef}>
                    {alert && <Alert variant={alert.variant}>{alert.message}</Alert>}
                    <Form>
                        <Row className='mb-3'>
                            <Col xs={6}>
                                <Form.Control
                                    type='text'
                                    placeholder={`${t('Enter Search Text')}...`}
                                    name='searchValue'
                                    onChange={(event) => {
                                        setSearchText(event.target.value)
                                    }}
                                />
                            </Col>
                            <Col xs='auto'>
                                <Form.Group>
                                    <Form.Check
                                        inline
                                        name='exact-match'
                                        type='checkbox'
                                        id='exact-match'
                                        checked={exactMatch}
                                        onChange={() => setExactMatch(!exactMatch)}
                                    />
                                    <Form.Label className='pt-2'>
                                        {t('Restricted Search')}{' '}
                                        <OverlayTrigger
                                            overlay={
                                                <Tooltip>
                                                    <div>
                                                        {t(
                                                            'In case By Name Only is unchecked checking this will search for elements with name and description matching the input Otherwise the entire document will be searched',
                                                        )}
                                                    </div>
                                                    {t(
                                                        'In case By Name Only is checked Checking this will search for elements with name exactly matching the input',
                                                    )}
                                                    .
                                                </Tooltip>
                                            }
                                            placement='top'
                                        >
                                            <sup>
                                                <BsInfoCircle size={20} />
                                            </sup>
                                        </OverlayTrigger>
                                    </Form.Label>
                                </Form.Group>
                            </Col>
                            <Col xs='auto'>
                                <Form.Group>
                                    <Form.Check
                                        inline
                                        name='by-name-only'
                                        type='checkbox'
                                        id='by-name-only'
                                        checked={byNameOnly}
                                        onChange={() => setByNameOnly(!byNameOnly)}
                                    />
                                    <Form.Label className='pt-2'>
                                        {t('By Name Only')}{' '}
                                        <OverlayTrigger
                                            overlay={
                                                <Tooltip>
                                                    {t(
                                                        'The search result will display elements with name matching the input',
                                                    )}
                                                </Tooltip>
                                            }
                                            placement='top'
                                        >
                                            <sup>
                                                <BsInfoCircle size={20} />
                                            </sup>
                                        </OverlayTrigger>
                                    </Form.Label>
                                </Form.Group>
                            </Col>
                            <Col xs='auto'>
                                <Button
                                    variant='secondary'
                                    onClick={() => {
                                        if (!searchText) setSearchText('')
                                        setPageableQueryParam((prev) => ({
                                            ...prev,
                                            page: 0,
                                        }))
                                        handleSearch()
                                    }}
                                    className='mt-2'
                                >
                                    {t('Search')}
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                    {memoizedData === undefined && showProcessing === true && (
                        <div className='col-12 mt-1 text-center'>
                            <Spinner className='spinner' />
                        </div>
                    )}
                    {memoizedData !== undefined && (
                        <div className='mb-3'>
                            {pageableQueryParam && table && paginationMeta ? (
                                <>
                                    <PageSizeSelector
                                        pageableQueryParam={pageableQueryParam}
                                        setPageableQueryParam={setPageableQueryParam}
                                    />
                                    <SW360Table
                                        table={table}
                                        showProcessing={showProcessing}
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
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant='dark'
                        onClick={cleanup}
                    >
                        {t('Close')}
                    </Button>
                    <Button
                        variant='primary'
                        onClick={() => {
                            void handleLinkProjects({
                                projectId,
                            })
                            scrollToTop()
                        }}
                        disabled={linkProjects.size === 0 || linking}
                    >
                        {t('Link Projects')}
                        {linking && (
                            <Spinner
                                className='ms-1'
                                size='sm'
                            />
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}
