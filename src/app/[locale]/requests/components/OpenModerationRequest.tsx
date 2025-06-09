// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { Embedded, HttpStatus, ModerationRequest } from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils/index'
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Table, _ } from 'next-sw360'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ReactNode, useCallback, useEffect, useState } from 'react'
import { Spinner } from 'react-bootstrap'
import BulkDeclineModerationRequestModal from './BulkDeclineModerationRequestModal'
import ExpandingModeratorCell from './ExpandingModeratorCell'

type EmbeddedModerationRequest = Embedded<ModerationRequest, 'sw360:moderationRequests'>
interface ModerationRequestMap {
    [key: string]: string
}

function OpenModerationRequest(): ReactNode {
    const t = useTranslations('default')
    const [loading, setLoading] = useState(true)
    const { data: session, status } = useSession()
    const [mrIdArray, setMrIdArray] = useState<Array<string>>([])
    const [tableData, setTableData] = useState<(object | string | string[])[][]>([])
    const [disableBulkDecline, setDisableBulkDecline] = useState(true)
    const [bulkDeclineMRModal, setBulkDeclineMRModal] = useState(false)
    const [mrIdNameMap, setMrIdNameMap] = useState<{ [key: string]: string }>({})
    const moderationRequestStatus: ModerationRequestMap = {
        INPROGRESS: t('In Progress'),
        APPROVED: t('APPROVED'),
        PENDING: t('Pending'),
        REJECTED: t('REJECTED'),
    }

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

    const fetchData = useCallback(
        async (url: string) => {
            const session = await getSession()
            if (CommonUtils.isNullOrUndefined(session)) return signOut()
            const response = await ApiUtils.GET(url, session.user.access_token)
            if (response.status == HttpStatus.OK) {
                const data = (await response.json()) as EmbeddedModerationRequest
                return data
            } else if (response.status == HttpStatus.UNAUTHORIZED) {
                return
            } else {
                notFound()
            }
        },
        [session],
    )

    useEffect(() => {
        if (status !== 'authenticated') return
        setLoading(true)
        void fetchData('moderationrequest').then((moderationRequests: EmbeddedModerationRequest | undefined) => {
            const filteredModerationRequests = moderationRequests?._embedded['sw360:moderationRequests'].filter(
                (item: ModerationRequest) => {
                    return item.moderationState === 'PENDING' || item.moderationState === 'INPROGRESS'
                },
            )
            if (filteredModerationRequests !== undefined) {
                setTableData(
                    filteredModerationRequests.map((item: ModerationRequest) => {
                        return [
                            formatDate(item.timestamp) ?? '',
                            item.documentType ?? '',
                            {
                                id: item.id,
                                documentName: item.documentName,
                            },
                            item.requestingUser ?? '',
                            item.requestingUserDepartment ?? '',
                            item.moderators ?? [],
                            item.moderationState !== undefined ? moderationRequestStatus[item.moderationState] : '',
                            {
                                moderationRequestId: item.id,
                                documentName: item.documentName,
                            },
                        ]
                    }),
                )
            }
            setLoading(false)
        })
    }, [fetchData, session])

    const handleCheckboxes = (moderationRequestId: string, documentName: string) => {
        const updatedMrIdArray: string[] = [...mrIdArray]
        const mrMap = { ...mrIdNameMap }
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

    const columns = [
        {
            id: 'openModerationRequest.date',
            name: t('Date'),
            width: 'auto',
            sort: true,
        },
        {
            id: 'openModerationRequest.type',
            name: t('Type'),
            width: 'auto',
            sort: true,
        },
        {
            id: 'openModerationRequest.documentName',
            name: t('Document Name'),
            width: 'auto',
            sort: true,
            formatter: ({ id, documentName }: { id: string; documentName: string }) =>
                _(
                    <>
                        <Link href={`/requests/moderationRequest/${id}`}>{documentName}</Link>
                    </>,
                ),
        },
        {
            id: 'openModerationRequest.requestingUser',
            name: t('Requesting User'),
            width: 'auto',
            formatter: (email: string) =>
                _(
                    <>
                        <Link
                            href={`mailto:${email}`}
                            className='text-link'
                        >
                            {email}
                        </Link>
                    </>,
                ),
            sort: true,
        },
        {
            id: 'openModerationRequest.department',
            name: t('Department'),
            width: 'auto',
            sort: true,
        },
        {
            id: 'openModerationRequest.moderators',
            name: t('Moderators'),
            width: 'auto',
            formatter: (moderators: string[]) => _(<ExpandingModeratorCell moderators={moderators} />),
            sort: true,
        },
        {
            id: 'openModerationRequest.state',
            name: t('State'),
            sort: true,
        },
        {
            id: 'openModerationRequest.actions',
            name: t('Actions'),
            width: 'auto',
            formatter: ({ moderationRequestId, documentName }: { moderationRequestId: string; documentName: string }) =>
                _(
                    <div className='form-check'>
                        <input
                            className='form-check-input'
                            type='checkbox'
                            name='moderationRequestId'
                            value={moderationRequestId}
                            id={moderationRequestId}
                            checked={mrIdArray.includes(moderationRequestId)}
                            onChange={() => handleCheckboxes(moderationRequestId, documentName)}
                        />
                    </div>,
                ),
        },
    ]

    if (status === 'unauthenticated') {
        void signOut()
    } else {
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
                    <div className='col-12 d-flex justify-content-center align-items-center'>
                        {loading == false ? (
                            <div style={{ paddingLeft: '0px' }}>
                                <Table
                                    columns={columns}
                                    data={tableData}
                                    sort={false}
                                    selector={true}
                                />
                            </div>
                        ) : (
                            <Spinner className='spinner' />
                        )}
                    </div>
                </div>
            </>
        )
    }
}

export default OpenModerationRequest
