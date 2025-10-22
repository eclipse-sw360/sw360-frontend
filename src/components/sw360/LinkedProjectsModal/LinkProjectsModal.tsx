// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ColumnDef, getCoreRowModel, SortingState, useReactTable } from '@tanstack/react-table'
import { StatusCodes } from 'http-status-codes'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { PageSizeSelector, SW360Table, TableFooter } from 'next-sw360'
import { ChangeEvent, type JSX, useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Button, Col, Form, Modal, OverlayTrigger, Row, Spinner, Tooltip } from 'react-bootstrap'
import { FaInfoCircle } from 'react-icons/fa'
import {
    Embedded,
    ErrorDetails,
    LinkedProjectData,
    PageableQueryParam,
    PaginationMeta,
    Project,
    ProjectPayload,
} from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'

interface AlertData {
    variant: string
    message: JSX.Element
}

interface Props {
    setLinkedProjectData: React.Dispatch<React.SetStateAction<Map<string, LinkedProjectData>>>
    projectPayload: ProjectPayload
    setProjectPayload: React.Dispatch<React.SetStateAction<ProjectPayload>>
    show: boolean
    setShow: (show: boolean) => void
}

type EmbeddedProjects = Embedded<Project, 'sw360:projects'>

const Capitalize = (text: string) =>
    text.split('_').reduce((s, c) => s + ' ' + (c.charAt(0) + c.substring(1).toLocaleLowerCase()), '')

export default function LinkProjectsModal({
    setLinkedProjectData,
    projectPayload,
    setProjectPayload,
    show,
    setShow,
}: Props): JSX.Element {
    const t = useTranslations('default')
    const [linkProjects, setLinkProjects] = useState<Map<string, LinkedProjectData>>(new Map())
    const [alert, setAlert] = useState<AlertData | null>(null)
    const isExactMatch = useRef<boolean>(false)
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

    const columns = useMemo<ColumnDef<Project>[]>(
        () => [
            {
                id: 'select',
                cell: ({ row }) => (
                    <div className='form-check'>
                        <input
                            className='form-check-input'
                            type='checkbox'
                            name='projectId'
                            value={row.original._links.self.href.split('/').at(-1) ?? ''}
                            id={row.original._links.self.href.split('/').at(-1) ?? ''}
                            title=''
                            placeholder='Project Id'
                            checked={linkProjects.has(row.original._links.self.href.split('/').at(-1) ?? '')}
                            onChange={() => handleCheckboxes(row.original)}
                        />
                    </div>
                ),
                meta: {
                    width: '7%',
                },
            },
            {
                id: 'name',
                header: t('Name'),
                accessorKey: 'name',
                cell: (info) => info.getValue(),
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
        ],
        [
            t,
            linkProjects,
        ],
    )
    const [pageableQueryParam, setPageableQueryParam] = useState<PageableQueryParam>({
        page: 0,
        page_entries: 10,
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
    })

    const handleExactMatchChange = (event: ChangeEvent<HTMLInputElement>) => {
        const isExactMatchSelected = event.target.checked
        isExactMatch.current = isExactMatchSelected
    }

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
                                  luceneSearch: exactMatch,
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
            setShowProcessing(false)
        }
    }

    const projectPayloadSetter = (projectPayloadData: Map<string, LinkedProjectData>) => {
        if (projectPayloadData.size > 0) {
            const updatedProjectPayload = {
                ...projectPayload,
            }
            if (updatedProjectPayload.linkedProjects === undefined) {
                updatedProjectPayload.linkedProjects = {}
            }
            for (const [projectId, linkedProject] of projectPayloadData) {
                updatedProjectPayload.linkedProjects[projectId] = {
                    projectRelationship: linkedProject.projectRelationship,
                    enableSvm: linkedProject.enableSvm,
                    name: linkedProject.name,
                    version: linkedProject.version,
                }
            }
            setProjectPayload(updatedProjectPayload)
        }
    }

    const handleCheckboxes = (project: Project) => {
        const m = new Map(linkProjects)
        if (linkProjects.has(project._links.self.href.split('/').at(-1) ?? '')) {
            m.delete(project._links.self.href.split('/').at(-1) ?? '')
        } else {
            m.set(project._links.self.href.split('/').at(-1) ?? '', {
                enableSvm: project.enableSvm ?? false,
                name: project.name ?? '',
                projectRelationship: 'CONTAINED',
                version: project.version ?? '',
            } as LinkedProjectData)
        }
        setLinkProjects(m)
    }

    const closeModal = () => {
        setShow(false)
        setProjectData([])
        setAlert(null)
        setLinkProjects(new Map())
        isExactMatch.current = false
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
                                        onChange={handleExactMatchChange}
                                    />
                                    <Form.Label
                                        className='pt-2'
                                        value={exactMatch}
                                        onClick={() => setExactMatch((prev) => !prev)}
                                    >
                                        {t('Exact Match')}{' '}
                                        <sup>
                                            <FaInfoCircle />
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
                        setLinkedProjectData(linkProjects)
                        setShow(false)
                        projectPayloadSetter(linkProjects)
                    }}
                    disabled={linkProjects.size === 0}
                >
                    {t('Link Projects')}
                </Button>
            </Modal.Footer>
        </Modal>
    )
}
