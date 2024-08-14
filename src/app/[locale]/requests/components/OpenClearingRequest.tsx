// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { Table, _ } from "next-sw360"
import { useTranslations } from 'next-intl'
import { ApiUtils } from '@/utils/index'
import { Embedded, HttpStatus } from '@/object-types'
import { getSession, signOut, useSession } from 'next-auth/react'
import { notFound } from 'next/navigation'
import { ClearingRequest } from '@/object-types'
import { Button, OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap'
import { FaPencilAlt } from 'react-icons/fa'

type EmbeddedClearingRequest = Embedded<ClearingRequest, 'sw360:clearingRequests'>

interface ClearingRequestDataMap {
    [key: string]: string;
}

interface LicenseClearingData {
    'Release Count': number
    'Approved Count': number
}

interface LicenseClearing {
    isProjectDeleted?: boolean,
    projectId?: string,
    clearingProgress?: boolean,
    openReleases?: boolean
}

interface ProjectData {
    isProjectDeleted?: boolean,
    projectId?: string,
    projectName?: string
}

function LicenseClearing(licenseClearing: LicenseClearing) {
    const [lcData, setLcData] = useState<LicenseClearingData | null>(null)
    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal

        ;(async () => {
            try {
                const session = await getSession()
                if (!session) {
                    return signOut()
                }

                    const response = await ApiUtils.GET(
                        `projects/${licenseClearing.projectId}/licenseClearingCount`,
                        session.user.access_token,
                        signal
                    )
                    if (response.status === HttpStatus.UNAUTHORIZED) {
                        return signOut()
                } else if (response.status !== HttpStatus.OK) {
                        return notFound()
                    }

                    const data = await response.json()

                    setLcData(data)
            } catch (e) {
                console.error(e)
            }
        })()

        return () => controller.abort()
    }, [licenseClearing.projectId])

    return (
        <>
            { lcData ? (
                <>
                    {
                        licenseClearing.openReleases && lcData['Release Count']? (
                            <div className='text-center'>
                                {`${lcData['Release Count']}`}
                            </div>
                        ) : null
                    }
                    {
                        licenseClearing.clearingProgress ? (
                            <div className='text-center'>
                                {`${lcData['Approved Count']}/${lcData['Release Count']}`}
                            </div>
                        ) : null
                    }
                </>
            ):(
                <div className='col-12 text-center'>
                    <Spinner className='spinner' />
                </div>
            )}
        </>        
    )
}

