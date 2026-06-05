// Copyright (C) Siemens Healthineers, 2025. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025,2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { StatusCodes } from 'http-status-codes'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { JSX, useCallback, useEffect, useState } from 'react'
import { ErrorDetails, ServiceDetailsResponse } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiError, ApiUtils, CommonUtils } from '@/utils/index'
import { dispatchSessionExpiredEvent } from '@/utils/sessionExpiry.utils'
import { ScheduleItem } from './ScheduleItem'

export default function VendorsList(): JSX.Element {
    const t = useTranslations('default')
    const session = useSession()
    const [serviceDetails, setServiceDetails] = useState<ServiceDetailsResponse>({})
    const [refreshTrigger, setRefreshTrigger] = useState(0)

    const refreshServiceDetails = useCallback(() => {
        setRefreshTrigger((prev) => prev + 1)
    }, [])

    useEffect(() => {
        const controller = new AbortController()

        const fetchServiceDetails = async () => {
            if (CommonUtils.isNullOrUndefined(session.data)) return dispatchSessionExpiredEvent()

            try {
                const response = await ApiUtils.GET(
                    'schedule/serviceDetails',
                    session.data.user.access_token,
                    controller.signal,
                )
                if (response.status === StatusCodes.OK) {
                    const data = (await response.json()) as ServiceDetailsResponse
                    setServiceDetails(data)
                }
            } catch (error: unknown) {
                ApiUtils.reportError(error)
            }
        }

        void fetchServiceDetails()

        return () => controller.abort()
    }, [
        session,
        refreshTrigger,
    ])

    const handleCancelAllTasks = async () => {
        try {
            if (CommonUtils.isNullOrUndefined(session.data)) return dispatchSessionExpiredEvent()

            const response = await ApiUtils.POST('schedule/unscheduleAllServices', {}, session.data.user.access_token)
            if (response.status === StatusCodes.OK) {
                setServiceDetails((prev) =>
                    Object.fromEntries(
                        Object.entries(prev).map(([key, val]) => [
                            key,
                            {
                                ...val,
                                isScheduled: false,
                            },
                        ]),
                    ),
                )
                MessageService.success(t('Every task unscheduled successfully'))
            } else if (response.status === StatusCodes.UNAUTHORIZED) {
                return dispatchSessionExpiredEvent()
            } else {
                const err = (await response.json()) as ErrorDetails
                throw new ApiError(err.message, {
                    status: response.status,
                })
            }
        } catch (error: unknown) {
            ApiUtils.reportError(error)
        }
    }

    const handleScheduleService = async (
        serviceName: string,
        action: 'schedule' | 'unschedule',
        successMessage: string,
    ): Promise<void> => {
        try {
            if (CommonUtils.isNullOrUndefined(session.data)) return dispatchSessionExpiredEvent()

            let response

            if (action === 'unschedule') {
                response = await ApiUtils.DELETE(
                    `schedule/unscheduleService?serviceName=${encodeURIComponent(serviceName)}`,
                    session.data.user.access_token,
                )
            } else {
                response = await ApiUtils.POST(
                    `schedule/scheduleService?serviceName=${encodeURIComponent(serviceName)}`,
                    {},
                    session.data.user.access_token,
                )
            }

            if (response.status === StatusCodes.OK) {
                MessageService.success(successMessage)
                refreshServiceDetails()
            } else if (response.status === StatusCodes.UNAUTHORIZED) {
                return dispatchSessionExpiredEvent()
            } else {
                const err = (await response.json()) as ErrorDetails
                throw new ApiError(err.message, {
                    status: response.status,
                })
            }
        } catch (error: unknown) {
            ApiUtils.reportError(error)
        }
    }

    const handleTriggerService = async (serviceName: string): Promise<void> => {
        try {
            if (CommonUtils.isNullOrUndefined(session.data)) return dispatchSessionExpiredEvent()

            const response = await ApiUtils.POST(
                `schedule/triggerService?serviceName=${encodeURIComponent(serviceName)}`,
                {},
                session.data.user.access_token,
            )

            if (response.status === StatusCodes.OK) {
                MessageService.success(t('Task performed successfully'))
                refreshServiceDetails()
            } else if (response.status === StatusCodes.UNAUTHORIZED) {
                return dispatchSessionExpiredEvent()
            } else {
                const err = (await response.json()) as ErrorDetails
                throw new ApiError(err.message, {
                    status: response.status,
                })
            }
        } catch (error: unknown) {
            ApiUtils.reportError(error)
        }
    }

    return (
        <>
            <div className='container page-content'>
                <div className='row'>
                    <div className='col-lg-12'>
                        <div className='row d-flex justify-content-between ms-1'>
                            <button
                                className='btn btn-danger col-auto'
                                onClick={handleCancelAllTasks}
                                disabled={!Object.values(serviceDetails).some((s) => s.isScheduled)}
                            >
                                {t('Cancel all Scheduled Tasks')}
                            </button>
                            <div className='col-auto buttonheader-title'>{t('Schedule Task Administration')}</div>
                        </div>
                    </div>
                </div>

                <div className='row'>
                    <div className='col-lg-8'>
                        {/* CVE Search Service */}
                        <h5 className='mt-3 mb-1 ms-1 header-underlined'>{t('CVE Search')}</h5>
                        <ScheduleItem
                            serviceName='cvesearchService'
                            scheduleLabel={t('Schedule CVE Service')}
                            cancelLabel={t('Cancel CVE Service')}
                            handleScheduleService={handleScheduleService}
                            serviceDetail={serviceDetails['cvesearchService']}
                        />

                        {/* SRC Upload Service */}
                        <h5 className='mt-3 mb-1 ms-1 header-underlined'>{t('SRC Upload')}</h5>
                        <ScheduleItem
                            serviceName='srcAttachmentUploadService'
                            scheduleLabel={t('Schedule SRC Upload Service')}
                            cancelLabel={t('Cancel Scheduled SRC Upload Service')}
                            handleScheduleService={handleScheduleService}
                            serviceDetail={serviceDetails['srcAttachmentUploadService']}
                        />

                        {/* SVM Vulnerabilities Sync Service */}
                        <h5 className='mt-3 mb-1 ms-1 header-underlined'>{t('SVM Vulnerabilities Sync')}</h5>
                        <ScheduleItem
                            serviceName='svmsyncService'
                            scheduleLabel={t('Schedule SVM Sync')}
                            cancelLabel={t('Cancel Scheduled SVM Sync')}
                            handleScheduleService={handleScheduleService}
                            serviceDetail={serviceDetails['svmsyncService']}
                        />

                        {/* SVM Vulnerabilities Reverse Match Service */}
                        <h5 className='mt-3 mb-1 ms-1 header-underlined'>{t('SVM Vulnerabilities Reverse Match')}</h5>
                        <ScheduleItem
                            serviceName='svmmatchService'
                            scheduleLabel={t('Schedule SVM Reverse Match')}
                            cancelLabel={t('Cancel Scheduled SVM Reverse Match')}
                            handleScheduleService={handleScheduleService}
                            serviceDetail={serviceDetails['svmmatchService']}
                        />

                        {/* SVM Monitoring List Update */}
                        <h5 className='mt-3 mb-1 ms-1 header-underlined'>{t('SVM Monitoring List Update')}</h5>
                        <ScheduleItem
                            serviceName='svmListUpdateService'
                            scheduleLabel={t('Schedule SVM Monitoring List Update')}
                            cancelLabel={t('Cancel Scheduled SVM Monitoring List Update')}
                            handleScheduleService={handleScheduleService}
                            serviceDetail={serviceDetails['svmListUpdateService']}
                        />

                        {/* SVM Release Tracking Feedback Service */}
                        <h5 className='mt-3 mb-1 ms-1 header-underlined'>{t('SVM Release Tracking Feedback')}</h5>
                        <ScheduleItem
                            serviceName='svmTrackingFeedbackService'
                            scheduleLabel={t('Schedule SVM Release Tracking Feedback')}
                            cancelLabel={t('Cancel Scheduled Schedule SVM Release Tracking Feedback')}
                            handleScheduleService={handleScheduleService}
                            serviceDetail={serviceDetails['svmTrackingFeedbackService']}
                        />

                        {/* Attachment Deletion From Local FS Service */}
                        <h5 className='mt-3 mb-1 ms-1 header-underlined'>{t('Attachment Deletion From Local FS')}</h5>
                        <ScheduleItem
                            serviceName='deleteattachmentService'
                            scheduleLabel={t('Schedule Attachment Deletion From Local FS')}
                            cancelLabel={t('Cancel Scheduled Attachment Deletion From Localm FS')}
                            handleScheduleService={handleScheduleService}
                            serviceDetail={serviceDetails['deleteattachmentService']}
                        />
                    </div>

                    <div className='col-lg-12 my-1'>
                        <h5 className='mt-3 mb-1 ms-1 header-underlined'>
                            {t('Manual triggering of scheduled services')}
                        </h5>
                        <div className='my-3 ms-1 d-flex flex-wrap gap-2'>
                            <button
                                className='btn btn-primary me-2 mb-2 px-5'
                                onClick={() => handleTriggerService('svmsyncService')}
                            >
                                {t('SVM Vulnerabilities Sync')}
                            </button>
                            <button
                                className='btn btn-primary me-2 mb-2 px-5'
                                onClick={() => handleTriggerService('svmmatchService')}
                            >
                                {t('SVM Vulnerabilities Reverse Match')}
                            </button>
                            <button
                                className='btn btn-primary me-2 mb-2 px-5'
                                onClick={() => handleTriggerService('svmListUpdateService')}
                            >
                                {t('SVM Monitoring List Update')}
                            </button>
                            <button
                                className='btn btn-primary me-2 mb-2 px-5'
                                onClick={() => handleTriggerService('svmTrackingFeedbackService')}
                            >
                                {t('SVM Release Tracking Feedback')}
                            </button>
                            <button
                                className='btn btn-primary me-2 mb-2 px-5'
                                onClick={() => handleTriggerService('deleteattachmentService')}
                            >
                                {t('Attachment Deletion From Local FS')}
                            </button>
                            <button
                                className='btn btn-primary me-2 mb-2 px-5'
                                onClick={() => handleTriggerService('cvesearchService')}
                            >
                                {t('CVE Search')}
                            </button>
                            <button
                                className='btn btn-primary me-2 mb-2 px-5'
                                onClick={() => handleTriggerService('srcAttachmentUploadService')}
                            >
                                {t('SRC Upload')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
