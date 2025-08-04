// Copyright (C) TOSHIBA CORPORATION, 2025. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2025. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { Embedded, Obligation } from '@/object-types'
import { CommonUtils } from '@/utils'
import { SW360_API_URL } from '@/utils/env'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { PageButtonHeader, QuickFilter, Table, _ } from 'next-sw360'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { ReactNode, useEffect, useState } from 'react'
import { OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap'
import { FaClipboard, FaPencilAlt, FaTrashAlt } from 'react-icons/fa'
import { MdOutlineTask } from 'react-icons/md'
import { ObligationLevelInfo, ObligationLevels } from '../../../../../object-types/Obligation'
import DeleteObligationDialog from './DeleteObligationDialog'

function Obligations(): ReactNode {
    const params = useSearchParams()
    const searchParams = Object.fromEntries(params)
    const t = useTranslations('default')
    const [search, setSearch] = useState({})
    const [obligationCount, setObligationCount] = useState(0)
    const { data: session, status } = useSession()
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [deletedObligationId, setDeletedObligationId] = useState('')
    const router = useRouter()

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [status])

    const openDeleteDialog = (obligationId: string | undefined) => {
        if (obligationId !== undefined) {
            setDeletedObligationId(obligationId)
            setShowDeleteDialog(true)
        }
    }

    const extractObligationId = (obligation: Obligation): string | undefined => {
        if (!obligation._links) return undefined
        const href = obligation._links.self.href
        const match = href.match(/\/([^/]+)$/)
        return match ? match[1] : undefined
    }

    const headerButtons = {
        'Add Obligation': { type: 'primary', link: '/admin/obligations/add', name: t('Add Obligation') },
    }

    const server = {
        url: CommonUtils.createUrlWithParams(`${SW360_API_URL}/resource/api/obligations`, searchParams),
        then: (data: Embedded<Obligation, 'sw360:obligations'>) => {
            const obligations = data._embedded['sw360:obligations']
            setObligationCount(data.page ? data.page.totalElements : 0)
            return obligations.length > 0
                ? obligations.map((item: Obligation) => [
                      item.title,
                      item.text,
                      item.obligationLevel !== undefined && item.obligationLevel in ObligationLevels
                          ? ObligationLevels[item.obligationLevel as keyof typeof ObligationLevels]
                          : '',
                      item,
                  ])
                : []
        },
        total: (data: Embedded<Obligation, 'sw360:obgligations'>) => (data.page ? data.page.totalElements : 0),
        headers: { Authorization: `${status === 'authenticated' ? session.user.access_token : ''}` },
    }

    const columns = [
        {
            name: t('Title'),
            sort: true,
        },
        {
            name: t('Text'),
            width: '35%',
            sort: true,
            formatter: (text: string) => {
                return _(
                    <div
                        style={{
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            maxWidth: '100%',
                        }}
                    >
                        {text}
                    </div>,
                )
            },
        },
        {
            name: t('Obligation Level'),
            width: '30%',
            formatter: (obligationLevel: string) => {
                return _(
                    <OverlayTrigger
                        overlay={
                            <Tooltip id={`tooltip-${obligationLevel}`}>
                                {ObligationLevelInfo[obligationLevel as keyof typeof ObligationLevelInfo]
                                    ? ObligationLevelInfo[obligationLevel as keyof typeof ObligationLevelInfo]
                                    : 'No description available.'}
                            </Tooltip>
                        }
                        placement='top'
                    >
                        <span>{obligationLevel}</span>
                    </OverlayTrigger>,
                )
            },
            sort: true,
        },
        {
            name: t('Actions'),
            width: '13%',
            formatter: (item: Obligation) =>
                _(
                    <>
                        <span className='d-flex justify-content-evenly'>
                            <OverlayTrigger overlay={<Tooltip>{t('Edit')}</Tooltip>}>
                                <span className='d-inline-block btn-overlay cursor-pointer'>
                                    <FaPencilAlt
                                        onClick={() => {
                                            router.push(`obligations/edit/detail?id=${extractObligationId(item)}`)
                                        }}
                                        className='btn-icon'
                                    />
                                </span>
                            </OverlayTrigger>
                            <OverlayTrigger overlay={<Tooltip>{t('Change Log')}</Tooltip>}>
                                <span
                                    className='d-inline-block btn-overlay cursor-pointer'
                                    onClick={() =>
                                        router.push(
                                            `obligations/changelog/${item._links?.self.href.split('/').at(-1) ?? ''}`,
                                        )
                                    }
                                >
                                    {item.id}
                                    <MdOutlineTask className='btn-icon overlay-trigger' />
                                </span>
                            </OverlayTrigger>

                            <OverlayTrigger overlay={<Tooltip>{t('Duplicate')}</Tooltip>}>
                                <span className='d-inline-block btn-overlay cursor-pointer'>
                                    <FaClipboard
                                        className='btn-icon'
                                        onClick={() => {
                                            router.push(`obligations/duplicate/detail?id=${extractObligationId(item)}`)
                                        }}
                                    />
                                </span>
                            </OverlayTrigger>

                            <OverlayTrigger overlay={<Tooltip>{t('Delete')}</Tooltip>}>
                                <span className='d-inline-block btn-overlay cursor-pointer'>
                                    <FaTrashAlt
                                        className='btn-icon'
                                        onClick={() => {
                                            openDeleteDialog(extractObligationId(item))
                                        }}
                                        style={{ color: 'gray', fontSize: '18px' }}
                                    />
                                </span>
                            </OverlayTrigger>
                        </span>
                    </>,
                ),
            sort: true,
        },
    ]

    const doSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
        setSearch({ keyword: event.currentTarget.value })
    }

    return (
        <div className='container page-content'>
            <DeleteObligationDialog
                obligationId={deletedObligationId}
                show={showDeleteDialog}
                setShow={setShowDeleteDialog}
            />
            <div className='row'>
                <div className='col-2 sidebar'>
                    <QuickFilter
                        id='obligationsFilter'
                        title={t('Quick Filter')}
                        searchFunction={doSearch}
                    />
                </div>
                <div className='col col-10'>
                    <div className='col'>
                        <div className='row'>
                            <PageButtonHeader
                                buttons={headerButtons}
                                title={`${t('Obligations')} (${obligationCount})`}
                            />
                            {status === 'authenticated' ? (
                                <Table
                                    server={server}
                                    columns={columns}
                                    search={search}
                                    selector={true}
                                />
                            ) : (
                                <div className='col-12 d-flex justify-content-center align-items-center'>
                                    <Spinner className='spinner' />
                                </div>
                            )}

                            <div className='row mt-2'></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Obligations
