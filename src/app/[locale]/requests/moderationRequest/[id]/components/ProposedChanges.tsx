// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ColumnDef, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table'
import { diffWordsWithSpace } from 'diff'
import { StatusCodes } from 'http-status-codes'
import { useTranslations } from 'next-intl'
import { SW360Table } from 'next-sw360'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import { Spinner } from 'react-bootstrap'
import { Attachment, ErrorDetails, ModerationRequestDetails, RequestDocumentTypes } from '@/object-types'
import { ApiError } from '@/utils'
import ApiUtils from '@/utils/api/authenticatedApi.util'
import { getAttachmentTypeShortForm } from '@/utils/attachments.utils'
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
    const attachmentTitle = t('ATTACHMENTS')

    const columns = useMemo<ColumnDef<RowInterface>[]>(
        () => [
            {
                id: 'basicChanges',
                header: t('Changes for Basic fields'),
                columns: [
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
                            // Current Value always shows the complete value currently stored on
                            // the document (e.g. every externalIds entry, every linked package),
                            // regardless of what changed. Former/Suggested below show only the
                            // actual diff, as produced by the backend's moderation request
                            // generators.
                            return <>{convertToReactNode(currentValue)}</>
                        },
                    },
                    {
                        id: 'formerValue',
                        header: t('Former Value'),
                        cell: ({ row }) => {
                            const { formerValue, suggestedValue } = row.original
                            return renderDiffCell(formerValue, suggestedValue, 'former')
                        },
                    },
                    {
                        id: 'suggestedValue',
                        header: t('Suggested Value'),
                        cell: ({ row }) => {
                            const { formerValue, suggestedValue } = row.original
                            return renderDiffCell(formerValue, suggestedValue, 'suggested')
                        },
                    },
                ],
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

    const attachmentColumns = useMemo<ColumnDef<Attachment>[]>(
        () => [
            {
                id: 'fileName',
                header: t('File name'),
                cell: ({ row }) => {
                    if (row.depth > 0) return
                    const { filename } = row.original

                    return <span className='text-center'>{filename}</span>
                },
                meta: {
                    width: '7%',
                },
            },
            {
                id: 'sha1',
                header: t('sha1'),
                cell: ({ row }) => {
                    if (row.depth > 0) return
                    const { sha1 } = row.original

                    return <span className='text-center'>{sha1}</span>
                },
                meta: {
                    width: '7%',
                },
            },
            {
                id: 'attachmentType',
                header: t('Attachment Type'),
                cell: ({ row }) => {
                    if (row.depth > 0) return
                    const { attachmentType } = row.original

                    return <span className='text-center'>{getAttachmentTypeShortForm(attachmentType)}</span>
                },
                meta: {
                    width: '7%',
                },
            },
            {
                id: 'createdBy',
                header: t('Created By'),
                cell: ({ row }) => {
                    if (row.depth > 0) return
                    const { createdBy } = row.original

                    return <span className='text-center'>{createdBy}</span>
                },
                meta: {
                    width: '7%',
                },
            },
            {
                id: 'createdTeam',
                header: t('Created Team'),
                cell: ({ row }) => {
                    if (row.depth > 0) return
                    const { createdTeam } = row.original

                    return <span className='text-center'>{createdTeam}</span>
                },
                meta: {
                    width: '7%',
                },
            },
            {
                id: 'createdComment',
                header: t('Created Comment'),
                cell: ({ row }) => {
                    if (row.depth > 0) return
                    const { createdComment } = row.original

                    return <span className='text-center'>{createdComment}</span>
                },
            },
            {
                id: 'createdOn',
                header: t('Created On'),
                cell: ({ row }) => {
                    if (row.depth > 0) return
                    const { createdOn } = row.original

                    return <span className='text-center'>{createdOn}</span>
                },
                meta: {
                    width: '7%',
                },
            },
            {
                id: 'checkedBy',
                header: t('Checked By'),
                cell: ({ row }) => {
                    if (row.depth > 0) return
                    const { checkedBy } = row.original

                    return <span className='text-center'>{checkedBy}</span>
                },
                meta: {
                    width: '7%',
                },
            },
            {
                id: 'checkedTeam',
                header: t('Checked Team'),
                cell: ({ row }) => {
                    if (row.depth > 0) return
                    const { checkedTeam } = row.original

                    return <span className='text-center'>{checkedTeam}</span>
                },
            },
            {
                id: 'checkedComment',
                header: t('Checked Comment'),
                cell: ({ row }) => {
                    if (row.depth > 0) return
                    const { checkedComment } = row.original

                    return <span className='text-center'>{checkedComment}</span>
                },
            },
            {
                id: 'checkedOn',
                header: t('Checked On'),
                cell: ({ row }) => {
                    if (row.depth > 0) return
                    const { checkedOn } = row.original

                    return <span className='text-center'>{checkedOn}</span>
                },
            },
            {
                id: 'checkStatus',
                header: t('Checked Status'),
                cell: ({ row }) => {
                    if (row.depth > 0) return
                    const { checkStatus } = row.original

                    return <span className='text-center'>{checkStatus}</span>
                },
            },
            {
                id: 'superAttachmentId',
                header: t('Super Attachment Id'),
            },
            {
                id: 'superAttachmentFIlename',
                header: t('Super Attachment Filename'),
            },
        ],
        [
            t,
        ],
    )

    const addedAttachmentsColumns = useMemo<ColumnDef<Attachment>[]>(
        () => [
            {
                id: 'added',
                header: t('Added Attachments'),
                columns: attachmentColumns,
            },
        ],
        [
            t,
        ],
    )

    const removedAttachmentsColumns = useMemo<ColumnDef<Attachment>[]>(
        () => [
            {
                id: 'removed',
                header: t('Removed Attachments'),
                columns: attachmentColumns,
            },
        ],
        [
            t,
        ],
    )

    // Serializes a value the same way the field would be compared (pretty-printed
    // JSON for objects/arrays, raw text for strings), so it can be fed into a
    // word-level diff.
    const toDiffText = (value: RowValue): string => {
        if (value === undefined || value === null) return ''
        if (typeof value === 'string') return value
        return JSON.stringify(value, null, 2)
    }

    // Renders Former/Suggested Value cells the same way change logs do: the full
    // value is always shown (nothing is hidden or filtered out), but the parts
    // that differ between formerValue and suggestedValue are highlighted -
    // removed content in red (Former Value column), added content in green
    // (Suggested Value column). Unchanged content is shown without highlighting.
    const renderDiffCell = (
        formerValue: RowValue,
        suggestedValue: RowValue,
        side: 'former' | 'suggested',
    ): ReactNode => {
        const formerEmpty = formerValue === undefined || formerValue === null
        const suggestedEmpty = suggestedValue === undefined || suggestedValue === null

        if (side === 'former' && formerEmpty) {
            return (
                <>
                    {'--'}
                    {t('not set')}
                    {'--'}
                </>
            )
        }
        if (side === 'suggested' && suggestedEmpty) {
            return (
                <>
                    {'--'}
                    {t('not set')}
                    {'--'}
                </>
            )
        }

        // field was newly added (nothing to diff against): show it fully highlighted
        if (side === 'suggested' && formerEmpty) {
            return (
                <pre className='change-text'>
                    <span className='new-val-change-highlight'>{toDiffText(suggestedValue)}</span>
                </pre>
            )
        }
        // field was entirely removed (nothing to diff against): show old value fully highlighted
        if (side === 'former' && suggestedEmpty) {
            return (
                <pre className='change-text'>
                    <span className='old-val-change-highlight'>{toDiffText(formerValue)}</span>
                </pre>
            )
        }

        const diffParts = diffWordsWithSpace(toDiffText(formerValue), toDiffText(suggestedValue))

        return (
            <pre className='change-text'>
                {diffParts.map((part, index) => {
                    if (side === 'former') {
                        if (part.added) return null
                        return (
                            <span
                                key={index}
                                className={part.removed ? 'old-val-change-highlight' : undefined}
                            >
                                {part.value}
                            </span>
                        )
                    } else {
                        if (part.removed) return null
                        return (
                            <span
                                key={index}
                                className={part.added ? 'new-val-change-highlight' : undefined}
                            >
                                {part.value}
                            </span>
                        )
                    }
                })}
            </pre>
        )
    }

    const populateTableData = (
        additions: Record<string, RowValue>,
        deletions: Record<string, RowValue>,
        entity: Record<string, RowValue>,
    ) => {
        const tableData: RowInterface[] = []

        for (const key in additions) {
            if (key === 'attachments') continue
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
            if (key === 'attachments') continue
            if (additions[key] !== undefined) continue
            tableData.push({
                fieldName: key,
                currentValue: entity[key],
                formerValue: deletions[key],
                suggestedValue: undefined,
            })
        }

        setTableData(tableData)
        setAddedAttachmentsTableData((additions.attachments ?? []) as unknown as Attachment[])
        setRemovedAttachmentsTableData((deletions.attachments ?? []) as unknown as Attachment[])
    }

    const [tableData, setTableData] = useState<RowInterface[]>([])
    const memoizedData = useMemo(
        () => tableData,
        [
            tableData,
        ],
    )
    const [showProcessing, setShowProcessing] = useState(false)

    const [addedAttachmentsTableData, setAddedAttachmentsTableData] = useState<Attachment[]>([])
    const memoizedAddedAttachmentsData = useMemo(
        () => addedAttachmentsTableData,
        [
            addedAttachmentsTableData,
        ],
    )

    const [removedAttachmentsTableData, setRemovedAttachmentsTableData] = useState<Attachment[]>([])
    const memoizedRemovedAttachmentsData = useMemo(
        () => removedAttachmentsTableData,
        [
            removedAttachmentsTableData,
        ],
    )

    useEffect(() => {
        if (moderationRequestData === undefined) return
        const controller = new AbortController()
        const signal = controller.signal

        void (async () => {
            try {
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
                const response = await ApiUtils.GET(queryUrl, signal)
                if (response.status !== StatusCodes.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new ApiError(err.message, {
                        status: response.status,
                    })
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

                populateTableData(additions, deletions, data)
            } catch (error) {
                ApiUtils.reportError(error)
            } finally {
                setShowProcessing(false)
            }
        })()

        return () => controller.abort()
    }, [
        moderationRequestData,
    ])

    const table = useReactTable({
        data: memoizedData,
        columns,
        getCoreRowModel: getCoreRowModel(),

        getPaginationRowModel: getPaginationRowModel(),
    })

    const addedAttachmentTable = useReactTable({
        data: memoizedAddedAttachmentsData,
        columns: addedAttachmentsColumns,
        getCoreRowModel: getCoreRowModel(),
    })

    const removedAttachmentTable = useReactTable({
        data: memoizedRemovedAttachmentsData,
        columns: removedAttachmentsColumns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <>
            {moderationRequestData && (
                <>
                    {moderationRequestData['requestDocumentDelete'] ? (
                        <div className='subscriptionBoxDanger'>
                            {t('The') +
                                ` ${moderationRequestData?.documentType?.toLowerCase()} ` +
                                ` ${moderationRequestData?.documentName} ` +
                                t('is requested to be deleted')}
                        </div>
                    ) : (
                        <>
                            <TableHeader title={dafaultTitle} />
                            <div className='mb-3'>
                                {table ? (
                                    <SW360Table
                                        table={table}
                                        showProcessing={showProcessing}
                                    />
                                ) : (
                                    <div className='col-12 mt-1 text-center'>
                                        <Spinner className='spinner' />
                                    </div>
                                )}
                            </div>
                            <TableHeader title={attachmentTitle} />
                            {addedAttachmentTable.getRowCount() + removedAttachmentTable.getRowCount() === 0 ? (
                                <div className='alert alert-primary'>{t('No changes in attachments')}</div>
                            ) : (
                                <>
                                    <div className='mb-3'>
                                        {addedAttachmentTable ? (
                                            <SW360Table
                                                table={addedAttachmentTable}
                                                showProcessing={showProcessing}
                                            />
                                        ) : (
                                            <div className='col-12 mt-1 text-center'>
                                                <Spinner className='spinner' />
                                            </div>
                                        )}
                                    </div>
                                    <div className='mb-3'>
                                        {removedAttachmentTable ? (
                                            <SW360Table
                                                table={removedAttachmentTable}
                                                showProcessing={showProcessing}
                                            />
                                        ) : (
                                            <div className='col-12 mt-1 text-center'>
                                                <Spinner className='spinner' />
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </>
            )}
        </>
    )
}
