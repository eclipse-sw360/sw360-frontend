// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ColumnDef, getCoreRowModel, getSortedRowModel, SortingState, useReactTable } from '@tanstack/react-table'
import { getSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState, type JSX } from 'react'
import { Alert, Button, Col, Form, Modal, OverlayTrigger, Row, Spinner, Tooltip } from 'react-bootstrap'
import { FaInfoCircle } from 'react-icons/fa'

import { Embedded, ErrorDetails, HttpStatus, PageableQueryParam, PaginationMeta, Project } from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils'
import { PageSizeSelector, SW360Table, TableFooter } from 'next-sw360'

type EmbeddedProjects = Embedded<Project, 'sw360:projects'>

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
    const searchValueRef = useRef<HTMLInputElement>(null)
    const topRef = useRef<HTMLDivElement | null>(null)
    const [linking, setLinking] = useState(false)

    const scrollToTop = () => {
        topRef.current?.scrollTo({ top: 0, left: 0 })
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
        [t, linkProjects],
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
    const [projectData, setProjectData] = useState<Project[] | undefined>(() => undefined)
    const memoizedData = useMemo(() => projectData, [projectData])
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

    useEffect(() => {
        if (memoizedData === undefined) return

        const controller = new AbortController()
        const signal = controller.signal

        void handleSearch(searchValueRef.current?.value ?? '', signal)

        return () => controller.abort()
    }, [pageableQueryParam])

    const handleCheckboxes = (projectId: string) => {
        const m = new Map(linkProjects)
        if (linkProjects.has(projectId)) {
            m.delete(projectId)
        } else {
            m.set(projectId, { enableSvm: true, projectRelationship: 'CONTAINED' })
        }
        setLinkProjects(m)
    }

    const handleSearch = async (searchValue: string, signal?: AbortSignal) => {
        const timeLimit = memoizedData && memoizedData.length !== 0 ? 700 : 0
        const timeout = setTimeout(() => {
            setShowProcessing(true)
        }, timeLimit)
        try {
            const session = await getSession()
            if (CommonUtils.isNullOrUndefined(session)) return signOut()

            const url = CommonUtils.createUrlWithParams(
                `projects`,
                Object.fromEntries(
                    Object.entries({
                        ...pageableQueryParam,
                        ...(CommonUtils.isNullEmptyOrUndefinedString(searchValue)
                            ? {}
                            : { name: searchValue, luceneSearch: true }),
                    }).map(([key, value]) => [key, String(value)]),
                ),
            )

            const response = await ApiUtils.GET(url, session.user.access_token, signal)
            if (response.status !== HttpStatus.OK) {
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
            setAlert({
                variant: 'danger',
                message: (
                    <>
                        <p>{message}</p>
                    </>
                ),
            })
        } finally {
            setShowProcessing(false)
            clearTimeout(timeout)
        }
    }

    const handleLinkProjects = async ({ projectId }: { projectId: string }) => {
        setLinking(true)
        try {
            const data = { linkedProjects: Object.fromEntries(linkProjects) }
            const session = await getSession()
            if (CommonUtils.isNullOrUndefined(session)) return signOut()

            const response = await ApiUtils.PATCH(`projects/${projectId}`, data, session.user.access_token)
            if (response.status !== HttpStatus.OK) {
                const err = (await response.json()) as ErrorDetails
                throw new Error(err.message)
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
                                href={'#'}
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
            if (error instanceof DOMException && error.name === 'AbortError') {
                return
            }
            const message = error instanceof Error ? error.message : String(error)
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
                                    ref={searchValueRef}
                                />
                            </Col>
                            <Col xs='auto'>
                                <Form.Group controlId='exact-match-group'>
                                    <Form.Check
                                        inline
                                        name='exact-match'
                                        type='checkbox'
                                        id='exact-match'
                                    />
                                    <Form.Label className='pt-2'>
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
                                    onClick={() => void handleSearch(searchValueRef.current?.value ?? '')}
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
                            void handleLinkProjects({ projectId })
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
