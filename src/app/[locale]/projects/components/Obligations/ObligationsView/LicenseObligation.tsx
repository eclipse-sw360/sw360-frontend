// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ColumnDef, getCoreRowModel, getExpandedRowModel, useReactTable } from '@tanstack/react-table'
import { StatusCodes } from 'http-status-codes'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Dispatch, type JSX, SetStateAction, useEffect, useMemo, useState } from 'react'
import { Spinner } from 'react-bootstrap'
import { PaddedCell, PageSizeSelector, SW360Table, TableFooter } from '@/components/sw360'
import {
    ActionType,
    ErrorDetails,
    NestedRows,
    ObligationData,
    ObligationEntry,
    ObligationResponse,
    PageableQueryParam,
    PaginationMeta,
} from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'
import { ObligationLevels } from '../../../../../../object-types/Obligation'
import CompareObligation from '../CompareObligation'
import { ExpandableList } from './ExpandableComponents'
import LicenseDbObligationsModal from './LicenseDbObligationsModal'
import UpdateCommentModal from './UpdateCommentModal'

const Capitalize = (text: string) =>
    text.split('_').reduce((s, c) => s + ' ' + (c.charAt(0) + c.substring(1).toLocaleLowerCase()), '')

interface UpdateCommentModalMetadata {
    obligation: string
    comment?: string
}

interface Props {
    projectId: string
    actionType: ActionType
    payload?: ObligationEntry
    setPayload?: Dispatch<SetStateAction<ObligationEntry>>
}

