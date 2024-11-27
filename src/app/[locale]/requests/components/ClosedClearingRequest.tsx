// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ClearingRequest, Embedded, HttpStatus } from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils/index'
import { getSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Table, _ } from 'next-sw360'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { Button, OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap'
import { FaPencilAlt } from 'react-icons/fa'

type EmbeddedClearingRequest = Embedded<ClearingRequest, 'sw360:clearingRequests'>

interface ProjectData {
    isProjectDeleted?: boolean
    projectId?: string
    projectName?: string
}

function ClosedClearingRequest() {
    const t = useTranslations('default')
    const [loading, setLoading] = useState(true)
    const [tableData, setTableData] = useState<Array<any>>([])
    const [isProjectDeleted, setIsProjectDeleted] = useState(false)

    const columns = [
        {
            id: 'closedClearingRequest.requestId',
            name: t('Request ID'),
            sort: true,
            formatter: ({ requestId }: { requestId: string }) =>
                _(
                    <Link
                        href={`/requests/clearingRequest/detail/${requestId}`}
                        className='text-link'
                    >
                        {requestId}
                    </Link>,
                ),
        },
        {
            id: 'closedClearingRequest.baBlGroup',
            name: t('BA-BL/Group'),
            sort: true,
        },
        {
            id: 'closedClearingRequest.project',
            name: t('Project'),
            sort: true,
            formatter: (projectData: ProjectData) =>
                _(
                    projectData.isProjectDeleted ?? false ? (
                        t('Project Deleted')
                    ) : (
                        <Link
                            href={`/projects/detail/${projectData.projectId}`}
                            className='text-link'
                        >
                            {projectData.projectName}
                        </Link>
                    ),
                ),
        },
        {
            id: 'closedClearingRequest.status',
            name: t('Status'),
            sort: true,
            formatter: (status: string) =>
                _(
                    <>
                        {status === 'CLOSED' && (
                            <OverlayTrigger overlay={<Tooltip>{t('CR Closed')}</Tooltip>}>
                                <span className='d-inline-block'>{t(`${status}`)}</span>
                            </OverlayTrigger>
                        )}
                        {status === 'REJECTED' && (
                            <OverlayTrigger overlay={<Tooltip>{t('CR Rejected')}</Tooltip>}>
                                <span className='d-inline-block'>{t(`${status}`)}</span>
                            </OverlayTrigger>
                        )}
                    </>,
                ),
        },
        {
            id: 'closedClearingRequest.reqestingUser',
            name: t('Requesting User'),
            formatter: (email: string) =>
                _(
                    <Link
                        href={`mailto:${email}`}
                        className='text-link'
                    >
                        {email}
                    </Link>,
                ),
            sort: true,
        },
        {
            id: 'closedClearingRequest.clearingTeam ',
            name: t('Clearing Team'),
            sort: true,
            formatter: (email: string) =>
                _(
                    <Link
                        href={`mailto:${email}`}
                        className='text-link'
                    >
                        {email}
                    </Link>,
                ),
        },
        {
            id: 'closedClearingRequest.createdOn',
            name: t('Created On'),
            sort: true,
        },
        {
            id: 'closedClearingRequest.preferredClearingDate',
            name: t('Preferred Clearing Date'),
            sort: true,
        },
        {
            id: 'closedClearingRequest.agreedClearingDate',
            name: t('Agreed Clearing Date'),
            sort: true,
        },
        {
            id: 'closedClearingRequest.requestClosedOn ',
            name: t('Request Closed On'),
            sort: true,
        },
        {
            id: 'openClearingRequest.clearingType',
            name: t('Clearing Type'),
            sort: true,
            formatter: (clearingType: string) =>
                _(
                    <>
                        {clearingType === 'DEEP' && (
                            <OverlayTrigger overlay={<Tooltip>{t('CR Type Deep')}</Tooltip>}>
                                <span className='d-inline-block'>{t(`${clearingType}`)}</span>
                            </OverlayTrigger>
                        )}
                        {clearingType === 'HIGH' && (
                            <OverlayTrigger overlay={<Tooltip>{t('CR Type High')}</Tooltip>}>
                                <span className='d-inline-block'>{t(`${clearingType}`)}</span>
                            </OverlayTrigger>
                        )}
                    </>,
                ),
        },
        {
            id: 'closedClearingRequest.actions ',
            name: t('Actions'),
            sort: true,
            formatter: ({ requestId }: { requestId: string }) =>
                _(
                    <OverlayTrigger overlay={<Tooltip>{t('Edit')}</Tooltip>}>
                        <Button
                            className='btn-transparent'
                            hidden={isProjectDeleted}
                        >
                            <Link
                                href={`/requests/clearingRequest/detail/${requestId}`}
                                className='overlay-trigger'
                            >
                                <FaPencilAlt className='btn-icon' />
                            </Link>
                        </Button>
                    </OverlayTrigger>,
                ),
        },
    ]

    const fetchData = useCallback(async (url: string) => {
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) return signOut()
        const response = await ApiUtils.GET(url, session.user.access_token)
        if (response.status == HttpStatus.OK) {
            const data = (await response.json()) as EmbeddedClearingRequest
            return data
        } else if (response.status == HttpStatus.UNAUTHORIZED) {
            return signOut()
        } else {
            notFound()
        }
    }, [])

    useEffect(() => {
        setLoading(true)
        void fetchData('clearingrequests').then((clearingRequests: EmbeddedClearingRequest | undefined) => {
            const filteredClearingRequests = clearingRequests?._embedded['sw360:clearingRequests'].filter(
                (item: ClearingRequest) => {
                    return item.clearingState === 'REJECTED' || item.clearingState === 'CLOSED'
                },
            )
            if (filteredClearingRequests !== undefined) {
                setTableData(
                    filteredClearingRequests.map((item: ClearingRequest) => {
                        if (!Object.hasOwn(item, 'projectId')) {
                            setIsProjectDeleted(true)
                        }
                        return [
                            {
                                requestId: item.id,
                            },
                            item.projectBU ?? t('Not Available'),
                            isProjectDeleted
                                ? {
                                      isProjectDeleted: true,
                                  }
                                : {
                                      isProjectDeleted: false,
                                      projectId: item.projectId ?? '',
                                      projectName: item.projectName ?? '',
                                  },
                            item.clearingState ?? '',
                            item.requestingUser ?? '',
                            item.clearingTeam ?? '',
                            item.createdOn ?? '',
                            item.requestedClearingDate ?? '',
                            item.agreedClearingDate ?? '',
                            item.requestClosedOn ?? '',
                            item.clearingType ?? '',
                            {
                                requestId: item.id,
                            },
                        ]
                    }),
                )
            }
            setLoading(false)
        })
    }, [fetchData])

    if (status === 'unauthenticated') {
        signOut()
    } else {
        return (
            <div className='row mb-4'>
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
        )
    }
}

export default ClosedClearingRequest
