// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE
'use client'

import { StatusCodes } from 'http-status-codes'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import React, { type JSX, useCallback, useEffect, useState } from 'react'
import { Pagination, Spinner, Table } from 'react-bootstrap'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'
import { Vendor } from './Vendor'

interface Props {
    chooseVendor: (vendor: Vendor | null) => void
}

interface VendorsResponse {
    _embedded?: {
        'sw360:vendors'?: Vendor[]
    }
    page?: {
        size: number
        totalElements: number
        totalPages: number
        number: number
    }
}

type SortDirection = 'asc' | 'desc'

function SearchVendorsModal({ chooseVendor }: Props): JSX.Element {
    const t = useTranslations('default')
    const { data: session } = useSession()

    const [vendors, setVendors] = useState<Vendor[]>([])
    const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
    const [searchText, setSearchText] = useState<string>('')
    const [lastSearchedText, setLastSearchedText] = useState<string>('')
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const [currentPage, setCurrentPage] = useState<number>(0)
    const [totalPages, setTotalPages] = useState<number>(0)
    const [pageSize] = useState<number>(10)
    const [totalElements, setTotalElements] = useState<number>(0)

    const [sortField, setSortField] = useState<string>('fullName')
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

    const fetchVendors = useCallback(
        async (page: number, search: string, sort: string, direction: SortDirection) => {
            if (!session?.user?.access_token) return

            setIsLoading(true)
            try {
                const params: Record<string, string> = {
                    page: page.toString(),
                    page_entries: pageSize.toString(),
                    sort: `${sort},${direction}`,
                }

                if (search.trim()) {
                    params.name = search.trim()
                }

                const url = CommonUtils.createUrlWithParams('vendors', params)
                const response = await ApiUtils.GET(url, session.user.access_token)

                if (response.status === StatusCodes.OK) {
                    const data = (await response.json()) as VendorsResponse
                    const vendorsList = data._embedded?.['sw360:vendors'] ?? []

                    setVendors(vendorsList)
                    setTotalPages(data.page?.totalPages ?? 0)
                    setTotalElements(data.page?.totalElements ?? 0)
                    setCurrentPage(data.page?.number ?? 0)
                } else if (response.status === StatusCodes.UNAUTHORIZED) {
                    MessageService.error(t('Unauthorized request'))
                    setVendors([])
                } else {
                    MessageService.error(t('Failed to fetch vendors'))
                    setVendors([])
                }
            } catch (error) {
                console.error('Error fetching vendors:', error)
                MessageService.error(t('Error loading vendors'))
                setVendors([])
            } finally {
                setIsLoading(false)
            }
        },
        [
            session?.user?.access_token,
            pageSize,
            t,
        ],
    )

    useEffect(() => {
        if (session?.user?.access_token) {
            void fetchVendors(0, lastSearchedText, sortField, sortDirection)
        }
    }, [
        sortField,
        sortDirection,
        session?.user?.access_token,
        fetchVendors,
        lastSearchedText,
    ])

    const handleSearch = () => {
        setLastSearchedText(searchText)
        setCurrentPage(0)
        void fetchVendors(0, searchText, sortField, sortDirection)
    }

    const handlePageChange = (page: number) => {
        if (page >= 0 && page < totalPages) {
            void fetchVendors(page, lastSearchedText, sortField, sortDirection)
        }
    }

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
        } else {
            setSortField(field)
            setSortDirection('asc')
        }
    }

    const handleSelectVendor = (vendor: Vendor) => {
        setSelectedVendor(vendor)
    }

    const handleConfirmSelection = () => {
        chooseVendor(selectedVendor)
        setSelectedVendor(null)
        setSearchText('')
        setLastSearchedText('')
        setCurrentPage(0)
    }

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch()
        }
    }

    const renderSortIcon = (field: string) => {
        if (sortField !== field) return '↕️'
        return sortDirection === 'asc' ? '↑' : '↓'
    }

    return (
        <>
            <div
                className='modal fade'
                id='search_vendors_modal'
                tabIndex={-1}
                aria-labelledby='Search Vendors Modal'
                aria-hidden='true'
            >
                <div className='modal-dialog modal-xl modal-dialog-centered'>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5
                                className='modal-title fw-bold'
                                id='search_vendors_modal_label'
                            >
                                {t('Search Vendor')}
                            </h5>
                            <button
                                type='button'
                                className='btn-close'
                                data-bs-dismiss='modal'
                                aria-label='Close'
                            ></button>
                        </div>
                        <div className='modal-body'>
                            <div className='row mb-3'>
                                <div className='col-lg-8'>
                                    <input
                                        type='text'
                                        className='form-control'
                                        placeholder={t('Enter vendor name...')}
                                        aria-label='Search Vendor'
                                        value={searchText}
                                        onChange={(e) => setSearchText(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                    />
                                </div>
                                <div className='col-lg-4'>
                                    <button
                                        type='button'
                                        className='btn btn-secondary'
                                        onClick={handleSearch}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Spinner
                                                    as='span'
                                                    animation='border'
                                                    size='sm'
                                                    role='status'
                                                    aria-hidden='true'
                                                    className='me-2'
                                                />
                                                {t('Searching...')}
                                            </>
                                        ) : (
                                            t('Search')
                                        )}
                                    </button>
                                </div>
                            </div>

                            {!isLoading && vendors.length > 0 && (
                                <div className='row mb-2'>
                                    <div className='col'>
                                        <small className='text-muted'>
                                            {t('Showing')} {currentPage * pageSize + 1}-
                                            {Math.min((currentPage + 1) * pageSize, totalElements)} {t('of')}{' '}
                                            {totalElements} {t('vendors')}
                                        </small>
                                    </div>
                                </div>
                            )}

                            <div className='row'>
                                <div className='col'>
                                    {isLoading ? (
                                        <div className='text-center py-5'>
                                            <Spinner
                                                animation='border'
                                                role='status'
                                            >
                                                <span className='visually-hidden'>{t('Loading...')}</span>
                                            </Spinner>
                                        </div>
                                    ) : vendors.length === 0 ? (
                                        <div className='alert alert-info text-center'>
                                            {t('No vendors found. Please try a different search.')}
                                        </div>
                                    ) : (
                                        <div
                                            className='table-responsive'
                                            style={{
                                                maxHeight: '400px',
                                                overflowY: 'auto',
                                            }}
                                        >
                                            <Table
                                                striped
                                                hover
                                            >
                                                <thead className='sticky-top bg-white'>
                                                    <tr>
                                                        <th
                                                            style={{
                                                                width: '50px',
                                                            }}
                                                        ></th>
                                                        <th
                                                            style={{
                                                                cursor: 'pointer',
                                                            }}
                                                            onClick={() => handleSort('fullName')}
                                                        >
                                                            {t('Full Name')} {renderSortIcon('fullName')}
                                                        </th>
                                                        <th
                                                            style={{
                                                                cursor: 'pointer',
                                                            }}
                                                            onClick={() => handleSort('shortName')}
                                                        >
                                                            {t('Short Name')} {renderSortIcon('shortName')}
                                                        </th>
                                                        <th
                                                            style={{
                                                                cursor: 'pointer',
                                                            }}
                                                            onClick={() => handleSort('url')}
                                                        >
                                                            {t('URL')} {renderSortIcon('url')}
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {vendors.map((vendor, index) => (
                                                        <tr
                                                            key={vendor.fullName || index}
                                                            onClick={() => handleSelectVendor(vendor)}
                                                            style={{
                                                                cursor: 'pointer',
                                                            }}
                                                            className={
                                                                selectedVendor?.fullName === vendor.fullName
                                                                    ? 'table-active'
                                                                    : ''
                                                            }
                                                        >
                                                            <td>
                                                                <input
                                                                    type='radio'
                                                                    name='vendorSelection'
                                                                    checked={
                                                                        selectedVendor?.fullName === vendor.fullName
                                                                    }
                                                                    onChange={() => handleSelectVendor(vendor)}
                                                                />
                                                            </td>
                                                            <td>{vendor.fullName}</td>
                                                            <td>{vendor.shortName || '-'}</td>
                                                            <td>
                                                                {vendor.url ? (
                                                                    <a
                                                                        href={vendor.url}
                                                                        target='_blank'
                                                                        rel='noopener noreferrer'
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    >
                                                                        {vendor.url}
                                                                    </a>
                                                                ) : (
                                                                    '-'
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {!isLoading && totalPages > 1 && (
                                <div className='row mt-3'>
                                    <div className='col d-flex justify-content-center'>
                                        <Pagination>
                                            <Pagination.First
                                                onClick={() => handlePageChange(0)}
                                                disabled={currentPage === 0}
                                            />
                                            <Pagination.Prev
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 0}
                                            />

                                            {Array.from(
                                                {
                                                    length: Math.min(5, totalPages),
                                                },
                                                (_, i) => {
                                                    let pageNum: number
                                                    if (totalPages <= 5) {
                                                        pageNum = i
                                                    } else if (currentPage < 3) {
                                                        pageNum = i
                                                    } else if (currentPage > totalPages - 3) {
                                                        pageNum = totalPages - 5 + i
                                                    } else {
                                                        pageNum = currentPage - 2 + i
                                                    }

                                                    return (
                                                        <Pagination.Item
                                                            key={pageNum}
                                                            active={pageNum === currentPage}
                                                            onClick={() => handlePageChange(pageNum)}
                                                        >
                                                            {pageNum + 1}
                                                        </Pagination.Item>
                                                    )
                                                },
                                            )}

                                            <Pagination.Next
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages - 1}
                                            />
                                            <Pagination.Last
                                                onClick={() => handlePageChange(totalPages - 1)}
                                                disabled={currentPage === totalPages - 1}
                                            />
                                        </Pagination>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className='modal-footer'>
                            <button
                                type='button'
                                data-bs-dismiss='modal'
                                className='btn btn-secondary'
                            >
                                {t('Close')}
                            </button>
                            <button
                                type='button'
                                className='btn btn-primary'
                                onClick={handleConfirmSelection}
                                disabled={!selectedVendor}
                                data-bs-dismiss={selectedVendor ? 'modal' : undefined}
                            >
                                {t('Select Vendor')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default SearchVendorsModal
