// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

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
import { PageSizeSelector, SW360Table, TableFooter } from 'next-sw360'
import { type JSX, useEffect, useMemo, useState } from 'react'
import { Button, Col, Form, Modal, Row, Spinner } from 'react-bootstrap'
import { BsInfoCircle } from 'react-icons/bs'
import { Embedded, ErrorDetails, LinkedPackageData, Package, PageableQueryParam, PaginationMeta } from '@/object-types'
import { ApiError, ApiUtils, CommonUtils } from '@/utils'

interface HasLinkedPackages {
    linkedPackages?: Record<string, LinkedPackageData>
    packageIds?: Record<string, LinkedPackageData>
}
interface Props<T extends HasLinkedPackages> {
    payload: T
    setPayload: React.Dispatch<React.SetStateAction<T>>
    show: boolean
    setShow: (show: boolean) => void
}

type EmbeddedPackages = Embedded<Package, 'sw360:packages'>

export default function LinkPackagesModal<T extends HasLinkedPackages>({
    payload,
    setPayload,
    show,
    setShow,
}: Props<T>): JSX.Element {
    const t = useTranslations('default')
    const [linkPackages, setLinkPackages] = useState<Map<string, LinkedPackageData>>(new Map())
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

    useEffect(() => {
        setLinkPackages(new Map(Object.entries(payload.linkedPackages ?? payload.packageIds ?? {})))
    }, [
        payload,
    ])

    const columns = useMemo<ColumnDef<Package>[]>(
        () => [
            {
                id: 'selectPackageCheckbox',
                cell: ({ row }) => {
                    const packageId = CommonUtils.getIdFromUrl(row.original._links?.self.href)
                    return (
                        <div className='form-check'>
                            <input
                                className='form-check-input'
                                type='checkbox'
                                value={packageId}
                                checked={linkPackages.has(packageId)}
                                onChange={() => handleCheckboxes(row.original)}
                            />
                        </div>
                    )
                },
            },
            {
                id: 'name',
                header: t('Name'),
                cell: ({ row }) => {
                    const packageId = CommonUtils.getIdFromUrl(row.original._links?.self.href)
                    const { name } = row.original
                    return (
                        <Link
                            href={`/packages/detail/${packageId}`}
                            className='text-link'
                        >
                            {name}
                        </Link>
                    )
                },
            },
            {
                id: 'version',
                header: t('Version'),
                accessorKey: 'version',
                cell: (info) => info.getValue(),
            },
            {
                id: 'license',
                header: t('License'),
                cell: ({ row }) => {
                    const licenseIds = row.original.licenseIds ?? []
                    return (
                        <div>
                            {licenseIds.map((licenseId, index) => (
                                <span key={index}>
                                    <Link
                                        className='text-link'
                                        href={`/licenses/detail?id=${licenseId}`}
                                    >
                                        {licenseId}
                                    </Link>
                                    {index !== licenseIds.length - 1 && ', '}
                                </span>
                            ))}
                        </div>
                    )
                },
            },
            {
                id: 'packageManager',
                header: t('Package Manager'),
                accessorKey: 'packageManager',
                cell: (info) => info.getValue(),
            },
            {
                id: 'purl',
                header: t('Purl'),
                accessorKey: 'purl',
                cell: (info) => info.getValue(),
            },
        ],
        [
            t,
            linkPackages,
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
    const [packagesData, setPackagesData] = useState<Package[]>(() => [])
    const memoizedData = useMemo(
        () => packagesData,
        [
            packagesData,
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
                `packages`,
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

            const data = (await response.json()) as EmbeddedPackages
            setPaginationMeta(data.page)
            setPackagesData(
                CommonUtils.isNullOrUndefined(data['_embedded']['sw360:packages'])
                    ? []
                    : data['_embedded']['sw360:packages'],
            )
        } catch (error) {
            ApiUtils.reportError(error)
        } finally {
            setShowProcessing(false)
        }
    }

    const payloadSetter = () => {
        setPayload({
            ...payload,
            linkedPackages: Object.fromEntries(linkPackages),
        })
    }

    const handleCheckboxes = (pkg: Package) => {
        const packageId = CommonUtils.getIdFromUrl(pkg._links?.self.href)
        const m = new Map(linkPackages)
        if (linkPackages.has(packageId)) {
            m.delete(packageId)
        } else {
            m.set(packageId, {
                ...{
                    packageId: packageId,
                    name: pkg.name ?? '',
                    version: pkg.version ?? '',
                    licenseIds: pkg.licenseIds ?? [],
                    packageManager: pkg.packageManager ?? '',
                },
                comment: '',
            })
        }
        setLinkPackages(m)
    }

    const closeModal = () => {
        setShow(false)
        setPackagesData([])
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
            aria-labelledby={t('Link Packages')}
            scrollable
        >
            <Modal.Header closeButton>
                <Modal.Title id='linked-projects-modal'>{t('Link Packages')}</Modal.Title>
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
                        payloadSetter()
                        closeModal()
                    }}
                    disabled={linkPackages.size === 0}
                >
                    {t('Link Packages')}
                </Button>
            </Modal.Footer>
        </Modal>
    )
}
