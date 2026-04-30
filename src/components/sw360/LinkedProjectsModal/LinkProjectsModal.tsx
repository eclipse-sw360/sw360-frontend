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
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { PageSizeSelector, SW360Table, TableFooter } from 'next-sw360'
import { type JSX, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Button, Col, Form, Modal, OverlayTrigger, Row, Spinner, Tooltip } from 'react-bootstrap'
import { BsInfoCircle } from 'react-icons/bs'
import {
    Embedded,
    ErrorDetails,
    LinkedProjectData,
    PageableQueryParam,
    PaginationMeta,
    Project,
    ProjectPayload,
} from '@/object-types'
import { ApiError, ApiUtils, CommonUtils } from '@/utils'

interface AlertData {
    variant: string
    message: JSX.Element
}

// Type definitions for different modes
interface CallbackModeProps {
    mode: 'callback'
    projectPayload: ProjectPayload
    setProjectPayload: React.Dispatch<React.SetStateAction<ProjectPayload>>
}

interface DirectModeProps {
    mode: 'direct'
    projectId: string
    onSuccess?: () => void
}

type Props = (CallbackModeProps | DirectModeProps) & {
    show: boolean
    setShow: (show: boolean) => void
}

type EmbeddedProjects = Embedded<Project, 'sw360:projects'>

const Capitalize = (text: string) =>
    text.split('_').reduce((s, c) => s + ' ' + (c.charAt(0) + c.substring(1).toLocaleLowerCase()), '')