function OpenClearingRequest() {

    const t = useTranslations('default')
    const [loading, setLoading] = useState(true)
    const { data: session, status } = useSession()
    const [isProjectDeleted, setIsProjectDeleted] = useState(false)
    const [tableData, setTableData] = useState<Array<any>>([])
    const clearingRequestType : ClearingRequestDataMap = {
        DEEP: t('Deep'),
        HIGH: t('High')
    };

    const fetchData = useCallback(
        async (url: string) => {
            const response = await ApiUtils.GET(url, session.user.access_token)
            if (response.status == HttpStatus.OK) {
                const data = await response.json() as EmbeddedClearingRequest
                return data
            } else if (response.status == HttpStatus.UNAUTHORIZED) {
                return signOut()
            } else {
                notFound()
            }
        },[session]
    )

    useEffect(() => {
        setLoading(true)
        void fetchData('clearingrequests').then((clearingRequests: EmbeddedClearingRequest) => {
            const filteredClearingRequests = clearingRequests['_embedded']['sw360:clearingRequests']
                                                                .filter((item: ClearingRequest) => {
                return item.clearingState != 'REJECTED' && item.clearingState != 'CLOSED';
            });
            setTableData(
                filteredClearingRequests.map((item: ClearingRequest) => {
                    if (!Object.hasOwn(item, 'projectId')){
                        setIsProjectDeleted(true)
                    }
                    return [
                                {
                                    requestId: item.id
                                },
                                item.projectBU ?? t('Not Available'),
                                isProjectDeleted ? {
                                    isProjectDeleted: true
                                    } : {
                                    isProjectDeleted: false,
                                    projectId: item.projectId ?? '',
                                    projectName: item.projectName ?? ''
                                },
                                isProjectDeleted ? {
                                    isProjectDeleted: true
                                    } : { 
                                        isProjectDeleted: false,
                                        projectId: item.projectId ?? '',
                                        openReleases: true
                                    },
                                item.clearingState ?? '', 
                                item.priority ?? '',
                                item.requestingUser ?? '',
                                isProjectDeleted ? {
                                    isProjectDeleted: true
                                    } : { 
                                        isProjectDeleted: false,
                                        projectId: item.projectId ?? '',
                                        clearingProgress: true
                                    },
                                item.createdOn ?? '',
                                item.requestedClearingDate ?? '',
                                item.agreedClearingDate ?? '',
                                clearingRequestType[item.clearingType] ?? '',
                                {
                                    requestId: item.id
                                },
                            ]
                })
            )
            setLoading(false)
        })}, [fetchData, session])

    const columns = [
        {
            id: 'openClearingRequest.requestId',
            name: t('Request ID'),
            sort: true,
            formatter: ({ requestId }: { requestId: string; }) =>
                _(
                    <>
                        <Link href={`/requests/clearingRequest/detail/${requestId}`}
                              className='text-link'>
                            {requestId}
                        </Link>
                    </>
                ),
        },
        {
            id: 'openClearingRequest.baBlGroup',
            name: t('BA-BL/Group'),
            sort: true,
        },
        {
            id: 'openClearingRequest.project',
            name: t('Project'),
            sort: true,
            formatter: (projectData: ProjectData) =>
                _(
                    projectData.isProjectDeleted ? t('Project Deleted') :
                    <>
                        <Link href={`/projects/detail/${projectData.projectId}`}
                              className='text-link'>
                            {projectData.projectName}
                        </Link>
                    </>
                ),
        },
        {
            id: 'openClearingRequest.openReleases',
            name: t('Open Releases'),
            sort: true,
            formatter: (licenseClearing: LicenseClearing) => 
                _(  
                    licenseClearing.isProjectDeleted ? t('Not Available') :
                    <LicenseClearing projectId={licenseClearing.projectId}
                                     openReleases={licenseClearing.openReleases}
                    />
                ),
        },
        {
            id: 'openClearingRequest.status',
            name: t('Status'),
            sort: true,
            formatter: (status: string) => 
                _(  
                    <>
                        {status === 'NEW' && (
                            <OverlayTrigger overlay={
                                <Tooltip>
                                    {t('CR New')}
                                </Tooltip>
                            }>
                            <span className='d-inline-block'>
                                {t(`${status}`)}
                            </span>
                            </OverlayTrigger>
                        )}
                        {status === 'IN_PROGRESS' && (
                            <OverlayTrigger overlay={
                                <Tooltip>
                                    {t('CR In Progress')}
                                </Tooltip>
                            }>
                            <span className='d-inline-block'>
                                {t(`${status}`)}
                            </span>
                            </OverlayTrigger>
                        )}
                        {status === 'ACCEPTED' && (
                            <OverlayTrigger overlay={
                                <Tooltip>
                                    {t('CR Accepted')}
                                </Tooltip>
                            }>
                            <span className='d-inline-block'>
                                {t(`${status}`)}
                            </span>
                            </OverlayTrigger>
                        )}
                        {status === 'SANITY_CHECK' && (
                            <OverlayTrigger overlay={
                                <Tooltip>
                                    {t('CR Sanity Check')}
                                </Tooltip>
                            }>
                            <span className='d-inline-block'>
                                {t(`${status}`)}
                            </span>
                            </OverlayTrigger>
                        )}
                        {status === 'IN_QUEUE' && (
                            <OverlayTrigger overlay={
                                <Tooltip>
                                    {t('CR In Queue')}
                                </Tooltip>
                            }>
                            <span className='d-inline-block'>
                                {t(`${status}`)}
                            </span>
                            </OverlayTrigger>
                        )}
                        {status === 'AWAITING_RESPONSE' && (
                            <OverlayTrigger overlay={
                                <Tooltip>
                                    {t('CR Awaiting Response')}
                                </Tooltip>
                            }>
                            <span className='d-inline-block'>
                                {t(`${status}`)}
                            </span>
                            </OverlayTrigger>
                        )}
                        {status === 'ON_HOLD' && (
                            <OverlayTrigger overlay={
                                <Tooltip>
                                    {t('CR On Hold')}
                                </Tooltip>
                            }>
                            <span className='d-inline-block'>
                                {t(`${status}`)}
                            </span>
                            </OverlayTrigger>
                        )}
                        {status === 'PENDING_INPUT' && (
                            <OverlayTrigger overlay={
                                <Tooltip>
                                    {t('CR Pending Input')}
                                </Tooltip>
                            }>
                            <span className='d-inline-block'>
                                {t(`${status}`)}
                            </span>
                            </OverlayTrigger>
                        )}
                    </>
                ),
        },
        {
            id: 'openClearingRequest.priority',
            name: t('Priority'),
            sort: true,
            formatter: (priority: string) =>
                _(
                    <>
                        {priority && priority === 'LOW' && (
                            <>
                                <div className='text-success'>
                                    <OverlayTrigger overlay={
                                        <Tooltip>
                                            {t('CR Priority Low')}
                                        </Tooltip>
                                    }>
                                        <span className='d-inline-block'>
                                            <b>{t(`${priority}`)}</b>
                                        </span>
                                    </OverlayTrigger>
                                </div>
                            </>
                        )}
                        {priority && priority === 'MEDIUM' && (
                            <>
                                <div className='text-primary'>
                                    <OverlayTrigger overlay={
                                        <Tooltip>
                                            {t('CR Priority Medium')}
                                        </Tooltip>
                                    }>
                                        <span className='d-inline-block'>
                                            <b>{t(`${priority}`)}</b>
                                        </span>
                                    </OverlayTrigger>
                                </div>
                            </>
                        )}
                        {priority && priority === 'HIGH' && (
                            <>
                                <div className='text-warning'>
                                    <OverlayTrigger overlay={
                                        <Tooltip>
                                            {t('CR Priority High')}
                                        </Tooltip>
                                    }>
                                        <span className='d-inline-block'>
                                            <b>{t(`${priority}`)}</b>
                                        </span>
                                    </OverlayTrigger>
                                </div>
                            </>
                        )}
                        {priority && priority === 'CRITICAL' && (
                            <>
                                <div className='text-danger'>
                                    <OverlayTrigger overlay={
                                        <Tooltip>
                                            {t('CR Priority Critical')}
                                        </Tooltip>
                                    }>
                                        <span className='d-inline-block'>
                                            <b>{t(`${priority}`)}</b>
                                        </span>
                                    </OverlayTrigger>
                                </div>
                            </>
                        )}
                    </>
                ),
        },
        {
            id: 'openClearingRequest.requestingUser',
            name: t('Requesting User'),
            sort: true,
        },
        {
            id: 'openClearingRequest.clearingProgress',
            name: t('Clearing Progress'),
            sort: true,
            formatter: (licenseClearing: LicenseClearing) => 
                _(  
                    licenseClearing.isProjectDeleted ? t('Not Available') :
                    <LicenseClearing projectId={licenseClearing.projectId}
                                     clearingProgress={licenseClearing.clearingProgress}
                    />
                ),
        },
        {
            id: 'openClearingRequest.createdOn',
            name: t('Created On'),
            sort: true,
        },
        {
            id: 'openClearingRequest.preferredClearingDate',
            name: t('Preferred Clearing Date'),
            sort: true,
        },
        {
            id: 'openClearingRequest.agreedClearingDate',
            name: t('Agreed Clearing Date'),
            sort: true,
        },
        {
            id: 'openClearingRequest.clearingType',
            name: t('Clearing Type'),
            sort: true,
        },
        {
            id: 'openClearingRequest.actions',
            name: t('Actions'),
            sort: true,
            formatter: ({ requestId }: { requestId: string }) => 
                _(
                    <>
                        <OverlayTrigger overlay={
                            <Tooltip>
                                {t('Edit')}
                            </Tooltip>}>
                            <Button className='btn-transparent'
                                    hidden={isProjectDeleted}>
                                <Link href={`/requests/clearingRequest/edit/${requestId}`}
                                    className='overlay-trigger'>
                                    <FaPencilAlt className='btn-icon'/>
                                </Link>
                            </Button>
                        </OverlayTrigger>
                    </>
                )
        }
    ]

    if (status === 'unauthenticated') {
        signOut()
    } else {
    return (
        <>
            <div className='row mb-4'>
                <div className='col-12 d-flex justify-content-center align-items-center'>
                    {loading == false ? (
                        <div style={{ paddingLeft: '0px' }}>
                            <Table columns={columns}
                                   data={tableData}
                                   sort={false}
                                   selector={true} />
                        </div>
                        ) : (
                                <Spinner className='spinner' />
                        )
                    }
                </div>
            </div>
        </>
    )}
}

export default OpenClearingRequest
