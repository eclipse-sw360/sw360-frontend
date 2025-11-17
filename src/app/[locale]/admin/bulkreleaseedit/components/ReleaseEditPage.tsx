// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

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
import { PageSizeSelector, QuickFilter, SW360Table, TableFooter, VendorDialog } from 'next-sw360'
import React, { Dispatch, type JSX, SetStateAction, useEffect, useMemo, useState } from 'react'
import { Alert, Modal, Spinner } from 'react-bootstrap'
import { GiCancel } from 'react-icons/gi'
import { Embedded, ErrorDetails, PageableQueryParam, PaginationMeta, Release, Vendor } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'

interface AlertData {
    variant: string
    message: JSX.Element
}

function UpdateReleaseModal({
    release,
    setRelease,
    reloadKey,
    setReloadKey,
}: {
    release: Release | null
    setRelease: Dispatch<SetStateAction<Release | null>>
    reloadKey: number
    setReloadKey: Dispatch<SetStateAction<number>>
}): JSX.Element {
    const t = useTranslations('default')
    const [vendor, setVendor] = useState<Vendor>(release?.vendor ?? {})
    const [selectVendor, setSelectVendor] = useState(false)
    const [alert, setAlert] = useState<AlertData | null>(null)
    const { status } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [
        status,
    ])

    useEffect(() => {
        setVendor(release?.vendor ?? {})
    }, [
        release,
    ])

    function handleClose() {
        setVendor({})
        setSelectVendor(false)
        setRelease(null)
        setAlert(null)
    }

    const handleEditRelease = async (release: Release | null) => {
        if (release === null) return
        try {
            const session = await getSession()
            if (CommonUtils.isNullOrUndefined(session)) return signOut()

            const response = await ApiUtils.PATCH(`releases/${release.id}`, release, session.user.access_token)

            if (response.status == StatusCodes.OK) {
                setAlert({
                    variant: 'success',
                    message: (
                        <>
                            <p>{t('Release updated successfully')}!</p>
                        </>
                    ),
                })
                setReloadKey(reloadKey + 1)
            } else {
                const err = (await response.json()) as ErrorDetails
                throw new Error(err.message)
            }
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                return
            }
            const message = error instanceof Error ? error.message : String(error)
            setAlert({
                variant: 'danger',
                message: (
                    <>
                        <p>{message}!</p>
                    </>
                ),
            })
        }
    }

    const updateInputField = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        release: Release,
        setRelease: Dispatch<SetStateAction<Release | null>>,
    ) => {
        if (release === null) return
        setRelease({
            ...release,
            [event.target.name]: event.target.value,
        })
    }

    const handleSetVendorData = (vendorResponse: Vendor) => {
        setVendor(vendorResponse)
        console.log(vendorResponse)
        setRelease({
            ...release,
            vendorId: vendorResponse._links?.self.href.split('/').at(-1),
        })
    }

    return (
        <Modal
            show={release !== null}
            onHide={handleClose}
            backdrop='static'
            centered
            size='lg'
        >
            <Modal.Header className='header'>
                <Modal.Title>{t('Update Release')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {alert && (
                    <Alert
                        variant={alert.variant}
                        id='updateRelease.message.alert'
                    >
                        {alert.message}
                    </Alert>
                )}
                {release && (
                    <>
                        <div className='row my-2'>
                            <div className='col'>
                                <label
                                    htmlFor='bulkReleaseEdit.cpeid'
                                    className='form-label fw-medium'
                                >
                                    {t('CPE ID')}
                                </label>
                                <input
                                    type='text'
                                    id='bulkReleaseEdit.cpeid'
                                    className='form-control'
                                    name='cpeid'
                                    placeholder={t('Enter CPE ID')}
                                    value={release.cpeid ?? ''}
                                    onChange={(e) => updateInputField(e, release, setRelease)}
                                />
                            </div>
                            <div className='col'>
                                <label
                                    htmlFor='bulkReleaseEdit.vendor'
                                    className='form-label fw-medium'
                                >
                                    {t('Vendor')}
                                </label>
                                <input
                                    type='text'
                                    className='form-control'
                                    placeholder={t('Click to set vendor')}
                                    readOnly
                                    id='bulkReleaseEdit.vendor'
                                    onClick={() => setSelectVendor(!selectVendor)}
                                    value={vendor.fullName ?? ''}
                                />
                                <div className='form-text'>
                                    <GiCancel
                                        onClick={() => {
                                            setVendor({})
                                            setRelease({
                                                ...release,
                                                vendorId: '',
                                            })
                                        }}
                                    />
                                </div>
                                <VendorDialog
                                    show={selectVendor}
                                    setShow={setSelectVendor}
                                    setVendor={handleSetVendorData}
                                    vendor={vendor}
                                />
                            </div>
                        </div>
                        <div className='row my-2'>
                            <div className='col'>
                                <label
                                    htmlFor='bulkReleaseEdit.name'
                                    className='form-label fw-medium'
                                >
                                    {t('Release name')}
                                </label>
                                <input
                                    type='text'
                                    className='form-control'
                                    name='name'
                                    placeholder={t('Enter Name')}
                                    value={release.name ?? ''}
                                    id='bulkReleaseEdit.name'
                                    onChange={(e) => updateInputField(e, release, setRelease)}
                                />
                            </div>
                            <div className='col'>
                                <label
                                    htmlFor='bulkReleaseEdit.name'
                                    className='form-label fw-medium'
                                >
                                    {t('Release name')}
                                </label>
                                <input
                                    type='text'
                                    className='form-control col'
                                    name='version'
                                    placeholder={t('Enter Version')}
                                    value={release.version ?? ''}
                                    onChange={(e) => updateInputField(e, release, setRelease)}
                                />
                            </div>
                        </div>
                    </>
                )}
            </Modal.Body>
            <Modal.Footer>
                <button
                    className='btn btn-secondary'
                    onClick={handleClose}
                >
                    {t('Cancel')}
                </button>
                <button
                    className='btn btn-primary'
                    onClick={() => void handleEditRelease(release)}
                >
                    {t('Update')}
                </button>
            </Modal.Footer>
        </Modal>
    )
}

