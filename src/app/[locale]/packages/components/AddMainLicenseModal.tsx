// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { StatusCodes } from 'http-status-codes'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { PageSizeSelector, SW360Table, TableFooter } from 'next-sw360'
import { type JSX, useEffect, useMemo, useState } from 'react'
import { Button, Modal, Spinner } from 'react-bootstrap'
import { Embedded, ErrorDetails, LicenseDetail, Package, PageableQueryParam, PaginationMeta } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils/index'

interface Props {
    showMainLicenseModal: boolean
    setPackagePayload: React.Dispatch<React.SetStateAction<Package>>
    setShowMainLicenseModal: React.Dispatch<React.SetStateAction<boolean>>
    packagePayload: Package
}

export default function AddMainLicenseModal({
    packagePayload,
    showMainLicenseModal,
    setPackagePayload,
    setShowMainLicenseModal,
}: Props): JSX.Element {
    const t = useTranslations('default')
    const [newMainLicense, setNewMainLicense] = useState<Array<string>>()
    const [searchText, setSearchText] = useState<string | undefined>(undefined)
    const session = useSession()

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            void signOut()
        }
    }, [
        session,
    ])

    useEffect(() => {
        if (packagePayload.licenseIds && packagePayload.licenseIds.length !== 0 && newMainLicense === undefined) {
            setNewMainLicense(packagePayload.licenseIds)
        }
    }, [
        packagePayload,
    ])

    const columns = useMemo<ColumnDef<LicenseDetail>[]>(
        () => [
            {
                id: 'select',
                cell: ({ row }) => (
                    <div className='form-check'>
                        <input
                            className='form-check-input'
                            type='checkbox'
                            value={row.original._links?.self.href.split('/').at(-1) ?? ''}
                            checked={
                                newMainLicense &&
                                newMainLicense.indexOf(row.original._links?.self.href.split('/').at(-1) ?? '') !== -1
                            }
                            onChange={() => handleCheckboxes(row.original._links?.self.href.split('/').at(-1) ?? '')}
                        />
                    </div>
                ),
                meta: {
                    width: '7%',
                },
            },
            {
                id: 'fullName',
                accessorKey: 'fullName',
                header: t('License Fullname'),
                cell: (info) => info.getValue(),
                meta: {
                    width: '60%',
                },
            },
        ],
        [
            t,
            newMainLicense,
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

            const data = (await response.json()) as Embedded<LicenseDetail, 'sw360:licenses'>
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

    const handleCheckboxes = (licenseId: string) => {
        const lics = [
            ...(newMainLicense ?? []),
        ]
        const index = lics.indexOf(licenseId)
        if (index === -1) {
            setNewMainLicense([
                ...lics,
                licenseId,
            ])
        } else {
            lics.splice(index, 1)
            setNewMainLicense(lics)
        }
    }

    const handleSelectLicense = () => {
        if (newMainLicense && newMainLicense.length > 0) {
            setPackagePayload((prevState: Package) => ({
                ...prevState,
                licenseIds: newMainLicense,
            }))
        }
    }

    const resetSelection = () => {
        setNewMainLicense([])
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

    const handleCloseDialog = () => {
        setShowMainLicenseModal(false)
        setNewMainLicense([])
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
            show={showMainLicenseModal}
            onHide={handleCloseDialog}
            backdrop='static'
            centered
            size='lg'
        >
            <Modal.Header closeButton>
                <Modal.Title>{t('Search Licenses')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
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
                            className='btn btn-secondary me-2'
                            onClick={() => {
                                if (!searchText) setSearchText('')
                                handleSearch()
                            }}
                        >
                            {t('Search')}
                        </button>
                        <button
                            type='button'
                            className='btn btn-secondary me-2'
                            onClick={resetSelection}
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
            </Modal.Body>
            <Modal.Footer className='justify-content-end'>
                <Button
                    type='button'
                    data-bs-dismiss='modal'
                    variant='secondary'
                    className='me-2'
                    onClick={handleCloseDialog}
                >
                    {t('Close')}
                </Button>
                <Button
                    type='button'
                    className='btn btn-primary'
                    onClick={() => {
                        handleSelectLicense()
                        handleCloseDialog()
                    }}
                >
                    {t('Select Licenses')}
                </Button>
            </Modal.Footer>
        </Modal>
    )
}
