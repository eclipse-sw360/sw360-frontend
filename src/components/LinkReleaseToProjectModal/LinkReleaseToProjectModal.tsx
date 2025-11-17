// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

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
import { type JSX, useEffect, useMemo, useState } from 'react'
import { Alert, Button, Col, Form, Modal, OverlayTrigger, Row, Spinner, Tooltip } from 'react-bootstrap'
import { PiCheckBold } from 'react-icons/pi'
import { PageSizeSelector, SW360Table, TableFooter } from '@/components/sw360'
import {
    Embedded,
    ErrorDetails,
    PageableQueryParam,
    PaginationMeta,
    Project,
    Release,
    ReleaseDetail,
} from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'

interface Props {
    releaseId?: string
    show: boolean
    setShow: React.Dispatch<React.SetStateAction<boolean>>
}

type EmbeddedProjects = Embedded<Project, 'sw360:projects'>

const Capitalize = (text: string) =>
    text.split('_').reduce((s, c) => s + ' ' + (c.charAt(0) + c.substring(1).toLocaleLowerCase()), '')

const LinkReleaseToProjectModal = ({ releaseId, show, setShow }: Props): JSX.Element => {
    const t = useTranslations('default')
    const [linkingReleaseName, setLinkingReleaseName] = useState('')
    const [withLinkedProject, setWithLinkedProject] = useState(true)
    const [showMessage, setShowMessage] = useState(false)
    const [searchText, setSearchText] = useState<string | undefined>(undefined)
    const [selectedProject, setSelectedProject] = useState<Project>()
    const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([])
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
                cell: ({ row }) => {
                    if (
                        withLinkedProject &&
                        selectedProjectIds.indexOf(row.original._links.self.href.split('/').at(-1) ?? '') !== -1
                    ) {
                        return <PiCheckBold color='green' />
                    } else {
                        return (
                            <div className='form-check'>
                                <input
                                    className='form-check-input'
                                    type='radio'
                                    name='projectId'
                                    checked={
                                        selectedProject?._links.self.href.split('/').at(-1) ===
                                        row.original._links.self.href.split('/').at(-1)
                                    }
                                    onChange={() => setSelectedProject(row.original)}
                                />
                            </div>
                        )
                    }
                },
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
            selectedProjectIds,
            selectedProject,
            withLinkedProject,
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

    const handleCloseDialog = () => {
        setShow(false)
        setSelectedProjectIds([])
        setProjectData([])
        setWithLinkedProject(true)
        setSelectedProject(undefined)
        setShowMessage(false)
        setSearchText(undefined)
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
        setLinkingReleaseName('')
    }

    const handleLinkToProject = async () => {
        try {
            if (CommonUtils.isNullOrUndefined(session.data)) return signOut()

            const response = await ApiUtils.PATCH(
                `projects/${selectedProject?._links.self.href.split('/').at(-1)}/releases`,
                [
                    releaseId,
                ],
                session.data.user.access_token,
            )
            if (response.status !== StatusCodes.CREATED) {
                const err = (await response.json()) as ErrorDetails
                throw new Error(err.message)
            }

            setShowMessage(true)
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                return
            }
            const message = error instanceof Error ? error.message : String(error)
            MessageService.error(message)
        }
    }

    const [showLinkedProjectsProcessing, setShowLinkedProjectsProcessing] = useState(false)

    const getLinkedProjects = async (signal: AbortSignal) => {
        setShowLinkedProjectsProcessing(true)
        try {
            if (CommonUtils.isNullOrUndefined(session.data)) return signOut()

            const response = await ApiUtils.GET(`releases/usedBy/${releaseId}`, session.data.user.access_token, signal)
            if (response.status !== StatusCodes.OK) {
                const err = (await response.json()) as ErrorDetails
                throw new Error(err.message)
            }

            const data = (await response.json()) as EmbeddedProjects
            setSelectedProjectIds(
                CommonUtils.isNullOrUndefined(data['_embedded']['sw360:projects'])
                    ? []
                    : data['_embedded']['sw360:projects'].map((p) => p._links.self.href.split('/').at(-1) ?? ''),
            )
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                return
            }
            const message = error instanceof Error ? error.message : String(error)
            MessageService.error(message)
        } finally {
            setShowLinkedProjectsProcessing(false)
        }
    }

    useEffect(() => {
        if (session.status === 'loading' || !withLinkedProject || !show) return
        const controller = new AbortController()
        const signal = controller.signal
        void getLinkedProjects(signal)
        return () => controller.abort()
    }, [
        withLinkedProject,
        show,
    ])

    useEffect(() => {
        if (session.status === 'loading') return
        const controller = new AbortController()
        const signal = controller.signal
        void (async () => {
            try {
                if (CommonUtils.isNullOrUndefined(session.data)) return signOut()

                const response = await ApiUtils.GET(`releases/${releaseId}`, session.data.user.access_token, signal)
                if (response.status !== StatusCodes.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new Error(err.message)
                }

                const data = (await response.json()) as ReleaseDetail
                setLinkingReleaseName(data.name)
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return
                }
                const message = error instanceof Error ? error.message : String(error)
                MessageService.error(message)
            }
        })()
        return () => controller.abort()
    }, [
        releaseId,
    ])

    return (
        <>
            {session.status === 'authenticated' && (
                <Modal
                    show={show}
                    onHide={handleCloseDialog}
                    backdrop='static'
                    centered
                    size='lg'
                >
                    <Modal.Header closeButton>
                        <Modal.Title>{t('Link Release to Project')}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body
                        style={{
                            overflow: 'scroll',
                        }}
                    >
                        <Alert
                            variant='success'
                            show={showMessage}
                        >
                            {t.rich('The release has been successfully linked to project', {
                                releaseName: linkingReleaseName,
                                projectName: selectedProject?.name ?? '',
                                strong: (chunks) => <b>{chunks}</b>,
                            })}
                            <br />
                            {t.rich(
                                'Click here to edit the release relation as well as the project mainline state in the project',
                                {
                                    link: (chunks) => (
                                        <Link
                                            className='text-link'
                                            href={`/projects/detail/${selectedProject?._links.self.href.split('/').at(-1)}`}
                                        >
                                            {chunks}
                                        </Link>
                                    ),
                                },
                            )}
                        </Alert>
                        <Form>
                            <Row>
                                <Col lg='5'>
                                    <Form.Control
                                        type='text'
                                        placeholder={`${t('Enter text search')}...`}
                                        onChange={(event) => {
                                            setSearchText(event.target.value)
                                        }}
                                    />
                                </Col>
                                <Col lg='3'>
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
                                <Col lg='4'>
                                    <Form.Check
                                        type='checkbox'
                                        id='show-linked-project'
                                        label={t('Show already linked projects')}
                                        style={{
                                            fontWeight: 'bold',
                                        }}
                                        checked={withLinkedProject}
                                        onChange={() => setWithLinkedProject(!withLinkedProject)}
                                    />
                                </Col>
                            </Row>
                        </Form>
                        <br />
                        <div className='mb-3'>
                            {pageableQueryParam && table && paginationMeta ? (
                                <>
                                    <PageSizeSelector
                                        pageableQueryParam={pageableQueryParam}
                                        setPageableQueryParam={setPageableQueryParam}
                                    />
                                    <SW360Table
                                        table={table}
                                        showProcessing={showProcessing || showLinkedProjectsProcessing}
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
                    </Modal.Body>
                    <Modal.Footer className='justify-content-end'>
                        {showMessage === true ? (
                            <Button
                                className='delete-btn'
                                variant='primary'
                                onClick={handleCloseDialog}
                            >
                                {' '}
                                {t('Close')}{' '}
                            </Button>
                        ) : (
                            <>
                                <Button
                                    className='delete-btn'
                                    variant='light'
                                    onClick={handleCloseDialog}
                                >
                                    {' '}
                                    {t('Close')}{' '}
                                </Button>
                                <Button
                                    className='login-btn'
                                    variant='primary'
                                    onClick={handleLinkToProject}
                                    disabled={selectedProject === undefined}
                                >
                                    {t('Link To Project')}
                                </Button>
                            </>
                        )}
                    </Modal.Footer>
                </Modal>
            )}
        </>
    )
}

export default LinkReleaseToProjectModal
