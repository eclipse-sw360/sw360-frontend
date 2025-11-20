// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ColumnDef, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table'
import { StatusCodes } from 'http-status-codes'
import { StaticImport } from 'next/dist/shared/lib/get-img-props'
import Image from 'next/image'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { ClientSidePageSizeSelector, ClientSideTableFooter, SW360Table } from 'next-sw360'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import { OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap'
import { FaClipboard, FaPencilAlt } from 'react-icons/fa'
import { HiOutlineLink } from 'react-icons/hi'
import { IoMdGitMerge } from 'react-icons/io'
import { MdDeleteOutline } from 'react-icons/md'
import fossologyIcon from '@/assets/images/fossology.svg'
import LinkReleaseToProjectModal from '@/components/LinkReleaseToProjectModal/LinkReleaseToProjectModal'
import FossologyClearing from '@/components/sw360/FossologyClearing/FossologyClearing'
import { Embedded, ErrorDetails, ReleaseLink, UserGroupType } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'
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
    const [deletingRelease, setDeletingRelease] = useState('')
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [clearingReleaseId, setClearingReleaseId] = useState<string | undefined>(undefined)
    const [fossologyClearingModelOpen, setFossologyClearingModelOpen] = useState(false)
    const [linkingReleaseId, setLinkingReleaseId] = useState<string | undefined>(undefined)
    const [linkToProjectModalOpen, setLinkToProjectModalOpen] = useState(false)
    const session = useSession()

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            void signOut()
        }
    }, [
        session,
    ])

    const handleClickDelete = (releaseId: string) => {
        setDeletingRelease(releaseId)
        setDeleteModalOpen(true)
    }

    const handleFossologyClearing = (releaseId: string) => {
        setClearingReleaseId(releaseId)
        setFossologyClearingModelOpen(true)
    }

    const handleLinkToProject = (releaseId: string) => {
        setLinkToProjectModalOpen(true)
        setLinkingReleaseId(releaseId)
    }

    const columns = useMemo<ColumnDef<ReleaseLink>[]>(
        () => [
            {
                id: 'name',
                header: t('Name'),
                accessorKey: 'name',
                enableSorting: false,
                cell: (info) => info.getValue(),
                meta: {
                    width: '20%',
                },
            },
            {
                id: 'version',
                header: t('Version'),
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
                    width: '20%',
                },
            },
            {
                id: 'clearingState',
                header: t('Clearing State'),
                cell: ({ row }) => <>{Capitalize(row.original.clearingState ?? '')}</>,
                meta: {
                    width: '20%',
                },
            },
            {
                id: 'mainlineState',
                header: t('Release Mainline State'),
                accessorKey: 'mainlineState',
                enableSorting: false,
                cell: ({ row }) => <>{Capitalize(row.original.mainlineState ?? '')}</>,
                meta: {
                    width: '20%',
                },
            },
            {
                id: 'actions',
                header: t('Actions'),
                enableSorting: false,
                cell: ({ row }) => {
                    const { id } = row.original
                    return (
                        <span className='d-flex justify-content-evenly'>
                            <Image
                                src={fossologyIcon as StaticImport}
                                width={20}
                                height={20}
                                style={{
                                    marginRight: '5px',
                                }}
                                alt='Fossology'
                                onClick={() => handleFossologyClearing(id)}
                            />
                            <OverlayTrigger overlay={<Tooltip>{t('Edit')}</Tooltip>}>
                                <Link href={`/components/editRelease/${id}`}>
                                    <FaPencilAlt
                                        size={16}
                                        className='btn-icon'
                                    />
                                </Link>
                            </OverlayTrigger>
                            <OverlayTrigger overlay={<Tooltip>{t('Duplicate')}</Tooltip>}>
                                <FaClipboard
                                    className='btn-icon'
                                    size={18}
                                />
                            </OverlayTrigger>
                            <OverlayTrigger overlay={<Tooltip>{t('Link Project')}</Tooltip>}>
                                <HiOutlineLink
                                    className='btn-icon'
                                    size={18}
                                    onClick={() => handleLinkToProject(id)}
                                />
                            </OverlayTrigger>
                            <OverlayTrigger overlay={<Tooltip>{t('Merge')}</Tooltip>}>
                                <IoMdGitMerge
                                    size={18}
                                    className='btn-icon'
                                />
                            </OverlayTrigger>
                            <OverlayTrigger overlay={<Tooltip>{t('Delete')}</Tooltip>}>
                                <span className='d-inline-block'>
                                    <MdDeleteOutline
                                        className='btn-icon'
                                        size={20}
                                        onClick={() => handleClickDelete(id)}
                                    />
                                </span>
                            </OverlayTrigger>
                        </span>
                    )
                },
                meta: {
                    width: '20%',
                },
            },
        ],
        [
            t,
        ],
    )

    const [releaseData, setReleaseData] = useState<ReleaseLink[]>(() => [])
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
                const response = await ApiUtils.GET(
                    `components/${componentId}/releases`,
                    session.data.user.access_token,
                    signal,
                )
                if (response.status !== StatusCodes.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new Error(err.message)
                }

                const data = (await response.json()) as EmbeddedLinkedReleases
                setReleaseData(
                    CommonUtils.isNullOrUndefined(data['_embedded']['sw360:releaseLinks'])
                        ? []
                        : data['_embedded']['sw360:releaseLinks'],
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
        componentId,
    ])

    const table = useReactTable({
        data: memoizedData,
        columns,
        getCoreRowModel: getCoreRowModel(),

        // table state config
        state: {
            columnVisibility: {
                actions:
                    !(session?.data?.user?.userGroup === UserGroupType.SECURITY_USER) ||
                    calledFromModerationRequestDetail === undefined ||
                    calledFromModerationRequestDetail === false,
            },
        },

        // client side pagination
        getPaginationRowModel: getPaginationRowModel(),

        meta: {
            rowHeightConstant: true,
        },
    })

    return (
        <>
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
        </>
    )
}

export default ReleaseOverview
