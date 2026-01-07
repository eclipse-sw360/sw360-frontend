// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
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
import { SW360Table } from 'next-sw360'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import { Alert, Button, Spinner } from 'react-bootstrap'
import { BsExclamationTriangle } from 'react-icons/bs'
import { Attachment, AttachmentTypes, Embedded, ErrorDetails } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'
import SPDXLicenseView from './SPDXLicenseView'

interface Props {
    releaseId: string
}

interface LicenseInfo {
    license: string
    otherLicense: string
    licenseIds?: string[]
    otherLicenseIds?: string[]
    totalFileCount?: number
}

interface CellData {
    id: string
    attachment: Attachment
    licenseInfo?: LicenseInfo
    status?: {
        variant: string
        message: string
    }
}

interface SpdxLicensesPayload {
    mainLicenseIds: string[]
    otherLicenseIds: string[]
}

const SPDXAttachments = ({ releaseId }: Props): ReactNode => {
    const t = useTranslations('default')
    const session = useSession()

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            void signOut()
        }
    }, [
        session,
    ])

    const [tableData, setTableData] = useState<CellData[]>(() => [])
    const memoizedData = useMemo(
        () => tableData,
        [
            tableData,
        ],
    )
    const [showProcessing, setShowProcessing] = useState(false)

    const columns = useMemo<ColumnDef<CellData>[]>(
        () => [
            {
                id: 'name',
                header: t('SPDX Attachments'),
                cell: ({ row }) => {
                    return (
                        <>
                            {row.original.attachment.attachmentType === AttachmentTypes.INITIAL_SCAN_REPORT ? (
                                <>
                                    {row.original.attachment.filename}{' '}
                                    <BsExclamationTriangle
                                        style={{
                                            color: 'red',
                                            fontSize: '20px',
                                        }}
                                        className='mb-1'
                                        size={20}
                                    />
                                </>
                            ) : (
                                <>{row.original.attachment.filename}</>
                            )}
                        </>
                    )
                },
                meta: {
                    width: '35%',
                },
            },
            {
                id: 'action',
                header: t('Action'),
                cell: ({ row }) => {
                    return (
                        <>
                            {row.original.licenseInfo !== undefined ? (
                                row.original.attachment.attachmentType !== 'ISR' && (
                                    <Button
                                        variant='primary'
                                        onClick={() => void handleAddSpdxLicenses(row.original.id)}
                                    >
                                        {t('Add License To Release')}
                                    </Button>
                                )
                            ) : (
                                <Button
                                    variant='secondary'
                                    onClick={() => void handleShowLicenseInfo(row.original.id)}
                                >
                                    {t('Show License Info')}
                                </Button>
                            )}
                        </>
                    )
                },
                meta: {
                    width: '30%',
                },
            },
            {
                id: 'result',
                header: t('Result'),
                cell: ({ row }) => {
                    return (
                        <>
                            {row.original.status ? (
                                <Alert variant={row.original.status.variant}>{row.original.status.message}</Alert>
                            ) : (
                                row.original.licenseInfo && (
                                    <SPDXLicenseView
                                        isISR={
                                            row.original.attachment.attachmentType ===
                                            AttachmentTypes.INITIAL_SCAN_REPORT
                                        }
                                        licenseInfo={row.original.licenseInfo}
                                        attachmentName={row.original.attachment.filename}
                                        releaseId={releaseId}
                                        attachmentId={row.original.id}
                                    />
                                )
                            )}
                        </>
                    )
                },
                meta: {
                    width: '35%',
                },
            },
        ],
        [
            t,
        ],
    )

    const handleAddSpdxLicenses = async (attachmentId: string) => {
        try {
            if (CommonUtils.isNullOrUndefined(session.data)) return signOut()
            setShowProcessing(true)
            const payload: SpdxLicensesPayload = {
                mainLicenseIds: [],
                otherLicenseIds: [],
            }
            tableData.forEach((t) => {
                if (t.id === attachmentId) {
                    payload.mainLicenseIds = t.licenseInfo?.licenseIds ?? []
                    payload.otherLicenseIds = t.licenseInfo?.otherLicenseIds ?? []
                }
            })
            const response = await ApiUtils.POST(
                `releases/${releaseId}/spdxLicenses`,
                payload,
                session.data.user.access_token,
            )
            if (response.status !== StatusCodes.OK) {
                const err = (await response.json()) as ErrorDetails
                throw new Error(err.message)
            }
            setTableData((prev) => {
                return prev.map((t) => {
                    if (t.id === attachmentId) {
                        return {
                            ...t,
                            status: {
                                variant: 'success',
                                message: 'Success! Please reload page to see the changes!',
                            },
                        }
                    }
                    return {
                        ...t,
                    }
                })
            })
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

    const handleShowLicenseInfo = async (attachmentId: string) => {
        try {
            if (CommonUtils.isNullOrUndefined(session.data)) return signOut()
            setShowProcessing(true)
            const response = await ApiUtils.GET(
                `releases/${releaseId}/spdxLicensesInfo?attachmentId=${attachmentId}`,
                session.data.user.access_token,
            )
            if (response.status !== StatusCodes.OK) {
                const err = (await response.json()) as ErrorDetails
                throw new Error(err.message)
            }

            const data = (await response.json()) as LicenseInfo
            setTableData((prev) => {
                return prev.map((t) => {
                    if (t.id === attachmentId) {
                        return {
                            ...t,
                            licenseInfo: data,
                        }
                    }
                    return {
                        ...t,
                    }
                })
            })
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

    const filterAttachmentByType = (attachments: Array<Attachment>, types: Array<string>) => {
        return attachments.filter((attachment) => types.includes(attachment.attachmentType))
    }

    useEffect(() => {
        if (session.status === 'loading') return
        const controller = new AbortController()
        const signal = controller.signal

        const timeLimit = tableData.length !== 0 ? 700 : 0
        const timeout = setTimeout(() => {
            setShowProcessing(true)
        }, timeLimit)

        void (async () => {
            try {
                if (CommonUtils.isNullOrUndefined(session.data)) return signOut()
                const response = await ApiUtils.GET(
                    `releases/${releaseId}/attachments`,
                    session.data.user.access_token,
                    signal,
                )
                if (response.status !== StatusCodes.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new Error(err.message)
                }

                const data = (await response.json()) as Embedded<Attachment, 'sw360:attachments'>

                const attachments = CommonUtils.isNullOrUndefined(data['_embedded']?.['sw360:attachments'])
                    ? []
                    : data['_embedded']['sw360:attachments']
                const isrAttachments = filterAttachmentByType(attachments, [
                    AttachmentTypes.INITIAL_SCAN_REPORT,
                ])
                const cliAndClxAttachments = filterAttachmentByType(attachments, [
                    AttachmentTypes.COMPONENT_LICENSE_INFO_XML,
                    AttachmentTypes.COMPONENT_LICENSE_INFO_COMBINED,
                ])

                const tableData: CellData[] = []
                if (cliAndClxAttachments.length !== 0) {
                    tableData.push(
                        ...cliAndClxAttachments.map((a) => ({
                            id: a.attachmentContentId ?? '',
                            attachment: a,
                        })),
                    )
                } else {
                    tableData.push(
                        ...isrAttachments.map((a) => ({
                            id: a.attachmentContentId ?? '',
                            attachment: a,
                        })),
                    )
                }

                setTableData(tableData)
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
        releaseId,
    ])

    const table = useReactTable({
        data: memoizedData,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
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
    )
}

export default SPDXAttachments
