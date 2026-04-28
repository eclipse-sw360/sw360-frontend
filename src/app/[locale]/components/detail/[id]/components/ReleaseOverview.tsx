// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ColumnDef, getCoreRowModel, SortingState, useReactTable } from '@tanstack/react-table'
import { StatusCodes } from 'http-status-codes'
import { StaticImport } from 'next/dist/shared/lib/get-img-props'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { PageSizeSelector, SW360Table, TableFooter, TableSearch } from 'next-sw360'
import { KeyboardEvent, ReactNode, useEffect, useMemo, useState } from 'react'
import { Button, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { BsClipboard, BsDownload, BsFillTrashFill, BsGit, BsLink45Deg, BsPencil } from 'react-icons/bs'
import fossologyIcon from '@/assets/images/fossology.svg'
import LinkReleaseToProjectModal from '@/components/LinkReleaseToProjectModal/LinkReleaseToProjectModal'
import FossologyClearing from '@/components/sw360/FossologyClearing/FossologyClearing'
import {
    Attachment,
    Embedded,
    ErrorDetails,
    PageableQueryParam,
    PaginationMeta,
    ReleaseLink,
    UserGroupType,
} from '@/object-types'
import DownloadService from '@/services/download.service'
import { ApiError, CommonUtils } from '@/utils'
import ApiUtils from '@/utils/api/authenticatedApi.util'
import { getAuthenticatedUserIdentity } from '@/utils/api/authenticatedUser.util'
import DeleteReleaseModal from './DeleteReleaseModal'

type EmbeddedLinkedReleases = Embedded<ReleaseLink, 'sw360:releaseLinks'>

const Capitalize = (text: string) =>
    text.split('_').reduce((s, c) => s + ' ' + (c.charAt(0) + c.substring(1).toLocaleLowerCase()), '')

interface Props {
    componentId: string
    calledFromModerationRequestDetail?: boolean
}

const ReleaseOverview = ({ componentId, calledFromModerationRequestDetail }: Props): ReactNode => {
    const t = useTranslations('default')
    const [search, setSearch] = useState<{
        searchText: string
        luceneSearch?: boolean
    }>({
        searchText: '',
    })
    const [deletingRelease, setDeletingRelease] = useState('')
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [clearingReleaseId, setClearingReleaseId] = useState<string | undefined>(undefined)
    const [fossologyClearingModelOpen, setFossologyClearingModelOpen] = useState(false)
    const [linkingReleaseId, setLinkingReleaseId] = useState<string | undefined>(undefined)
    const [linkToProjectModalOpen, setLinkToProjectModalOpen] = useState(false)
    const [userIdentity, setUserIdentity] = useState<Awaited<ReturnType<typeof getAuthenticatedUserIdentity>> | null>(
        null,
    )

    useEffect(() => {
        void (async () => {
            try {
                setUserIdentity(await getAuthenticatedUserIdentity())
            } catch {
                setUserIdentity(null)
            }
        })()
    }, [])

    const handleClickDelete = (releaseId: string) => {
        setDeletingRelease(releaseId)
        setDeleteModalOpen(true)
    }

    const [underClearingWarningOpen, setUnderClearingWarningOpen] = useState(false)
    const [pendingFossologyReleaseId, setPendingFossologyReleaseId] = useState<string | undefined>(undefined)

    const handleFossologyClearing = (releaseId: string, clearingState?: string) => {
        if (clearingState === 'UNDER_CLEARING') {
            setPendingFossologyReleaseId(releaseId)
            setUnderClearingWarningOpen(true)
        } else {
            setClearingReleaseId(releaseId)
            setFossologyClearingModelOpen(true)
        }
    }

    const confirmFossologyClearing = () => {
        setUnderClearingWarningOpen(false)
        if (pendingFossologyReleaseId) {
            setClearingReleaseId(pendingFossologyReleaseId)
            setFossologyClearingModelOpen(true)
            setPendingFossologyReleaseId(undefined)
        }
    }

    const handleLinkToProject = (releaseId: string) => {
        setLinkToProjectModalOpen(true)
        setLinkingReleaseId(releaseId)
    }

    const handleClearingReportDownload = async (releaseId: string, attachment: Attachment) => {
        if (!attachment.attachmentContentId) return

        await DownloadService.download(
            `releases/${releaseId}/attachments/${attachment.attachmentContentId}`,
            attachment.filename,
        )
    }

    const buildClearingReportTooltip = (attachment: Attachment): string => {
        const status = attachment.checkStatus
            ? `${attachment.checkStatus}${attachment.checkedBy ? ` by ${attachment.checkedBy}` : ''}${attachment.checkedOn ? ` on ${attachment.checkedOn}` : ''}`
            : ''
        const created = `${attachment.createdBy ?? ''}${attachment.createdOn ? ` on ${attachment.createdOn}` : ''}`

        return [
            `Filename: ${attachment.filename}`,
            `Status: ${status}`,
            `Comment: ${attachment.checkedComment ?? ''}`,
            `Created: ${created}`,
        ].join('\n')
    }

    const renderClearingReportCell = (release: ReleaseLink) => {
        const reports = release.clearingReport?.attachments ?? []

        if (reports.length === 0) {
            const clearingReportStatus = release.clearingReport?.clearingReportStatus
            return <>{clearingReportStatus ? t(clearingReportStatus as never) : t('NO_REPORT')}</>
        }

        return (
            <span className='d-flex flex-wrap gap-1'>
                {reports.map((attachment) => (
                    <OverlayTrigger
                        key={attachment.attachmentContentId ?? attachment.filename}
                        placement='left'
                        overlay={
                            <Tooltip>
                                <span
                                    className='text-start d-inline-block'
                                    style={{
                                        whiteSpace: 'pre-line',
                                    }}
                                >
                                    {buildClearingReportTooltip(attachment)}
                                </span>
                            </Tooltip>
                        }
                    >
                        <span
                            className='btn-icon text-warning'
                            role='button'
                            onClick={() => void handleClearingReportDownload(release.id, attachment)}
                        >
                            <BsDownload size={18} />
                        </span>
                    </OverlayTrigger>
                ))}
            </span>
        )
    }

    const searchFunction = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.currentTarget.value === '') {
            setSearch({
                searchText: '',
            })
        } else {
            setSearch({
                searchText: event.currentTarget.value,
                luceneSearch: true,
            })
        }
    }

    const columns = useMemo<ColumnDef<ReleaseLink>[]>(
        () => [
            {
                id: 'name',
                header: t('Name'),
                accessorKey: 'name',
                enableSorting: true,
                cell: (info) => info.getValue(),
                meta: {
                    width: '18%',
                },
            },
            {
                id: 'version',
                header: t('Version'),
                accessorKey: 'version',
                enableSorting: true,
                cell: ({ row }) => {
                    const { version, id } = row.original
                    return (
                        <Link
                            href={'/components/releases/detail/' + id}
                            className='link'
                        >
                            {version}
                        </Link>
                    )
                },
                meta: {
                    width: '18%',
                },
            },
            {
                id: 'clearingState',
                header: t('Clearing State'),
                accessorKey: 'clearingState',
                enableSorting: true,
                cell: ({ row }) => <>{Capitalize(row.original.clearingState ?? '')}</>,

                meta: {
                    width: '16%',
                },
            },
            {
                id: 'clearingReport',
                header: t('CLEARING_REPORT'),
                enableSorting: false,
                cell: ({ row }) => renderClearingReportCell(row.original),
                meta: {
                    width: '16%',
                },
            },
            {
                id: 'mainlineState',
                header: t('Release Mainline State'),
                accessorKey: 'mainlineState',
                enableSorting: true,
                cell: ({ row }) => <>{Capitalize(row.original.mainlineState ?? '')}</>,
                meta: {
                    width: '16%',
                },
            },
            {
                id: 'actions',
                header: t('Actions'),
                enableSorting: false,
                cell: ({ row }) => {
                    const { id, clearingState } = row.original
                    const isViewer = userIdentity?.userGroup === UserGroupType.VIEWER
                    return (
                        <span className='d-flex justify-content-evenly'>
                            {!isViewer && (
                                <Image
                                    src={fossologyIcon as StaticImport}
                                    width={20}
                                    height={20}
                                    style={{
                                        marginRight: '5px',
                                    }}
                                    alt='Fossology'
                                    onClick={() => handleFossologyClearing(id, clearingState)}
                                />
                            )}
                            {!isViewer && (
                                <OverlayTrigger overlay={<Tooltip>{t('Edit')}</Tooltip>}>
                                    <Link href={`/components/editRelease/${id}`}>
                                        <BsPencil
                                            size={20}
                                            className='btn-icon'
                                        />
                                    </Link>
                                </OverlayTrigger>
                            )}
                            <OverlayTrigger overlay={<Tooltip>{t('Duplicate')}</Tooltip>}>
                                <Link href={`/components/edit/${componentId}/release/add?duplicate=${id}`}>
                                    <BsClipboard
                                        className='btn-icon'
                                        size={20}
                                    />
                                </Link>
                            </OverlayTrigger>
                            {!isViewer && (
                                <OverlayTrigger overlay={<Tooltip>{t('Link Project')}</Tooltip>}>
                                    <BsLink45Deg
                                        className='btn-icon'
                                        size={20}
                                        onClick={() => handleLinkToProject(id)}
                                    />
                                </OverlayTrigger>
                            )}
                            {!isViewer && (
                                <OverlayTrigger overlay={<Tooltip>{t('Merge')}</Tooltip>}>
                                    <Link href={`/components/releases/detail/${id}/merge`}>
                                        <BsGit
                                            size={20}
                                            className='btn-icon'
                                        />
                                    </Link>
                                </OverlayTrigger>
                            )}
                            {!isViewer && (
                                <OverlayTrigger overlay={<Tooltip>{t('Delete')}</Tooltip>}>
                                    <span className='d-inline-block'>
                                        <BsFillTrashFill
                                            className='btn-icon'
                                            size={20}
                                            onClick={() => handleClickDelete(id)}
                                        />
                                    </span>
                                </OverlayTrigger>
                            )}
                        </span>
                    )
                },
                meta: {
                    width: '16%',
                },
            },
        ],
        [
            t,
            userIdentity,
        ],
    )

    const [pageableQueryParam, setPageableQueryParam] = useState<PageableQueryParam>({
        page: 0,
        page_entries: 10,
        sort: 'version,asc',
    })
    const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | undefined>({
        size: 0,
        totalElements: 0,
        totalPages: 0,
        number: 0,
    })
    const [releaseData, setReleaseData] = useState<ReleaseLink[]>(() => [])
    const memoizedData = useMemo(
        () => releaseData,
        [
            releaseData,
        ],
    )
    const [showProcessing, setShowProcessing] = useState(false)

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal

        const timeLimit = releaseData.length !== 0 ? 700 : 0
        const timeout = setTimeout(() => {
            setShowProcessing(true)
        }, timeLimit)

        void (async () => {
            try {
                const queryUrl = CommonUtils.createUrlWithParams(
                    `components/${componentId}/releases`,
                    Object.fromEntries(
                        Object.entries({
                            ...search,
                            ...pageableQueryParam,
                        }).map(([key, value]) => [
                            key,
                            String(value),
                        ]),
                    ),
                )
                const response = await ApiUtils.GET(queryUrl, signal)
                if (response.status !== StatusCodes.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new ApiError(err.message, {
                        status: response.status,
                    })
                }

                const responseText = await response.text()
                if (CommonUtils.isNullEmptyOrUndefinedString(responseText)) {
                    setReleaseData([])
                    setPaginationMeta({
                        size: 0,
                        totalElements: 0,
                        totalPages: 0,
                        number: 0,
                    })
                    return
                }

                const data = JSON.parse(responseText) as EmbeddedLinkedReleases
                setPaginationMeta(data.page)
                setReleaseData(data['_embedded']?.['sw360:releaseLinks'] ?? [])
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return
                }
                ApiUtils.reportError(error)
            } finally {
                clearTimeout(timeout)
                setShowProcessing(false)
            }
        })()

        return () => controller.abort()
    }, [
        componentId,
        pageableQueryParam,
        search,
    ])

    const table = useReactTable({
        data: memoizedData,
        columns,
        getCoreRowModel: getCoreRowModel(),

        // table state config
        state: {
            columnVisibility: {
                actions:
                    !(userIdentity?.userGroup === UserGroupType.SECURITY_USER) ||
                    calledFromModerationRequestDetail === undefined ||
                    calledFromModerationRequestDetail === false,
            },
            pagination: {
                pageIndex: pageableQueryParam.page,
                pageSize: pageableQueryParam.page_entries,
            },
            sorting: pageableQueryParam.sort
                ? [
                      {
                          id: pageableQueryParam.sort.split(',')[0],
                          desc: pageableQueryParam.sort.split(',')[1] === 'desc',
                      },
                  ]
                : [],
        },

        // server side sorting config
        manualSorting: true,
        onSortingChange: (updater) => {
            setPageableQueryParam((prev) => {
                const prevSorting: SortingState = prev.sort
                    ? [
                          {
                              id: prev.sort.split(',')[0],
                              desc: prev.sort.split(',')[1] === 'desc',
                          },
                      ]
                    : []
                const nextSorting = typeof updater === 'function' ? updater(prevSorting) : updater
                if (nextSorting.length > 0) {
                    const { id, desc } = nextSorting[0]
                    return {
                        ...prev,
                        sort: `${id},${desc ? 'desc' : 'asc'}`,
                    }
                }
                return {
                    ...prev,
                    sort: '',
                }
            })
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

    return (
        <>
            <div className='mb-3'>
                <div className='d-flex justify-content-between'>
                    <PageSizeSelector
                        pageableQueryParam={pageableQueryParam}
                        setPageableQueryParam={setPageableQueryParam}
                        totalElements={paginationMeta?.totalElements}
                    />
                    <TableSearch searchFunction={searchFunction} />
                </div>
                <SW360Table
                    table={table}
                    showProcessing={showProcessing}
                />
                {paginationMeta && (
                    <TableFooter
                        pageableQueryParam={pageableQueryParam}
                        setPageableQueryParam={setPageableQueryParam}
                        paginationMeta={paginationMeta}
                    />
                )}
            </div>
            <DeleteReleaseModal
                releaseId={deletingRelease}
                show={deleteModalOpen}
                setShow={setDeleteModalOpen}
            />
            {!CommonUtils.isNullOrUndefined(clearingReleaseId) && (
                <FossologyClearing
                    show={fossologyClearingModelOpen}
                    setShow={setFossologyClearingModelOpen}
                    releaseId={clearingReleaseId}
                />
            )}
            {!CommonUtils.isNullOrUndefined(linkingReleaseId) && (
                <LinkReleaseToProjectModal
                    show={linkToProjectModalOpen}
                    setShow={setLinkToProjectModalOpen}
                    releaseId={linkingReleaseId}
                />
            )}
            <Modal
                show={underClearingWarningOpen}
                onHide={() => setUnderClearingWarningOpen(false)}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>{t('Release Under Clearing')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        {t('The clearing state of this release is currently')} <b>{t('UNDER_CLEARING')}</b>
                        {', '}
                        {t('which means someone is already working on it')}.{' '}
                        {t('Do you still want to trigger the FOSSology process')}?
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant='secondary'
                        onClick={() => setUnderClearingWarningOpen(false)}
                    >
                        {t('Cancel')}
                    </Button>
                    <Button
                        variant='primary'
                        onClick={confirmFossologyClearing}
                    >
                        {t('Proceed')}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

export default ReleaseOverview