export default function LicenseObligation({ projectId, actionType, payload, setPayload }: Props): JSX.Element {
    const t = useTranslations('default')
    const [updateCommentModalData, setUpdateCommentModalData] = useState<UpdateCommentModalMetadata | null>(null)
    const [showLicenseDbObligationsModal, setShowLicenseDbObligationsModal] = useState(false)
    const [showCompareObligationsModal, setShowCompareObligationsModal] = useState(false)
    const [refresh, setRefresh] = useState(false)
    const session = useSession()

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            void signOut()
        }
    }, [
        session,
    ])

    const detailColumns = useMemo<
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
                    width: '13%',
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
                    width: '13%',
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
            {
                id: 'comment',
                header: t('Comment'),
                cell: ({ row }) => <>{row.original.node[1].comment ?? ''}</>,
                meta: {
                    width: '20%',
                },
            },
        ],
        [
            t,
        ],
    )

    const [selectedProjectId, setSelectedProjectId] = useState<string>()
    const [selectedProjectObligationData, setSelectedProjectObligationData] = useState<ObligationResponse>()

    const editColumns = useMemo<
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
                id: 'title',
                header: t('License Obligation'),
                cell: ({ row }) => {
                    let releaseMatch = true,
                        licensesMatch = true
                    const obligationMatch =
                        selectedProjectObligationData?.obligations?.[row.original.node[0]] !== undefined

                    const licenseIds =
                        selectedProjectObligationData?.obligations?.[row.original.node[0]]?.licenseIds ?? []
                    for (const lic of row.original.node[1].licenseIds ?? []) {
                        if (licenseIds.indexOf(lic) === -1) {
                            licensesMatch = false
                            break
                        }
                    }

                    const releases = selectedProjectObligationData?.obligations?.[row.original.node[0]]?.releases ?? []
                    for (const rel of row.original.node[1].releases ?? []) {
                        if (releases.filter((r) => rel.id === r.id)) {
                            releaseMatch = false
                            break
                        }
                    }

                    return (
                        <div
                            className={`text-center ${selectedProjectObligationData ? (obligationMatch && releaseMatch && licensesMatch ? 'green-cell' : 'red-cell') : ''}`}
                        >
                            <span>{row.original.node[0]}</span>
                        </div>
                    )
                },
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
                    width: '13%',
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
                    width: '13%',
                },
            },
            {
                id: 'status',
                header: t('Status'),
                cell: ({ row }) => (
                    <select
                        className='form-select'
                        id='organizationObligation.edit.status'
                        name='status'
                        value={payload?.[row.original.node[0]]?.status ?? row.original.node[1].status ?? 'OPEN'}
                        onChange={(e) => {
                            if (setPayload) {
                                let obligationValue = payload?.[row.original.node[0]] ?? {}
                                obligationValue = {
                                    ...obligationValue,
                                    id: row.original.node[1].id,
                                    status: e.target.value,
                                    obligationType: ObligationLevels.LICENSE_OBLIGATION,
                                }
                                setPayload((payload: ObligationEntry) => ({
                                    ...payload,
                                    [row.original.node[0]]: obligationValue,
                                }))
                            }
                        }}
                    >
                        <option value='OPEN'>{t('Open')}</option>
                        <option value='ACKNOWLEDGED_OR_FULFILLED'>{t('Acknowledged or Fulfilled')}</option>
                        <option value='WILL_BE_FULFILLED_BEFORE_RELEASE'>
                            {t('Will be fulfilled before release')}
                        </option>
                        <option value='NOT_APPLICABLE'>{t('Not Applicable')}</option>
                        <option value='DEFERRED_TO_PARENT_PROJECT'>{t('Deferred to parent project')}</option>
                        <option value='FULFILLED_AND_PARENT_MUST_ALSO_FULFILL'>
                            {t('Fulfilled and parent must also fulfill')}
                        </option>
                        <option value='ESCALATED'>{t('Escalated')}</option>
                    </select>
                ),
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
            {
                id: 'comment',
                header: t('Comment'),
                cell: ({ row }) => (
                    <input
                        type='text'
                        value={payload?.[row.original.node[0]]?.comment ?? row.original.node[1].comment ?? ''}
                        onClick={() => {
                            setUpdateCommentModalData({
                                comment: payload?.[row.original.node[0]]?.comment ?? row.original.node[1].comment ?? '',
                                obligation: row.original.node[0],
                            })
                        }}
                        className='form-control'
                        placeholder={t('Enter comments')}
                        readOnly
                    />
                ),
                meta: {
                    width: '20%',
                },
            },
        ],
        [
            t,
            payload,
            selectedProjectObligationData,
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
                    `projects/${projectId}/licenseObligations`,
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
                if (response.status !== StatusCodes.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new Error(err.message)
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

    useEffect(() => {
        if (session.status === 'loading' || !selectedProjectId) return
        const controller = new AbortController()
        const signal = controller.signal

        void (async () => {
            try {
                if (CommonUtils.isNullOrUndefined(session.data)) return signOut()
                setShowProcessing(true)
                const response = await ApiUtils.GET(
                    `projects/${selectedProjectId}/licenseObligations`,
                    session.data.user.access_token,
                    signal,
                )
                if (response.status !== StatusCodes.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new Error(err.message)
                }

                const data = (await response.json()) as ObligationResponse
                setSelectedProjectObligationData(data)
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return
                }
                const message = error instanceof Error ? error.message : String(error)
                MessageService.error(message)
            } finally {
                setShowProcessing(false)
            }
        })()

        return () => controller.abort()
    }, [
        session,
        selectedProjectId,
    ])

    const detailTable = useReactTable({
        data: memoizedData,
        columns: detailColumns,
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

    detailTable.getRowModel().rows.forEach((row) => {
        if (row.depth === 1) {
            row.meta = {
                isFullSpanRow: true,
            }
        }
    })

    const editTable = useReactTable({
        data: memoizedData,
        columns: editColumns,
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

    editTable.getRowModel().rows.forEach((row) => {
        if (row.depth === 1) {
            row.meta = {
                isFullSpanRow: true,
            }
        }
    })

    return (
        <>
            <UpdateCommentModal
                modalMetaData={updateCommentModalData}
                setModalMetaData={setUpdateCommentModalData}
                payload={payload}
                setPayload={setPayload}
                obligationTypeName={ObligationLevels.LICENSE_OBLIGATION}
            />
            <LicenseDbObligationsModal
                show={showLicenseDbObligationsModal}
                setShow={setShowLicenseDbObligationsModal}
                projectId={projectId}
                refresh={refresh}
                setRefresh={setRefresh}
            />
            <CompareObligation
                show={showCompareObligationsModal}
                setShow={setShowCompareObligationsModal}
                setSelectedProjectId={setSelectedProjectId}
            />
            <div className='d-flex justify-content-end'>
                {actionType === ActionType.EDIT && (
                    <>
                        <button
                            className='btn btn-primary me-2'
                            onClick={() => setShowLicenseDbObligationsModal(true)}
                        >
                            {t('Add Obligations from License Database')}
                        </button>
                        <button
                            className='btn btn-secondary col-auto'
                            onClick={() => setShowCompareObligationsModal(true)}
                        >
                            {t('Compare Obligation')}
                        </button>
                    </>
                )}
            </div>
            <div className='mb-3'>
                {pageableQueryParam && paginationMeta && detailTable && editTable ? (
                    <>
                        <PageSizeSelector
                            pageableQueryParam={pageableQueryParam}
                            setPageableQueryParam={setPageableQueryParam}
                        />
                        <SW360Table
                            table={actionType === ActionType.DETAIL ? detailTable : editTable}
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
        </>
    )
}
