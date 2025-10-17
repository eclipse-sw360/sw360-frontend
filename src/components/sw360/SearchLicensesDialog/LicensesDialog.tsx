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
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { type JSX, useEffect, useMemo, useRef, useState } from 'react'
import { Button, Form, Modal, Spinner } from 'react-bootstrap'
import { Embedded, ErrorDetails, LicenseDetail, PageableQueryParam, PaginationMeta } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'
import { PageSizeSelector, SW360Table, TableFooter } from '../Table/Components'

interface Props {
    show: boolean
    setShow: React.Dispatch<React.SetStateAction<boolean>>
    selectLicenses: (licenses: { [k: string]: string }) => void
    releaseLicenses: {
        [k: string]: string
    }
}

type EmbeddedLicenses = Embedded<LicenseDetail, 'sw360:licenses'>

const LicensesDialog = ({ show, setShow, selectLicenses, releaseLicenses }: Props): JSX.Element => {
    const t = useTranslations('default')
    const [selectedLicenses, setSelectedLicenses] = useState<{
        [k: string]: string
    }>(releaseLicenses)
    const [searchText, setSearchText] = useState<string | undefined>(undefined)
    const session = useSession()

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            void signOut()
        }
    }, [
        session,
    ])

    const handleCheckbox = (item: LicenseDetail) => {
        const copiedLicenses = {
            ...selectedLicenses,
        }
        const licenseId = item._links?.self.href.split('/').at(-1)
        if (licenseId === undefined) return
        if (Object.keys(copiedLicenses).includes(licenseId)) {
            delete copiedLicenses[licenseId]
        } else {
            copiedLicenses[licenseId] = item.fullName ?? ''
        }
        setSelectedLicenses(copiedLicenses)
    }

    const columns = useMemo<ColumnDef<LicenseDetail>[]>(
        () => [
            {
                id: 'licenseId',
                cell: ({ row }) => (
                    <Form.Check
                        name='licenseId'
                        type='checkbox'
                        checked={Object.keys(selectedLicenses).includes(
                            row.original._links?.self.href.split('/').at(-1) ?? '',
                        )}
                        onClick={() => {
                            handleCheckbox(row.original)
                        }}
                    ></Form.Check>
                ),
            },
            {
                id: 'license',
                header: t('License'),
                cell: ({ row }) => <>{row.original.fullName}</>,
            },
        ],
        [
            t,
            selectedLicenses,
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
    const [licenseData, setLicenseData] = useState<LicenseDetail[]>(() => [])
    const memoizedData = useMemo(
        () => licenseData,
        [
            licenseData,
        ],
    )
    const [showProcessing, setShowProcessing] = useState(false)

    const handleSearch = async (signal?: AbortSignal) => {
        try {
            if (CommonUtils.isNullOrUndefined(session.data)) return signOut()

            const queryUrl = CommonUtils.createUrlWithParams(
                `licenses`,
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

            const data = (await response.json()) as EmbeddedLicenses
            setPaginationMeta(data.page)
            setLicenseData(
                CommonUtils.isNullOrUndefined(data['_embedded']['sw360:licenses'])
                    ? []
                    : data['_embedded']['sw360:licenses'],
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
        handleSearch(signal)
        return () => controller.abort()
    }, [
        pageableQueryParam,
        session,
    ])

    const handleClickSelectLicenses = () => {
        selectLicenses(selectedLicenses)
        setShow(!show)
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

    const handleCloseDialog = () => {
        setShow(!show)
        setSelectedLicenses({})
        setLicenseData([])
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
                <Modal.Title>{t('Search Licenses')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className='modal-body'>
                    <div className='row'>
                        <div className='col-lg-8'>
                            <input
                                type='text'
                                className='form-control'
                                placeholder={t('Enter search text')}
                                aria-describedby='Search Licenses'
                                onChange={(event) => {
                                    setSearchText(event.target.value)
                                }}
                            />
                        </div>
                        <div className='col-lg-4'>
                            <button
                                type='button'
                                className={`fw-bold btn btn-light button-plain me-2`}
                                onClick={() => {
                                    if (!searchText) setSearchText('')
                                    handleSearch()
                                }}
                            >
                                {t('Search')}
                            </button>
                            <button
                                type='button'
                                className={`fw-bold btn btn-light button-plain me-2`}
                                onClick={() => {
                                    setSearchText('')
                                    setLicenseData([])
                                    setSelectedLicenses({})
                                }}
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
                    className={`fw-bold btn btn-light button-plain me-2`}
                    onClick={handleCloseDialog}
                >
                    {t('Close')}
                </Button>
                <Button
                    type='button'
                    className={`btn btn-primary`}
                    onClick={handleClickSelectLicenses}
                >
                    {t('Select Licenses')}
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default LicensesDialog
