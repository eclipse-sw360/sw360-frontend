// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ColumnDef, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { type JSX, useEffect, useMemo, useState } from 'react'
import { OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap'
import { FaPencilAlt } from 'react-icons/fa'
import { ClientSidePageSizeSelector, ClientSideTableFooter, SW360Table } from '@/components/sw360'
import { ErrorDetails, HttpStatus, Package, Project, ReleaseClearingStateMapping } from '@/object-types'
import MessageService from '@/services/message.service'
import CommonUtils from '@/utils/common.utils'
import { ApiUtils } from '@/utils/index'

interface Props {
    projectId: string
}

export default function LinkedPackagesTab({ projectId }: Props): JSX.Element {
    const t = useTranslations('default')
    const session = useSession()

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            void signOut()
        }
    }, [
        session,
    ])

    const [packagesData, setPackagesData] = useState<Package[]>(() => [])
    const memoizedPackagesData = useMemo(
        () => packagesData,
        [
            packagesData,
        ],
    )
    const [showPackagesProcessing, setShowPackagesProcessing] = useState(false)

    const [projectData, setProjectData] = useState<Project | undefined>()
    const memoizedProjectData = useMemo(
        () => projectData,
        [
            projectData,
        ],
    )
    const [showProjectProcessing, setShowProjectProcessing] = useState(false)

    const columns = useMemo<ColumnDef<Package>[]>(
        () => [
            {
                id: 'vendor',
                header: t('Vendor'),
                meta: {
                    width: '10%',
                },
            },
            {
                id: 'packageName',
                header: t('Package Name Version'),
                cell: ({ row }) => {
                    const { id, name, version } = row.original
                    return (
                        <Link
                            href={`/packages/detail/${id}`}
                            className='text-link'
                        >{`${name} (${version})`}</Link>
                    )
                },
                meta: {
                    width: '20%',
                },
            },
            {
                id: 'releaseName',
                header: t('Release Name Version'),
                cell: ({ row }) => {
                    const release = row.original._embedded?.['sw360:release']
                    return (
                        <Link
                            href={`/components/releases/detail/${release?.id}`}
                            className='text-link'
                        >
                            {`${release?.name} (${release?.version})`}
                        </Link>
                    )
                },
                meta: {
                    width: '15%',
                },
            },
            {
                id: 'releaseClearingState',
                header: t('Release Clearing State'),
                cell: ({ row }) => {
                    const releaseClearingState = row.original._embedded?.['sw360:release']?.clearingState ?? ''
                    return (
                        <div className='text-center'>
                            {releaseClearingState === '' ? (
                                <>{t('Not Applicable')}</>
                            ) : (
                                <OverlayTrigger
                                    overlay={
                                        <Tooltip>
                                            {`${t('Release Clearing State')}: ${t(
                                                ReleaseClearingStateMapping[
                                                    releaseClearingState as keyof typeof ReleaseClearingStateMapping
                                                ],
                                            )}`}
                                        </Tooltip>
                                    }
                                >
                                    {releaseClearingState === 'NEW_CLEARING' || releaseClearingState === 'NEW' ? (
                                        <span className='state-box clearingStateOpen capsule-left capsule-right align-center'>
                                            {'CS'}
                                        </span>
                                    ) : releaseClearingState === 'REPORT_AVAILABLE' ? (
                                        <span className='state-box clearingStateReportAvailable capsule-left capsule-right'>
                                            {'CS'}
                                        </span>
                                    ) : releaseClearingState === 'UNDER_CLEARING' ? (
                                        <span className='state-box clearingStateInProgress capsule-left capsule-right'>
                                            {'CS'}
                                        </span>
                                    ) : releaseClearingState === 'INTERNAL_USE_SCAN_AVAILABLE' ? (
                                        <span className='state-box clearingStateUnknown capsule-left capsule-right'>
                                            {'CS'}
                                        </span>
                                    ) : releaseClearingState === 'SENT_TO_CLEARING_TOOL' ||
                                      releaseClearingState === 'SCAN_AVAILABLE' ? (
                                        <span className='state-box clearingStateSentToClearingTool capsule-left capsule-right'>
                                            {'CS'}
                                        </span>
                                    ) : (
                                        <span className='state-box clearingStateApproved capsule-left capsule-right'>
                                            {'CS'}
                                        </span>
                                    )}
                                </OverlayTrigger>
                            )}
                        </div>
                    )
                },
                meta: {
                    width: '10%',
                },
            },
            {
                id: 'licenses',
                header: t('Licenses'),
                cell: ({ row }) => {
                    const { licenseIds } = row.original
                    return (
                        <div>
                            {licenseIds?.map((lincenseId, index) => (
                                <span key={index}>
                                    <Link
                                        href={`/licenses/detail?id=${lincenseId}`}
                                        className='text-link'
                                    >
                                        {lincenseId}
                                    </Link>
                                    {index !== licenseIds.length - 1 && ', '}
                                </span>
                            ))}
                        </div>
                    )
                },
                meta: {
                    width: '10%',
                },
            },
            {
                id: 'packageManager',
                header: t('Package Manager'),
                accessorKey: 'packageManager',
                cell: (info) => info.getValue(),
                enableSorting: false,
                meta: {
                    width: '10%',
                },
            },
            {
                id: 'packageLinkDate',
                header: t('Package Link Date'),
                cell: ({ row }) => <>{memoizedProjectData?.packageIds?.[row.original.id ?? '']?.createdOn || ''}</>,
                meta: {
                    width: '10%',
                },
            },
            {
                id: 'comment',
                header: t('Comments'),
                cell: ({ row }) => <>{memoizedProjectData?.packageIds?.[row.original.id ?? '']?.comment || ''}</>,
                meta: {
                    width: '10%',
                },
            },

            {
                id: 'actions',
                header: t('Actions'),
                cell: ({ row }) => {
                    return (
                        <span className='d-flex justify-content-evenly'>
                            <OverlayTrigger overlay={<Tooltip>{t('Edit Package')}</Tooltip>}>
                                <Link
                                    href={`/packages/edit/${row.original.id}`}
                                    className='overlay-trigger'
                                >
                                    <FaPencilAlt className='btn-icon' />
                                </Link>
                            </OverlayTrigger>
                        </span>
                    )
                },
                meta: {
                    width: '5%',
                },
            },
        ],
        [
            t,
            memoizedProjectData,
        ],
    )

    useEffect(() => {
        if (session.status === 'loading') return
        const controller = new AbortController()
        const signal = controller.signal

        const timeLimit = packagesData.length !== 0 ? 700 : 0
        const timeout = setTimeout(() => {
            setShowPackagesProcessing(true)
        }, timeLimit)

        void (async () => {
            try {
                if (CommonUtils.isNullOrUndefined(session.data)) return signOut()
                const response = await ApiUtils.GET(
                    `projects/${projectId}/packages`,
                    session.data.user.access_token,
                    signal,
                )
                if (response.status !== HttpStatus.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new Error(err.message)
                }

                const data = (await response.json()) as Package[]
                setPackagesData(data)
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return
                }
                const message = error instanceof Error ? error.message : String(error)
                MessageService.error(message)
            } finally {
                clearTimeout(timeout)
                setShowPackagesProcessing(false)
            }
        })()

        return () => controller.abort()
    }, [
        session,
        projectId,
    ])

    useEffect(() => {
        if (session.status === 'loading') return
        const controller = new AbortController()
        const signal = controller.signal

        const timeLimit = projectData === undefined ? 700 : 0
        const timeout = setTimeout(() => {
            setShowProjectProcessing(true)
        }, timeLimit)

        void (async () => {
            try {
                if (CommonUtils.isNullOrUndefined(session.data)) return signOut()
                const response = await ApiUtils.GET(`projects/${projectId}`, session.data.user.access_token, signal)
                if (response.status !== HttpStatus.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new Error(err.message)
                }

                const data = (await response.json()) as Project
                setProjectData(data)
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return
                }
                const message = error instanceof Error ? error.message : String(error)
                MessageService.error(message)
            } finally {
                clearTimeout(timeout)
                setShowProjectProcessing(false)
            }
        })()

        return () => controller.abort()
    }, [
        session,
        projectId,
    ])

    const table = useReactTable({
        data: memoizedPackagesData,
        columns,
        getCoreRowModel: getCoreRowModel(),

        getPaginationRowModel: getPaginationRowModel(),
    })

    return (
        <div className='mb-3'>
            {table ? (
                <>
                    <ClientSidePageSizeSelector table={table} />
                    <SW360Table
                        table={table}
                        showProcessing={showPackagesProcessing || showProjectProcessing}
                    />
                    <ClientSideTableFooter table={table} />
                </>
            ) : (
                <div className='col-12 mt-1 text-center'>
                    <Spinner className='spinner' />
                </div>
            )}
        </div>
    )
}
