// Copyright (C) Siemens Healthineers, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import React, { JSX } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { ScheduleItem } from './ScheduleItem';
import { ApiUtils, CommonUtils } from '@/utils/index'
import { getSession, signOut, useSession } from 'next-auth/react'
import MessageService from '@/services/message.service'
import { HttpStatus, ErrorDetails } from '@/object-types'


export default function VendorsList(): JSX.Element {
    const t = useTranslations('default')
    const router = useRouter()
    const { status } = useSession();

    const handleCancelAllTasks = async () => {
        try{
            const session = await getSession()
            if (CommonUtils.isNullOrUndefined(session))
                return signOut()

            const response = await ApiUtils.POST('schedule/unscheduleAllServices', {}, session.user.access_token)
            if (response.status == HttpStatus.ACCEPTED) {
                MessageService.success(t('Every task unscheduled successfully'))
                router.push('/admin/schedule')
            } else if (response.status === HttpStatus.UNAUTHORIZED) {
                return signOut()
            } else {
                const err = await response.json() as ErrorDetails
                throw new Error(err.message)
            }
        } catch(error: unknown) {
            if (error instanceof DOMException && error.name === "AbortError") {
                return
            }
            const message = error instanceof Error ? error.message : String(error)
            MessageService.error(message)
        }
    }

    const handleScheduleService = async (serviceEndpoint: string, successMessage: string): Promise<void> => {
        try{
            const session = await getSession()
            if (CommonUtils.isNullOrUndefined(session))
                return signOut()

            let response;

            if(serviceEndpoint==='schedule/unscheduleSvmSync' || serviceEndpoint==='schedule/unscheduleSvmReverseMatch' || serviceEndpoint==='schedule/cancelMonitoringListUpdate' || serviceEndpoint==='schedule/cancelSrcUpload'){
                
                response = await ApiUtils.DELETE(serviceEndpoint, session.user.access_token);
            }
            else{
                response = await ApiUtils.POST(serviceEndpoint, {}, session.user.access_token);
            }
                
            if (response.status == HttpStatus.ACCEPTED) {
                MessageService.success(successMessage);
                router.push('/admin/schedule')
            } else if (response.status === HttpStatus.UNAUTHORIZED) {
                return signOut()
            } else {
                const err = await response.json() as ErrorDetails
                throw new Error(err.message)
            }
        } catch(error: unknown) {
            if (error instanceof DOMException && error.name === "AbortError") {
                return
            }
            const message = error instanceof Error ? error.message : String(error)
            MessageService.error(message)
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
                                disabled={status !== 'authenticated'}
                            >
                                {t('Cancel all Schedule Tasks')}
                            </button>
                            <div className='col-auto buttonheader-title'>{t('Schedule Task Administration')}</div>
                        </div>
                        
                    </div>
                </div>

                <div className='row'>
                    <div className="col-lg-8">

                        {/* CVE SEARCH Service */}
                        <h5 className="mt-3 mb-1 ms-1 header-underlined">
                                {t('CVE SEARCH')}
                        </h5>
                        <ScheduleItem 
                            scheduleUrl="schedule/cveService" 
                            cancelUrl="schedule/unscheduleCve" 
                            scheduleLabel={t('Schedule CVE Service')} 
                            cancelLabel={t('Cancel CVE Service')} 
                            status={status} 
                            handleScheduleService={handleScheduleService} 
                        />
                        

                        {/* SRC Upload Service */}
                        <h5 className="mt-3 mb-1 ms-1 header-underlined">
                                {t('SRC Upload')}
                        </h5>
                        <ScheduleItem 
                            scheduleUrl="schedule/scheduleSourceUploadForReleaseComponents" 
                            cancelUrl="" 
                            scheduleLabel={t('Schedule SRC Upload Service')}
                            cancelLabel={t('Cancel Scheduled SRC Upload Service')} 
                            status={status} 
                            handleScheduleService={handleScheduleService} 
                        />


                        {/* SVM Vulnerabilities Sync Service */}
                        <h5 className="mt-3 mb-1 ms-1 header-underlined">
                                {t('SVM Vulnerabilities Sync')}
                        </h5>
                        <ScheduleItem 
                            scheduleUrl="schedule/scheduleSvmSync" 
                            cancelUrl="schedule/unscheduleSvmSync" 
                            scheduleLabel={t('Schedule SVM Sync')}
                            cancelLabel={t('Cancel Scheduled SVM Sync')}
                            status={status} 
                            handleScheduleService={handleScheduleService} 
                        />


                        {/* SVM Vulnerabilities Reverse Match Service */}
                        <h5 className="mt-3 mb-1 ms-1 header-underlined">
                                {t('SVM Vulnerabilities Reverse Match')}
                        </h5>
                        <ScheduleItem 
                            scheduleUrl="schedule/svmReverseMatch" 
                            cancelUrl="schedule/unscheduleSvmReverseMatch" 
                            scheduleLabel={t('Schedule SVM Reverse Match')}
                            cancelLabel={t('Cancel Scheduled SVM Reverse Match')}
                            status={status} 
                            handleScheduleService={handleScheduleService} 
                        />
                        
                        
                        {/* SVM Monitoring List Update */}
                        <h5 className="mt-3 mb-1 ms-1 header-underlined">
                                {t('SVM Monitoring List Update')}
                        </h5>
                        <ScheduleItem 
                            scheduleUrl="schedule/monitoringListUpdate" 
                            cancelUrl="schedule/cancelMonitoringListUpdate" 
                            scheduleLabel={t('Schedule SVM Monitoring List Update')}
                            cancelLabel={t('Cancel Scheduled SVM Monitoring List Update')}
                            status={status} 
                            handleScheduleService={handleScheduleService} 
                        />
                        
                        {/* SVM Release Tracking Feedback Service */}
                        <h5 className="mt-3 mb-1 ms-1 header-underlined">
                                {t('SVM Release Tracking Feedback')}
                        </h5>
                        <ScheduleItem 
                            scheduleUrl="schedule/trackingFeedback" 
                            cancelUrl="schedule/cancelMonitoringListUpdate" 
                            scheduleLabel={t('Schedule SVM Release Tracking Feedback')}
                            cancelLabel={t('Cancel Scheduled Schedule SVM Release Tracking Feedback')}
                            status={status} 
                            handleScheduleService={handleScheduleService} 
                        />

                        
                        {/* Attachment Deletion From Local FS Service */}
                        <h5 className="mt-3 mb-1 ms-1 header-underlined">
                                {t('Attachment Deletion From Local FS')}
                        </h5>
                        <ScheduleItem 
                            scheduleUrl="schedule/deleteAttachment" 
                            cancelUrl="schedule/unScheduleDeleteAttachment" 
                            scheduleLabel={t('Schedule Attachment Deletion From Local FS')}
                            cancelLabel={t('Cancel Scheduled Attachment Deletion From Localm FS')}
                            status={status} 
                            handleScheduleService={handleScheduleService} 
                        />
                    </div>

                    <div className="col-lg-12 my-1">
                        <h5 className="mt-3 mb-1 ms-1 header-underlined">
                                {t('Manual triggering of scheduled services')}
                        </h5>
                        <div className="my-3 ms-1 d-flex flex-wrap gap-2">
                            <button 
                                className="btn btn-primary me-2 mb-2 px-5"
                                onClick={() => handleScheduleService("schedule/scheduleSvmSync", "Task performed successfully!")}
                                disabled={status !== 'authenticated'} 
                            >
                                {t('SVM Vulnerabilities Sync')}
                            </button>
                            <button 
                                className="btn btn-primary me-2 mb-2 px-5"
                                onClick={() => handleScheduleService("schedule/svmReverseMatch", "Task performed successfully!")}
                                disabled={status !== 'authenticated'}
                            >
                                {t('SVM Vulnerabilities Reverse Match')}
                            </button>
                            <button 
                                className="btn btn-primary me-2 mb-2 px-5"
                                onClick={() => handleScheduleService("schedule/monitoringListUpdate", "Task performed successfully!")}
                                disabled={status !== 'authenticated'}
                            >
                                {t('SVM Monitoring List Update')}
                            </button>
                            <button 
                                className="btn btn-primary me-2 mb-2 px-5"
                                onClick={() => handleScheduleService("schedule/trackingFeedback", "Task performed successfully!")}
                                disabled={status !== 'authenticated'}
                            >
                                {t('SVM Release Tracking Feedback')}
                            </button>
                            <button 
                                className="btn btn-primary me-2 mb-2 px-5"
                                onClick={() => handleScheduleService("schedule/deleteAttachment", "Task performed successfully!")}
                                disabled={status !== 'authenticated'}
                            >
                                {t('Attachment Deletion From Local FS')}
                            </button>
                            <button 
                                className="btn btn-primary me-2 mb-2 px-5"
                                onClick={() => handleScheduleService("schedule/cveService", "Task performed successfully!")}
                                disabled={status !== 'authenticated'}
                            >
                                {t('CVE Search')}
                            </button>
                            <button 
                                className="btn btn-primary me-2 mb-2 px-5"
                                onClick={() => handleScheduleService("schedule/scheduleSourceUploadForReleaseComponents", "Task performed successfully!")}
                                disabled={status !== 'authenticated'}
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
