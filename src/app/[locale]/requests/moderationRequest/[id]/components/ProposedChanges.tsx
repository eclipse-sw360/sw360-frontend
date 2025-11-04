// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ColumnDef, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table'
import { StatusCodes } from 'http-status-codes'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { ClientSidePageSizeSelector, ClientSideTableFooter, SW360Table } from 'next-sw360'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import { Spinner } from 'react-bootstrap'
import { ErrorDetails, ModerationRequestDetails, RequestDocumentTypes } from '@/object-types'
import MessageService from '@/services/message.service'
import CommonUtils from '@/utils/common.utils'
import { ApiUtils } from '@/utils/index'
import TableHeader from './TableHeader'

type RowValue =
    | string
    | number
    | boolean
    | null
    | undefined
    | RowValue[]
    | {
          [key: string]: RowValue
      }

interface RowInterface {
    fieldName: string
    currentValue: RowValue
    formerValue: RowValue
    suggestedValue: RowValue
}

export default function ProposedChanges({
    moderationRequestData,
}: {
    moderationRequestData: ModerationRequestDetails | undefined
}): ReactNode | undefined {
    const t = useTranslations('default')
    const dafaultTitle = t('BASIC FIELD CHANGES')
    const session = useSession()

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            void signOut()
        }
    }, [
        session,
    ])

    const columns = useMemo<ColumnDef<RowInterface>[]>(
        () => [
            {
                id: 'fieldName',
                accessorKey: 'fieldName',
                enableSorting: false,
                header: t('Field Name'),
                cell: (info) => info.getValue(),
            },
            {
                id: 'currentValue',
                header: t('Current Value'),
                cell: ({ row }) => {
                    const { currentValue } = row.original
                    return <>{convertToReactNode(currentValue)}</>
                },
            },
            {
                id: 'formerValue',
                header: t('Former Value'),
                cell: ({ row }) => {
                    const { formerValue } = row.original
                    return <>{convertToReactNode(formerValue)}</>
                },
            },
            {
                id: 'suggestedValue',
                header: t('Suggested Value'),
                cell: ({ row }) => {
                    const { suggestedValue } = row.original
                    return <>{convertToReactNode(suggestedValue)}</>
                },
            },
        ],
        [
            t,
        ],
    )

    const convertToReactNode = (value: RowValue): ReactNode => {
        if (value === undefined || value === null) {
            return (
                <>
                    {'--'}
                    {t('not set')}
                    {'--'}
                </>
            )
        }

        if (typeof value === 'string' || typeof value === 'number') {
            return <>{value}</>
        }

        if (typeof value === 'boolean') {
            return <>{value ? 'true' : 'false'}</>
        }

        if (Array.isArray(value)) {
            return (
                <ul>
                    {value.map((item, index) => (
                        <li key={index}>{convertToReactNode(item)}</li>
                    ))}
                </ul>
            )
        }

        if (typeof value === 'object') {
            return (
                <ul>
                    {Object.entries(value).map(([key, val]) => (
                        <li key={key}>
                            <span className='fw-medium'>{key}</span> {convertToReactNode(val)}
                        </li>
                    ))}
                </ul>
            )
        }
    }

    const populateTableData = (
        additions: Record<string, RowValue>,
        deletions: Record<string, RowValue>,
        entity: Record<string, RowValue>,
    ): RowInterface[] => {
        const tableData: RowInterface[] = []
        for (const key in additions) {
            // keys which were added/updated
            if (deletions[key] !== undefined && additions[key] === deletions[key]) continue
            tableData.push({
                fieldName: key,
                currentValue: entity[key],
                formerValue: deletions[key],
                suggestedValue: additions[key],
            })
        }
        for (const key in deletions) {
            // keys which were deleted
            if (additions[key] !== undefined) continue
            tableData.push({
                fieldName: key,
                currentValue: entity[key],
                formerValue: deletions[key],
                suggestedValue: undefined,
            })
        }

        return tableData
    }

    const [tableData, setTableData] = useState<RowInterface[]>([])
    const memoizedData = useMemo(
        () => tableData,
        [
            tableData,
        ],
    )
    const [showProcessing, setShowProcessing] = useState(false)

    useEffect(() => {
        if (session.status === 'loading' || moderationRequestData === undefined) return
        const controller = new AbortController()
        const signal = controller.signal

        void (async () => {
            try {
                if (CommonUtils.isNullOrUndefined(session.data)) return signOut()
                setShowProcessing(true)
                let queryUrl = ''
                if (moderationRequestData?.documentType == RequestDocumentTypes.COMPONENT) {
                    queryUrl = `components/${moderationRequestData.documentId}`
                } else if (moderationRequestData?.documentType == RequestDocumentTypes.LICENSE) {
                    queryUrl = `licenses/${moderationRequestData.documentId}`
                } else if (moderationRequestData?.documentType == RequestDocumentTypes.PROJECT) {
                    queryUrl = `projects/${moderationRequestData.documentId}`
                } else if (moderationRequestData?.documentType == RequestDocumentTypes.RELEASE) {
                    queryUrl = `releases/${moderationRequestData.documentId}`
                }
                const response = await ApiUtils.GET(queryUrl, session.data.user.access_token, signal)
                if (response.status !== StatusCodes.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new Error(err.message)
                }

                let additions: Record<string, RowValue> = {},
                    deletions: Record<string, RowValue> = {}
                const data = (await response.json()) as Record<string, RowValue>
                if (moderationRequestData?.documentType == RequestDocumentTypes.COMPONENT) {
                    additions = moderationRequestData.componentAdditions ?? {}
                    deletions = moderationRequestData.componentDeletions ?? {}
                } else if (moderationRequestData?.documentType == RequestDocumentTypes.LICENSE) {
                    additions = moderationRequestData.licenseAdditions ?? {}
                    deletions = moderationRequestData.licenseDeletions ?? {}
                } else if (moderationRequestData?.documentType == RequestDocumentTypes.PROJECT) {
                    additions = moderationRequestData.projectAdditions ?? {}
                    deletions = moderationRequestData.projectDeletions ?? {}
                } else if (moderationRequestData?.documentType == RequestDocumentTypes.RELEASE) {
                    additions = moderationRequestData.releaseAdditions ?? {}
                    deletions = moderationRequestData.releaseDeletions ?? {}
                }

                setTableData(populateTableData(additions, deletions, data))
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
        moderationRequestData,
    ])

    const table = useReactTable({
        data: memoizedData,
        columns,
        getCoreRowModel: getCoreRowModel(),

        getPaginationRowModel: getPaginationRowModel(),
    })

    return (
        <>
            {moderationRequestData && (
                <>
                    <TableHeader title={dafaultTitle} />
                    {moderationRequestData['requestDocumentDelete'] ? (
                        <div className='subscriptionBoxDanger'>
                            {t('The') +
                                ` ${moderationRequestData?.documentType?.toLowerCase()} ` +
                                ` ${moderationRequestData?.documentName} ` +
                                t('is requested to be deleted')}
                        </div>
                    ) : (
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
                    )}
                </>
            )}
        </>
    )
}
