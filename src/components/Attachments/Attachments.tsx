// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
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
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { PaddedCell, SW360Table } from 'next-sw360'
import { type JSX, useEffect, useMemo, useState } from 'react'
import { Button, Modal, Spinner } from 'react-bootstrap'
import { FaInfoCircle } from 'react-icons/fa'
import { LuDownload } from 'react-icons/lu'
import { AccessControl } from '@/components/AccessControl/AccessControl'
import CDXImportStatus from '@/components/CDXImportStatus/CDXImportStatus'
import { Attachment, Embedded, ErrorDetails, NestedRows, UserGroupType } from '@/object-types'
import DownloadService from '@/services/download.service'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'
import ImportSummary from '../../object-types/cyclonedx/ImportSummary'

type EmbeddedAttachments = Embedded<Attachment, 'sw360:attachments'>

function Attachments({ documentId, documentType }: { documentId: string; documentType: string }): JSX.Element {
    const t = useTranslations('default')
    const [importStatusData, setImportStatusData] = useState<ImportSummary | null>(null)
    const session = useSession()

    const handleAttachmentDownload = async (attachmentId: string, attachmentName: string) => {
        if (CommonUtils.isNullOrUndefined(session.data)) return
        await DownloadService.download(
            `${documentType}/${documentId}/attachments/${attachmentId}`,
            session.data,
            attachmentName,
        )
    }

    const handleImportStatusView = async (attachmentId: string) => {
        try {
            if (CommonUtils.isNullOrUndefined(session.data)) return

            const res = await ApiUtils.GET(
                `${documentType}/${documentId}/attachments/${attachmentId}`,
                session.data.user.access_token,
            )

            if (res.status === StatusCodes.OK) {
                const data = (await res.json()) as ImportSummary
                setImportStatusData(data)
            } else {
                const err = (await res.json()) as ErrorDetails
                throw new Error(err.message)
            }
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                return
            }
            const message = error instanceof Error ? error.message : String(error)
            MessageService.error(message)
        }
    }

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            void signOut()
        }
    }, [
        session,
    ])

    const columns = useMemo<ColumnDef<NestedRows<Attachment>>[]>(
        () => [
            {
                id: 'expand',
                cell: ({ row }) => {
                    if (row.depth > 0) {
                        return (
                            <>
                                <div className='row justify-content-between mx-5 my-2'>
                                    <div className='col'>{`SHA1: ${row.original.node.sha1 ?? ''}`}</div>
                                    <div className='col'>{`${t('Uploaded On')}: ${row.original.node.createdOn ?? ''}`}</div>
                                    <div className='col'>{`${t('Uploaded Comment')}: ${row.original.node.createdComment ?? ''}`}</div>
                                </div>
                                <div className='row justify-content-between mx-5 my-2'>
                                    <div className='col'>{`${t('Checked On')}: ${row.original.node.checkedOn ?? ''}`}</div>
                                    <div className='col'>{`${t('Checked Comment')}: ${row.original.node.checkedComment ?? ''}`}</div>
                                </div>
                            </>
                        )
                    } else {
                        return <PaddedCell row={row}></PaddedCell>
                    }
                },
                meta: {
                    width: '3%',
                },
            },
            {
                id: 'fileName',
                header: t('File name'),
                meta: {
                    width: '20%',
                },
                cell: ({ row }) => {
                    if (row.depth > 0) return
                    const { filename, attachmentContentId } = row.original.node
                    const isImportStatus = filename.includes('ImportStatus_') && filename.endsWith('.json')

                    if (!isImportStatus) {
                        return <p>{filename}</p>
                    }

                    return (
                        <span className='d-inline-flex align-items-center gap-1'>
                            {filename}
                            <span
                                role='button'
                                style={{
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    color: 'black',
                                }}
                                onClick={() => void handleImportStatusView(attachmentContentId ?? '')}
                                title={t('Click to view SBOM import result')}
                            >
                                <FaInfoCircle size={14} />
                            </span>
                        </span>
                    )
                },
            },
            {
                id: 'size',
                header: t('Size'),
                cell: ({ row }) => {
                    if (row.depth > 0) return
                    return <p className='text-center'>{row.original.node.size ?? 'n/a'}</p>
                },
                meta: {
                    width: '8%',
                },
            },
            {
                id: 'type',
                header: t('Type'),
                cell: ({ row }) => {
                    if (row.depth > 0) return
                    return <p className='text-center'>{row.original.node.attachmentType ?? ''}</p>
                },
            },
            {
                id: 'createdTeam',
                header: t('Group'),
                cell: ({ row }) => {
                    if (row.depth > 0) return
                    return <p className='text-center'>{row.original.node.createdTeam ?? ''}</p>
                },
            },
            {
                id: 'createdBy',
                header: t('Uploaded by'),
                cell: ({ row }) => {
                    if (row.depth > 0) return
                    return <p className='text-center'>{row.original.node.createdBy ?? ''}</p>
                },
            },
            {
                id: 'checkedTeam',
                header: t('Group'),
                cell: ({ row }) => {
                    if (row.depth > 0) return
                    return <p className='text-center'>{row.original.node.checkedTeam ?? ''}</p>
                },
            },
            {
                id: 'checkedBy',
                header: t('Checked By'),
                cell: ({ row }) => {
                    if (row.depth > 0) return
                    return (
                        <Link
                            href={`mailto:${row.original.node.checkedBy ?? ''}`}
                            className='text-link w-100 text-center'
                        >
                            {row.original.node.checkedBy ?? ''}
                        </Link>
                    )
                },
            },
            {
                id: 'usages',
                header: t('Usages'),
                cell: ({ row }) => {
                    if (row.depth > 0) return
                    const { projectAttachmentUsage } = row.original.node
                    if (projectAttachmentUsage?.visible === 0 && projectAttachmentUsage.restricted === 0) {
                        return <p className='text-center'>{'n/a'}</p>
                    } else {
                        return (
                            <Link
                                href='#'
                                title='visible / restricted'
                                onClick={(e) => {
                                    e.preventDefault()
                                }}
                                className='text-center'
                            >
                                {projectAttachmentUsage?.visible ?? 0} / {projectAttachmentUsage?.restricted ?? 0}
                            </Link>
                        )
                    }
                },
                meta: {
                    width: '5%',
                },
            },
            {
                id: 'actions',
                header: t('Actions'),
                cell: ({ row }) => {
                    if (row.depth > 0) return
                    const { attachmentContentId, filename } = row.original.node
                    return (
                        <LuDownload
                            className='btn-icon text-center w-100'
                            size={18}
                            onClick={() => void handleAttachmentDownload(attachmentContentId ?? '', filename)}
                        />
                    )
                },
                meta: {
                    width: '5%',
                },
            },
        ],
        [
            t,
        ],
    )

    const [attachmentData, setAttachmentData] = useState<NestedRows<Attachment>[]>(() => [])
    const memoizedData = useMemo(
        () => attachmentData,
        [
            attachmentData,
        ],
    )
    const [showProcessing, setShowProcessing] = useState(false)

    useEffect(() => {
        if (session.status === 'loading') return
        const controller = new AbortController()
        const signal = controller.signal

        const timeLimit = attachmentData.length !== 0 ? 700 : 0
        const timeout = setTimeout(() => {
            setShowProcessing(true)
        }, timeLimit)

        void (async () => {
            try {
                if (CommonUtils.isNullOrUndefined(session.data)) return
                const response = await ApiUtils.GET(
                    `${documentType}/${documentId}/attachments`,
                    session.data.user.access_token,
                    signal,
                )
                if (response.status !== StatusCodes.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new Error(err.message)
                }

                const data = (await response.json()) as EmbeddedAttachments
                setAttachmentData(
                    CommonUtils.isNullOrUndefined(data['_embedded']['sw360:attachments'])
                        ? []
                        : data['_embedded']['sw360:attachments'].map(
                              (att) =>
                                  ({
                                      node: att,
                                      children: [
                                          {
                                              node: att,
                                          },
                                      ],
                                  }) as NestedRows<Attachment>,
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
        session,
    ])

    const table = useReactTable({
        data: memoizedData,
        columns,
        getCoreRowModel: getCoreRowModel(),

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
    })

    table.getRowModel().rows.forEach((row) => {
        if (row.depth === 1) {
            row.meta = {
                isFullSpanRow: true,
            }
        }
    })

    return (
        <>
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
            {importStatusData != null && (
                <Modal
                    show={true}
                    onHide={() => setImportStatusData(null)}
                    size='lg'
                    centered
                    scrollable
                >
                    <Modal.Header closeButton>
                        <Modal.Title>
                            <span className='text-primary'>{t('SBOM Import Statistics for')}:</span>{' '}
                            <span className='text-warning'>{importStatusData.fileName}</span>
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <CDXImportStatus
                            data={importStatusData}
                            isNewProject={false}
                        />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            variant='secondary'
                            onClick={() => setImportStatusData(null)}
                        >
                            {t('Close')}
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </>
    )
}

// Pass notAllowedUserGroups to AccessControl to restrict access
export default AccessControl(Attachments, [
    UserGroupType.SECURITY_USER,
])
