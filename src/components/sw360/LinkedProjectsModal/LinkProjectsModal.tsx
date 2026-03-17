// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ColumnDef, getCoreRowModel, SortingState, useReactTable } from '@tanstack/react-table'
import { StatusCodes } from 'http-status-codes'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { PageSizeSelector, SW360Table, TableFooter } from 'next-sw360'
import { type JSX, useEffect, useMemo, useState } from 'react'
import { Alert, Button, Col, Form, Modal, Row, Spinner } from 'react-bootstrap'
import { BsInfoCircle } from 'react-icons/bs'
import { createLinkedProjectsColumns } from '@/components/sw360/LinkedProjectsModal/linkedProjectsColumns'
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

interface Props {
    projectPayload: ProjectPayload
    setProjectPayload: React.Dispatch<React.SetStateAction<ProjectPayload>>
    show: boolean
    setShow: (show: boolean) => void
}

type EmbeddedProjects = Embedded<Project, 'sw360:projects'>

export default function LinkProjectsModal({ projectPayload, setProjectPayload, show, setShow }: Props): JSX.Element {
    const t = useTranslations('default')
    const [linkProjects, setLinkProjects] = useState<Map<string, LinkedProjectData>>(new Map())
    const [alert, setAlert] = useState<AlertData | null>(null)
    const [searchText, setSearchText] = useState<string | undefined>(undefined)
    const [exactMatch, setExactMatch] = useState(false)
    const session = useSession()

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            void signOut()
        }
    }, [
        session,
    ])

    useEffect(() => {
        setLinkProjects(new Map(Object.entries(projectPayload.linkedProjects ?? {})))
    }, [
        projectPayload,
    ])

    const getProjectId = (project: Project): string => project._links.self.href.split('/').at(-1) ?? ''

    const handleCheckboxes = (project: Project) => {
        const m = new Map(linkProjects)
        const projectId = getProjectId(project)
        if (linkProjects.has(projectId)) {
            m.delete(projectId)
        } else {
            m.set(projectId, {
                enableSvm: project.enableSvm ?? false,
                name: project.name ?? '',
                projectRelationship: 'CONTAINED',
                version: project.version ?? '',
            } as LinkedProjectData)
        }
        setLinkProjects(m)
    }

    const selectedProjectIds = useMemo(
        () => new Set(linkProjects.keys()),
        [
            linkProjects,
        ],
    )

    // Refactor: both link-project modals now use one shared column factory for consistent table UI.
    const columns = useMemo<ColumnDef<Project>[]>(
        () =>
            createLinkedProjectsColumns({
                t,
                selectedProjectIds,
                onToggleProject: handleCheckboxes,
                getProjectId: getProjectId,
            }),
        [
            t,
            selectedProjectIds,
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
    const [projectData, setProjectData] = useState<Project[]>(() => [])
    const memoizedData = useMemo(
        () => projectData,
        [
            projectData,
        ],
    )
    const [showProcessing, setShowProcessing] = useState(false)

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

    const table = useReactTable({
        data: memoizedData,
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
                    sort: '',
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

    const handleSearch = async (signal?: AbortSignal) => {
        try {
            if (CommonUtils.isNullOrUndefined(session.data)) return signOut()

            const queryUrl = CommonUtils.createUrlWithParams(
                `projects`,
                Object.fromEntries(
                    Object.entries({
                        ...pageableQueryParam,
                        ...(searchText && searchText !== ''
                            ? {
                                  searchText: searchText,
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
        } catch (error) {
            ApiUtils.reportError(error)
        } finally {
            setShowProcessing(false)
        }
    }

    const projectPayloadSetter = () => {
        setProjectPayload({
            ...projectPayload,
            linkedProjects: Object.fromEntries(linkProjects),
        })
    }

    const closeModal = () => {
        setShow(false)
        setProjectData([])
        setAlert(null)
        setExactMatch(false)
        setPaginationMeta({
            size: 0,
            totalElements: 0,
            totalPages: 0,
            number: 0,
        })
        setPageableQueryParam({
            page: 0,
            page_entries: 10,
            sort: '',
        })
        setSearchText(undefined)
    }

    return (
        <Modal
            size='lg'
            centered
            show={show}
            onHide={() => {
                closeModal()
            }}
            aria-labelledby={t('Link Projects')}
            scrollable
        >
            <Modal.Header closeButton>
                <Modal.Title id='linked-projects-modal'>{t('Link Projects')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
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
                                    onChange={(event) => {
                                        setSearchText(event.target.value)
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
                                        if (!searchText) setSearchText('')
                                        handleSearch()
                                    }}
                                >
                                    {t('Search')}
                                </Button>
                            </Col>
                        </Row>
                        <Row>
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
                        </Row>
                    </Col>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    variant='dark'
                    onClick={() => {
                        closeModal()
                    }}
                >
                    {t('Close')}
                </Button>
                <Button
                    variant='primary'
                    onClick={() => {
                        projectPayloadSetter()
                        closeModal()
                    }}
                    disabled={linkProjects.size === 0}
                >
                    {t('Link Projects')}
                </Button>
            </Modal.Footer>
        </Modal>
    )
}
