// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { PageSizeSelector, SW360Table, TableFooter } from 'next-sw360'
import React, { Dispatch, type JSX, SetStateAction, useCallback, useMemo, useRef, useState } from 'react'
import { Button, Form, Modal, Spinner } from 'react-bootstrap'
import { Embedded, ErrorDetails, HttpStatus, PageableQueryParam, PaginationMeta, Vendor } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'
import AddVendorDialog from './AddVendor'

interface Props {
    show: boolean
    setShow: Dispatch<SetStateAction<boolean>>
    setVendor: (vend: Vendor) => void
    vendor: Vendor
}

type EmbeddedVendors = Embedded<Vendor, 'sw360:vendors'>

const VendorDialog = ({ show, setShow, setVendor, vendor }: Props): JSX.Element => {
    const t = useTranslations('default')
    const [showAddVendor, setShowAddVendor] = useState(false)
    const [searchText, setSearchText] = useState('')
    const handleCloseDialog = () => {
        setShow(!show)
        setSelectedVendor(vendor)
    }
    const session = useSession()
    const [selectedVendor, setSelectedVendor] = useState<Vendor>(vendor)

    const columns = useMemo<ColumnDef<Vendor>[]>(
        () => [
            {
                id: 'select',
                cell: ({ row }) => (
                    <Form.Check
                        type='radio'
                        checked={
                            selectedVendor !== null &&
                            row.original._links?.self.href.split('/').at(-1) ===
                                selectedVendor._links?.self.href.split('/').at(-1)
                        }
                        onChange={() => setSelectedVendor(row.original)}
                    ></Form.Check>
                ),
                meta: {
                    width: '7%',
                },
            },
            {
                id: 'fullName',
                accessorKey: 'fullName',
                header: t('Full Name'),
                cell: (info) => info.getValue(),
                meta: {
                    width: '43%',
                },
            },
            {
                id: 'shortName',
                accessorKey: 'shortName',
                header: t('Short Name'),
                cell: (info) => info.getValue(),
                meta: {
                    width: '25%',
                },
            },
            {
                id: 'url',
                header: t('URL'),
                accessorKey: 'url',
                cell: (info) => info.getValue(),
                meta: {
                    width: '25%',
                },
            },
        ],
        [
            t,
            selectedVendor,
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

    const searchVendor = async () => {
        try {
            setShowProcessing(true)
            if (CommonUtils.isNullOrUndefined(session.data)) return signOut()
            const queryUrl = CommonUtils.createUrlWithParams(
                `vendors`,
                Object.fromEntries(
                    Object.entries({
                        ...pageableQueryParam,
                        ...(searchText !== ''
                            ? {
                                  searchText: searchText,
                              }
                            : {}),
                    }).map(([key, value]) => [
                        key,
                        String(value),
                    ]),
                ),
            )
            const response = await ApiUtils.GET(queryUrl, session.data.user.access_token)
            if (response.status !== HttpStatus.OK) {
                const err = (await response.json()) as ErrorDetails
                throw new Error(err.message)
            }

            const data = (await response.json()) as EmbeddedVendors
            setPaginationMeta(data.page)
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
            setShowProcessing(false)
        }
    }

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
    })

    const handleClickSelectVendor = () => {
        setVendor(selectedVendor)
        setShow(!show)
    }

    return (
        <>
            <AddVendorDialog
                show={showAddVendor}
                setShow={setShowAddVendor}
            />
            <Modal
                show={show}
                onHide={handleCloseDialog}
                backdrop='static'
                centered
                size='lg'
            >
                <Modal.Header closeButton>
                    <Modal.Title>{t('Search Vendor')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className='modal-body'>
                        <div className='row'>
                            <div className='col-lg-8'>
                                <input
                                    type='text'
                                    className='form-control'
                                    placeholder={t('Enter search text')}
                                    aria-describedby='Search Vendor'
                                    value={searchText}
                                    onChange={(event) => {
                                        setSearchText(event.target.value)
                                    }}
                                />
                            </div>
                            <div className='col-lg-4'>
                                <button
                                    type='button'
                                    className='btn btn-secondary me-2'
                                    onClick={searchVendor}
                                >
                                    {t('Search')}
                                </button>
                                <button
                                    type='button'
                                    className='btn btn-secondary me-2'
                                    onClick={() => setSearchText('')}
                                >
                                    {t('Reset')}
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
                        className='fw-bold btn btn-light button-plain me-2'
                        onClick={handleCloseDialog}
                    >
                        {t('Close')}
                    </Button>
                    <Button
                        type='button'
                        className='fw-bold btn btn-light button-plain me-2'
                        onClick={() => {
                            setShowAddVendor(!showAddVendor)
                            setShow(!show)
                        }}
                    >
                        {t('Add Vendor')}
                    </Button>
                    <Button
                        type='button'
                        className='btn btn-primary'
                        onClick={handleClickSelectVendor}
                    >
                        {t('Select Vendor')}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

export default VendorDialog
