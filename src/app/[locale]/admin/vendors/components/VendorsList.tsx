// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { StatusCodes } from 'http-status-codes'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { PageSizeSelector, QuickFilter, SW360Table, TableFooter } from 'next-sw360'
import { Dispatch, type JSX, SetStateAction, useEffect, useMemo, useState } from 'react'
import { Modal, OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap'
import { BsFillTrashFill, BsGit, BsPencil, BsQuestionCircle } from 'react-icons/bs'
import { Embedded, ErrorDetails, PageableQueryParam, PaginationMeta, Vendor } from '@/object-types'
import DownloadService from '@/services/download.service'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils/index'

type EmbeddedVendors = Embedded<Vendor, 'sw360:vendors'>

const DeleteVendor = async (vendorId: string) => {
    try {
        const session = await getSession()
        if (!session) {
            return signOut()
        }
        const response = await ApiUtils.DELETE(`vendors/${vendorId}`, session.user.access_token)
        if (response.status !== StatusCodes.NO_CONTENT) {
            const err = (await response.json()) as ErrorDetails
            throw new Error(err.message)
        }
    } catch (error: unknown) {
        if (error instanceof DOMException && error.name === 'AbortError') {
            return
        }
        const message = error instanceof Error ? error.message : String(error)
        MessageService.error(message)
    }
}

function DeletionModal({
    vendor,
    setVendor,
}: {
    setVendor: Dispatch<SetStateAction<Vendor | null>>
    vendor: Vendor | null
}) {
    const t = useTranslations('default')
    return (
        <Modal
            size='lg'
            show={vendor !== null}
            onHide={() => setVendor(null)}
        >
            <Modal.Header
                style={{
                    backgroundColor: '#feefef',
                    color: '#da1414',
                }}
                closeButton
            >
                <Modal.Title className='fw-bold'>
                    <BsQuestionCircle size={20} /> {t('Delete Vendor')} ?
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className='fs-5'>
                {t.rich('Do you really want to delete the vendor', {
                    name: vendor?.shortName ?? '',
                    strong: (chunks) => <b>{chunks}</b>,
                })}
                ?
            </Modal.Body>
            <Modal.Footer>
                <button
                    className='btn btn-secondary'
                    onClick={() => setVendor(null)}
                >
                    {t('Cancel')}
                </button>
                <button
                    className='btn btn-danger'
                    onClick={() => {
                        void (async () => {
                            await DeleteVendor(vendor?._links?.self.href.split('/').at(-1) ?? '')
                            setVendor(null)
                        })()
                    }}
                >
                    {t('Delete Vendor')}
                </button>
            </Modal.Footer>
        </Modal>
    )
}

export default function VendorsList(): JSX.Element {
    const t = useTranslations('default')
    const router = useRouter()

    const [numVendors, setNumVendors] = useState<null | number>(null)
    const [delVendor, setDelVendor] = useState<Vendor | null>(null)
    const session = useSession()
    const [search, setSearch] = useState({})

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            void signOut()
        }
    }, [
        session,
    ])

    const handleAddVendor = () => {
        router.push('/admin/vendors/add')
    }

    const columns = useMemo<ColumnDef<Vendor>[]>(
        () => [
            {
                id: 'name',
                header: t('Full Name'),
                cell: ({ row }) => {
                    return (
                        <Link
                            href={`/admin/vendors/edit/${row.original._links?.self.href.split('/').at(-1)}`}
                            className='text-link'
                        >
                            {row.original.fullName}
                        </Link>
                    )
                },
                meta: {
                    width: '30%',
                },
            },
            {
                id: 'shortName',
                accessorKey: 'shortName',
                header: t('Short Name'),
                cell: (info) => info.getValue(),
                meta: {
                    width: '20%',
                },
            },
            {
                id: 'url',
                header: t('URL'),
                accessorKey: 'url',
                cell: (info) => info.getValue(),
                meta: {
                    width: '40%',
                },
            },
            {
                id: 'actions',
                header: t('Actions'),
                cell: ({ row }) => {
                    return (
                        <>
                            <span className='d-flex justify-content-evenly'>
                                <OverlayTrigger overlay={<Tooltip>{t('Edit')}</Tooltip>}>
                                    <Link
                                        href={`/admin/vendors/edit/${row.original._links?.self.href.split('/').at(-1)}`}
                                        className='text-link'
                                    >
                                        <BsPencil
                                            className='btn-icon'
                                            size={20}
                                        />
                                    </Link>
                                </OverlayTrigger>
                                <OverlayTrigger overlay={<Tooltip>{t('Merge')}</Tooltip>}>
                                    <Link
                                        href={`vendors/merge/${row.original._links?.self.href.split('/').at(-1)}`}
                                        className='text-link'
                                    >
                                        <BsGit
                                            className='btn-icon'
                                            size={20}
                                        />
                                    </Link>
                                </OverlayTrigger>
                                <OverlayTrigger overlay={<Tooltip>{t('Delete')}</Tooltip>}>
                                    <span
                                        className='d-inline-block'
                                        onClick={() => setDelVendor(row.original)}
                                    >
                                        <BsFillTrashFill
                                            className='btn-icon'
                                            size={20}
                                        />
                                    </span>
                                </OverlayTrigger>
                            </span>
                        </>
                    )
                },
                meta: {
                    width: '10%',
                },
            },
        ],
        [
            t,
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
    const [vendorData, setVendorData] = useState<Vendor[]>(() => [])
    const memoizedData = useMemo(
        () => vendorData,
        [
            vendorData,
        ],
    )
    const [showProcessing, setShowProcessing] = useState(false)

    useEffect(() => {
        if (session.status === 'loading') return
        const controller = new AbortController()
        const signal = controller.signal

        const timeLimit = vendorData.length !== 0 ? 700 : 0
        const timeout = setTimeout(() => {
            setShowProcessing(true)
        }, timeLimit)

        void (async () => {
            try {
                if (CommonUtils.isNullOrUndefined(session.data)) return signOut()
                const queryUrl = CommonUtils.createUrlWithParams(
                    `vendors`,
                    Object.fromEntries(
                        Object.entries({
                            ...pageableQueryParam,
                            ...search,
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

                const data = (await response.json()) as EmbeddedVendors
                setPaginationMeta(data.page)
                setNumVendors(data.page?.totalElements ?? 0)
                setVendorData(
                    CommonUtils.isNullOrUndefined(data['_embedded']['sw360:vendors'])
                        ? []
                        : data['_embedded']['sw360:vendors'],
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

    useEffect(() => {
        setPageableQueryParam({
            page: 0,
            page_entries: 10,
            sort: '',
        })
    }, [
        search,
    ])

    const doSearch = (value: string) => {
        setSearch({
            searchText: value,
        })
    }

    const handleExportSpreadsheet = async () => {
        try {
            const session = await getSession()
            if (CommonUtils.isNullOrUndefined(session)) return signOut()
            const url = 'vendors/exportVendorDetails'
            const currentDate = new Date().toISOString().split('T')[0]
            void DownloadService.download(url, session, `vendors-${currentDate}.xlsx`)
        } catch (error: unknown) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                return
            }
            const message = error instanceof Error ? error.message : String(error)
            MessageService.error(message)
        }
    }

    return (
        <>
            <DeletionModal
                vendor={delVendor}
                setVendor={setDelVendor}
            />
            <div className='container page-content'>
                <div className='row'>
                    <div className='col-lg-2'>
                        <QuickFilter
                            id='vendorSearch'
                            searchFunction={doSearch}
                        />
                    </div>
                    <div className='col-lg-10'>
                        <div className='row d-flex justify-content-between'>
                            <div className='col-lg-5'>
                                <button
                                    className='btn btn-primary col-auto me-2'
                                    onClick={handleAddVendor}
                                >
                                    {t('Add Vendor')}
                                </button>
                                <button
                                    className='btn btn-secondary col-auto'
                                    onClick={() => void handleExportSpreadsheet()}
                                >
                                    {t('Export Spreadsheet')}
                                </button>
                            </div>
                            <div className='col-auto buttonheader-title'>{`${t('VENDORS')} (${numVendors ?? ''})`}</div>
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
                </div>
            </div>
        </>
    )
}
