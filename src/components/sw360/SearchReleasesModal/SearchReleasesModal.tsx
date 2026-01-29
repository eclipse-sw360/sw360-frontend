// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

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
import {
    ClientSidePageSizeSelector,
    ClientSideTableFooter,
    PageSizeSelector,
    SW360Table,
    TableFooter,
} from 'next-sw360'
import React, { type JSX, useEffect, useMemo, useState } from 'react'
import { Button, Col, Form, Modal, Row, Spinner } from 'react-bootstrap'
import { BsInfoCircle } from 'react-icons/bs'
import { Embedded, ErrorDetails, PageableQueryParam, PaginationMeta, ReleaseDetail } from '@/object-types'
import { ApiError, ApiUtils, CommonUtils } from '@/utils'

interface Props {
    projectId?: string | undefined
    show: boolean
    setShow: React.Dispatch<React.SetStateAction<boolean>>
    setSelectedReleases: React.Dispatch<React.SetStateAction<Array<ReleaseDetail>>>
}

type EmbeddedReleases = Embedded<ReleaseDetail, 'sw360:releases'>

const Capitalize = (text: string) =>
    text.split('_').reduce((s, c) => s + ' ' + (c.charAt(0) + c.substring(1).toLocaleLowerCase()), '')

const SearchReleasesModal = ({ projectId, show, setShow, setSelectedReleases }: Props): JSX.Element => {
    const t = useTranslations('default')
    const [selectingReleaseOnTable, setSelectingReleaseOnTable] = useState<Array<ReleaseDetail>>([])
    const [searchText, setSearchText] = useState<string | undefined>(undefined)
    const [exactMatch, setExactMatch] = useState(false)
    const [onlySubProjectReleases, setOnlySubProjectReleases] = useState(false)
    const session = useSession()

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            void signOut()
        }
    }, [
        session,
    ])

    const handleSelectRelease = (relDetail: ReleaseDetail) => {
        const selectingReleaseIds = selectingReleaseOnTable.map((rel) => rel.id)
        if (selectingReleaseIds.includes(relDetail.id)) {
            setSelectingReleaseOnTable(selectingReleaseOnTable.filter((release) => release.id !== relDetail.id))
            return
        }

        setSelectingReleaseOnTable([
            ...selectingReleaseOnTable,
            relDetail,
        ])
    }

    const columns = useMemo<ColumnDef<ReleaseDetail>[]>(
        () => [
            {
                id: 'selectReleaseCheckbox',
                cell: ({ row }) => {
                    const { id: releaseId } = row.original
                    return (
                        <div className='form-check'>
                            <input
                                className='form-check-input'
                                type='checkbox'
                                value={releaseId ?? ''}
                                checked={
                                    selectingReleaseOnTable.findIndex(
                                        (r: ReleaseDetail) => r.id === (releaseId ?? ''),
                                    ) !== -1
                                }
                                onChange={() => handleSelectRelease(row.original)}
                            />
                        </div>
                    )
                },
                meta: {
                    width: '8%',
                },
            },
            {
                id: 'vendor',
                header: t('Vendor'),
                cell: ({ row }) => <>{row.original.vendor ? (row.original.vendor.fullName ?? '') : ''}</>,
                meta: {
                    width: '22%',
                },
            },
            {
                id: 'componentName',
                header: t('Component Name'),
                cell: ({ row }) => (
                    <Link
                        className='text-link'
                        href={`/components/detail/${row.original['_links']['sw360:component']['href'].split('/').pop() ?? ''}`}
                    >
                        {row.original.name}
                    </Link>
                ),
                meta: {
                    width: '20%',
                },
            },
            {
                id: 'releaseVersion',
                header: t('Release version'),
                cell: ({ row }) => {
                    const { id, version } = row.original
                    return (
                        <Link
                            className='text-link'
                            href={`/components/releases/detail/${id}`}
                        >
                            {version}
                        </Link>
                    )
                },
                meta: {
                    width: '20%',
                },
            },
            {
                id: 'clearingState',
                header: t('Clearing State'),
                cell: ({ row }) => <>{Capitalize(row.original.clearingState ?? '')}</>,
                meta: {
                    width: '15%',
                },
            },
            {
                id: 'mainlineState',
                header: t('Mainline State'),
                cell: ({ row }) => <>{Capitalize(row.original.mainlineState ?? '')}</>,
                meta: {
                    width: '15%',
                },
            },
        ],
        [
            t,
            selectingReleaseOnTable,
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
    const [releaseData, setReleaseData] = useState<ReleaseDetail[]>(() => [])
    const memoizedData = useMemo(
        () => releaseData,
        [
            releaseData,
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
                `releases`,
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

            const data = (await response.json()) as EmbeddedReleases
            setPaginationMeta(data.page)
            setReleaseData(
                CommonUtils.isNullOrUndefined(data['_embedded']['sw360:releases'])
                    ? []
                    : data['_embedded']['sw360:releases'],
            )
        } catch (error) {
            ApiUtils.reportError(error)
        } finally {
            setShowProcessing(false)
        }
    }

    const getLinkedReleasesOfSubProjects = async () => {
        setOnlySubProjectReleases(true)
        setShowProcessing(true)
        try {
            if (CommonUtils.isNullOrUndefined(session.data)) return signOut()

            const response = await ApiUtils.GET(
                `projects/${projectId}/subProjects/releases`,
                session.data.user.access_token,
            )
            if (response.status !== StatusCodes.OK) {
                const err = (await response.json()) as ErrorDetails
                throw new ApiError(err.message, {
                    status: response.status,
                })
            }

            const data = (await response.json()) as EmbeddedReleases
            setReleaseData(
                CommonUtils.isNullOrUndefined(data['_embedded']['sw360:releases'])
                    ? []
                    : data['_embedded']['sw360:releases'],
            )
        } catch (error) {
            ApiUtils.reportError(error)
        } finally {
            setShowProcessing(false)
        }
    }

    const closeModal = () => {
        setShow(false)
        setReleaseData([])
        setSelectingReleaseOnTable([])
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
    }

    return (
        <Modal
            size='lg'
            centered
            show={show}
            onHide={() => {
                closeModal()
            }}
            aria-labelledby={t('Link Releases')}
            scrollable
        >
            <Modal.Header closeButton>
                <Modal.Title id='linked-projects-modal'>{t('Link Releases')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
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
                                <Button
                                    type='submit'
                                    variant='secondary'
                                    onClick={() => {
                                        if (!searchText) setSearchText('')
                                        handleSearch()
                                    }}
                                >
                                    {t('Search')}
                                </Button>
                            </Col>
                            <Col ls='auto'>
                                <Button
                                    type='submit'
                                    variant='secondary'
                                    onClick={() => void getLinkedReleasesOfSubProjects()}
                                >
                                    {t(`Releases of linked projects`)}
                                </Button>
                            </Col>
                        </Row>
                        <Row>
                            <Form.Group controlId='exact-match-group'>
                                <Form.Check
                                    inline
                                    name='exact-match'
                                    type='checkbox'
                                    id='exact-match'
                                    onChange={() => setExactMatch(!exactMatch)}
                                />
                                <Form.Label className='pt-2'>
                                    {t('Exact Match')}{' '}
                                    <sup>
                                        <BsInfoCircle size={20} />
                                    </sup>
                                </Form.Label>
                            </Form.Group>
                        </Row>
                        <Row>
                            {onlySubProjectReleases ? (
                                <div className='mb-3'>
                                    {table ? (
                                        <>
                                            <ClientSidePageSizeSelector table={table} />
                                            <SW360Table
                                                table={table}
                                                showProcessing={showProcessing}
                                            />
                                            <ClientSideTableFooter table={table} />
                                        </>
                                    ) : (
                                        <div className='col-12 mt-1 text-center'>
                                            <Spinner className='spinner' />
                                        </div>
                                    )}
                                </div>
                            ) : (
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
                        setSelectedReleases(selectingReleaseOnTable)
                        closeModal()
                    }}
                    disabled={selectingReleaseOnTable.length === 0}
                >
                    {t('Link Releases')}
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default SearchReleasesModal