export default function LinkProjectsModal(props: Props): JSX.Element {
    const t = useTranslations('default')
    const [linkProjects, setLinkProjects] = useState<Map<string, LinkedProjectData>>(new Map())
    const [alert, setAlert] = useState<AlertData | null>(null)
    const [searchValue, setSearchValue] = useState<string>('')
    const [exactMatch, setExactMatch] = useState(false)
    const [pageableQueryParam, setPageableQueryParam] = useState<PageableQueryParam>({
        page: 0,
        page_entries: 10,
        sort: 'name,asc',
    })
    const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>({
        size: 0,
        totalElements: 0,
        totalPages: 0,
        number: 0,
    })
    const [projectData, setProjectData] = useState<Project[] | undefined>()
    const [showProcessing, setShowProcessing] = useState(false)
    const [linking, setLinking] = useState(false)
    const topRef = useRef<HTMLDivElement | null>(null)
    const session = useSession()
    const isDirect = props.mode === 'direct'
    const isCallback = props.mode === 'callback'

    // Initialize linked projects from projectPayload if in callback mode
    useEffect(() => {
        if (isCallback) {
            setLinkProjects(new Map(Object.entries(props.projectPayload.linkedProjects ?? {})))
        } else {
            setLinkProjects(new Map())
        }
    }, [
        isCallback,
        props,
    ])

    // Auth check
    useEffect(() => {
        if (session.status === 'unauthenticated') {
            void signOut()
        }
    }, [
        session.status,
    ])

    const scrollToTop = useCallback(() => {
        topRef.current?.scrollTo({
            top: 0,
            left: 0,
        })
    }, [])

    const memoizedData = useMemo(
        () => projectData,
        [
            projectData,
        ],
    )

    const columns = useMemo<ColumnDef<Project>[]>(
        () => [
            {
                id: 'select',
                cell: ({ row }) => {
                    const projectId = isDirect
                        ? (row.original.id ?? '')
                        : (row.original._links.self.href.split('/').at(-1) ?? '')
                    return (
                        <div className='form-check'>
                            <input
                                className='form-check-input'
                                type='checkbox'
                                name='projectId'
                                value={projectId}
                                id={projectId}
                                title=''
                                placeholder='Project Id'
                                checked={linkProjects.has(projectId)}
                                onChange={() => handleCheckboxes(row.original)}
                            />
                        </div>
                    )
                },
                meta: {
                    width: '7%',
                },
            },
            {
                id: 'name',
                header: t('Project Name'),
                accessorKey: 'name',
                cell: ({ row }) => {
                    const { name, version } = row.original
                    return isDirect ? (
                        <p>
                            {name} {!CommonUtils.isNullEmptyOrUndefinedString(version) && `(${version})`}
                        </p>
                    ) : (
                        name
                    )
                },
                enableSorting: true,
                meta: {
                    width: isDirect ? '17.5%' : '15%',
                },
            },
            ...(isCallback
                ? [
                      {
                          id: 'version',
                          header: t('Version'),
                          accessorKey: 'version',
                          cell: (info) => info.getValue(),
                          meta: {
                              width: '15%',
                          },
                      } as ColumnDef<Project>,
                  ]
                : [
                      {
                          id: 'version',
                          header: t('Version'),
                          accessorKey: 'version',
                          cell: (info) => info.getValue(),
                          meta: {
                              width: '12%',
                          },
                      } as ColumnDef<Project>,
                  ]),
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
                    width: isCallback ? '13%' : '17.5%',
                },
            },
            {
                id: 'description',
                header: t('Description'),
                accessorKey: 'description',
                cell: (info) => info.getValue(),
                meta: {
                    width: isCallback ? '40%' : '32.5%',
                },
            },
        ],
        [
            t,
            linkProjects,
            isDirect,
            isCallback,
        ],
    )

    const table = useReactTable({
        data: memoizedData ?? [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),

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

    const handleSearch = useCallback(
        async (searchVal: string = '', signal?: AbortSignal) => {
            const timeLimit = memoizedData && memoizedData.length !== 0 ? 700 : 0
            const timeout = setTimeout(() => {
                setShowProcessing(true)
            }, timeLimit)

            try {
                const currentSession = isDirect ? await getSession() : session.data
                if (CommonUtils.isNullOrUndefined(currentSession)) return signOut()

                const url = CommonUtils.createUrlWithParams(
                    'projects',
                    Object.fromEntries(
                        Object.entries({
                            ...pageableQueryParam,
                            ...(isCallback && searchVal && searchVal !== ''
                                ? {
                                      searchText: searchVal,
                                      luceneSearch: !exactMatch,
                                  }
                                : isCallback
                                  ? {}
                                  : CommonUtils.isNullEmptyOrUndefinedString(searchVal)
                                    ? {}
                                    : {
                                          name: searchVal,
                                          luceneSearch: !exactMatch,
                                      }),
                            ...(isCallback
                                ? {
                                      allDetails: true,
                                  }
                                : {}),
                        }).map(([key, value]) => [
                            key,
                            String(value),
                        ]),
                    ),
                )

                const response = await ApiUtils.GET(url, currentSession.user.access_token, signal)
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
                setProjectData(
                    CommonUtils.isNullOrUndefined(data['_embedded']['sw360:projects'])
                        ? []
                        : data['_embedded']['sw360:projects'],
                )
            } catch (error) {
                if (error instanceof ApiError && error.isAborted) {
                    return
                }
                if (isCallback) {
                    ApiUtils.reportError(error)
                } else {
                    const message =
                        error instanceof ApiError
                            ? error.message
                            : error instanceof Error
                              ? error.message
                              : String(error)
                    setAlert({
                        variant: 'danger',
                        message: (
                            <>
                                <p>{message}</p>
                            </>
                        ),
                    })
                }
            } finally {
                setShowProcessing(false)
                clearTimeout(timeout)
            }
        },
        [
            memoizedData,
            pageableQueryParam,
            session.data,
            isDirect,
            isCallback,
            exactMatch,
        ],
    )

    // Auto-search on pagination/sorting changes
    useEffect(() => {
        if (isCallback && !props.show) return
        if (isDirect && memoizedData === undefined) return

        const controller = new AbortController()
        const signal = controller.signal

        void handleSearch(searchValue, signal)

        return () => controller.abort()
    }, [
        pageableQueryParam,
        isCallback,
        isDirect,
        memoizedData,
        props.show,
        handleSearch,
        searchValue,
    ])

    const handleCheckboxes = (project: Project) => {
        const projectId = isDirect ? (project.id ?? '') : (project._links.self.href.split('/').at(-1) ?? '')
        const m = new Map(linkProjects)

        if (linkProjects.has(projectId)) {
            m.delete(projectId)
        } else {
            m.set(projectId, {
                enableSvm: project.enableSvm ?? true,
                name: project.name ?? '',
                projectRelationship: 'CONTAINED',
                version: project.version ?? '',
            } as LinkedProjectData)
        }
        setLinkProjects(m)
    }

    const handleLinkProjectsCallback = () => {
        if (isCallback) {
            props.setProjectPayload({
                ...props.projectPayload,
                linkedProjects: Object.fromEntries(linkProjects),
            })
        }
    }

    const handleLinkProjectsDirect = async () => {
        if (!isDirect) return

        setLinking(true)
        try {
            const currentSession = await getSession()
            if (CommonUtils.isNullOrUndefined(currentSession)) return signOut()

            const data = {
                linkedProjects: Object.fromEntries(linkProjects),
            }

            const response = await ApiUtils.PATCH(`projects/${props.projectId}`, data, currentSession.user.access_token)
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
                                href={`/projects/edit/${props.projectId}?tab=linkedProjectsAndReleases`}
                                className='text-link'
                            >
                                {t('here')}
                            </Link>{' '}
                            {t('to edit the project relation')}.
                        </p>
                    </>
                ),
            })
            props.onSuccess?.()
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
        props.setShow(false)
        setProjectData(undefined)
        setPageableQueryParam({
            page: 0,
            page_entries: 10,
            sort: 'name,asc',
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
        setSearchValue('')
        setShowProcessing(false)
    }

    return (
        <>
            <Modal
                size='lg'
                centered
                show={props.show}
                onHide={cleanup}
                aria-labelledby={t('Link Projects')}
                scrollable
            >
                <Modal.Header closeButton>
                    <Modal.Title id='linked-projects-modal'>{t('Link Projects')}</Modal.Title>
                </Modal.Header>
                <Modal.Body ref={topRef}>
                    {alert && (
                        <Alert
                            variant={alert.variant}
                            id='linkProjects.alert'
                        >
                            {alert.message}
                        </Alert>
                    )}
                    <Form>
                        <Col>
                            <Row className='mb-3'>
                                <Col xs={6}>
                                    <Form.Control
                                        type='text'
                                        placeholder={`${t('Enter Search Text')}...`}
                                        name='searchValue'
                                        value={searchValue}
                                        onChange={(event) => {
                                            setSearchValue(event.target.value)
                                        }}
                                    />
                                </Col>
                                <Col xs='auto'>
                                    <Form.Group controlId='exact-match-group'>
                                        <Form.Check
                                            inline
                                            name='exact-match'
                                            type='checkbox'
                                            id='exact-match'
                                            onChange={() => setExactMatch(!exactMatch)}
                                        />
                                        <Form.Label
                                            className='pt-2'
                                            value={exactMatch}
                                        >
                                            {t('Exact Match')}{' '}
                                            <sup>
                                                <BsInfoCircle size={20} />
                                            </sup>
                                        </Form.Label>
                                    </Form.Group>
                                </Col>
                                <Col xs='auto'>
                                    <Button
                                        variant='secondary'
                                        onClick={() => {
                                            void handleSearch(searchValue)
                                        }}
                                    >
                                        {t('Search')}
                                    </Button>
                                </Col>
                            </Row>
                            <Row>
                                <div className='mb-3'>
                                    {isCallback &&
                                    (memoizedData === undefined || memoizedData.length === 0) &&
                                    showProcessing ? (
                                        <div className='col-12 mt-1 text-center'>
                                            <Spinner className='spinner' />
                                        </div>
                                    ) : isDirect && memoizedData === undefined && showProcessing ? (
                                        <div className='col-12 mt-1 text-center'>
                                            <Spinner className='spinner' />
                                        </div>
                                    ) : memoizedData !== undefined ? (
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
                            </Row>
                        </Col>
                    </Form>
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
                            if (isCallback) {
                                handleLinkProjectsCallback()
                                cleanup()
                            } else if (isDirect) {
                                void handleLinkProjectsDirect()
                                scrollToTop()
                            }
                        }}
                        disabled={linkProjects.size === 0 || (isDirect && linking)}
                    >
                        {t('Link Projects')}
                        {isDirect && linking && (
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
