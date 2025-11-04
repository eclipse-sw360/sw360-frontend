// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ColumnDef, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table'
import { StatusCodes } from 'http-status-codes'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { ClientSidePageSizeSelector, ClientSideTableFooter, SW360Table } from 'next-sw360'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import { Spinner } from 'react-bootstrap'
import { Embedded, ErrorDetails, ModerationRequest } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils/index'
import BulkDeclineModerationRequestModal from './BulkDeclineModerationRequestModal'
import ExpandingModeratorCell from './ExpandingModeratorCell'

type EmbeddedModerationRequest = Embedded<ModerationRequest, 'sw360:moderationRequests'>
interface ModerationRequestMap {
    [key: string]: string
}

function OpenModerationRequest(): ReactNode {
    const t = useTranslations('default')
    const [mrIdArray, setMrIdArray] = useState<Array<string>>([])
    const [disableBulkDecline, setDisableBulkDecline] = useState(true)
    const [bulkDeclineMRModal, setBulkDeclineMRModal] = useState(false)
    const [mrIdNameMap, setMrIdNameMap] = useState<{
        [key: string]: string
    }>({})
    const moderationRequestStatus: ModerationRequestMap = {
        INPROGRESS: t('In Progress'),
        APPROVED: t('APPROVED'),
        PENDING: t('Pending'),
        REJECTED: t('REJECTED'),
    }

    const session = useSession()
    const params = useSearchParams()

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            void signOut()
        }
    }, [
        session,
    ])

    const formatDate = (timestamp: number | undefined): string | null => {
        if (timestamp === undefined) {
            return null
        }
        const date = new Date(timestamp)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    const columns = useMemo<ColumnDef<ModerationRequest>[]>(
        () => [
            {
                id: 'date',
                header: t('Date'),
                cell: ({ row }) => <>{formatDate(row.original.timestamp)}</>,
            },
            {
                id: 'documentType',
                header: t('Type'),
                accessorKey: 'documentType',
                enableSorting: false,
                cell: (info) => info.getValue(),
            },
            {
                id: 'documentName',
                header: t('Document Name'),
                cell: ({ row }) => {
                    const { id, documentName } = row.original
                    return (
                        <Link
                            className='text-link'
                            href={'requests/moderationRequest/' + id}
                        >
                            {documentName}
                        </Link>
                    )
                },
            },
            {
                id: 'requestingUser',
                header: t('Requesting User'),
                cell: ({ row }) => {
                    const { requestingUser: email } = row.original
                    return (
                        <Link
                            href={`mailto:${email}`}
                            className='text-link'
                        >
                            {email}
                        </Link>
                    )
                },
            },
            {
                id: 'department',
                header: t('Department'),
                cell: ({ row }) => <>{row.original.requestingUserDepartment}</>,
            },
            {
                id: 'moderators',
                header: t('Moderators'),
                cell: ({ row }) => <ExpandingModeratorCell moderators={row.original.moderators ?? []} />,
            },
            {
                id: 'state',
                header: t('State'),
                cell: ({ row }) => (
                    <>{row.original.moderationState ? moderationRequestStatus[row.original.moderationState] : ''}</>
                ),
            },
            {
                id: 'actions',
                header: t('Actions'),
                cell: ({ row }) => {
                    const { id, documentName } = row.original
                    return (
                        <div className='form-check'>
                            <input
                                className='form-check-input'
                                type='checkbox'
                                name='moderationRequestId'
                                value={id}
                                checked={mrIdArray.includes(id)}
                                onChange={() => handleCheckboxes(id, documentName)}
                            />
                        </div>
                    )
                },
                meta: {
                    width: '6%',
                },
            },
        ],
        [
            t,
            mrIdArray,
        ],
    )

    const [moderationRequestData, setModerationRequestData] = useState<ModerationRequest[]>(() => [])
    const memoizedData = useMemo(
        () => moderationRequestData,
        [
            moderationRequestData,
        ],
    )
    const [showProcessing, setShowProcessing] = useState(false)

    useEffect(() => {
        if (session.status === 'loading') return
        const controller = new AbortController()
        const signal = controller.signal

        const timeLimit = moderationRequestData.length !== 0 ? 700 : 0
        const timeout = setTimeout(() => {
            setShowProcessing(true)
        }, timeLimit)

        void (async () => {
            try {
                if (CommonUtils.isNullOrUndefined(session.data)) return signOut()
                const searchParams = Object.fromEntries(params.entries())
                const queryUrl = CommonUtils.createUrlWithParams(
                    `moderationrequest`,
                    Object.fromEntries(
                        Object.entries({
                            ...searchParams,
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

                const data = (await response.json()) as EmbeddedModerationRequest
                const openModerationRequests = CommonUtils.isNullOrUndefined(
                    data['_embedded']['sw360:moderationRequests'],
                )
                    ? []
                    : data['_embedded']['sw360:moderationRequests'].filter(
                          (mr) => mr.moderationState === 'PENDING' || mr.moderationState === 'INPROGRESS',
                      )
                setModerationRequestData(openModerationRequests)
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
        params.toString(),
        session,
    ])

    const table = useReactTable({
        data: memoizedData,
        columns,
        getCoreRowModel: getCoreRowModel(),

        getPaginationRowModel: getPaginationRowModel(),
    })

    const handleCheckboxes = (moderationRequestId: string, documentName: string) => {
        const updatedMrIdArray: string[] = [
            ...mrIdArray,
        ]
        const mrMap = {
            ...mrIdNameMap,
        }
        if (updatedMrIdArray.includes(moderationRequestId)) {
            const index = updatedMrIdArray.indexOf(moderationRequestId)
            updatedMrIdArray.splice(index, 1)
            delete mrMap[moderationRequestId]
        } else {
            mrMap[moderationRequestId] = documentName
            updatedMrIdArray.push(moderationRequestId)
        }
        setMrIdArray(updatedMrIdArray)
        setMrIdNameMap(mrMap)
        setDisableBulkDecline(updatedMrIdArray.length === 0)
    }

    return (
        <>
            <BulkDeclineModerationRequestModal
                show={bulkDeclineMRModal}
                setShow={setBulkDeclineMRModal}
                mrIdNameMap={mrIdNameMap}
            />
            <div className='row mb-4'>
                <div className='col-12'>
                    <button
                        className='btn btn-danger'
                        disabled={disableBulkDecline}
                        onClick={() => setBulkDeclineMRModal(true)}
                    >
                        {t('Bulk Actions')}
                    </button>
                </div>
                <div className='mb-3'>
                    {table ? (
                        <>
                            <ClientSidePageSizeSelector table={table} />
                            <SW360Table
                                table={table}
                                showProcessing={showProcessing}
                            />
                            <ClientSideTableFooter table={table} />
                        </>
                    ) : (
                        <div className='col-12 mt-1 text-center'>
                            <Spinner className='spinner' />
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default OpenModerationRequest