export default function BulkReleaseEdit(): JSX.Element {
    const t = useTranslations('default')

    const [release, setRelease] = useState<Release | null>(null)
    const [reloadKey, setReloadKey] = useState(1)
    const [search, setSearch] = useState('')

    const session = useSession()

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            void signOut()
        }
    }, [
        session,
    ])

    const columns = useMemo<ColumnDef<Release>[]>(
        () => [
            {
                id: 'cpeid',
                header: t('CPE ID'),
                meta: {
                    width: '20%',
                },
                cell: ({ row }) => (
                    <input
                        type='text'
                        className='form-control'
                        value={row.original.cpeid ?? ''}
                        readOnly
                    />
                ),
            },
            {
                id: 'vendor',
                header: t('Vendor'),
                meta: {
                    width: '20%',
                },
                cell: ({ row }) => (
                    <input
                        type='text'
                        className='form-control'
                        readOnly
                        value={row.original.vendor?.fullName ?? ''}
                    />
                ),
            },
            {
                id: 'name',
                header: t('Release name'),
                meta: {
                    width: '20%',
                },
                cell: ({ row }) => (
                    <input
                        type='text'
                        className='form-control'
                        value={row.original.name ?? ''}
                        readOnly
                    />
                ),
            },
            {
                id: 'version',
                header: t('Release version'),
                meta: {
                    width: '20%',
                },
                cell: ({ row }) => (
                    <input
                        type='text'
                        className='form-control'
                        value={row.original.version ?? ''}
                        readOnly
                    />
                ),
            },
            {
                id: 'submit',
                header: t('Update'),
                meta: {
                    width: '20%',
                },
                cell: ({ row }) => (
                    <div className='text-center'>
                        <button
                            type='button'
                            onClick={() => setRelease(row.original)}
                            className='btn btn-primary'
                        >
                            {t('Update')}
                        </button>
                    </div>
                ),
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
    const [releaseData, setReleaseData] = useState<Release[]>(() => [])
    const memoizedData = useMemo(
        () => releaseData,
        [
            releaseData,
        ],
    )
    const [showProcessing, setShowProcessing] = useState(false)

    useEffect(() => {
        if (session.status === 'loading') return
        const controller = new AbortController()
        const signal = controller.signal

        const timeLimit = releaseData.length !== 0 ? 700 : 0
        const timeout = setTimeout(() => {
            setShowProcessing(true)
        }, timeLimit)

        void (async () => {
            try {
                if (CommonUtils.isNullOrUndefined(session.data)) return signOut()
                const queryUrl = CommonUtils.createUrlWithParams(
                    `releases`,
                    Object.fromEntries(
                        Object.entries({
                            allDetails: true,
                            ...(search !== ''
                                ? {
                                      lucenseSearch: true,
                                      name: search,
                                  }
                                : {}),
                            ...pageableQueryParam,
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

                const data = (await response.json()) as Embedded<Release, 'sw360:releases'>
                setPaginationMeta(data.page)
                setReleaseData(
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
                clearTimeout(timeout)
                setShowProcessing(false)
            }
        })()

        return () => controller.abort()
    }, [
        pageableQueryParam,
        session,
        search,
        reloadKey,
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
    })

    const doSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
        setSearch(event.currentTarget.value)
        setReloadKey(reloadKey + 1)
    }

    return (
        <>
            <UpdateReleaseModal
                release={release}
                setRelease={setRelease}
                reloadKey={reloadKey}
                setReloadKey={setReloadKey}
            />
            <div className='container page-content'>
                <div className='row'>
                    <div className='col-lg-2 mt-1'>
                        <QuickFilter
                            id='vendorSearch'
                            searchFunction={doSearch}
                        />
                    </div>
                    <div className='col-lg-10'>
                        <div className='row d-flex justify-content-end ms-1'>
                            <div className='col-auto buttonheader-title'>{t('Release Bulk Edit')}</div>
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
