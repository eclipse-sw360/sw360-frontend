// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ColumnDef, getCoreRowModel, getExpandedRowModel, useReactTable } from '@tanstack/react-table'
import { StatusCodes } from 'http-status-codes'
import Link from 'next/link'
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Dispatch, ReactNode, SetStateAction, useEffect, useMemo, useState } from 'react'
import { Modal, Spinner } from 'react-bootstrap'
import { GrCheckboxSelected } from 'react-icons/gr'
import { PaddedCell, PageSizeSelector, SW360Table, TableFooter } from '@/components/sw360'
import {
    ErrorDetails,
    NestedRows,
    ObligationData,
    ObligationResponse,
    PageableQueryParam,
    PaginationMeta,
} from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'
import { ExpandableList } from './ExpandableComponents'

const Capitalize = (text: string) =>
    text.split('_').reduce((s, c) => s + ' ' + (c.charAt(0) + c.substring(1).toLocaleLowerCase()), '')

export default function LicenseDbObligationsModal({
    show,
    setShow,
    projectId,
    refresh,
    setRefresh,
}: {
    show: boolean
    setShow: Dispatch<SetStateAction<boolean>>
    projectId: string
    refresh: boolean
    setRefresh: Dispatch<SetStateAction<boolean>>
}): ReactNode {
    const t = useTranslations('default')
    const [obligationIds, setObligationIds] = useState<string[]>([])
    const session = useSession()
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            void signOut()
        }
    }, [
        session,
    ])

    const addObligationsToLicense = async () => {
        try {
            setLoading(true)
            const session = await getSession()
            if (CommonUtils.isNullOrUndefined(session)) return signOut()
            const response = await ApiUtils.POST(
                `projects/${projectId}/licenseObligation`,
                obligationIds,
                session.user.access_token,
            )
            if (response.status === StatusCodes.UNAUTHORIZED) {
                await signOut()
            } else if (response.status === StatusCodes.CREATED) {
                MessageService.success(t('Added obligations successfully'))
            } else {
                const err = (await response.json()) as ErrorDetails
                throw new Error(err.message)
            }
            setLoading(false)
        } catch (error: unknown) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                return
            }
            const message = error instanceof Error ? error.message : String(error)
            MessageService.error(message)
        }
    }

    const handleCheckboxes = (obId: string) => {
        const obs = [
            ...(obligationIds ?? []),
        ]
        const index = obs.indexOf(obId)
        if (index === -1) {
            setObligationIds([
                ...obs,
                obId,
            ])
        } else {
            obs.splice(index, 1)
            setObligationIds(obs)
        }
    }

    const columns = useMemo<
        ColumnDef<
            NestedRows<
                [
                    string,
                    ObligationData,
                ]
            >
        >[]
    >(
        () => [
            {
                id: 'expand',
                cell: ({ row }) => {
                    if (row.depth > 0) {
                        return <p>{row.original.node[1].text ?? ''}</p>
                    } else {
                        return <PaddedCell row={row}></PaddedCell>
                    }
                },
                meta: {
                    width: '3%',
                },
            },
            {
                id: 'select',
                cell: ({ row }) => (
                    <div className='form-check'>
                        <input
                            className='form-check-input'
                            type='checkbox'
                            value={row.original.node[0] ?? ''}
                            checked={obligationIds.indexOf(row.original.node[0] ?? '') !== -1}
                            onChange={() => handleCheckboxes(row.original.node[0] ?? '')}
                        />
                    </div>
                ),
                meta: {
                    width: '7%',
                },
            },
            {
                id: 'title',
                header: t('License Obligation'),
                cell: ({ row }) => (
                    <div className='text-center'>
                        <span>{row.original.node[0]}</span>
                    </div>
                ),
                meta: {
                    width: '20%',
                },
            },
            {
                id: 'licenses',
                header: t('Licenses'),
                cell: ({ row }) => {
                    const licenseIds = row.original.node[1].licenseIds ?? []
                    return (
                        <div className='text-center'>
                            {
                                <ul className='px-0'>
                                    {licenseIds.map((licenseId: string, index: number) => {
                                        return (
                                            <li
                                                key={licenseId}
                                                style={{
                                                    display: 'inline',
                                                }}
                                            >
                                                <Link
                                                    href={`/licenses/${licenseId}`}
                                                    className='text-link'
                                                >
                                                    {licenseId}
                                                </Link>
                                                {index >= licenseIds.length - 1 ? '' : ', '}{' '}
                                            </li>
                                        )
                                    })}
                                </ul>
                            }
                        </div>
                    )
                },
                meta: {
                    width: '16%',
                },
            },
            {
                id: 'releases',
                header: t('Releases'),
                cell: ({ row }) => {
                    const releases = row.original.node[1].releases ?? []
                    return (
                        <>
                            {Array.isArray(releases) && releases.length > 0 ? (
                                <ExpandableList
                                    releases={releases}
                                    previewString={releases
                                        .map((r) => `${r.name} ${r.version}`)
                                        .join(', ')
                                        .substring(0, 10)}
                                    commonReleases={[]}
                                />
                            ) : null}
                        </>
                    )
                },
                meta: {
                    width: '23%',
                },
            },
            {
                id: 'status',
                header: t('Status'),
                cell: ({ row }) => <>{Capitalize(row.original.node[1].status ?? '')}</>,
                meta: {
                    width: '10%',
                },
            },
            {
                id: 'type',
                header: t('Type'),
                cell: ({ row }) => <>{Capitalize(row.original.node[1].obligationType ?? '')}</>,
                meta: {
                    width: '10%',
                },
            },
            {
                id: 'id',
                header: t('Id'),
                cell: ({ row }) => <>{row.original.node[1].id ?? ''}</>,
                meta: {
                    width: '10%',
                },
            },
        ],
        [
            t,
            obligationIds,
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
    const [obligationData, setObligationData] = useState<
        NestedRows<
            [
                string,
                ObligationData,
            ]
        >[]
    >(() => [])
    const memoizedData = useMemo(
        () => obligationData,
        [
            obligationData,
        ],
    )
    const [showProcessing, setShowProcessing] = useState(false)

    useEffect(() => {
        if (session.status === 'loading') return
        const controller = new AbortController()
        const signal = controller.signal

        const timeLimit = obligationData.length !== 0 ? 700 : 0
        const timeout = setTimeout(() => {
            setShowProcessing(true)
        }, timeLimit)

        void (async () => {
            try {
                if (CommonUtils.isNullOrUndefined(session.data)) return signOut()
                const queryUrl = CommonUtils.createUrlWithParams(
                    `projects/${projectId}/licenseDbObligations`,
                    Object.fromEntries(
                        Object.entries({
                            ...pageableQueryParam,
                        }).map(([key, value]) => [
                            key,
                            String(value),
                        ]),
                    ),
                )
                const response = await ApiUtils.GET(queryUrl, session.data.user.access_token, signal)
                if (response.status !== StatusCodes.OK && response.status !== StatusCodes.NO_CONTENT) {
                    const err = (await response.json()) as ErrorDetails
                    throw new Error(err.message)
                }
                if (response.status === StatusCodes.NO_CONTENT) {
                    return
                }
                const data = (await response.json()) as ObligationResponse
                setPaginationMeta(data.page)
                setObligationData(
                    Object.entries(data.obligations).map(
                        (o) =>
                            ({
                                node: o,
                                children: [
                                    {
                                        node: o,
                                    },
                                ],
                            }) as NestedRows<
                                [
                                    string,
                                    ObligationData,
                                ]
                            >,
                    ),
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
        columns: columns,
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

        // expand config
        getExpandedRowModel: getExpandedRowModel(),
        getSubRows: (row) => row.children ?? [],
        getRowCanExpand: (row) => {
            if (row.depth === 1) {
                row.meta = {
                    isFullSpanRow: true,
                }
            }
            return row.depth === 0
        },

        meta: {
            rowHeightConstant: true,
        },
    })

    table.getRowModel().rows.forEach((row) => {
        if (row.depth === 1) {
            row.meta = {
                isFullSpanRow: true,
            }
        }
    })

    const handleCloseDialog = () => {
        setShow(false)
        setObligationIds([])
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
            onHide={() => handleCloseDialog()}
            scrollable
        >
            <Modal.Header
                style={{
                    backgroundColor: '#eef2fa',
                    color: '#2e5aac',
                }}
                closeButton
            >
                <Modal.Title id='delete-all-license-info-modal'>
                    <GrCheckboxSelected /> {t('Select License Obligations to be added')}.
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className='mb-3'>
                    {pageableQueryParam && paginationMeta && table ? (
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
            <Modal.Footer>
                <button
                    className='btn btn-dark'
                    onClick={() => handleCloseDialog()}
                >
                    {t('Cancel')}
                </button>
                <button
                    className='btn btn-primary'
                    onClick={async () => {
                        await addObligationsToLicense()
                        handleCloseDialog()
                    }}
                    disabled={loading}
                >
                    {t('Add')}{' '}
                    {loading === true && (
                        <Spinner
                            size='sm'
                            className='ms-1 spinner text-dark'
                        />
                    )}
                </button>
            </Modal.Footer>
        </Modal>
    )
}
