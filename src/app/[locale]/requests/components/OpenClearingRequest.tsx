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
import { Spinner } from 'react-bootstrap'

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
    const [tableData, setTableData] = useState<Array<any>>([])
    const clearingRequestStatus : ClearingRequestDataMap = {
        NEW: t('New'),
        IN_PROGRESS: t('In Progress'),
        ACCEPTED: t('ACCEPTED'),
        PENDING_INPUT: t('Pending Input'),
        REJECTED: t('REJECTED'),
        IN_QUEUE: t('In Queue'),
        CLOSED: t('Closed'),
        AWAITING_RESPONSE: t('Awaiting Response'),
        ON_HOLD: t('On Hold'),
        SANITY_CHECK: t('Sanity Check')
    };

    const clearingRequestPriority : ClearingRequestDataMap = {
        LOW: t('Low'),
        MEDIUM: t('Medium'),
        HIGH: t('High'),
        CRITICAL: t('Critical')
    };
    
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
                    let isProjectDeleted : boolean = false
                    if (!Object.hasOwn(item, 'projectId')){
                        isProjectDeleted = true
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
                                clearingRequestStatus[item.clearingState] ?? '',
                                { 
                                    priority: item.priority ?? ''
                                },
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
                                ''
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
                        <Link href={`/requests/clearingRequest/${requestId}`} className='text-link'>
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
        },
        {
            id: 'openClearingRequest.priority',
            name: t('Priority'),
            sort: true,
            formatter: ({ priority }: { priority: string }) =>
                _(
                    <>
                        {priority && priority === 'LOW' && (
                            <>
                                <div className='text-success'>
                                    <b>{clearingRequestPriority[priority]}</b>
                                </div>
                            </>
                        )}
                        {priority && priority === 'MEDIUM' && (
                            <>
                                <div className='text-primary'>

                                    <b>{clearingRequestPriority[priority]}</b>
                                </div>
                            </>
                        )}
                        {priority && priority === 'HIGH' && (
                            <>
                                <div className='text-warning'>

                                    <b>{clearingRequestPriority[priority]}</b>
                                </div>
                            </>
                        )}
                        {priority && priority === 'CRITICAL' && (
                            <>
                                <div className='text-danger'>
                                    <b>{clearingRequestPriority[priority]}</b>
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
                            <Table columns={columns} data={tableData} sort={false} selector={true} />
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
