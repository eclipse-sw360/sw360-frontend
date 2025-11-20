// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { StatusCodes } from 'http-status-codes'
import { notFound, useSearchParams } from 'next/navigation'
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { type JSX, useEffect, useMemo, useState } from 'react'
import { Button, Form, Modal, Spinner } from 'react-bootstrap'
import {
    Embedded,
    ErrorDetails,
    PageableQueryParam,
    PaginationMeta,
    Release,
    ReleaseDetail,
    ReleaseLink,
} from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'
import { PageSizeSelector, SW360Table, TableFooter } from '../Table/Components'

interface Props {
    show: boolean
    setShow: React.Dispatch<React.SetStateAction<boolean>>
    onReRender: () => void
    releaseLinks: ReleaseLink[]
    setReleaseLinks: React.Dispatch<React.SetStateAction<ReleaseLink[]>>
    releasePayload: Release
    setReleasePayload: React.Dispatch<React.SetStateAction<Release>>
}

type EmbeddedReleases = Embedded<ReleaseDetail, 'sw360:releases'>

const Capitalize = (text: string) =>
    text.split('_').reduce((s, c) => s + ' ' + (c.charAt(0) + c.substring(1).toLocaleLowerCase()), '')

const LinkedReleasesDialog = ({
    show,
    setShow,
    onReRender,
    releaseLinks,
    setReleaseLinks,
    releasePayload,
    setReleasePayload,
}: Props): JSX.Element => {
    const t = useTranslations('default')
    const [linkedReleases, setLinkedReleases] = useState<Array<ReleaseDetail>>([])
    const [linkedReleasesResponse, setLinkedReleasesResponse] = useState<ReleaseLink[]>([])
    const [searchText, setSearchText] = useState<string | undefined>(undefined)
    const handleCloseDialog = () => {
        setShow(!show)
    }
    const session = useSession()

    const columns = useMemo<ColumnDef<ReleaseDetail>[]>(
        () => [
            {
                id: 'select',
                cell: ({ row }) => (
                    <Form.Check
                        type='checkbox'
                        checked={linkedReleases.map((r) => r.id).includes(row.original.id ?? '')}
                        onChange={() => handlSelectRelease(row.original)}
                    ></Form.Check>
                ),
                meta: {
                    width: '7%',
                },
            },
            {
                id: 'vendor',
                header: t('Vendor'),
                cell: ({ row }) => <div className='text-center'>{row.original.vendor?.fullName ?? ''}</div>,
            },
            {
                id: 'componentName',
                header: t('Component Name'),
                cell: ({ row }) => <div className='text-center'>{row.original.name}</div>,
            },
            {
                id: 'releaseVersion',
                header: 'Release Version',
                cell: ({ row }) => <div className='text-center'>{row.original.version}</div>,
            },
            {
                id: 'clearingState',
                header: t('Clearing State'),
                cell: ({ row }) => <div className='text-center'>{Capitalize(row.original.clearingState ?? '')}</div>,
            },
            {
                id: 'mainlineState',
                header: t('Mainline State'),
                cell: ({ row }) => <div className='text-center'>{row.original.mainlineState ?? t('OPEN')}</div>,
            },
        ],
        [
            t,
            linkedReleases,
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
    const [releaseData, setVendorData] = useState<ReleaseDetail[]>(() => [])
    const memoizedData = useMemo(
        () => releaseData,
        [
            releaseData,
        ],
    )
    const [showProcessing, setShowProcessing] = useState(false)

    const searchLinkedReleases = async (signal?: AbortSignal) => {
        try {
            setShowProcessing(true)
            if (CommonUtils.isNullOrUndefined(session.data)) return signOut()
            const queryUrl = CommonUtils.createUrlWithParams(
                `releases`,
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

            const data = (await response.json()) as EmbeddedReleases
            setPaginationMeta(data.page)
            setVendorData(
                CommonUtils.isNullOrUndefined(data['_embedded']['sw360:releases'])
                    ? []
                    : data['_embedded']['sw360:releases'],
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

    useEffect(() => {
        if (session.status === 'loading' || searchText === undefined) return
        const controller = new AbortController()
        const signal = controller.signal
        searchLinkedReleases(signal)
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

    const handleClickSelectLinkedReleases = () => {
        linkedReleasesResponse.forEach((linkedRelease: ReleaseLink) => {
            releaseLinks.push(linkedRelease)
        })
        const mapReleaseRelationship = new Map<string, string>()
        releaseLinks.forEach((item) => {
            mapReleaseRelationship.set(item.id, item.releaseRelationship)
        })
        const obj = Object.fromEntries(mapReleaseRelationship)
        setReleasePayload({
            ...releasePayload,
            releaseIdToRelationship: obj,
        })
        releaseLinks = releaseLinks.filter((v, index, a) => a.findIndex((v2) => v2.id === v.id) === index)
        setReleaseLinks(releaseLinks)
        setShow(!show)
        onReRender()
    }

    const handlSelectRelease = (item: ReleaseDetail) => {
        const releases: ReleaseDetail[] = linkedReleases
        if (linkedReleases.map((rel) => rel.id).includes(item.id)) {
            const index = linkedReleases.map((rel) => rel.id).indexOf(item.id)
            releases.splice(index, 1)
        } else {
            releases.push(item)
        }
        setLinkedReleases(releases)
        const releaseLinks: ReleaseLink[] = []
        releases.forEach((item: ReleaseDetail) => {
            const releaseLink: ReleaseLink = {
                id: CommonUtils.getIdFromUrl(item._links.self.href),
                name: item.name,
                version: item.version,
                mainlineState: item.mainlineState,
                clearingState: item.clearingState,
                vendor: item.vendor ? item.vendor.fullName : '',
                releaseRelationship: 'CONTAINED',
            }
            releaseLinks.push(releaseLink)
        })
        setLinkedReleasesResponse(releaseLinks)
    }

    return (
        <Modal
            show={show}
            onHide={handleCloseDialog}
            backdrop='static'
            centered
            size='lg'
        >
            <Modal.Header closeButton>
                <Modal.Title>{t('Link Releases')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className='modal-body'>
                    <div className='row'>
                        <div className='col-lg-8'>
                            <input
                                type='text'
                                className='form-control'
                                placeholder={t('Enter search text')}
                                onChange={(event) => {
                                    setSearchText(event.target.value)
                                }}
                            />
                        </div>
                        <div className='col-lg-4'>
                            <button
                                type='button'
                                className={`fw-bold btn btn-secondary`}
                                onClick={() => {
                                    if (!searchText) setSearchText('')
                                    searchLinkedReleases()
                                }}
                            >
                                {t('Search')}
                            </button>
                        </div>
                    </div>
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
                </div>
            </Modal.Body>
            <Modal.Footer className='justify-content-end'>
                <Button
                    type='button'
                    data-bs-dismiss='modal'
                    className={`fw-bold btn btn-secondary`}
                    onClick={handleCloseDialog}
                >
                    {t('Close')}
                </Button>
                <Button
                    type='button'
                    className={`fw-bold btn btn-secondary`}
                    onClick={handleClickSelectLinkedReleases}
                >
                    {t('Link Releases')}
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default LinkedReleasesDialog
